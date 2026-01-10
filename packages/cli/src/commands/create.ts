import fs from 'fs-extra';
import * as path from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import {
  withSpinner,
  runCommand,
  validateProjectName,
  isDirectoryEmpty,
  printSuccess,
  printError,
  printInfo,
  printStep,
} from '../lib/utils.js';

interface CreateOptions {
  template: string;
  skipInstall?: boolean;
  skipGit?: boolean;
  skipMcp?: boolean;
}

interface ShopifyCredentials {
  storeDomain: string;
  storefrontApiToken: string;
  adminAccessToken: string;
}

export async function createCommand(
  name: string | undefined,
  options: CreateOptions,
): Promise<void> {
  console.log();
  console.log(chalk.bold('🔨 Hydrogen Forge'));
  console.log(chalk.dim('Create a new Hydrogen project'));
  console.log();

  // Get project name if not provided
  let projectName = name;
  if (!projectName) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project named?',
        default: 'my-hydrogen-store',
        validate: (input: string) => {
          if (!validateProjectName(input)) {
            return 'Project name must be a valid npm package name (lowercase, no spaces)';
          }
          return true;
        },
      },
    ]);
    projectName = answers.projectName as string;
  }

  // Validate project name
  if (!projectName || !validateProjectName(projectName)) {
    printError('Project name must be a valid npm package name (lowercase, no spaces)');
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  // Check if directory exists and is not empty
  if (await fs.pathExists(targetDir)) {
    if (!(await isDirectoryEmpty(targetDir))) {
      const {overwrite} = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Directory ${projectName} is not empty. Continue anyway?`,
          default: false,
        },
      ]);

      if (!overwrite) {
        printInfo('Cancelled');
        process.exit(0);
      }
    }
  }

  // Calculate total steps based on options
  let totalSteps = 2; // Base: create dir + configure
  if (!options.skipGit) totalSteps++;
  if (!options.skipMcp) totalSteps++;
  if (!options.skipInstall) totalSteps++;
  let currentStep = 1;

  // Collect MCP credentials early (before project creation) if not skipped
  let shopifyCredentials: ShopifyCredentials | null = null;
  if (!options.skipMcp) {
    shopifyCredentials = await promptForShopifyCredentials();
  }

  // Step 1: Create project directory
  printStep(currentStep++, totalSteps, 'Creating project directory...');

  await withSpinner(
    {text: 'Setting up project structure'},
    async () => {
      await fs.ensureDir(targetDir);

      // Copy template files
      const templateDir = await getTemplateDir(options.template);
      await copyTemplateFiles(templateDir, targetDir, projectName);
    },
  );

  // Step 2: Update package.json
  printStep(currentStep++, totalSteps, 'Configuring project...');

  await withSpinner(
    {text: 'Updating package.json'},
    async () => {
      const packageJsonPath = path.join(targetDir, 'package.json');

      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        packageJson.name = projectName;
        await fs.writeJson(packageJsonPath, packageJson, {spaces: 2});
      }
    },
  );

  // Step 3: Initialize git (optional)
  if (!options.skipGit) {
    printStep(currentStep++, totalSteps, 'Initializing git repository...');

    await withSpinner(
      {text: 'Running git init'},
      async () => {
        await runCommand('git', ['init'], targetDir);
        await runCommand('git', ['add', '.'], targetDir);
        await runCommand('git', ['commit', '-m', '"Initial commit from Hydrogen Forge"'], targetDir);
      },
    );
  }

  // Step 4: Configure MCP for Claude Code (optional)
  if (!options.skipMcp && shopifyCredentials) {
    printStep(currentStep++, totalSteps, 'Configuring MCP for Claude Code...');

    await withSpinner(
      {text: 'Creating .mcp.json and CLAUDE.md'},
      async () => {
        await createMcpConfig(targetDir, shopifyCredentials!);
        await createClaudeMd(targetDir, projectName);
      },
    );
  }

  // Step 5: Install dependencies (optional)
  if (!options.skipInstall) {
    printStep(currentStep++, totalSteps, 'Installing dependencies...');

    await withSpinner(
      {text: 'Running npm install (this may take a moment)'},
      async () => {
        await runCommand('npm', ['install'], targetDir);
      },
    );
  }

  // Success message
  console.log();
  printSuccess(`Project ${chalk.cyan(projectName)} created successfully!`);
  console.log();
  console.log(chalk.bold('Next steps:'));
  console.log();
  console.log(`  ${chalk.cyan('cd')} ${projectName}`);

  if (options.skipInstall) {
    console.log(`  ${chalk.cyan('npm install')}`);
  }

  console.log(`  ${chalk.cyan('npm run dev')}`);
  console.log();
  console.log(chalk.dim('To connect to Shopify, run:'));
  console.log(`  ${chalk.cyan('npx shopify hydrogen link')}`);
  console.log();
  if (shopifyCredentials) {
    console.log(chalk.green('✓ MCP configured for Claude Code'));
    console.log(chalk.dim('  Open this project in Claude Code and ask "what products do I have?"'));
    console.log();
  } else if (!options.skipMcp) {
    console.log(chalk.dim('To set up MCP servers for Claude Code later:'));
    console.log(`  ${chalk.cyan('hydrogen-forge setup-mcp')}`);
    console.log();
  }
}

async function getTemplateDir(template: string): Promise<string> {
  // First, check if running from the monorepo (development)
  const monorepoTemplate = path.resolve(
    import.meta.dirname,
    '../../../../templates',
    template,
  );

  if (await fs.pathExists(monorepoTemplate)) {
    return monorepoTemplate;
  }

  // Check in the package's templates directory (published)
  // From dist/commands/create.js -> ../../templates
  const packageTemplate = path.resolve(
    import.meta.dirname,
    '../../templates',
    template,
  );

  if (await fs.pathExists(packageTemplate)) {
    return packageTemplate;
  }

  throw new Error(`Template "${template}" not found`);
}

async function copyTemplateFiles(
  templateDir: string,
  targetDir: string,
  _projectName: string,
): Promise<void> {
  // Copy all files from template
  await fs.copy(templateDir, targetDir, {
    filter: (src) => {
      const basename = path.basename(src);
      // Skip node_modules and build artifacts
      if (basename === 'node_modules' || basename === 'dist' || basename === '.cache') {
        return false;
      }
      return true;
    },
  });

  // Create .env file if it doesn't exist
  const envPath = path.join(targetDir, '.env');
  if (!(await fs.pathExists(envPath))) {
    const envContent = `# Shopify Storefront API
SESSION_SECRET="your-session-secret"
PUBLIC_STOREFRONT_API_TOKEN=""
PUBLIC_STORE_DOMAIN=""

# Optional: Customer Account API
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=""
PUBLIC_CUSTOMER_ACCOUNT_API_URL=""
`;
    await fs.writeFile(envPath, envContent);
  }

  // Create .gitignore if it doesn't exist
  const gitignorePath = path.join(targetDir, '.gitignore');
  if (!(await fs.pathExists(gitignorePath))) {
    const gitignoreContent = `node_modules
.cache
dist
.env
.mcp.json
*.local
.DS_Store
`;
    await fs.writeFile(gitignorePath, gitignoreContent);
  } else {
    // Ensure .mcp.json is in existing .gitignore
    const existingGitignore = await fs.readFile(gitignorePath, 'utf-8');
    if (!existingGitignore.includes('.mcp.json')) {
      await fs.appendFile(gitignorePath, '\n.mcp.json\n');
    }
  }
}

async function promptForShopifyCredentials(): Promise<ShopifyCredentials | null> {
  console.log();
  console.log(chalk.bold('🔌 MCP Configuration'));
  console.log(chalk.dim('Configure Claude Code to work with your Shopify store'));
  console.log();

  const { setupMcp } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setupMcp',
      message: 'Would you like to configure MCP for Claude Code integration?',
      default: true,
    },
  ]);

  if (!setupMcp) {
    console.log(chalk.dim('Skipping MCP setup. Run "hydrogen-forge setup-mcp" later to configure.'));
    return null;
  }

  console.log();
  console.log(chalk.dim('Where to find these values:'));
  console.log();
  console.log(chalk.dim('  Store domain: Your *.myshopify.com domain'));
  console.log();
  console.log(chalk.dim('  Storefront API token:'));
  console.log(chalk.dim('    Sales channels → Headless → [Your Storefront] → Storefront API → Manage'));
  console.log(chalk.dim('    Copy the "Public access token"'));
  console.log(chalk.dim('    (No Headless storefront? Create one: Sales channels → Headless → Add storefront)'));
  console.log();
  console.log(chalk.dim('  Admin API token:'));
  console.log(chalk.dim('    You likely already have this from your app setup (starts with shpua_ or shpat_)'));
  console.log(chalk.dim('    Or: Dev Dashboard (dev.shopify.com) → Apps → [Your App] → Settings'));
  console.log();

  const credentials = await inquirer.prompt([
    {
      type: 'input',
      name: 'storeDomain',
      message: 'Shopify store domain (e.g., my-store.myshopify.com):',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Store domain is required';
        }
        if (!input.includes('.myshopify.com') && !input.includes('.')) {
          return 'Please enter a valid domain (e.g., my-store.myshopify.com)';
        }
        return true;
      },
    },
    {
      type: 'password',
      name: 'storefrontApiToken',
      message: 'Storefront API access token:',
      mask: '*',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Storefront API token is required';
        }
        return true;
      },
    },
    {
      type: 'password',
      name: 'adminAccessToken',
      message: 'Admin API access token (for MCP tools):',
      mask: '*',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Admin access token is required';
        }
        return true;
      },
    },
  ]);

  return credentials as ShopifyCredentials;
}

async function createMcpConfig(
  targetDir: string,
  credentials: ShopifyCredentials,
): Promise<void> {
  const mcpConfig = {
    mcpServers: {
      'hydrogen-forge-shopify': {
        command: 'npx',
        args: ['-y', '@hydrogen-forge/mcp-shopify'],
        env: {
          SHOPIFY_STORE_DOMAIN: credentials.storeDomain,
          SHOPIFY_STOREFRONT_ACCESS_TOKEN: credentials.storefrontApiToken,
          SHOPIFY_ADMIN_ACCESS_TOKEN: credentials.adminAccessToken,
        },
      },
    },
  };

  const mcpPath = path.join(targetDir, '.mcp.json');
  await fs.writeJson(mcpPath, mcpConfig, { spaces: 2 });
}

async function createClaudeMd(targetDir: string, projectName: string): Promise<void> {
  const claudeMdContent = `# ${projectName} - Claude Code Instructions

## MCP Servers Available

This project is configured with MCP (Model Context Protocol) servers for Claude Code integration.

### Shopify MCP Tools

Use these tools directly - DO NOT read source files to understand products/inventory:

| Tool | Description |
|------|-------------|
| \`listProducts\` | List all products with filtering and pagination |
| \`getProduct\` | Get a single product by ID or handle |
| \`createProduct\` | Create a new product |
| \`updateProduct\` | Update an existing product |
| \`deleteProduct\` | Delete a product |
| \`executeGraphQL\` | Run any GraphQL query against Shopify Admin API |
| \`getInventoryLevels\` | Get inventory for an item across locations |
| \`updateInventory\` | Set inventory quantity |
| \`adjustInventory\` | Adjust inventory by delta |
| \`listLocations\` | List all inventory locations |

### Example Queries

- "What products do I have?" → Use \`listProducts\`
- "Show me the Blue T-Shirt details" → Use \`getProduct\`
- "Create a new product called..." → Use \`createProduct\`
- "Update inventory for..." → Use \`updateInventory\`

## Project Structure

This is a Shopify Hydrogen project built with Remix.

\`\`\`
app/
├── components/     # React components
├── routes/         # Remix routes (pages)
├── lib/           # Utilities and helpers
└── styles/        # CSS files
\`\`\`

## Development Commands

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npx shopify hydrogen link    # Link to Shopify store
\`\`\`
`;

  const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
  await fs.writeFile(claudeMdPath, claudeMdContent);
}
