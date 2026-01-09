# Hydrogen Forge - Architecture Decision Records

## Active Decisions

### ADR-001: Start from Skeleton
**Date:** 2026-01-09
**Status:** Accepted
**Context:** Need to choose between skeleton and demo-store templates
**Decision:** Use skeleton template, not demo-store
**Consequences:** Cleaner starting point, no snowboard-specific code to remove

### ADR-002: Package Manager
**Date:** 2026-01-09
**Status:** Accepted
**Context:** Need consistent package management across project
**Decision:** Use pnpm
**Consequences:** Faster installs, disk-efficient, stricter dependency resolution

### ADR-003: TypeScript Strict
**Date:** 2026-01-09
**Status:** Accepted
**Context:** Need to establish type safety standards
**Decision:** Enable strict mode
**Consequences:** Better type safety, catch errors early, more verbose types

### ADR-004: GitHub as Single Source of Truth
**Date:** 2026-01-09
**Status:** Accepted
**Context:** Need collaboration mechanism between Claude instances
**Decision:** All collaboration files, context, session logs in GitHub
**Consequences:** Enables seamless handoffs between Claude Chat, Code, and Projects

---

## Pending Decisions

*None currently*

---

## Deprecated Decisions

*None currently*
