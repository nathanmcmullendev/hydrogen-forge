import fs from 'fs-extra';
import * as path from 'node:path';
import {spawn} from 'node:child_process';
import chalk from 'chalk';
import ora from 'ora';

export interface SpinnerOptions {
  text: string;
  successText?: string;
  failText?: string;
}

export async function withSpinner<T>(
  options: SpinnerOptions,
  fn: () => Promise<T>,
): Promise<T> {
  const spinner = ora(options.text).start();

  try {
    const result = await fn();
    spinner.succeed(options.successText || options.text);
    return result;
  } catch (error) {
    spinner.fail(options.failText || options.text);
    throw error;
  }
}

export async function runCommand(
  command: string,
  args: string[],
  cwd: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Join command and args into single string to avoid deprecation warning
    // when using shell: true with args array
    const fullCommand = [command, ...args].join(' ');
    const child = spawn(fullCommand, [], {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

export async function copyTemplate(
  templateDir: string,
  targetDir: string,
  replacements?: Record<string, string>,
): Promise<void> {
  await fs.copy(templateDir, targetDir);

  if (replacements) {
    await replaceInFiles(targetDir, replacements);
  }
}

async function replaceInFiles(
  dir: string,
  replacements: Record<string, string>,
): Promise<void> {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await replaceInFiles(filePath, replacements);
    } else if (
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.json') ||
      file.endsWith('.md')
    ) {
      let content = await fs.readFile(filePath, 'utf-8');

      for (const [key, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(key, 'g'), value);
      }

      await fs.writeFile(filePath, content);
    }
  }
}

export function validateProjectName(name: string): boolean {
  // Valid npm package name
  const validName = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
  return validName.test(name);
}

export async function isDirectoryEmpty(dir: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dir);
    return files.length === 0;
  } catch {
    return true; // Directory doesn't exist
  }
}

export async function detectPackageManager(): Promise<'npm' | 'pnpm' | 'yarn'> {
  const cwd = process.cwd();

  if (await fs.pathExists(path.join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (await fs.pathExists(path.join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }
  return 'npm';
}

export function printSuccess(message: string): void {
  console.log(chalk.green('✓'), message);
}

export function printError(message: string): void {
  console.error(chalk.red('✗'), message);
}

export function printInfo(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

export function printWarning(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

export function printStep(step: number, total: number, message: string): void {
  console.log(chalk.dim(`[${step}/${total}]`), message);
}
