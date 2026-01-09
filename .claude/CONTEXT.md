# Hydrogen Forge - Project Context
## Last Updated: 2026-01-09 | Infrastructure Complete

---

## PROJECT VISION

Build "Hydrogen Forge" - the first developer-focused ecosystem for Shopify Hydrogen. No vendor lock-in, MCP-native, comprehensive tooling.

**Key Differentiator:** Every existing Hydrogen starter is locked to a platform (Pack, Sanity, Weaverse). We build standalone developer tools.

---

## CURRENT STATUS

### Completed ✅
- [x] Market research - identified empty market (1 consumer theme, no developer ecosystem)
- [x] Competitive analysis - documented Ciseco, Weaverse, platform-locked starters
- [x] Shopify demo-store analysis - 30 routes, 27 components, Mock.shop data structure
- [x] Technical stack decisions (TypeScript, pnpm, React Router 7)
- [x] Collaboration architecture designed (GitHub as single source of truth)
- [x] Local development environment set up
- [x] GitHub repository created with full structure
- [x] 5 role configs created (ARCHITECT, HYDROGEN, TOOLING, DOCS, MANAGER)
- [x] MCP sync package scaffolded (packages/mcp-claude-sync)
- [x] Session template and workflow established

### In Progress 🔄
- [ ] Base theme development

### Not Started ⏳
- [ ] Enhanced Shopify MCP
- [ ] Hydrogen-specific MCP
- [ ] CLI tooling

---

## KEY DOCUMENTS CREATED

| Document | Location | Purpose |
|----------|----------|---------|
| Master Plan | HYDROGEN-FORGE-MASTER-PLAN.md | 4-week execution plan, vision, architecture |
| Market Research | research/MARKET-RESEARCH.md | Competitive analysis, opportunity assessment |
| Rules | .claude/RULES.md | Code quality, git workflow, commit conventions |
| Priorities | .claude/PRIORITIES.md | Current sprint tracking |
| Decisions | .claude/DECISIONS.md | Architecture Decision Records |

---

## KEY FINDINGS FROM RESEARCH

### Market Gap
```
WHAT EXISTS:
- Shopify official: skeleton (bare) + demo-store (snowboards)
- ThemeForest: 1 theme (Ciseco, $49, 120 sales, consumer-focused)
- Platform-locked: Pack, Sanity, Contentful, Weaverse starters

WHAT DOESN'T EXIST:
- Standalone developer-focused starter
- MCP integration for AI-assisted development
- CLI scaffolding tools
- Comprehensive ecosystem (theme + tools + templates)
```

### Demo Store Analysis (Mock.shop)
```
STRUCTURE:
- 30 routes (pages)
- 27 components
- Snowboard products with variants
- Basic collections
- No metafields examples
- Single product niche

OPPORTUNITIES:
- Multi-industry demo data
- Edge cases (OOS, sale, backorder)
- Metafields examples
- Better variant coverage
- Developer-focused documentation
```

---

## ARCHITECTURE DECISIONS

### ADR-001: Start from Skeleton
**Decision:** Use skeleton template, not demo-store
**Rationale:** Cleaner starting point, no snowboard-specific code to remove

### ADR-002: Package Manager
**Decision:** Use pnpm
**Rationale:** Faster, disk-efficient, stricter dependency resolution

### ADR-003: TypeScript Strict
**Decision:** Enable strict mode
**Rationale:** Better type safety, catch errors early

### ADR-004: GitHub as Single Source of Truth
**Decision:** All collaboration files, context, session logs in GitHub
**Rationale:** Enables seamless handoffs between Claude Chat, Code, and Projects

---

## LOCAL ENVIRONMENT

### Folder Structure
```
C:\xampp\htdocs\HYDROGEN-FORGE\
├── hydrogen-forge-repo/        # GitHub repo (this project)
├── demo-store-research/        # Mock.shop analysis (complete)
├── starter-skeleton/           # Connected to dev store (32 products)
├── Sessions/
│   └── Session-1/              # Day 1 work
├── PRIVATE/
│   └── CREDENTIALS-MASTER.md   # API keys (gitignored)
└── *.md                        # Planning documents
```

### Connected Store
- Domain: dev-store-749237498237498787.myshopify.com
- Products: 32 (from Commerce Hub migration)
- Storefront API: Configured in starter-skeleton/.env

---

## COLLABORATION SYSTEM

### GitHub Repository Structure
```
github.com/nathanmcmullendev/hydrogen-forge/
├── .claude/
│   ├── CONTEXT.md              # This file (always read first)
│   ├── PRIORITIES.md           # Current sprint
│   ├── DECISIONS.md            # ADRs
│   ├── RULES.md                # Working rules
│   └── projects/               # Role-specific instructions
│       ├── architect.md
│       ├── hydrogen.md
│       ├── tooling.md
│       ├── docs.md
│       └── manager.md
├── .sessions/
│   ├── TEMPLATE.md             # Session log template
│   └── logs/                   # Session logs
├── research/                   # Research artifacts
├── packages/
│   └── mcp-claude-sync/        # Collaboration MCP (scaffolded)
├── docs/                       # Documentation
└── templates/                  # Theme templates
```

### The 5 Roles
| Role | Owner | Responsibilities |
|------|-------|------------------|
| MANAGER | Claude Chat | Orchestration, task assignment, review |
| ARCHITECT | Claude Code | Planning, decisions, quality review |
| HYDROGEN | Claude Code | Components, routes, React code |
| TOOLING | Claude Code | MCPs, CLI, CI/CD |
| DOCS | Claude Code | READMEs, tutorials, guides |

### Session Workflow
```
1. User tells Claude Code which role: "Act as HYDROGEN"
2. Claude Code reads .claude/projects/hydrogen.md
3. Claude Code executes tasks following role rules
4. Claude Code pushes session log and updates CONTEXT.md
5. User returns to MANAGER (Claude Chat) for review
```

---

## NEXT PRIORITY

**Immediate:** Begin base theme development

1. Create starter theme from skeleton template
2. Set up component library structure
3. Implement core layout components
4. Connect to dev store for testing

**Then:** Enhanced Shopify MCP development

---

## SESSION INSTRUCTIONS

### For Claude Chat (MANAGER)
```
1. Read this CONTEXT.md first
2. Check PRIORITIES.md for current focus
3. Assign tasks to appropriate roles
4. Review session outputs from Claude Code
```

### For Claude Code
```
1. User specifies role: "Act as HYDROGEN"
2. Read role file from .claude/projects/
3. Read CONTEXT.md for project state
4. Follow RULES.md for working style
5. On session end: push updates, create session log
```

### Commit Prefixes
- [ARCHITECT] - Planning, architecture changes
- [HYDROGEN] - Component and route code
- [TOOLING] - MCP, CLI, build config
- [DOCS] - Documentation updates
- [SYNC] - Automated context updates

---

## CREDENTIALS REFERENCE

**Location:** `C:\xampp\htdocs\HYDROGEN-FORGE\PRIVATE\CREDENTIALS-MASTER.md`

Contains:
- GitHub token
- Shopify Storefront API tokens
- Supabase keys
- Other API credentials

**Never commit credentials to GitHub.**

---

*This file is the single source of truth. Update it at every session end.*
