import {z} from 'zod';

// Component Types
export const ComponentTypeSchema = z.enum([
  'basic',
  'product',
  'collection',
  'cart',
  'form',
  'layout',
]);

export type ComponentType = z.infer<typeof ComponentTypeSchema>;

// Route Types
export const RouteTypeSchema = z.enum([
  'page',
  'resource',
  'collection',
  'product',
  'account',
  'api',
]);

export type RouteType = z.infer<typeof RouteTypeSchema>;

// ScaffoldComponent Input
export const ScaffoldComponentSchema = z.object({
  name: z
    .string()
    .describe('Component name in PascalCase (e.g., "ProductCard", "CartDrawer")'),
  type: ComponentTypeSchema.default('basic').describe(
    'Component type template to use',
  ),
  props: z
    .array(
      z.object({
        name: z.string().describe('Prop name'),
        type: z.string().describe('TypeScript type (e.g., "string", "number", "boolean")'),
        required: z.boolean().default(true).describe('Whether the prop is required'),
        description: z.string().optional().describe('JSDoc description for the prop'),
      }),
    )
    .optional()
    .describe('Component props to generate'),
  outputDir: z
    .string()
    .default('app/components')
    .describe('Output directory relative to project root'),
  withStyles: z
    .boolean()
    .default(true)
    .describe('Include Tailwind CSS class suggestions'),
  withTests: z
    .boolean()
    .default(false)
    .describe('Generate test file alongside component'),
});

export type ScaffoldComponentInput = z.infer<typeof ScaffoldComponentSchema>;

// ScaffoldRoute Input
export const ScaffoldRouteSchema = z.object({
  name: z
    .string()
    .describe(
      'Route name/path (e.g., "products.$handle", "collections._index", "api.webhook")',
    ),
  type: RouteTypeSchema.default('page').describe('Route type template to use'),
  withLoader: z.boolean().default(true).describe('Include loader function'),
  withAction: z.boolean().default(false).describe('Include action function'),
  withMeta: z.boolean().default(true).describe('Include meta function'),
  withGraphQL: z
    .boolean()
    .default(false)
    .describe('Include GraphQL query template'),
  outputDir: z
    .string()
    .default('app/routes')
    .describe('Output directory relative to project root'),
});

export type ScaffoldRouteInput = z.infer<typeof ScaffoldRouteSchema>;

// AnalyzeProject Input
export const AnalyzeProjectSchema = z.object({
  projectPath: z
    .string()
    .default('.')
    .describe('Path to the Hydrogen project to analyze'),
  includeRoutes: z.boolean().default(true).describe('Analyze routes'),
  includeComponents: z.boolean().default(true).describe('Analyze components'),
  includeStyles: z.boolean().default(true).describe('Analyze style configuration'),
  includeConfig: z.boolean().default(true).describe('Analyze project configuration'),
});

export type AnalyzeProjectInput = z.infer<typeof AnalyzeProjectSchema>;

// Analysis Results
export interface ProjectAnalysis {
  projectPath: string;
  isHydrogenProject: boolean;
  hydrogenVersion?: string;
  reactRouterVersion?: string;
  routes: RouteInfo[];
  components: ComponentInfo[];
  styles: StyleConfig;
  config: ProjectConfig;
  recommendations: string[];
}

export interface RouteInfo {
  file: string;
  path: string;
  hasLoader: boolean;
  hasAction: boolean;
  hasMeta: boolean;
  hasGraphQL: boolean;
}

export interface ComponentInfo {
  file: string;
  name: string;
  hasProps: boolean;
  propsInterface?: string;
  imports: string[];
}

export interface StyleConfig {
  hasTailwind: boolean;
  tailwindConfig?: string;
  customClasses: string[];
}

export interface ProjectConfig {
  typescript: boolean;
  eslint: boolean;
  prettier: boolean;
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'unknown';
}
