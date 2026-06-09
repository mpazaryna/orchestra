# adr

Capture an architectural decision record — document a decision that was made during work, why it was made, and its consequences.

## Quick Start

```
/adr switch from REST to gRPC for internal services
/adr we decided to use Cloudflare D1 over PlanetScale
```

## What It Does

1. Globs `.orchestra/adr/` to find existing ADRs and determine the next sequence number
2. Gathers context from the user: what was decided, the problem that forced it, alternatives considered, reasoning, and consequences
3. Assigns a status (`proposed`, `accepted`, `deprecated`, or `superseded`)
4. Writes the file to `.orchestra/adr/ADR-{NNN}-{short-kebab-title}.md`
5. Presents the ADR for review before saving

ADRs are not ticket-initiated — they emerge during execution. New ADRs are almost always `accepted` status. Write consequences as a briefing for a future agent, not a human narrative.

## Prerequisites

- `.orchestra/adr/` directory must exist (created by `/scaffold`)
- A meaningful decision has been made — trivial choices and temporary workarounds don't qualify

## See Also

- `scaffold` — creates the `.orchestra/` structure including the `adr/` directory
- `devlog` — narrative work journal (complements ADRs)
- `spec` — execution plan that may reference ADRs
