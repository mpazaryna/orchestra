# milestone

Review milestones and project progress — diff the materials table against repo state, surface gaps, and propose next work items.

## Quick Start

```
/milestone
/milestone active
/milestone "MVP Launch"
```

No argument reviews the first in-progress milestone. Pass a name to target a specific one.

## What It Does

1. Reads `.orchestra/roadmap.md` and finds the active milestone (or the one specified)
2. Audits each row in the milestone PRD's materials table:
   - File paths: checks existence and completeness, flags status mismatches
   - ClickUp links: notes them for the user
   - "Done" items: verifies they actually exist and look complete
3. Presents a review with three tables: Gaps, Stale, and On Track
4. Recommends next actions for each gap: whether it needs a PRD, spec, ticket, or direct work

Read-only — never modifies files.

## Prerequisites

- `.orchestra/roadmap.md` with at least one milestone
- Milestone PRDs with materials tables

## See Also

- `roadmap` — higher-level roadmap status and management
- `prd` — generate a PRD for a gap surfaced by milestone review
- `spec` — generate an execution spec from an approved PRD
