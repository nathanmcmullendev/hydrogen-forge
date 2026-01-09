# Hydrogen Forge - Working Rules

## Code Quality
- TypeScript strict mode always
- No `any` types
- Tests required for components
- ESLint + Prettier before commit

## Git Workflow
- One file at a time for complex changes
- Verify deployment before next change
- Meaningful commit messages (conventional commits)
- Stop on errors - diagnose before fixing

## Commit Convention
Format: `<type>(<scope>): <description> [ROLE]`

Types: feat, fix, docs, style, refactor, test, chore
Scopes: core, components, routes, mcp, cli, docs, ci
Roles: [ARCHITECT], [HYDROGEN], [TOOLING], [DOCS]

Example: `feat(components): add ProductCard with variants [HYDROGEN]`

## Session Protocol
- START: Pull .claude/CONTEXT.md
- WORK: Follow current priorities
- END: Update CONTEXT.md, create session log

## Communication
- Senior developer approach
- No unnecessary explanations
- Direct, actionable guidance
- Document decisions in ADRs
