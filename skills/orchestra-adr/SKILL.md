---
name: orchestra-adr
description: "Capture an architectural decision record — document a decision that was made during work, why it was made, and its consequences."
when_to_use: "Use when a significant technical or process decision needs to be recorded for future agents and developers."
allowed-tools: Read, Glob, Write
argument-hint: "<decision-title or description>"
disable-model-invocation: false
---

# Write ADR

Capture a decision that was made during the course of work. ADRs are not initiated by tickets — they emerge during execution and serve as ambient context for future agents and developers working on the project.

## What Makes a Good ADR

An ADR captures a decision that:
- Has consequences that future agents need to understand before acting
- Would otherwise only exist in someone's head or a chat log
- Represents a fork in the road — alternatives were considered and one was chosen

Not every decision needs an ADR. Trivial choices, obvious implementations, and temporary workarounds do not.

## Prerequisites

- `.orchestra/adr/` directory must exist in the project
- A decision has been made (or is being made) that meets the bar above

## Steps

### 1. Establish Context

- Glob `.orchestra/adr/` to see existing ADRs and their numbering
- Read the most recent 2-3 ADRs to understand the project's decision history and writing style
- Determine the next ADR number (`ADR-{NNN}`)

### 2. Gather the Decision

From $ARGUMENTS or by asking the user:
- **What was decided?** One clear sentence.
- **What problem prompted this decision?** What situation forced a choice?
- **What alternatives were considered?** At least briefly — even if rejected quickly.
- **Why was this option chosen?** The reasoning, not just the outcome.
- **What are the consequences?** What does this decision enable, constrain, or close off?

If the user provides $ARGUMENTS with a description, use that as the starting point and ask only for gaps.

### 3. Determine the Status

ADRs use a four-value vocabulary:
- `proposed` — decision is under active consideration, not yet settled
- `accepted` — decision is made and active
- `deprecated` — no longer applies, context has changed
- `superseded` — replaced by a newer ADR (note which one)

New ADRs are almost always `accepted` — if a decision isn't made yet, it's too early to write the ADR.

### 4. Generate the ADR

Use this structure:

```markdown
---
status: accepted
created_on: {YYYY-MM-DD}
---

# ADR-{NNN}: {Title}

## Context

{The situation that forced a decision. What problem or constraint prompted this. What was true about the world at the time.}

## Decision

{What was decided, stated clearly. One or two sentences maximum. This is the headline.}

{Expand on the reasoning — why this option over the alternatives. What trade-offs were accepted.}

## Consequences

{What this decision enables, constrains, or closes off. What future work now looks different because of this. What agents should know before acting in this area.}
```

No `ticket` field — ADRs are not initiated by tickets. They reference the work that prompted them through context, not frontmatter.

### 5. Determine the Filename

Use the convention: `ADR-{NNN}-{short-kebab-title}.md`

Examples:
- `ADR-001-orchestra-artifact-frontmatter-contract.md`
- `ADR-002-direct-api-over-subprocess.md`
- `ADR-003-agentic-factory-as-skill-authoring-tool.md`

### 6. Write the File

Save to: `.orchestra/adr/ADR-{NNN}-{short-kebab-title}.md`

### 7. Present for Review

Show the user the complete ADR. Ask:
- Does the context accurately describe the situation?
- Is the decision statement clear and unambiguous?
- Are the consequences complete — anything future agents need to know that's missing?

## Quality Checks

- [ ] Status is one of: `proposed`, `accepted`, `deprecated`, `superseded`
- [ ] `created_on` is today's date in `YYYY-MM-DD` format
- [ ] No `ticket` field — ADRs are not ticket-initiated
- [ ] Decision is stated in 1-2 sentences — not buried in prose
- [ ] Consequences are written for a future agent, not a human reader — what do they need to know before touching this area?
- [ ] Filename follows `ADR-{NNN}-{short-kebab-title}.md` convention
- [ ] Numbered correctly — no gaps or duplicates with existing ADRs

## ADRs as Ambient Context

ADRs are the project's institutional memory. Future agents glob `.orchestra/adr/` before starting work and read `accepted` ADRs to understand why the project is shaped the way it is. An ADR that is vague, incomplete, or missing is an agent that will repeat a mistake or re-litigate a settled decision.

Write ADRs as if briefing a capable agent who has never seen this project before.

