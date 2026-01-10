# Hydrogen Forge - Sprint Priorities

## Current Sprint: Week 2 - Core Components + MCP

**Start Date:** 2026-01-09
**Status:** Week 2 Complete, Week 3 Day 11-12 Next

---

## Week 1: Foundation (Days 1-5) ✅ COMPLETE

### Day 1-2: Research & Infrastructure ✅ COMPLETE

- [x] Market research - identified empty market
- [x] Demo store analysis - 30 routes, 27 components
- [x] Collaboration infrastructure setup
- [x] GitHub repo with .claude/ structure
- [x] 5 role configs (ARCHITECT, HYDROGEN, TOOLING, DOCS, MANAGER)
- [x] Session workflow established

### Day 3: Base Theme Setup ✅ COMPLETE

| Task                                       | Role      | Priority | Status |
| ------------------------------------------ | --------- | -------- | ------ |
| Create starter theme in templates/starter/ | HYDROGEN  | P0       | ✅     |
| Configure TypeScript strict mode           | HYDROGEN  | P0       | ✅     |
| Set up Tailwind CSS                        | HYDROGEN  | P0       | ✅     |
| ADR-005: Component architecture pattern    | ARCHITECT | P0       | ⏳     |

### Day 4: Layout Components ✅ COMPLETE

| Task                      | Role      | Priority | Status |
| ------------------------- | --------- | -------- | ------ |
| Header component          | HYDROGEN  | P0       | ✅     |
| Footer component          | HYDROGEN  | P0       | ✅     |
| Navigation component      | HYDROGEN  | P0       | ✅     |
| MobileMenu component      | HYDROGEN  | P1       | ✅     |
| ADR-006: State management | ARCHITECT | P1       | ⏳     |

### Day 5: CI/CD & Quality ✅ COMPLETE

| Task                                                     | Role      | Priority | Status |
| -------------------------------------------------------- | --------- | -------- | ------ |
| GitHub Actions workflow (lint, format, typecheck, build) | TOOLING   | P0       | ✅     |
| Pre-commit hooks (husky + lint-staged)                   | TOOLING   | P1       | ✅     |
| README with badges                                       | DOCS      | P1       | ✅     |
| CONTRIBUTING.md                                          | DOCS      | P1       | ✅     |
| Quality review: Week 1                                   | ARCHITECT | P0       | ⏳     |

---

## Week 2: Core Components + MCP (Days 6-10)

### Day 6-7: Product Components ✅ COMPLETE

| Task                                         | Role     | Priority | Status |
| -------------------------------------------- | -------- | -------- | ------ |
| ProductCard component                        | HYDROGEN | P0       | ✅     |
| ProductGrid component                        | HYDROGEN | P0       | ✅     |
| ProductGallery component                     | HYDROGEN | P0       | ✅     |
| ProductForm (variant selection, add to cart) | HYDROGEN | P0       | ✅     |
| ProductPrice component                       | HYDROGEN | P1       | ✅     |
| AddToCartButton component                    | HYDROGEN | P0       | ✅     |

### Day 8-9: Enhanced Shopify MCP ✅ COMPLETE

| Task                                                     | Role      | Priority | Status |
| -------------------------------------------------------- | --------- | -------- | ------ |
| Set up packages/mcp-shopify structure                    | TOOLING   | P0       | ✅     |
| executeGraphQL tool (key feature)                        | TOOLING   | P0       | ✅     |
| Product operations (create, update, get, list, delete)   | TOOLING   | P0       | ✅     |
| Inventory operations (update, adjust, levels, locations) | TOOLING   | P1       | ✅     |
| MCP server entry point & tool registration               | TOOLING   | P0       | ✅     |
| MCP tool documentation (README.md)                       | DOCS      | P0       | ✅     |
| ADR-007: MCP tool design                                 | ARCHITECT | P0       | ⏳     |

### Day 10: Cart & Collection Components ✅ COMPLETE

| Task                        | Role      | Priority | Status |
| --------------------------- | --------- | -------- | ------ |
| CartMain component (drawer) | HYDROGEN  | P0       | ✅     |
| CartLineItem component      | HYDROGEN  | P0       | ✅     |
| CartSummary component       | HYDROGEN  | P0       | ✅     |
| CollectionGrid component    | HYDROGEN  | P0       | ✅     |
| CollectionFilters component | HYDROGEN  | P1       | ✅     |
| Quality review: Week 2      | ARCHITECT | P0       | ⏳     |

---

## Week 3: Search + Hydrogen MCP (Days 11-15)

### Day 11-12: Search & Polish ✅ COMPLETE

| Task                               | Role     | Priority | Status |
| ---------------------------------- | -------- | -------- | ------ |
| SearchDialog component             | HYDROGEN | P0       | ✅     |
| SearchResultsPredictive (enhanced) | HYDROGEN | P0       | ✅     |
| Performance optimization pass      | HYDROGEN | P1       | ⏳     |
| Accessibility audit                | HYDROGEN | P1       | ⏳     |

### Day 13-14: Hydrogen MCP ✅ COMPLETE

| Task                                   | Role    | Priority | Status |
| -------------------------------------- | ------- | -------- | ------ |
| Set up packages/mcp-hydrogen structure | TOOLING | P0       | ✅     |
| scaffoldComponent tool                 | TOOLING | P0       | ✅     |
| scaffoldRoute tool                     | TOOLING | P0       | ✅     |
| analyzeProject tool                    | TOOLING | P1       | ✅     |
| Hydrogen MCP documentation             | DOCS    | P0       | ✅     |

### Day 15: Integration Testing ✅ COMPLETE

| Task                   | Role      | Priority | Status |
| ---------------------- | --------- | -------- | ------ |
| Full user flow testing | HYDROGEN  | P0       | ✅     |
| MCP integration tests  | TOOLING   | P0       | ✅     |
| Quality review: Week 3 | ARCHITECT | P0       | ✅     |

---

## Week 4: CLI + Launch (Days 16-20)

### Day 16-17: CLI Development ← CURRENT

| Task                                       | Role    | Priority | Status |
| ------------------------------------------ | ------- | -------- | ------ |
| Set up packages/cli structure              | TOOLING | P0       | ⏳     |
| create command (npx hydrogen-forge create) | TOOLING | P0       | ⏳     |
| add command (add component/route)          | TOOLING | P1       | ⏳     |
| setup-mcp command                          | TOOLING | P1       | ⏳     |

### Day 18-19: Documentation & Polish

| Task                       | Role     | Priority | Status |
| -------------------------- | -------- | -------- | ------ |
| Complete all READMEs       | DOCS     | P0       | ⏳     |
| Architecture documentation | DOCS     | P0       | ⏳     |
| Extension guide            | DOCS     | P0       | ⏳     |
| Deployment guide (Oxygen)  | DOCS     | P0       | ⏳     |
| Demo store deployment      | HYDROGEN | P0       | ⏳     |

### Day 20: Launch

| Task                | Role      | Priority | Status |
| ------------------- | --------- | -------- | ------ |
| Publish MCPs to npm | TOOLING   | P0       | ⏳     |
| Publish CLI to npm  | TOOLING   | P0       | ⏳     |
| Launch announcement | DOCS      | P0       | ⏳     |
| Final quality check | ARCHITECT | P0       | ⏳     |

---

## Role Summary

### ARCHITECT Backlog

| Task                            | Week | Dependencies            |
| ------------------------------- | ---- | ----------------------- |
| ADR-005: Component architecture | 1    | None                    |
| ADR-006: State management       | 1    | ADR-005                 |
| ADR-007: MCP tool design        | 2    | None                    |
| Quality review: Week 1          | 1    | Layout components       |
| Quality review: Week 2          | 2    | Product/Cart components |
| Quality review: Week 3          | 3    | Search, Hydrogen MCP    |
| Final quality gate              | 4    | All components          |

### HYDROGEN Backlog

| Component                    | Week | Priority |
| ---------------------------- | ---- | -------- |
| Base theme setup             | 1    | P0       |
| Header/Footer/Nav/MobileMenu | 1    | P0       |
| ProductCard                  | 2    | P0       |
| ProductGrid                  | 2    | P0       |
| ProductGallery               | 2    | P0       |
| ProductForm                  | 2    | P0       |
| ProductPrice                 | 2    | P1       |
| CartDrawer                   | 2    | P0       |
| CartLineItem                 | 2    | P0       |
| CollectionGrid               | 2    | P0       |
| CollectionFilters            | 2    | P1       |
| SearchDialog                 | 3    | P0       |
| PredictiveSearch             | 3    | P0       |

### TOOLING Backlog

| Task                            | Week | Priority | Status |
| ------------------------------- | ---- | -------- | ------ |
| GitHub Actions CI               | 1    | P0       | ✅     |
| Pre-commit hooks                | 1    | P1       | ✅     |
| MCP Shopify: executeGraphQL     | 2    | P0       | ✅     |
| MCP Shopify: product ops        | 2    | P0       | ✅     |
| MCP Shopify: inventory ops      | 2    | P1       | ✅     |
| MCP Hydrogen: scaffoldComponent | 3    | P0       | ✅     |
| MCP Hydrogen: scaffoldRoute     | 3    | P0       | ✅     |
| MCP Hydrogen: analyzeProject    | 3    | P1       | ✅     |
| CLI: create command             | 4    | P0       | ⏳     |
| CLI: add command                | 4    | P1       | ⏳     |
| CLI: setup-mcp                  | 4    | P1       | ⏳     |
| npm publish                     | 4    | P0       | ⏳     |

### DOCS Backlog

| Task                | Week | Priority |
| ------------------- | ---- | -------- |
| README with badges  | 1    | P1       |
| CONTRIBUTING.md     | 1    | P1       |
| MCP Shopify docs    | 2    | P0 ✅    |
| MCP Hydrogen docs   | 3    | P0 ✅    |
| Architecture guide  | 4    | P0       |
| Extension guide     | 4    | P0       |
| Deployment guide    | 4    | P0       |
| Launch announcement | 4    | P0       |

---

## Key Decisions Pending (ARCHITECT)

### ADR-005: Component Architecture

- Compound components vs flat components?
- Render props vs children pattern?
- Styling: Tailwind variants, CVA, or custom?

### ADR-006: State Management

- React Router loaders only?
- Additional state library needed?
- Cart state handling pattern?

### ADR-007: MCP Tool Design

- Tool granularity (one big vs many small)?
- Error handling standards?
- Authentication flow?

---

## Success Metrics

### Week 1 Checkpoint

- [ ] Base theme compiles and runs
- [ ] Layout components functional
- [ ] CI/CD pipeline working

### Week 2 Checkpoint

- [ ] 10+ components built
- [ ] Enhanced Shopify MCP working
- [ ] Product display functional

### Week 3 Checkpoint

- [ ] Search functional
- [ ] Hydrogen MCP working
- [ ] 95+ PageSpeed score

### Week 4 Checkpoint

- [ ] CLI published to npm
- [ ] MCPs published to npm
- [ ] Live demo deployed
- [ ] Launch complete

---

_Updated: 2026-01-09 | Sprint: Week 2, Day 10_
