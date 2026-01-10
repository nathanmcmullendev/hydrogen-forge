#!/usr/bin/env node

import {Command} from 'commander';
import chalk from 'chalk';
import {createCommand} from './commands/create.js';
import {addCommand} from './commands/add.js';
import {setupMcpCommand} from './commands/setup-mcp.js';

const program = new Command();

program
  .name('hydrogen-forge')
  .description('CLI for creating and managing Hydrogen Forge projects')
  .version('0.1.0');

// Create command - npx hydrogen-forge create [name]
program
  .command('create [name]')
  .description('Create a new Hydrogen Forge project')
  .option('-t, --template <template>', 'Template to use', 'starter')
  .option('--skip-install', 'Skip npm install')
  .option('--skip-git', 'Skip git initialization')
  .option('--skip-mcp', 'Skip MCP configuration for Claude Code')
  .action(createCommand);

// Add command - hydrogen-forge add <type> <name>
program
  .command('add <type> <name>')
  .description('Add a component or route to your project')
  .option('-d, --dir <directory>', 'Output directory')
  .option('--no-styles', 'Skip Tailwind CSS classes')
  .action(addCommand);

// Setup MCP command - hydrogen-forge setup-mcp
program
  .command('setup-mcp')
  .description('Configure MCP servers for Claude Code')
  .option('--shopify', 'Set up Shopify MCP only')
  .option('--hydrogen', 'Set up Hydrogen MCP only')
  .action(setupMcpCommand);

// Help styling
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => chalk.cyan(cmd.name()),
});

// Error handling
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (err) {
  if (err instanceof Error && err.message !== 'commander.executeSubCommandAsync') {
    console.error(chalk.red('Error:'), err.message);
    process.exit(1);
  }
}
