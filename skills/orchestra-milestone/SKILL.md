---
name: orchestra-milestone
description: "Review milestones and project progress — diff materials table against repo state, surface gaps, check for orphaned work items, and propose next actions."
when_to_use: "Use when the user asks about milestones, project status, what to work on next, what's left to do, or wants to check progress on the roadmap."
allowed-tools: Read, Glob, Grep, Write
argument-hint: "<milestone-name or 'active'>"
---

# Milestone Review

Read the active milestone PRD, compare its materials table against actual repo state, and surface what needs attention. Also performs a reverse check — scanning for work items in `.orchestra/work/` that don't appear in any milestone, catching scope drift before it compounds.

## Steps

### 1. Find the Active Milestone

- Read `.orchestra/roadmap.md`
- Parse the materials table
- Find the first milestone with status "In Progress" or "Not Started"
- If $ARGUMENTS specifies a milestone name, use that instead
- Read the milestone's PRD at the path in the materials table

### 2. Audit the Materials Table

For each row in the milestone PRD's materials table:

**If location is a file path:**
- Check if the file exists
- If it exists, read it and assess completeness
- Compare actual state to the status column — flag mismatches

**If location is an issue tracker link:**
- Note it for the user and skip — link resolution requires an installed integration

**If status is "Done":**
- Verify the deliverable actually exists and looks complete

**If status is "Not Started" or "Needs Refresh":**
- This is a gap — candidate for new work

### 3. Reverse Check — Orphaned Work Items

The forward check (step 2) asks: "what's in the milestone but missing from the repo?" The reverse check asks: "what's in the repo but missing from any milestone?"

- Glob `.orchestra/work/*/` to list all work item folders
- For every milestone in `roadmap.md`, read its PRD and collect all file paths from its materials table
- Build the union of all tracked paths across all milestones
- For each work item folder, check whether any file in it appears in that union
- Any folder with no tracked entry is **orphaned** — work that exists without a stated goal

Orphaned work items are a velocity smell: work that moved faster than the roadmap. They are not a blocker, but they should be surfaced so the human can assign them to a milestone or acknowledge them as one-off work.

### 4. Present the Review

```
## Milestone Review: {milestone name}

**Objective:** {from PRD}
**Progress:** {N}/{M} deliverables done

### Gaps (work needed)
| Material | Status | Issue |
|----------|--------|-------|
| {name} | Not Started | {why it matters} |
| {name} | Needs Refresh | {what changed since last version} |

### Stale (status says done but reality differs)
| Material | Claimed | Actual |
|----------|---------|--------|
| {name} | Done | {what's actually wrong} |

### On Track
| Material | Status |
|----------|--------|
| {name} | Done |
| {name} | In Progress |

### Orphaned Work Items (in repo, not in any milestone)
| Work Item | Status | Action |
|-----------|--------|--------|
| {path} | {spec status} | Assign to a milestone or acknowledge as one-off |

### Recommended Next Actions
1. {highest priority gap — why}
2. {second priority — why}
3. {third — why}
```

If no orphaned items exist, omit that section from the report.

### 5. Propose Work

For each gap, suggest whether it needs:
- A **PRD** (if scope is unclear or multi-deliverable)
- A **spec** (if approach needs defining)
- A **ticket** (if ready to execute)
- **Direct work** (if small enough to just do)

For each orphaned item, suggest: assign to an existing milestone, create a new milestone, or acknowledge as intentional one-off work.

## Rules

- Read-only — don't modify any files
- Be honest about mismatches — if status says "Done" but the file is empty, flag it
- Trace everything back to the roadmap — gaps should connect to the milestone objective
