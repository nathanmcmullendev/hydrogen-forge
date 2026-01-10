# Contributing to Hydrogen Forge

Thank you for your interest in contributing to Hydrogen Forge! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hydrogen-forge.git
   cd hydrogen-forge
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Project Structure

```
hydrogen-forge/
├── .claude/           # Project context and collaboration files
├── .github/           # CI/CD workflows
├── packages/          # MCP servers and CLI tools
├── templates/         # Theme templates
│   └── starter/       # Base Hydrogen theme
├── research/          # Market research
└── docs/              # Documentation
```

## Code Standards

### TypeScript

- Use TypeScript strict mode
- Avoid `any` types - use proper typing
- Export types alongside components

### React Components

- Use functional components with hooks
- Include proper TypeScript interfaces for props
- Follow accessibility best practices (WCAG 2.1)

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design system tokens
- Mobile-first responsive design

### Formatting

We use Prettier and ESLint for code formatting. Run before committing:

```bash
# Format code
npm run format --workspace=@hydrogen-forge/starter

# Check linting
npm run lint --workspace=@hydrogen-forge/starter
```

Pre-commit hooks are configured to run these automatically.

## Commit Convention

We follow conventional commits:

```
<type>(<scope>): <description> [ROLE]

Examples:
feat(components): add ProductCard component [HYDROGEN]
fix(cart): resolve quantity update bug [HYDROGEN]
docs(readme): update installation instructions [DOCS]
chore(ci): add build workflow [TOOLING]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `chore` - Maintenance tasks
- `refactor` - Code refactoring
- `test` - Adding tests

### Roles

- `[HYDROGEN]` - Component and route code
- `[TOOLING]` - MCP, CLI, CI/CD
- `[DOCS]` - Documentation
- `[ARCHITECT]` - Planning, decisions

## Pull Request Process

1. Ensure all tests pass locally
2. Update documentation if needed
3. Create a pull request with a clear description
4. Link any related issues
5. Wait for CI checks to pass
6. Request review from maintainers

### PR Template

```markdown
## Summary

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] Build succeeds
- [ ] Linting passes

## Related Issues

Fixes #123
```

## Testing

### Running Tests

```bash
# Run all workspace tests
npm run test

# Run starter template tests
cd templates/starter
npm run typecheck
npm run build
```

### Build Verification

Before submitting a PR, ensure the build passes:

```bash
cd templates/starter
npm run build
```

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Join discussions in pull requests

## Code of Conduct

Be respectful and inclusive. We're all here to build great software together.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
