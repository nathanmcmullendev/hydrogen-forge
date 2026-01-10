import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type {ScaffoldRouteInput} from '../lib/types.js';
import {generateRoute, getRouteFileName} from '../templates/routes.js';

export interface ScaffoldResult {
  success: boolean;
  files: Array<{
    path: string;
    created: boolean;
  }>;
  message: string;
}

export async function scaffoldRoute(
  input: ScaffoldRouteInput,
): Promise<ScaffoldResult> {
  const files: Array<{path: string; created: boolean}> = [];

  try {
    // Validate route name format
    const validRoutePattern = /^[a-z$_.[\]]+$/i;
    if (!validRoutePattern.test(input.name)) {
      return {
        success: false,
        files: [],
        message: `Invalid route name "${input.name}". Use format like "products.$handle", "collections._index", "api.webhook"`,
      };
    }

    // Generate route code
    const routeCode = generateRoute(input);

    // Determine output path
    const outputDir = input.outputDir || 'app/routes';
    const routeDir = path.join(process.cwd(), outputDir);
    const fileName = getRouteFileName(input.name);
    const routePath = path.join(routeDir, fileName);

    // Check if file already exists
    try {
      await fs.access(routePath);
      return {
        success: false,
        files: [],
        message: `Route file already exists at ${routePath}. Use a different name or delete the existing file.`,
      };
    } catch {
      // File doesn't exist, continue
    }

    // Ensure directory exists
    await fs.mkdir(routeDir, {recursive: true});

    // Write route file
    await fs.writeFile(routePath, routeCode, 'utf-8');
    files.push({path: routePath, created: true});

    // Provide helpful information about the route
    const routeInfo = getRouteInfo(input.name);

    return {
      success: true,
      files,
      message: `Successfully created ${input.type} route "${input.name}".\n${routeInfo}`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      files,
      message: `Failed to scaffold route: ${errorMessage}`,
    };
  }
}

function getRouteInfo(routeName: string): string {
  // Convert route name to URL path
  const urlPath = routeName
    .replace(/\._index$/, '') // _index becomes the folder root
    .replace(/\./g, '/') // dots become slashes
    .replace(/\$/g, ':') // $param becomes :param
    .replace(/\[([^\]]+)\]/g, '$1'); // [file.ext] becomes file.ext

  const info = [
    `URL Path: /${urlPath || ''}`,
    `File: app/routes/${routeName}.tsx`,
  ];

  // Add notes about special route patterns
  if (routeName.includes('$')) {
    info.push('Dynamic segment: Use params.paramName to access dynamic values');
  }
  if (routeName.includes('_index')) {
    info.push('Index route: Renders at the parent folder URL');
  }
  if (routeName.startsWith('_')) {
    info.push('Pathless layout: Does not add to URL, used for shared layouts');
  }
  if (routeName.includes('[') && routeName.includes(']')) {
    info.push('Escaped route: Square brackets are used literally in URL');
  }

  return info.join('\n');
}
