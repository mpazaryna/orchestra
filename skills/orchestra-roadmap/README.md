# roadmap

Read and manage the `.orchestra/roadmap.md` — show status, identify active milestones, find gaps, and propose next work.

## Quick Start

```
/roadmap status
/roadmap next
/roadmap update "MVP Launch" done
/roadmap add
```

## What It Does

Four commands:

- **status** — reads roadmap.md, reads each milestone PRD, presents a roll-up table: milestone → deliverables → progress fraction
- **next** — finds the first incomplete milestone, lists its "Not Started" and "Needs Refresh" items, suggests what to tackle based on dependencies and priority
- **update** — marks a milestone or deliverable as done/in-progress; if all deliverables in a milestone are done, updates the milestone status in roadmap.md
- **add** — asks for milestone name, objective, and deliverables; creates the PRD stub; adds a row to roadmap.md

Always reads current state before modifying. Never removes rows — marks abandoned items as "Cancelled". Traces all changes: deliverable → milestone → roadmap.

## Prerequisites

- `.orchestra/roadmap.md` exists (created by `/scaffold`)

## See Also

- `milestone` — deep-dive audit of a single milestone's materials table
- `scaffold` — creates the `.orchestra/` structure including roadmap.md
- `prd` — generate a PRD for a gap the roadmap surfaces
