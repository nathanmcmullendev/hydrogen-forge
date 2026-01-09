# Hydrogen Forge - Project Context
## Last Updated: 2026-01-09 | Week 1, Day 2 Complete

---

## PROJECT VISION

Build "Hydrogen Forge" - the first developer-focused ecosystem for Shopify Hydrogen. No vendor lock-in, MCP-native, comprehensive tooling.

**Key Differentiator:** Every existing Hydrogen starter is locked to a platform (Pack, Sanity, Weaverse). We build standalone developer tools.

---

## CURRENT STATUS

### Sprint: Week 1 - Foundation
**Day 1-2:** Complete ✅
**Day 3:** Base Theme Setup ← NEXT

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
- [x] **4-week sprint plan created with role assignments**

### Day 3 Tasks (Next Session)
| Task | Role | Priority |
|------|------|----------|
| Create starter theme in templates/starter/ | HYDROGEN | P0 |
| Configure TypeScript strict mode | HYDROGEN | P0 |
| Set up Tailwind CSS | HYDROGEN | P0 |
| ADR-005: Component architecture pattern | ARCHITECT | P0 |

---

## 4-WEEK EXECUTION PLAN

### Week 1: Foundation (Days 1-5)
- Day 1-2: Research & infrastructure ✅
- Day 3: Base theme setup (HYDROGEN)
- Day 4: Layout components - Header, Footer, Nav (HYDROGEN)
- Day 5: CI/CD & quality gates (TOOLING)

### Week 2: Core Components + MCP (Days 6-10)
- Day 6-7: Product components (HYDROGEN)
- Day 8-9: Enhanced Shopify MCP (TOOLING)
- Day 10: Cart & Collection components (HYDROGEN)

### Week 3: Search + Hydrogen MCP (Days 11-15)
- Day 11-12: Search components (HYDROGEN)
- Day 13-14: Hydrogen MCP (TOOLING)
- Day 15: Integration testing (ALL)

### Week 4: CLI + Launch (Days 16-20)
- Day 16-17: CLI development (TOOLING)
- Day 18-19: Documentation (DOCS)
- Day 20: Launch (ALL)

---

## DELIVERABLES BY WEEK

### Week 1 Deliverables
- [ ] Base theme compiles and runs
- [ ] Layout components (Header, Footer, Nav, MobileMenu)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] ADR-005, ADR-006 documented

### Week 2 Deliverables
- [ ] Product components (Card, Grid, Gallery, Form, Price)
- [ ] Cart components (Drawer, LineItem)
- [ ] Collection components (Grid, Filters)
- [ ] Enhanced Shopify MCP with executeGraphQL

### Week 3 Deliverables
- [ ] Search components (Dialog, PredictiveSearch)
- [ ] Hydrogen MCP (scaffoldComponent, scaffoldRoute)
- [ ] 95+ PageSpeed score
- [ ] Accessibility compliance

### Week 4 Deliverables
- [ ] CLI (npx hydrogen-forge create)
- [ ] All documentation complete
- [ ] Live demo deployed
- [ ] npm packages published

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

### Pending Decisions
- ADR-005: Component architecture pattern
- ADR-006: State management approach
- ADR-007: MCP tool design

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
│   ├── PRIORITIES.md           # Sprint plan with day-by-day tasks
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
├── templates/                  # Theme templates (Week 1)
├── docs/                       # Documentation
└── CLAUDE.md                   # Auto-read bootstrap file
```

### The 5 Roles
| Role | Owner | Focus |
|------|-------|-------|
| MANAGER | Claude Chat | Orchestration, task assignment |
| ARCHITECT | Claude Code | Planning, ADRs, quality review |
| HYDROGEN | Claude Code | Components, routes, React code |
| TOOLING | Claude Code | MCPs, CLI, CI/CD |
| DOCS | Claude Code | Documentation, guides |

### Session Workflow
```
1. User tells Claude Code which role: "Act as HYDROGEN"
2. Claude Code reads .claude/projects/hydrogen.md
3. Claude Code checks PRIORITIES.md for current tasks
4. Claude Code executes tasks following role rules
5. Claude Code pushes session log and updates CONTEXT.md
6. User returns to MANAGER (Claude Chat) for review
```

---

## NEXT SESSION INSTRUCTIONS

**Role Needed:** HYDROGEN (or ARCHITECT first for ADR-005)

**Tasks:**
1. Create starter theme structure in templates/starter/
2. Configure TypeScript strict mode
3. Set up Tailwind CSS
4. Verify build works

**Start Command:**
```
Act as HYDROGEN for this session.
Read .claude/projects/hydrogen.md and .claude/PRIORITIES.md.
Execute Day 3 tasks: Base Theme Setup.
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
