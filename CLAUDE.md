## MCP SERVERS - USE THESE TOOLS DIRECTLY

- hydrogen-forge-shopify: listProducts, getProduct, createProduct, executeGraphQL
- hydrogen-forge-hydrogen: scaffoldComponent, scaffoldRoute, analyzeProject
  DO NOT READ SOURCE FILES. CALL THE MCP TOOLS.

---

# Hydrogen Forge - Claude Code Session Bootstrap

## Project Overview

**Hydrogen Forge** is a developer-focused Shopify Hydrogen ecosystem. No vendor lock-in, MCP-native, comprehensive tooling.

Key differentiator: Every existing Hydrogen starter is locked to a platform (Pack, Sanity, Weaverse). We build standalone developer tools.

---

## Session Start Protocol

### 1. Pull Latest Context

```
Read: .claude/CONTEXT.md
```

This file contains current project state, completed work, and next priorities.

### 2. Determine Your Role

Ask the user: **"Which role should I use for this session?"**

Available roles (read from `.claude/projects/`):
| Role | File | Focus |
|------|------|-------|
| ARCHITECT | architect.md | Planning, decisions, quality review |
| HYDROGEN | hydrogen.md | Components, routes, React code |
| TOOLING | tooling.md | MCPs, CLI, CI/CD |
| DOCS | docs.md | READMEs, tutorials, guides |

If user doesn't specify, check `PRIORITIES.md` for current sprint focus.

### 3. Load Role Instructions

```
Read: .claude/projects/{role}.md
```

Follow that role's specific responsibilities and constraints.

---

## Session Workflow

```
START
├── Pull .claude/CONTEXT.md
├── Ask user for role (or infer from task)
├── Read .claude/projects/{role}.md
└── Read .claude/RULES.md for working style

WORK
├── Execute tasks following role rules
├── Use commit prefix: [ARCHITECT], [HYDROGEN], [TOOLING], or [DOCS]
└── Stop on errors - diagnose before fixing

END
├── Update .claude/CONTEXT.md with progress
├── Create session log in .sessions/logs/{date}-{id}.md
└── Push all changes to GitHub
```

---

## Key File Locations

| File                    | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `.claude/CONTEXT.md`    | Project state (read first, update at end)      |
| `.claude/PRIORITIES.md` | Current sprint tasks                           |
| `.claude/DECISIONS.md`  | Architecture Decision Records                  |
| `.claude/RULES.md`      | Code quality, git workflow, commit conventions |
| `.claude/projects/*.md` | Role-specific instructions                     |
| `.sessions/TEMPLATE.md` | Session log template                           |
| `.sessions/logs/`       | Historical session logs                        |

---

## Working Style

See `.claude/RULES.md` for:

- Code quality standards (TypeScript strict, no `any`)
- Git workflow (one file at a time, verify before next change)
- Commit convention (`<type>(<scope>): <description> [ROLE]`)
- Session protocol

---

## Commit Prefixes

Always include role in commits:

- `[ARCHITECT]` - Planning, architecture changes
- `[HYDROGEN]` - Component and route code
- `[TOOLING]` - MCP, CLI, build config
- `[DOCS]` - Documentation updates

---

## Quick Start

1. Read this file ✓
2. Read `.claude/CONTEXT.md`
3. Ask: "Which role for this session?"
4. Read `.claude/projects/{role}.md`
5. Begin work
