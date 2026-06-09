---
name: orchestra-prd
description: "Define the what and why for a piece of work — objective, success criteria, materials table, and context. The foundational Score document before any spec is written."
when_to_use: "Use when a piece of work needs to be scoped before execution — whether surfaced by a milestone review, a ticket, a stakeholder request, or a spike finding."
allowed-tools: Read, Glob, Write
argument-hint: "<work-item name or description>"
disable-model-invocation: false
---

# Write PRD

Define the what and why for a piece of work. The PRD is the foundational Score document — it must exist and be approved before any spec is written.

## Prerequisites

- `.orchestra/roadmap.md` must exist
- Read the roadmap and any active milestone PRD for context — but a milestone gap is not required to write a PRD

## Steps

### 1. Establish Context

- Read `.orchestra/roadmap.md` to understand the project vision
- Identify which milestone this PRD serves
- Read the milestone PRD to understand the objective and surrounding deliverables
- Read any relevant ADRs in `.orchestra/adr/`

### 2. Gather Requirements

Ask the user:
- **What is the objective?** What does "done" look like?
- **Why does this matter?** How does it serve the milestone?
- **What are the deliverables?** Files, documents, features, or artifacts
- **What are the constraints?** Technical, timeline, dependencies
- **What are the success criteria?** How do we know it worked?

If the user provides $ARGUMENTS with a description, use that as the starting point and ask only for gaps.

### 3. Generate the PRD

Generate the PRD with this structure:

- **Title**: Clear, specific name
- **Objective**: 1-2 sentences — what "done" looks like
- **Success Criteria**: 3-5 testable checkboxes
- **Context**: Why this matters, what milestone it serves, what problem it solves
- **Materials table**: Each deliverable with location and "Not Started" status
- **References**: Link to milestone PRD, relevant ADRs, external docs
- **Notes**: Constraints, open questions, dependencies

### 4. Determine Work Item ID

- If a ticket ID exists from an issue tracker, use `{ticket-id}-{short-name}`
- If no ticket yet, use a descriptive slug: `{short-name}`
- The user can rename the folder later when a ticket is assigned

### 5. Write the File

Save to: `.orchestra/work/{id}-{name}/prd.md`

Include YAML frontmatter at the top of the file:

```yaml
---
ticket: {ticket-id or slug — matches the work item folder name}
status: draft
created_on: {today's date in YYYY-MM-DD format}
---
```

Status vocabulary for PRDs: `draft` → `approved` → `complete`

### 6. Update the Milestone

If an active milestone PRD exists in `.orchestra/roadmap.md`:
- Add or update the row in that milestone's materials table:

```markdown
| {PRD title} | .orchestra/work/{id}-{name}/prd.md | Not Started |
```

If no active milestone exists, skip this step and note it in the report — the work item can be assigned to a milestone later.

### 7. Present for Approval

Show the user the complete PRD. Ask:
- Does the objective capture what you want?
- Are the success criteria testable and complete?
- Is anything missing from the materials table?
- Should we proceed to write a spec?

## Quality Checks

- [ ] Objective is specific — not "improve the thing" but "add X that does Y so Z"
- [ ] Success criteria are testable — each one can be checked as done/not done
- [ ] Materials table lists concrete deliverables with file paths
- [ ] Context explains why this work matters — and traces to a milestone if one exists
- [ ] No open questions left unaddressed (flag them if unresolved)
