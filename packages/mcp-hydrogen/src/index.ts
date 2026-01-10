#!/usr/bin/env node

import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
  ScaffoldComponentSchema,
  ScaffoldRouteSchema,
  AnalyzeProjectSchema,
} from './lib/types.js';

import {scaffoldComponent} from './tools/scaffoldComponent.js';
import {scaffoldRoute} from './tools/scaffoldRoute.js';
import {analyzeProject} from './tools/analyzeProject.js';

const server = new Server(
  {
    name: 'mcp-hydrogen',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Tool definitions
const TOOLS = [
  {
    name: 'scaffoldComponent',
    description:
      'Generate a new Hydrogen/React component with TypeScript types and optional test file. ' +
      'Supports multiple component types: basic, product, collection, cart, form, layout. ' +
      'Each type includes appropriate imports, props interfaces, and Tailwind CSS classes.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description:
            'Component name in PascalCase (e.g., "ProductCard", "CartDrawer")',
        },
        type: {
          type: 'string',
          enum: ['basic', 'product', 'collection', 'cart', 'form', 'layout'],
          description:
            'Component type template. "basic" for simple components, "product" for product display, "collection" for collection cards, "cart" for cart items, "form" for form components, "layout" for layout wrappers.',
          default: 'basic',
        },
        props: {
          type: 'array',
          description: 'Custom props to add to the component',
          items: {
            type: 'object',
            properties: {
              name: {type: 'string', description: 'Prop name'},
              type: {
                type: 'string',
                description: 'TypeScript type (e.g., "string", "number")',
              },
              required: {type: 'boolean', description: 'Is prop required?'},
              description: {type: 'string', description: 'JSDoc description'},
            },
            required: ['name', 'type'],
          },
        },
        outputDir: {
          type: 'string',
          description: 'Output directory relative to project root',
          default: 'app/components',
        },
        withStyles: {
          type: 'boolean',
          description: 'Include Tailwind CSS classes',
          default: true,
        },
        withTests: {
          type: 'boolean',
          description: 'Generate test file',
          default: false,
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'scaffoldRoute',
    description:
      'Generate a new Hydrogen/React Router route with loader, action, and meta functions. ' +
      'Supports route types: page (standard page), resource (API-like), collection (product listing), ' +
      'product (product detail), account (authenticated), api (API endpoint). ' +
      'Includes GraphQL query templates for data fetching.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description:
            'Route name/path using React Router conventions (e.g., "products.$handle", "collections._index", "api.webhook")',
        },
        type: {
          type: 'string',
          enum: ['page', 'resource', 'collection', 'product', 'account', 'api'],
          description:
            'Route type template. Determines the generated structure and included features.',
          default: 'page',
        },
        withLoader: {
          type: 'boolean',
          description: 'Include loader function for data fetching',
          default: true,
        },
        withAction: {
          type: 'boolean',
          description: 'Include action function for form handling',
          default: false,
        },
        withMeta: {
          type: 'boolean',
          description: 'Include meta function for SEO',
          default: true,
        },
        withGraphQL: {
          type: 'boolean',
          description: 'Include GraphQL query template',
          default: false,
        },
        outputDir: {
          type: 'string',
          description: 'Output directory relative to project root',
          default: 'app/routes',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'analyzeProject',
    description:
      'Analyze a Hydrogen project structure and provide insights. ' +
      'Scans routes, components, styles, and configuration. ' +
      'Provides recommendations for improving the project setup.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the Hydrogen project to analyze',
          default: '.',
        },
        includeRoutes: {
          type: 'boolean',
          description: 'Analyze routes',
          default: true,
        },
        includeComponents: {
          type: 'boolean',
          description: 'Analyze components',
          default: true,
        },
        includeStyles: {
          type: 'boolean',
          description: 'Analyze style configuration',
          default: true,
        },
        includeConfig: {
          type: 'boolean',
          description: 'Analyze project configuration',
          default: true,
        },
      },
    },
  },
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {tools: TOOLS};
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const {name, arguments: args} = request.params;

  try {
    switch (name) {
      case 'scaffoldComponent': {
        const input = ScaffoldComponentSchema.parse(args);
        const result = await scaffoldComponent(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'scaffoldRoute': {
        const input = ScaffoldRouteSchema.parse(args);
        const result = await scaffoldRoute(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'analyzeProject': {
        const input = AnalyzeProjectSchema.parse(args);
        const result = await analyzeProject(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Hydrogen MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
