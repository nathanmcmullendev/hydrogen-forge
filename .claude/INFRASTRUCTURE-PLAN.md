# CLAUDE CODE - Infrastructure Setup Plan
## Enter Planner Mode and Execute This

---

## OBJECTIVE

Set up the complete Hydrogen Forge collaboration infrastructure:
1. GitHub repository with proper structure
2. 4 Claude Projects with role-specific instructions
3. MCP tools for automated context sync
4. Session workflow automation

---

## READ THESE FILES FIRST

```
C:\xampp\htdocs\HYDROGEN-FORGE\HYDROGEN-FORGE-MASTER-PLAN.md
C:\xampp\htdocs\HYDROGEN-FORGE\Sessions\Session-1\HYDROGEN-FORGE-COLLABORATION-ARCHITECTURE.md
C:\xampp\htdocs\HYDROGEN-FORGE\Sessions\Session-1\CONTEXT.md
C:\xampp\htdocs\HYDROGEN-FORGE\PRIVATE\CREDENTIALS-MASTER.md
```

---

## PHASE 1: GitHub Repository Setup

### Task 1.1: Create Repository
```
Organization: nathanmcmullendev (or hydrogen-forge if creating org)
Repo name: hydrogen-forge
Visibility: Public
Description: "Developer-focused Shopify Hydrogen ecosystem. Clean architecture, MCP integration, no vendor lock-in."
```

### Task 1.2: Create Directory Structure
```
hydrogen-forge/
├── .claude/
│   ├── CONTEXT.md
│   ├── PRIORITIES.md
│   ├── DECISIONS.md
│   ├── RULES.md
│   └── projects/
│       ├── architect.md
│       ├── hydrogen.md
│       ├── tooling.md
│       └── docs.md
├── .sessions/
│   ├── TEMPLATE.md
│   └── logs/
│       └── .gitkeep
├── research/
│   └── RESEARCH-NOTES.md
├── docs/
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   └── CONTRIBUTING.md
├── packages/
│   ├── mcp-shopify/
│   ├── mcp-hydrogen/
│   ├── mcp-claude-sync/
│   └── cli/
├── templates/
│   └── starter/
├── .gitignore
├── README.md
└── package.json
```

### Task 1.3: Create .gitignore
```gitignore
# Credentials - NEVER commit
.credentials/
CREDENTIALS*.md
*.env
.env.*

# Dependencies
node_modules/

# Build
dist/
build/
.cache/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

### Task 1.4: Push Initial Files
Move these existing files to appropriate locations:
- CONTEXT.md → .claude/CONTEXT.md
- RESEARCH-NOTES.md → research/RESEARCH-NOTES.md
- MASTER-PLAN.md → docs/MASTER-PLAN.md
- COLLABORATION-ARCHITECTURE.md → docs/COLLABORATION-ARCHITECTURE.md

---

## PHASE 2: Claude Project Configuration Files

### Task 2.1: Create .claude/RULES.md
```markdown
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
```

### Task 2.2: Create .claude/PRIORITIES.md
```markdown
# Hydrogen Forge - Current Priorities

## Sprint: Infrastructure Setup
**Duration:** Day 1-2
**Goal:** Complete collaboration infrastructure

### This Sprint
1. [x] Market research
2. [x] Demo store analysis
3. [ ] GitHub repo setup ← CURRENT
4. [ ] Claude Projects configured
5. [ ] MCP sync tools created
6. [ ] Test full workflow

### Next Sprint
- Base theme development
- Component library
- Enhanced Shopify MCP

### Backlog
- CLI tooling
- Additional templates
- Documentation site
- Pro version
```

### Task 2.3: Create .claude/projects/architect.md
```markdown
# ARCHITECT - Project Instructions

## Role
Lead architect for Hydrogen Forge. You own planning, architecture decisions, and quality.

## On Session Start
1. Pull .claude/CONTEXT.md from GitHub
2. Review PRIORITIES.md for current sprint
3. Check DECISIONS.md for pending items

## Responsibilities
- Break features into actionable tasks
- Make and document architecture decisions (ADRs)
- Review work from other roles
- Maintain CONTEXT.md as source of truth
- Resolve technical conflicts

## You DO NOT
- Write component code (that's HYDROGEN)
- Build MCPs/CLI (that's TOOLING)
- Write tutorials (that's DOCS)

## Commit Prefix
[ARCHITECT]

## Decision Template
When making decisions, add to DECISIONS.md:
```
### ADR-XXX: Title
**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated
**Context:** Why this decision is needed
**Decision:** What we decided
**Consequences:** What this means
```

## On Session End
1. Update .claude/CONTEXT.md with current state
2. Log decisions made
3. Create session summary in .sessions/logs/
```

### Task 2.4: Create .claude/projects/hydrogen.md
```markdown
# HYDROGEN - Project Instructions

## Role
React/Hydrogen component developer. You build the actual storefront code.

## On Session Start
1. Pull .claude/CONTEXT.md from GitHub
2. Check assigned tasks in PRIORITIES.md
3. Review component patterns in docs/ARCHITECTURE.md

## Responsibilities
- Build reusable UI components
- Implement page routes
- Write component tests
- Follow TypeScript strict mode
- Optimize for performance (95+ PageSpeed)

## You DO NOT
- Make architecture decisions (propose to ARCHITECT)
- Build MCPs/CLI (that's TOOLING)
- Write external documentation (that's DOCS)

## Commit Prefix
[HYDROGEN]

## Component Standards
- Functional components with TypeScript
- Props interface defined and exported
- Default exports for components
- Tailwind for styling
- Tests in adjacent .test.tsx file

## On Session End
1. Update CONTEXT.md with progress
2. Note any blockers or decisions needed
3. Create session summary
```

### Task 2.5: Create .claude/projects/tooling.md
```markdown
# TOOLING - Project Instructions

## Role
Infrastructure and tooling specialist. You build MCPs, CLI, and dev tools.

## On Session Start
1. Pull .claude/CONTEXT.md from GitHub
2. Check tooling tasks in PRIORITIES.md
3. Review MCP patterns in packages/

## Responsibilities
- Build and enhance MCPs
- Develop CLI tools
- Set up CI/CD pipelines
- Manage build configuration
- Create developer utilities

## You DO NOT
- Build UI components (that's HYDROGEN)
- Make architecture decisions (propose to ARCHITECT)
- Write tutorials (that's DOCS)

## Commit Prefix
[TOOLING]

## MCP Standards
- TypeScript with strict mode
- JSON-RPC protocol compliance
- Comprehensive tool documentation
- Error handling with clear messages
- Tests for all tools

## On Session End
1. Update CONTEXT.md with progress
2. Document new tools in packages/*/README.md
3. Create session summary
```

### Task 2.6: Create .claude/projects/docs.md
```markdown
# DOCS - Project Instructions

## Role
Documentation specialist. You make Hydrogen Forge understandable.

## On Session Start
1. Pull .claude/CONTEXT.md from GitHub
2. Check documentation needs
3. Review existing docs for consistency

## Responsibilities
- Write and maintain READMEs
- Create tutorials and guides
- Document component APIs
- Maintain setup instructions
- Write changelog entries

## You DO NOT
- Write component code (that's HYDROGEN)
- Build MCPs/CLI (that's TOOLING)
- Make architecture decisions (that's ARCHITECT)

## Commit Prefix
[DOCS]

## Documentation Standards
- Clear, developer-focused language
- Code examples that actually work
- Step-by-step instructions
- Troubleshooting sections
- Keep updated with code changes

## On Session End
1. Update CONTEXT.md with docs progress
2. Note any undocumented features
3. Create session summary
```

---

## PHASE 3: MCP for Claude Sync

### Task 3.1: Create packages/mcp-claude-sync/package.json
```json
{
  "name": "@hydrogen-forge/mcp-claude-sync",
  "version": "0.1.0",
  "description": "MCP tools for Claude collaboration sync",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@octokit/rest": "^20.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### Task 3.2: Create packages/mcp-claude-sync/src/index.ts
```typescript
import { Octokit } from '@octokit/rest';

interface SyncConfig {
  owner: string;
  repo: string;
  token: string;
}

// Tool: Pull current context from GitHub
export async function claude_context_pull(config: SyncConfig) {
  const octokit = new Octokit({ auth: config.token });
  
  const { data } = await octokit.repos.getContent({
    owner: config.owner,
    repo: config.repo,
    path: '.claude/CONTEXT.md'
  });
  
  if ('content' in data) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  throw new Error('CONTEXT.md not found');
}

// Tool: Push updated context to GitHub
export async function claude_context_push(
  config: SyncConfig, 
  content: string,
  message: string
) {
  const octokit = new Octokit({ auth: config.token });
  
  // Get current SHA
  const { data: current } = await octokit.repos.getContent({
    owner: config.owner,
    repo: config.repo,
    path: '.claude/CONTEXT.md'
  });
  
  const sha = 'sha' in current ? current.sha : undefined;
  
  // Update file
  await octokit.repos.createOrUpdateFileContents({
    owner: config.owner,
    repo: config.repo,
    path: '.claude/CONTEXT.md',
    message: `chore(context): ${message} [SYNC]`,
    content: Buffer.from(content).toString('base64'),
    sha
  });
  
  return { success: true };
}

// Tool: Create session log
export async function claude_session_log(
  config: SyncConfig,
  sessionId: string,
  content: string
) {
  const octokit = new Octokit({ auth: config.token });
  
  const date = new Date().toISOString().split('T')[0];
  const path = `.sessions/logs/${date}-${sessionId}.md`;
  
  await octokit.repos.createOrUpdateFileContents({
    owner: config.owner,
    repo: config.repo,
    path,
    message: `docs(session): add ${date} ${sessionId} log [SYNC]`,
    content: Buffer.from(content).toString('base64')
  });
  
  return { success: true, path };
}

// Tool: Get project-specific instructions
export async function claude_project_config(
  config: SyncConfig,
  role: 'architect' | 'hydrogen' | 'tooling' | 'docs'
) {
  const octokit = new Octokit({ auth: config.token });
  
  const { data } = await octokit.repos.getContent({
    owner: config.owner,
    repo: config.repo,
    path: `.claude/projects/${role}.md`
  });
  
  if ('content' in data) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  throw new Error(`${role}.md not found`);
}
```

---

## PHASE 4: Session Template

### Task 4.1: Create .sessions/TEMPLATE.md
```markdown
# Session Log: {DATE} - {SESSION_ID}

## Session Info
- **Date:** {DATE}
- **Role:** {ARCHITECT | HYDROGEN | TOOLING | DOCS}
- **Duration:** {START} - {END}

## Objectives
What was planned for this session.

## Completed
- [ ] Task 1
- [ ] Task 2

## Decisions Made
Any ADRs or significant decisions.

## Blockers Encountered
Issues that slowed progress.

## Next Session
What should happen next.

## Files Changed
- path/to/file.ts - description
- path/to/other.ts - description

## Notes
Any additional context.
```

---

## EXECUTION ORDER

1. **Create GitHub repo** using GitHub MCP
2. **Create directory structure** (all folders)
3. **Create .gitignore**
4. **Create .claude/ files** (CONTEXT.md, RULES.md, PRIORITIES.md, DECISIONS.md)
5. **Create .claude/projects/** (all 4 role files)
6. **Create .sessions/TEMPLATE.md**
7. **Create packages/mcp-claude-sync/** (package.json, src/index.ts)
8. **Create initial README.md**
9. **Move research files** to /research/
10. **Verify structure** is correct
11. **Report completion**

---

## VERIFICATION CHECKLIST

After execution, confirm:
- [ ] GitHub repo exists and is accessible
- [ ] .claude/CONTEXT.md is readable
- [ ] All 4 project files exist in .claude/projects/
- [ ] .gitignore excludes credentials
- [ ] MCP sync package structure is correct
- [ ] Session template exists

---

## START COMMAND

```
Enter planner mode.

Read all files listed in "READ THESE FILES FIRST" section.

Execute phases 1-4 in order.

Use GitHub MCP for all repository operations.

Report completion with verification checklist.
```
