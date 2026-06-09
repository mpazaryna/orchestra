# ticket

Capture a work ticket as the starting point for the orchestra loop — read a brief, scaffold the work item folder, and set up for PRD and spec.

## Quick Start

```
/ticket 86e065njp
/ticket https://app.clickup.com/t/86e065njp
/ticket add rate limiting to the API gateway
```

Pass a ClickUp ID, URL, or plain text description.

## What It Does

1. Reads the brief — fetches from ClickUp API if given an ID/URL, or uses the text directly
2. Checks for an existing work item at `.orchestra/work/{slug}/` — stops without overwriting if found
3. Scaffolds the folder and writes `ticket.md` — preserves the original brief verbatim, with acceptance criteria and notes
4. Updates the active milestone PRD's materials table (or notes the ticket is unassigned)
5. Reports what was created and the next steps

The ticket.md is a faithful capture of what was asked. Clarity and refinement happen in the PRD step.

## The Loop

```
/ticket → /prd → /spec → implement → /devlog
```

## Prerequisites

- `.orchestra/` structure exists (from `/scaffold`)
- `CLICKUP_API_KEY` in `.env` (only needed when fetching from ClickUp)

## Rules

- Never overwrites an existing work item
- Preserves the original brief — doesn't rewrite or improve it
- Vague briefs are captured as-is; the PRD step is where clarity happens

## See Also

- `prd` — expands the ticket brief into a full PRD
- `scaffold` — creates the `.orchestra/` structure
- `roadmap` — assigns the ticket to a milestone
