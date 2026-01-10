import * as fs from 'fs-extra';
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

  const totalSteps = options.skipInstall ? (options.skipGit ? 2 : 3) : (options.skipGit ? 3 : 4);
  let currentStep = 1;

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
        await runCommand('git', ['commit', '-m', 'Initial commit from Hydrogen Forge'], targetDir);
      },
    );
  }

  // Step 4: Install dependencies (optional)
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
  console.log(chalk.dim('To set up MCP servers for Claude Code:'));
  console.log(`  ${chalk.cyan('hydrogen-forge setup-mcp')}`);
  console.log();
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
  const packageTemplate = path.resolve(
    import.meta.dirname,
    '../templates',
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
*.local
.DS_Store
`;
    await fs.writeFile(gitignorePath, gitignoreContent);
  }
}
