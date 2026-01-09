# Hydrogen Forge - Project Context
## Last Updated: 2026-01-09 | Session 1 Complete

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

### In Progress 🔄
- [ ] GitHub repository creation with proper structure
- [ ] Claude Projects setup (4 specialized roles)
- [ ] MCP development for collaboration automation

### Not Started ⏳
- [ ] Base theme development
- [ ] Enhanced Shopify MCP
- [ ] Hydrogen-specific MCP
- [ ] CLI tooling

---

## KEY DOCUMENTS CREATED

| Document | Location | Purpose |
|----------|----------|---------|
| Master Plan | HYDROGEN-FORGE-MASTER-PLAN.md | 4-week execution plan, vision, architecture |
| Market Research | HYDROGEN-FORGE-MARKET-RESEARCH.md | Competitive analysis, opportunity assessment |
| Collaboration Architecture | HYDROGEN-FORGE-COLLABORATION-ARCHITECTURE.md | How Claude Chat/Code/Projects work together |
| Clean Setup Guide | HYDROGEN-FORGE-CLEAN-SETUP.md | Golden path for Hydrogen setup |
| Setup Log | HYDROGEN-FORGE-SETUP-LOG.md | Issues encountered, fixes, learnings |

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
├── demo-store-research/        # Mock.shop analysis (complete)
├── starter-skeleton/           # Connected to dev store (32 products)
├── Sessions/
│   └── Session-1/              # Today's work
├── PRIVATE/
│   └── CREDENTIALS-MASTER.md   # API keys (gitignored)
└── *.md                        # Planning documents
```

### Connected Store
- Domain: dev-store-749237498237498787.myshopify.com
- Products: 32 (from Commerce Hub migration)
- Storefront API: Configured in starter-skeleton/.env

---

## COLLABORATION SYSTEM (TO BE IMPLEMENTED)

### GitHub Repository Structure
```
github.com/nathanmcmullendev/hydrogen-forge/
├── .claude/
│   ├── CONTEXT.md              # This file (always read first)
│   ├── PRIORITIES.md           # Current sprint
│   ├── DECISIONS.md            # ADRs
│   └── projects/               # Role-specific instructions
│       ├── architect.md
│       ├── hydrogen.md
│       ├── tooling.md
│       └── docs.md
├── .sessions/                  # Auto-generated session logs
├── research/                   # Research artifacts
├── packages/                   # MCPs and CLI
└── templates/                  # Theme templates
```

### The 4 Claude Projects
| Project | Role | Responsibilities |
|---------|------|------------------|
| ARCHITECT | Lead | Planning, decisions, quality review |
| HYDROGEN | Developer | Components, routes, React code |
| TOOLING | Infrastructure | MCPs, CLI, CI/CD |
| DOCS | Documentation | READMEs, tutorials, guides |

### Session Workflow
```
START: Pull .claude/CONTEXT.md from GitHub
WORK: Execute tasks for current priority
END: Push updates + create session log
```

---

## NEXT PRIORITY

**Immediate:** Set up GitHub repository and collaboration infrastructure

1. Create GitHub repo with .claude/ structure
2. Initialize 4 Claude Projects with role instructions
3. Create MCP tools for automated sync (claude_context_pull, claude_context_push)
4. Test full session workflow

**Then:** Begin Day 2 - Base theme development

---

## SESSION INSTRUCTIONS

### For Claude Chat
```
1. Read this CONTEXT.md first
2. Check PRIORITIES.md for current focus
3. Make decisions, update DECISIONS.md
4. On session end, update CONTEXT.md
```

### For Claude Code
```
1. Read CONTEXT.md: Pull from GitHub or local .claude/ folder
2. Enter planner mode for complex tasks
3. Follow RULES.md for working style
4. On session end, push updates and create session log
```

### For Claude Projects
```
1. Read role-specific file from .claude/projects/
2. Focus only on that role's responsibilities
3. Use commit prefix: [ARCHITECT], [HYDROGEN], [TOOLING], [DOCS]
4. Coordinate via CONTEXT.md updates
```

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
