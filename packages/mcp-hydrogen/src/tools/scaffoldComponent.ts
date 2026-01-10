import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type {ScaffoldComponentInput} from '../lib/types.js';
import {generateComponent, generateTestFile} from '../templates/components.js';

export interface ScaffoldResult {
  success: boolean;
  files: Array<{
    path: string;
    created: boolean;
  }>;
  message: string;
}

export async function scaffoldComponent(
  input: ScaffoldComponentInput,
): Promise<ScaffoldResult> {
  const files: Array<{path: string; created: boolean}> = [];

  try {
    // Validate component name is PascalCase
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(input.name)) {
      return {
        success: false,
        files: [],
        message: `Invalid component name "${input.name}". Must be PascalCase (e.g., "ProductCard", "CartDrawer")`,
      };
    }

    // Generate component code
    const componentCode = generateComponent(input);

    // Determine output path
    const outputDir = input.outputDir || 'app/components';
    const componentDir = path.join(process.cwd(), outputDir);
    const componentPath = path.join(componentDir, `${input.name}.tsx`);

    // Check if file already exists
    try {
      await fs.access(componentPath);
      return {
        success: false,
        files: [],
        message: `Component file already exists at ${componentPath}. Use a different name or delete the existing file.`,
      };
    } catch {
      // File doesn't exist, continue
    }

    // Ensure directory exists
    await fs.mkdir(componentDir, {recursive: true});

    // Write component file
    await fs.writeFile(componentPath, componentCode, 'utf-8');
    files.push({path: componentPath, created: true});

    // Generate test file if requested
    if (input.withTests) {
      const testDir = path.join(componentDir, '__tests__');
      const testPath = path.join(testDir, `${input.name}.test.tsx`);

      await fs.mkdir(testDir, {recursive: true});
      const testCode = generateTestFile(input.name);
      await fs.writeFile(testPath, testCode, 'utf-8');
      files.push({path: testPath, created: true});
    }

    return {
      success: true,
      files,
      message: `Successfully created ${input.type} component "${input.name}" with ${files.length} file(s)`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      files,
      message: `Failed to scaffold component: ${errorMessage}`,
    };
  }
}
