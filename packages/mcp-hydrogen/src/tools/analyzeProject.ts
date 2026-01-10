import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type {
  AnalyzeProjectInput,
  ProjectAnalysis,
  RouteInfo,
  ComponentInfo,
  StyleConfig,
  ProjectConfig,
} from '../lib/types.js';

export async function analyzeProject(
  input: AnalyzeProjectInput,
): Promise<ProjectAnalysis> {
  const projectPath = path.resolve(process.cwd(), input.projectPath);

  const analysis: ProjectAnalysis = {
    projectPath,
    isHydrogenProject: false,
    routes: [],
    components: [],
    styles: {
      hasTailwind: false,
      customClasses: [],
    },
    config: {
      typescript: false,
      eslint: false,
      prettier: false,
      packageManager: 'unknown',
    },
    recommendations: [],
  };

  try {
    // Check if it's a Hydrogen project by reading package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, 'utf-8'),
      );

      analysis.isHydrogenProject =
        !!packageJson.dependencies?.['@shopify/hydrogen'] ||
        !!packageJson.devDependencies?.['@shopify/hydrogen'];

      if (packageJson.dependencies?.['@shopify/hydrogen']) {
        analysis.hydrogenVersion = packageJson.dependencies['@shopify/hydrogen'];
      }
      if (packageJson.dependencies?.['react-router']) {
        analysis.reactRouterVersion = packageJson.dependencies['react-router'];
      }

      // Detect package manager
      analysis.config.packageManager = await detectPackageManager(projectPath);
    } catch {
      // package.json not found or invalid
      analysis.recommendations.push(
        'No package.json found. Run npm init or create a new Hydrogen project.',
      );
    }

    // Analyze routes
    if (input.includeRoutes) {
      analysis.routes = await analyzeRoutes(projectPath);
      if (analysis.routes.length === 0) {
        analysis.recommendations.push(
          'No routes found in app/routes/. Create route files to define pages.',
        );
      }
    }

    // Analyze components
    if (input.includeComponents) {
      analysis.components = await analyzeComponents(projectPath);
      if (analysis.components.length === 0) {
        analysis.recommendations.push(
          'No components found in app/components/. Consider creating reusable components.',
        );
      }
    }

    // Analyze styles
    if (input.includeStyles) {
      analysis.styles = await analyzeStyles(projectPath);
      if (!analysis.styles.hasTailwind) {
        analysis.recommendations.push(
          'Tailwind CSS not detected. Consider adding it for rapid UI development.',
        );
      }
    }

    // Analyze config
    if (input.includeConfig) {
      analysis.config = await analyzeConfig(projectPath);
      if (!analysis.config.typescript) {
        analysis.recommendations.push(
          'TypeScript not detected. Consider using TypeScript for better type safety.',
        );
      }
      if (!analysis.config.eslint) {
        analysis.recommendations.push(
          'ESLint not detected. Consider adding it for code quality.',
        );
      }
    }

    // Add Hydrogen-specific recommendations
    if (analysis.isHydrogenProject) {
      addHydrogenRecommendations(analysis);
    }

    return analysis;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    analysis.recommendations.push(`Error analyzing project: ${errorMessage}`);
    return analysis;
  }
}

async function analyzeRoutes(projectPath: string): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = [];
  const routesDir = path.join(projectPath, 'app', 'routes');

  try {
    const files = await fs.readdir(routesDir);

    for (const file of files) {
      if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;

      const filePath = path.join(routesDir, file);
      const content = await fs.readFile(filePath, 'utf-8');

      const routeName = file.replace(/\.(tsx|ts)$/, '');
      const routePath = routeNameToPath(routeName);

      routes.push({
        file,
        path: routePath,
        hasLoader: /export\s+(async\s+)?function\s+loader/.test(content),
        hasAction: /export\s+(async\s+)?function\s+action/.test(content),
        hasMeta: /export\s+const\s+meta/.test(content),
        hasGraphQL: /#graphql/.test(content),
      });
    }
  } catch {
    // Routes directory doesn't exist
  }

  return routes;
}

async function analyzeComponents(projectPath: string): Promise<ComponentInfo[]> {
  const components: ComponentInfo[] = [];
  const componentsDir = path.join(projectPath, 'app', 'components');

  try {
    const files = await fs.readdir(componentsDir);

    for (const file of files) {
      if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
      if (file.startsWith('__')) continue; // Skip __tests__ etc.

      const filePath = path.join(componentsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');

      const componentName = file.replace(/\.(tsx|ts)$/, '');

      // Find props interface
      const propsMatch = content.match(
        /(?:interface|type)\s+(\w+Props)\s*[={]/,
      );
      const hasProps = !!propsMatch;

      // Find imports
      const importMatches = content.matchAll(
        /import\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/g,
      );
      const imports = Array.from(importMatches).map((m) => m[1]);

      components.push({
        file,
        name: componentName,
        hasProps,
        propsInterface: propsMatch?.[1],
        imports,
      });
    }
  } catch {
    // Components directory doesn't exist
  }

  return components;
}

async function analyzeStyles(projectPath: string): Promise<StyleConfig> {
  const styles: StyleConfig = {
    hasTailwind: false,
    customClasses: [],
  };

  // Check for Tailwind config
  const tailwindConfigs = [
    'tailwind.config.js',
    'tailwind.config.ts',
    'tailwind.config.mjs',
  ];

  for (const configFile of tailwindConfigs) {
    try {
      const configPath = path.join(projectPath, configFile);
      await fs.access(configPath);
      styles.hasTailwind = true;
      styles.tailwindConfig = configFile;

      // Try to extract custom theme extensions
      const content = await fs.readFile(configPath, 'utf-8');
      const colorMatch = content.match(/colors:\s*\{([^}]+)\}/);
      if (colorMatch) {
        const customColors = colorMatch[1]
          .match(/['"]?(\w+)['"]?\s*:/g)
          ?.map((c) => c.replace(/['":\s]/g, ''));
        if (customColors) {
          styles.customClasses.push(...customColors.map((c) => `bg-${c}-*`));
        }
      }
      break;
    } catch {
      // Config file doesn't exist
    }
  }

  return styles;
}

async function analyzeConfig(projectPath: string): Promise<ProjectConfig> {
  const config: ProjectConfig = {
    typescript: false,
    eslint: false,
    prettier: false,
    packageManager: 'unknown',
  };

  // Check for TypeScript
  try {
    await fs.access(path.join(projectPath, 'tsconfig.json'));
    config.typescript = true;
  } catch {
    // No TypeScript
  }

  // Check for ESLint
  const eslintConfigs = [
    '.eslintrc.js',
    '.eslintrc.json',
    '.eslintrc.yaml',
    'eslint.config.js',
    'eslint.config.mjs',
  ];
  for (const eslintConfig of eslintConfigs) {
    try {
      await fs.access(path.join(projectPath, eslintConfig));
      config.eslint = true;
      break;
    } catch {
      // No ESLint config
    }
  }

  // Check for Prettier
  const prettierConfigs = [
    '.prettierrc',
    '.prettierrc.js',
    '.prettierrc.json',
    'prettier.config.js',
  ];
  for (const prettierConfig of prettierConfigs) {
    try {
      await fs.access(path.join(projectPath, prettierConfig));
      config.prettier = true;
      break;
    } catch {
      // No Prettier config
    }
  }

  config.packageManager = await detectPackageManager(projectPath);

  return config;
}

async function detectPackageManager(
  projectPath: string,
): Promise<'npm' | 'pnpm' | 'yarn' | 'unknown'> {
  try {
    await fs.access(path.join(projectPath, 'pnpm-lock.yaml'));
    return 'pnpm';
  } catch {
    // Not pnpm
  }

  try {
    await fs.access(path.join(projectPath, 'yarn.lock'));
    return 'yarn';
  } catch {
    // Not yarn
  }

  try {
    await fs.access(path.join(projectPath, 'package-lock.json'));
    return 'npm';
  } catch {
    // Not npm
  }

  return 'unknown';
}

function routeNameToPath(routeName: string): string {
  return (
    '/' +
    routeName
      .replace(/\._index$/, '')
      .replace(/\./g, '/')
      .replace(/\$/g, ':')
      .replace(/\[([^\]]+)\]/g, '$1')
  );
}

function addHydrogenRecommendations(analysis: ProjectAnalysis): void {
  // Check for essential routes
  const essentialRoutes = [
    'products.$handle',
    'collections.$handle',
    'cart',
    '_index',
  ];
  const existingRoutePaths = analysis.routes.map((r) => r.file.replace('.tsx', ''));

  for (const route of essentialRoutes) {
    if (!existingRoutePaths.some((p) => p.includes(route.replace('$', '')))) {
      analysis.recommendations.push(
        `Consider adding route: ${route} for a complete storefront`,
      );
    }
  }

  // Check for routes without loaders
  const routesWithoutLoaders = analysis.routes.filter(
    (r) => !r.hasLoader && !r.file.startsWith('api.'),
  );
  if (routesWithoutLoaders.length > 0) {
    analysis.recommendations.push(
      `${routesWithoutLoaders.length} routes without loaders. Consider adding data loading.`,
    );
  }

  // Check for GraphQL usage
  const routesWithGraphQL = analysis.routes.filter((r) => r.hasGraphQL);
  if (routesWithGraphQL.length === 0 && analysis.routes.length > 0) {
    analysis.recommendations.push(
      'No GraphQL queries detected. Use storefront.query() for data fetching.',
    );
  }
}
