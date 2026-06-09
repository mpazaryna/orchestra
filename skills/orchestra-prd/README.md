# prd

Generate a PRD from a milestone gap — define objective, success criteria, materials table, and context.

## Quick Start

```
/prd add voice dictation support to the SOAP note pipeline
/prd 86e065njp-voice-input
```

## What It Does

1. Reads `.orchestra/roadmap.md` and identifies which milestone this PRD serves
2. Reads the milestone PRD and relevant ADRs for context
3. Asks (or derives from `$ARGUMENTS`): objective, why it matters, deliverables, constraints, success criteria
4. Generates a PRD with title, objective, testable success criteria, context, materials table, references, and notes
5. Saves to `.orchestra/work/{id}-{name}/prd.md` with YAML frontmatter (`status: draft`)
6. Updates the parent milestone PRD's materials table
7. Presents for approval and asks if a spec should follow

## Prerequisites

- `.orchestra/roadmap.md` must exist
- An active milestone PRD should exist with a gap that motivates this PRD

## Quality Bar

- Objective is specific ("add X that does Y so Z") — not "improve the thing"
- Success criteria are testable checkboxes
- Materials table has concrete deliverables with file paths
- Context traces back to a milestone

## See Also

- `milestone` — surfaces gaps that need PRDs
- `spec` — generates execution spec from an approved PRD
- `scaffold` — creates the `.orchestra/` structure
