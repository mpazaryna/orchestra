---
name: orchestra-implement
description: "Execute an approved spec — create a branch, work through each step, commit progress, and mark complete."
when_to_use: "Use when a spec is approved and ready for implementation."
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "<spec-path or work-item-name>"
---

# Implement

Execute an approved spec end-to-end. Work through each step in order, commit progress, verify acceptance criteria, and update the work item status.

## Prerequisites

- A spec must exist at `.orchestra/work/{id}-{name}/spec.md`
- Spec `status` must be `approved`
- Git working tree must be clean (`git status` shows nothing uncommitted)

## Steps

### 1. Load the Spec

- Locate the spec from $ARGUMENTS (path or work item name)
- Read the spec completely — objective, approach steps, deliverables table, acceptance criteria
- Read the PRD alongside it for intent context
- Confirm `status: approved` in the frontmatter — stop and report if `draft`, `in-progress`, or `complete`

**Pre-flight: verify milestone traceability**

Before creating a branch, check whether this work item is anchored to a milestone:

- Read `.orchestra/roadmap.md`
- For each milestone row, read its PRD and scan the materials table
- Check whether this work item's path appears in any materials table

**If found:** note which milestone this serves — include it in the Step 7 report.

**If not found:** surface an advisory and wait for explicit confirmation:

> "This work item does not appear in any milestone's materials table — it has no stated goal it serves. Proceed anyway, or assign it to a milestone first via `/orchestra-roadmap update`?"

- **Proceed** → continue to Step 2
- **Assign first** → stop here; resume after the user runs `/orchestra-roadmap update`

This is advisory, not a blocker. At agentic speed, work sometimes moves faster than the roadmap. The check makes the gap visible so the human consciously decides, rather than silently accepting scope drift.

### 2. Prepare the Branch

```bash
git checkout -b impl/{ticket-id}
```

Branch name: `impl/{ticket-id}` — use the ticket slug from the work item folder name (e.g. `impl/86e15rqpp`).

### 3. Mark In-Progress

Update the spec frontmatter:

```yaml
status: in-progress
```

Commit:

```bash
git add .orchestra/work/{id}-{name}/spec.md
git commit -m "wip({ticket-id}): begin implementation"
```

### 4. Execute Each Step

Work through the spec's approach steps in order:

- Read each step fully before acting
- Complete the step before moving to the next — no partial steps
- After each meaningful unit of work, commit:
  ```
  feat({ticket-id}): {brief description}
  ```
- If a step cannot be completed (missing dependency, genuine ambiguity in the spec), stop and report — do not skip or guess

### 5. Verify Acceptance Criteria

When all steps are done, check each acceptance criterion from the spec explicitly:

- Work through them one by one
- State pass or fail with brief evidence for each
- If any criterion fails, return to Step 4 to address it before continuing

### 6. Mark Complete

Update the spec frontmatter:

```yaml
status: complete
```

Update the deliverables table — mark each row as delivered.

Commit:

```bash
git add .
git commit -m "feat({ticket-id}): implementation complete"
```

### 7. Report

Output a concise summary:
- Branch name and commit count
- Each acceptance criterion with pass/fail
- Any decisions made during implementation that deviated from the spec
- Signal: ready for `/orchestra-review`

## Quality Checks

- [ ] Milestone traceability checked — gap surfaced and human confirmed before proceeding
- [ ] Every step in the spec was executed — none skipped
- [ ] Every acceptance criterion checked explicitly, not assumed
- [ ] All deliverables in the materials table exist at their specified paths
- [ ] Working tree is clean, no uncommitted changes
- [ ] Spec status is `complete`

## Boundaries

- Do not merge to main — that is `/orchestra-merge`
- Do not push the branch — let the next skill decide
- Do not rewrite the spec mid-execution — if the spec is wrong, stop and surface it
