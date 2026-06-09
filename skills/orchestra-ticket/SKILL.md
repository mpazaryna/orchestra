---
name: orchestra-ticket
description: "Capture a work ticket as the starting point for the orchestra loop — read a brief, scaffold the work item folder, and set up for PRD and spec."
when_to_use: "Use when starting new work from a ticket, task, or brief."
allowed-tools: Read, Glob, Write, Bash
argument-hint: "<ticket-id, url, or description>"
disable-model-invocation: false
---

# Ticket

Capture a work ticket and scaffold the orchestra work item. The ticket is the contract — the starting point for the loop.

## Flow

```
/orchestra-ticket → /orchestra-plan (PRD → Spec → Gherkin) → /orchestra-implement → /orchestra-review → /orchestra-merge
```

## Steps

### 1. Read the Brief

From $ARGUMENTS, determine the source:

- **Issue tracker ID or URL** — fetch the ticket if an integration is installed. Use the task ID to retrieve title, description, and acceptance criteria.
- **Text description** — the user is providing the brief directly

Extract: title, objective, any acceptance criteria, priority, context.

### 2. Check for Existing Work Item

Derive the slug: `{ticket-id}-{short-name}` (if from an issue tracker) or `{short-name}` (if from a text brief).

Check if `.orchestra/work/{slug}/` already exists.

**If it exists:** show what's there (ticket.md, prd.md, spec.md) and stop. Don't overwrite.

### 3. Scaffold the Work Item

Create the folder and write the ticket file:

```
.orchestra/work/{slug}/
└── ticket.md
```

**ticket.md format:**

```markdown
# {Title}

**Source:** {issue tracker link or "user brief"}
**Priority:** {if known}
**Date:** {today}

## Brief

{The ticket description — what was asked for, in the requestor's words}

## Acceptance Criteria

- [ ] {From the ticket, or "To be defined in PRD"}

## Notes

{Any constraints, context, or references from the original ticket}
```

### 4. Update the Milestone

If an active milestone exists in `.orchestra/roadmap.md`:
- Add a row to the milestone PRD's materials table pointing to the new work item
- If no active milestone, note this in the output — the user can assign it later

### 5. Report

```
## Ticket Captured

- **Title:** {title}
- **Slug:** {slug}
- **Path:** .orchestra/work/{slug}/ticket.md
- **Milestone:** {milestone name or "unassigned"}

### Next Steps
1. Run `orchestra-prd {slug}` to expand the brief into a full PRD
2. Run `orchestra-spec {slug}` to plan execution
3. Implement and log with `orchestra-devlog`
```

## Rules

- Never overwrite an existing work item — check first, always
- The ticket.md preserves the original brief — don't rewrite or improve it
- Every ticket gets a PRD and spec downstream — keep the folder ready for both
- If the brief is vague, capture it as-is — the PRD step is where clarity happens
