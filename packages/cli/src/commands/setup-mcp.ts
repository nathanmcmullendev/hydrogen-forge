import fs from 'fs-extra';
import * as path from 'node:path';
import * as os from 'node:os';
import chalk from 'chalk';
import inquirer from 'inquirer';
import {printSuccess, printError, printInfo, printWarning} from '../lib/utils.js';

interface SetupMcpOptions {
  shopify?: boolean;
  hydrogen?: boolean;
}

interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
}

interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export async function setupMcpCommand(options: SetupMcpOptions): Promise<void> {
  console.log();
  console.log(chalk.bold('🔧 MCP Server Setup'));
  console.log(chalk.dim('Configure MCP servers for Claude Code'));
  console.log();

  // Determine which MCPs to set up
  let setupShopify = options.shopify || (!options.shopify && !options.hydrogen);
  let setupHydrogen = options.hydrogen || (!options.shopify && !options.hydrogen);

  // If no options specified, ask the user
  if (!options.shopify && !options.hydrogen) {
    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'mcps',
        message: 'Which MCP servers would you like to configure?',
        choices: [
          {name: 'Shopify MCP (GraphQL, products, inventory)', value: 'shopify', checked: true},
          {name: 'Hydrogen MCP (scaffolding, analysis)', value: 'hydrogen', checked: true},
        ],
      },
    ]);

    setupShopify = answers.mcps.includes('shopify');
    setupHydrogen = answers.mcps.includes('hydrogen');
  }

  if (!setupShopify && !setupHydrogen) {
    printInfo('No MCP servers selected');
    return;
  }

  // Find Claude Code config location
  const configPath = getClaudeConfigPath();

  if (!configPath) {
    printError('Could not find Claude Code configuration directory');
    printInfo('Make sure Claude Code is installed');
    process.exit(1);
  }

  printInfo(`Config location: ${chalk.dim(configPath)}`);

  // Load existing config or create new
  let config: McpConfig = {mcpServers: {}};

  if (await fs.pathExists(configPath)) {
    try {
      config = await fs.readJson(configPath);
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
    } catch {
      printWarning('Could not parse existing config, creating new one');
    }
  }

  // Add Shopify MCP
  if (setupShopify) {
    // Check if already configured
    if (config.mcpServers.shopify) {
      const {overwrite} = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Shopify MCP is already configured. Overwrite?',
          default: false,
        },
      ]);

      if (!overwrite) {
        printInfo('Skipping Shopify MCP');
      } else {
        await configureShopifyMcp(config);
      }
    } else {
      await configureShopifyMcp(config);
    }
  }

  // Add Hydrogen MCP
  if (setupHydrogen) {
    if (config.mcpServers.hydrogen) {
      const {overwrite} = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Hydrogen MCP is already configured. Overwrite?',
          default: false,
        },
      ]);

      if (!overwrite) {
        printInfo('Skipping Hydrogen MCP');
      } else {
        configureHydrogenMcp(config);
      }
    } else {
      configureHydrogenMcp(config);
    }
  }

  // Write config
  await fs.ensureDir(path.dirname(configPath));
  await fs.writeJson(configPath, config, {spaces: 2});

  console.log();
  printSuccess('MCP servers configured successfully!');
  console.log();

  // Print summary
  console.log(chalk.bold('Configured servers:'));
  if (config.mcpServers.shopify) {
    console.log(`  ${chalk.cyan('shopify')} - Shopify Admin API operations`);
  }
  if (config.mcpServers.hydrogen) {
    console.log(`  ${chalk.cyan('hydrogen')} - Component and route scaffolding`);
  }

  console.log();
  console.log(chalk.dim('Restart Claude Code to apply changes'));
  console.log();
}

function getClaudeConfigPath(): string | null {
  const platform = os.platform();
  const home = os.homedir();

  if (platform === 'darwin') {
    // macOS
    return path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'win32') {
    // Windows
    return path.join(home, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'linux') {
    // Linux
    return path.join(home, '.config', 'Claude', 'claude_desktop_config.json');
  }

  return null;
}

async function configureShopifyMcp(config: McpConfig): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'storeDomain',
      message: 'Shopify store domain (e.g., my-store.myshopify.com):',
      validate: (input: string) => {
        if (!input.includes('.myshopify.com') && !input.includes('.')) {
          return 'Please enter a valid Shopify domain';
        }
        return true;
      },
    },
    {
      type: 'password',
      name: 'accessToken',
      message: 'Admin API access token:',
      mask: '*',
      validate: (input: string) => {
        if (!input || input.length < 10) {
          return 'Please enter a valid access token';
        }
        return true;
      },
    },
  ]);

  config.mcpServers.shopify = {
    command: 'npx',
    args: ['@hydrogen-forge/mcp-shopify'],
    env: {
      SHOPIFY_STORE_DOMAIN: answers.storeDomain,
      SHOPIFY_ACCESS_TOKEN: answers.accessToken,
    },
  };

  printSuccess('Shopify MCP configured');
}

function configureHydrogenMcp(config: McpConfig): void {
  config.mcpServers.hydrogen = {
    command: 'npx',
    args: ['@hydrogen-forge/mcp-hydrogen'],
  };

  printSuccess('Hydrogen MCP configured');
}
