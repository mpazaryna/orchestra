---
name: orchestra-roadmap
description: "Bootstrap or manage the .orchestra/roadmap.md — interactive project setup when no roadmap exists, or status/update/add commands when one does."
when_to_use: "Use when setting up a new project's vision and milestones, checking project status, or updating the roadmap."
allowed-tools: Read, Glob, Write, AskUserQuestion
---

# Roadmap

Bootstrap or manage the project roadmap. Behavior depends on whether a roadmap exists.

## Entry Point

Check for `.orchestra/roadmap.md`:

- **Does not exist** → enter Bootstrap mode
- **Exists** → parse $ARGUMENTS and enter the appropriate command mode

---

## Bootstrap Mode

No roadmap exists. Run an interactive session to define the project and produce an approved roadmap. This is the human-in-the-loop QA that sets the score for everything that follows.

### Step 1: Read the README Brief

Check for `README.md` in the project root. Look for a `## Brief` section:

```markdown
## Brief
**Vision:** {what done looks like at the highest level}
**Audience:** {who benefits}
```

**If the Brief section is present and has vision + audience:**
- Extract both fields
- Skip Step 2 — go directly to Step 3 (milestones)
- Propose milestones derived from the vision — the user approves, adjusts, or adds
- The Brief seeds the conversation; milestones are still a planning output

**If README exists but has no Brief section:**
- Read the README intro (first 2–3 paragraphs) to extract whatever context is available
- Use it to pre-fill what you can, ask for the rest in Steps 2–3

**If no README exists:**
- Proceed to Steps 2–3 with no pre-fill

### Step 2: Vision (ask only if not in Brief)

Ask via AskUserQuestion:

> To set up your roadmap I need to understand the project:
>
> 1. **Project name** — What is this called?
> 2. **Vision** — In 1–2 sentences, what does "done" look like at the highest level?
> 3. **Audience** — Who benefits when this ships?

Wait for answers before proceeding.

### Step 3: Milestones (ask only if not in Brief)

Ask via AskUserQuestion:

> Now let's define milestones — meaningful checkpoints you could demo, ship, or celebrate.
>
> For each milestone give me:
> - **Name** — short and memorable
> - **Objective** — what does "done" look like for this milestone?
>
> Aim for 2–5. What are yours?

If the user is unsure, help them derive milestones from the vision:
- What's the minimum working version?
- What comes after that?
- What would make it complete?

If the user gives more than 6, suggest grouping — too many dilutes focus.

### Step 4: Draft the Roadmap

Generate the roadmap and present it for review:

```markdown
# {Project Name} Roadmap

**Objective:** {Vision}

## Success Criteria

- [ ] {Derived from vision — what "fully done" looks like}
- [ ] {Second criterion}

## Context

{Why this project matters. Who it serves. What problem it solves.}

## Milestones

| Material | Location | Status |
|----------|----------|--------|
| {Milestone 1} | .orchestra/work/{slug}/prd.md | Not Started |
| {Milestone 2} | .orchestra/work/{slug}/prd.md | Not Started |

## References

- ADR-000: [The Score](.orchestra/adr/ADR-000-the-score.md)
```

Ask via AskUserQuestion:

> Here's the roadmap draft. Does this capture the vision and milestones correctly? Or what should change?

Iterate until approved. Apply the same gate protocol as `orchestra-plan`: one question, re-present after feedback, advance on approval.

### Step 5: Write on Approval

On approval, write:

1. `.orchestra/roadmap.md` — the approved roadmap
2. For each milestone, `.orchestra/work/{slug}/prd.md` — a stub PRD:

```markdown
---
ticket: {slug}
status: draft
created_on: {YYYY-MM-DD}
---

# {Milestone Name}

**Objective:** {What "done" looks like for this milestone}

## Success Criteria

- [ ] To be defined — run /orchestra-plan to flesh this out

## Context

Part of the [{Project Name} Roadmap](.orchestra/roadmap.md).

## Materials

| Material | Location | Status |
|----------|----------|--------|
| To be defined | | Not Started |

## Notes

Run /orchestra-plan {slug} to start the planning loop for this milestone.
```

### Step 6: Report

```
## Roadmap Bootstrapped

  .orchestra/roadmap.md          [{N} milestones]
  .orchestra/work/{slug}/prd.md  [stub — ×N]

### Next Step
Run /orchestra-plan {first-milestone-slug} to begin planning.
```

---

## Command Mode

When `roadmap.md` exists, parse $ARGUMENTS:

- **status** — roll-up view
- **next** — identify what to work on
- **update** — mark a milestone or deliverable done/in-progress
- **add** — add a new milestone

### Status

1. Read `.orchestra/roadmap.md`
2. For each milestone row, read its PRD and parse its materials table
3. Present:

```
## Roadmap: {Project Name}

### {Milestone 1} — {status}
  - {deliverable}: {status}
  Progress: N/M done

### {Milestone 2} — {status}
  ...
```

### Next

1. Find the first milestone that isn't Done
2. Read its PRD's materials table
3. List items marked Not Started or Needs Refresh
4. Suggest which to tackle based on dependencies

### Update

1. Identify the target from $ARGUMENTS
2. Update the status in the appropriate materials table
3. If all deliverables in a milestone are Done, update the milestone status in `roadmap.md`

### Add

1. Ask for: milestone name, objective, initial deliverables
2. Create `.orchestra/work/{slug}/prd.md` using the stub PRD format above
3. Add a row to the `roadmap.md` materials table

## Rules

- Always read current state before modifying
- Trace changes: deliverable → milestone → roadmap
- Never remove rows — mark as Cancelled if abandoned
