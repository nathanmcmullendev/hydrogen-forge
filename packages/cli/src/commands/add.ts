import fs from 'fs-extra';
import * as path from 'node:path';
import chalk from 'chalk';
import {printSuccess, printError, printInfo} from '../lib/utils.js';
import {generateComponent} from '../lib/generators.js';
import {generateRoute} from '../lib/generators.js';

interface AddOptions {
  dir?: string;
  styles?: boolean;
}

type AddType = 'component' | 'route';

const COMPONENT_TYPES = ['basic', 'product', 'collection', 'cart', 'form', 'layout'] as const;
const ROUTE_TYPES = ['page', 'resource', 'collection', 'product', 'account', 'api'] as const;

export async function addCommand(
  type: string,
  name: string,
  options: AddOptions,
): Promise<void> {
  const normalizedType = type.toLowerCase() as AddType;

  if (normalizedType !== 'component' && normalizedType !== 'route') {
    printError(`Invalid type "${type}". Use "component" or "route".`);
    console.log();
    console.log('Examples:');
    console.log(`  ${chalk.cyan('hydrogen-forge add component ProductCard')}`);
    console.log(`  ${chalk.cyan('hydrogen-forge add route products.$handle')}`);
    process.exit(1);
  }

  // Check if we're in a Hydrogen project
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    printError('Not in a project directory. Run this command from your project root.');
    process.exit(1);
  }

  if (normalizedType === 'component') {
    await addComponent(name, options);
  } else {
    await addRoute(name, options);
  }
}

async function addComponent(name: string, options: AddOptions): Promise<void> {
  // Validate component name is PascalCase
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    printError('Component name must be PascalCase (e.g., "ProductCard", "CartDrawer")');
    process.exit(1);
  }

  // Detect component type from name
  const componentType = detectComponentType(name);
  const withStyles = options.styles !== false;

  const outputDir = options.dir || 'app/components';
  const componentPath = path.join(process.cwd(), outputDir, `${name}.tsx`);

  // Check if file already exists
  if (await fs.pathExists(componentPath)) {
    printError(`Component ${name} already exists at ${componentPath}`);
    process.exit(1);
  }

  // Generate component
  const code = generateComponent(name, componentType, withStyles);

  // Ensure directory exists
  await fs.ensureDir(path.dirname(componentPath));

  // Write file
  await fs.writeFile(componentPath, code);

  printSuccess(`Created ${chalk.cyan(name)} component`);
  printInfo(`Location: ${chalk.dim(componentPath)}`);
  console.log();
  console.log(chalk.dim('Import with:'));
  console.log(`  ${chalk.cyan(`import {${name}} from '~/components/${name}';`)}`);
}

async function addRoute(name: string, options: AddOptions): Promise<void> {
  // Validate route name
  if (!/^[a-z$_.[\]]+$/i.test(name)) {
    printError('Invalid route name. Use format like "products.$handle" or "collections._index"');
    process.exit(1);
  }

  // Detect route type from name
  const routeType = detectRouteType(name);

  const outputDir = options.dir || 'app/routes';
  const routePath = path.join(process.cwd(), outputDir, `${name}.tsx`);

  // Check if file already exists
  if (await fs.pathExists(routePath)) {
    printError(`Route ${name} already exists at ${routePath}`);
    process.exit(1);
  }

  // Generate route
  const code = generateRoute(name, routeType);

  // Ensure directory exists
  await fs.ensureDir(path.dirname(routePath));

  // Write file
  await fs.writeFile(routePath, code);

  // Calculate URL path
  const urlPath = routeNameToUrlPath(name);

  printSuccess(`Created ${chalk.cyan(name)} route`);
  printInfo(`Location: ${chalk.dim(routePath)}`);
  printInfo(`URL: ${chalk.dim(urlPath)}`);
}

function detectComponentType(name: string): (typeof COMPONENT_TYPES)[number] {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('product')) return 'product';
  if (lowerName.includes('collection')) return 'collection';
  if (lowerName.includes('cart')) return 'cart';
  if (lowerName.includes('form')) return 'form';
  if (lowerName.includes('layout')) return 'layout';

  return 'basic';
}

function detectRouteType(name: string): (typeof ROUTE_TYPES)[number] {
  const lowerName = name.toLowerCase();

  if (lowerName.startsWith('api.')) return 'api';
  if (lowerName.startsWith('account')) return 'account';
  if (lowerName.includes('product')) return 'product';
  if (lowerName.includes('collection')) return 'collection';
  if (lowerName.includes('_index')) return 'page';

  return 'page';
}

function routeNameToUrlPath(routeName: string): string {
  return (
    '/' +
    routeName
      .replace(/\._index$/, '')
      .replace(/\./g, '/')
      .replace(/\$/g, ':')
      .replace(/\[([^\]]+)\]/g, '$1')
  );
}
