# Hydrogen Forge - Collaboration Workflow

This document describes the multi-agent workflow used to build Hydrogen Forge, enabling Claude Chat and Claude Code to work together effectively.

## Overview

Hydrogen Forge was built using a novel collaboration pattern:

- **MANAGER (Claude Chat)** - Orchestration, planning, task assignment
- **Claude Code** - Execution with role-specific instructions

This pattern compresses weeks of development into hours while maintaining quality.

## The 5 Roles

| Role      | Owner       | Focus                           |
| --------- | ----------- | ------------------------------- |
| MANAGER   | Claude Chat | Orchestration, sprint planning  |
| ARCHITECT | Claude Code | ADRs, quality review, decisions |
| HYDROGEN  | Claude Code | Components, routes, React code  |
| TOOLING   | Claude Code | MCPs, CLI, CI/CD, npm           |
| DOCS      | Claude Code | Documentation, guides           |

## MANAGER Orchestration

### How MANAGER Works

1. **Session Start**
   - MANAGER (Claude Chat) reads `.claude/CONTEXT.md`
   - Reviews current sprint in `.claude/PRIORITIES.md`
   - Determines which role is needed

2. **Task Assignment**
   - MANAGER creates clear task list
   - Specifies which role to use
   - Provides success criteria

3. **Handoff to Claude Code**
   - User opens Claude Code
   - User provides role instruction: "Act as HYDROGEN"
   - Claude Code reads role file and executes tasks

4. **Session End**
   - Claude Code updates `.claude/CONTEXT.md`
   - Claude Code commits and pushes
   - User returns to MANAGER for review

### Example MANAGER Instructions

```
Next Session: Act as HYDROGEN

Tasks:
1. Create ProductCard component
2. Create ProductGrid component
3. Add skeleton loading states

Success Criteria:
- Components render correctly
- TypeScript compiles with no errors
- Tailwind classes used throughout
```

## Push Discipline Workflow

### The Rule

**Never push directly. Always ask user to push.**

### Why This Matters

1. **User Control** - User reviews changes before they go public
2. **Error Recovery** - Easy to fix issues before push
3. **Audit Trail** - Clear separation between commits

### The Pattern

```
Claude Code: [Makes changes, creates commit]
Claude Code: "Committed as abc123. Please push to GitHub."
User: git push origin main
User: [Pastes output]
Claude Code: "Pushed. Continuing with next task..."
```

### Example Flow

```
1. Claude Code makes changes
2. Claude Code: git add . && git commit -m "feat: add ProductCard"
3. Claude Code: "Please push commit abc123"
4. User: git push origin main
5. User shares output
6. Claude Code continues
```

## Role Switching Process

### Within a Session

```
User: "Now switch to DOCS role"
Claude Code: [Reads .claude/projects/docs.md]
Claude Code: [Adjusts behavior to DOCS role]
Claude Code: [Continues with documentation tasks]
```

### Between Sessions

```
Session 1 (HYDROGEN):
- Build components
- Update CONTEXT.md with progress
- Commit and push

Session 2 (TOOLING):
- Read CONTEXT.md for current state
- Build MCP tools
- Update CONTEXT.md
- Commit and push
```

### Role Files

Each role has a dedicated file in `.claude/projects/`:

```
.claude/projects/
├── architect.md   # Architecture decisions, quality review
├── hydrogen.md    # React components, routes
├── tooling.md     # MCPs, CLI, CI/CD
├── docs.md        # Documentation
└── manager.md     # Orchestration (for reference)
```

## Context Compression Recovery

### The Problem

Long sessions exceed context limits. How do we continue?

### The Solution

1. **Automatic Summarization**
   - Claude Code summarizes when context fills
   - Key information preserved in summary

2. **Context Files**
   - `.claude/CONTEXT.md` - Current project state
   - `.claude/PRIORITIES.md` - Sprint tasks
   - `.sessions/logs/` - Session history

3. **Recovery Process**

```
[Context limit reached, session summarized]

Claude Code reads:
1. Summary of previous conversation
2. .claude/CONTEXT.md for current state
3. .claude/PRIORITIES.md for tasks
4. Continues where it left off
```

### Example Recovery

```
Previous session summary:
- Completed SearchDialog component
- Working on SearchResultsPredictive
- Next: Fix lint errors

Recovery:
1. Read summary above
2. Read CONTEXT.md - confirms Week 3, Day 11-12
3. Read PRIORITIES.md - see current tasks
4. Continue with lint fixes
```

## Best Practices

### For MANAGER (Claude Chat)

1. **Be Specific** - Clear task lists with success criteria
2. **One Role Per Session** - Avoid mid-session role switches
3. **Update Context** - Always update CONTEXT.md at session end
4. **Push Discipline** - Never push directly, always ask user

### For Claude Code

1. **Read Context First** - Always read CONTEXT.md and PRIORITIES.md
2. **Follow Role Rules** - Stay within role boundaries
3. **Commit Often** - Small, focused commits
4. **Update Docs** - Keep CONTEXT.md current

### For Users

1. **Clear Handoffs** - Tell Claude Code which role to use
2. **Push When Asked** - Review commits before pushing
3. **Share Output** - Paste terminal output for confirmation
4. **Check Context** - Review CONTEXT.md between sessions

## File Reference

| File                    | Purpose           | When to Update      |
| ----------------------- | ----------------- | ------------------- |
| `.claude/CONTEXT.md`    | Project state     | Every session end   |
| `.claude/PRIORITIES.md` | Sprint tasks      | When tasks complete |
| `.claude/DECISIONS.md`  | ADRs              | When decisions made |
| `.claude/RULES.md`      | Code standards    | Rarely              |
| `.claude/projects/*.md` | Role instructions | When roles change   |
| `.sessions/logs/*.md`   | Session history   | Every session       |

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    MANAGER (Claude Chat)                 │
│                                                         │
│  1. Read CONTEXT.md                                     │
│  2. Review PRIORITIES.md                                │
│  3. Assign tasks to role                                │
│  4. Hand off to user                                    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                         USER                             │
│                                                         │
│  1. Open Claude Code                                    │
│  2. Provide role: "Act as HYDROGEN"                     │
│  3. Push when asked                                     │
│  4. Return to MANAGER                                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                           │
│                                                         │
│  1. Read role file (.claude/projects/hydrogen.md)       │
│  2. Read CONTEXT.md and PRIORITIES.md                   │
│  3. Execute tasks                                       │
│  4. Commit changes (don't push)                         │
│  5. Update CONTEXT.md                                   │
│  6. Ask user to push                                    │
└─────────────────────────────────────────────────────────┘
```

## Session Template

```markdown
# Session: [DATE]-[ROLE]

## Role

[HYDROGEN/TOOLING/DOCS/ARCHITECT]

## Tasks Completed

- [ ] Task 1
- [ ] Task 2

## Commits

- abc123: Description

## Context Updates

- Updated CONTEXT.md with...

## Next Session

- Role needed: [ROLE]
- Tasks: [LIST]
```

---

_This workflow enabled 20 days of development in ~7 hours._
