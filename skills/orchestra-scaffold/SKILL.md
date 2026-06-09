---
name: orchestra-scaffold
description: "Scaffold the .orchestra/ agent knowledge base in a project — creates folder structure, templates, README, and ADR-000."
when_to_use: "Use when setting up a new project or adding .orchestra/ to an existing one."
allowed-tools: Read, Glob, Write, Bash
argument-hint: "<project-path>"
---

# Scaffold .orchestra/

Create the `.orchestra/` agent knowledge base structure. This is mechanical work — no questions asked, just files. When done, run `/orchestra-roadmap` to define the project vision and milestones interactively.

## What It Creates

```
.orchestra/
├── README.md
├── adr/
│   └── ADR-000-the-score.md
├── work/
│   └── TEMPLATES/
│       ├── prd.md
│       └── spec.md
├── uml/
└── devlog/
    └── {YYYY}-Q{N}/
```

## Steps

### 1. Check

- Determine target path from $ARGUMENTS (default: current working directory)
- If `.orchestra/` already exists → STOP and report what's there
- Note the project name: use the directory name (e.g. `basename` of the path)

### 2. Create or Update Project README

The project `README.md` (at the project root, not inside `.orchestra/`) is the human-facing entry point and the source of the orchestra Brief.

**If no `README.md` exists:**
Create one with a Brief section template:

```markdown
# {directory-name}

> {one-line description — fill this in}

## Brief

**Vision:** {what done looks like at the highest level — fill this in}
**Audience:** {who benefits — fill this in}

## Usage

{fill in after first milestone ships}
```

**If `README.md` exists and has no `## Brief` section:**
Append the Brief section to the end of the file:

```markdown

## Brief

**Vision:** {what done looks like at the highest level — fill this in}
**Audience:** {who benefits — fill this in}
```

**If `README.md` exists and already has a `## Brief` section:**
Leave it untouched. Report it as already present.

### 3. Create Structure

Create all directories: `adr/`, `work/TEMPLATES/`, `uml/`, `devlog/{YYYY}-Q{N}/`

### 4. Write .orchestra/README.md

Explain the folder to agents and humans:

```markdown
# .orchestra/

Agent knowledge base for this project. All agents read this folder before acting.

## Structure

- `roadmap.md` — The score. Project vision and milestone index.
- `adr/` — Architecture Decision Records. Decisions that affect future agents.
- `work/` — Per-work-item folders. Each contains a PRD, spec, and gherkin.
- `uml/` — Mermaid diagrams for architecture, workflows, and state machines.
- `devlog/` — Chronological journal of development sessions.

## The Loop

```
/orchestra-roadmap   → define vision and milestones
/orchestra-plan      → PRD → Spec → Gherkin for a work item
/orchestra-implement → execute an approved spec
/orchestra-review    → validate implementation against spec
/orchestra-merge     → merge and close the work item
```

## Rules

- Agents read the roadmap and relevant ADRs before acting on any work item
- Every work item has a PRD before a spec; every spec before implementation
- Nothing moves forward without explicit human approval at each gate
```

### 5. Write ADR-000

Write `.orchestra/adr/ADR-000-the-score.md`:

```markdown
---
id: ADR-000
status: accepted
created_on: {YYYY-MM-DD}
---

# ADR-000: The Score

## Decision

This project uses Orchestra — a software development lifecycle encoded for agents. PRDs are the unit of work. Every significant piece of work has a PRD before a spec, and a spec before implementation.

## Rationale

Without a written PRD, work drifts. Without a spec, agents have no contract to
execute against. Without Gherkin, there is no definition of done an agent can verify.

The `.orchestra/` folder is the shared knowledge base. Agents read it. Humans update
it at each gate. The score doesn't change mid-performance without a new ADR.

## Consequences

- No implementation without an approved spec
- No spec without an approved PRD
- All significant architectural decisions are recorded as ADRs
```

### 6. Write Templates

Write `.orchestra/work/TEMPLATES/prd.md`:

```markdown
---
ticket:
status: draft
created_on:
---

# {Title}

## Objective
{What does "done" look like? 1–2 sentences.}

## Success Criteria
- [ ] {Testable criterion}

## Context
{Why this matters. Which milestone it serves.}

## Materials

| Deliverable | Location | Status |
|-------------|----------|--------|
| | | Not Started |

## References

## Notes
```

Write `.orchestra/work/TEMPLATES/spec.md`:

```markdown
---
ticket:
status: draft
created_on:
---

# {Title}

> PRD: {path}

## Objective
{Restated from PRD}

## Approach

### Step 1: {name}

## Testing Strategy

### Unit Tests
### Integration Tests
### E2E Tests

## Deliverables

| File | Purpose | Status |
|------|---------|--------|

## Acceptance Criteria

### Functional
### Unit
### Integration
### E2E

## Dependencies

## Risks

| Risk | Mitigation |
|------|-----------|
```

### 6. Report

```
## .orchestra/ Scaffolded

### Created
- README.md                          [created with Brief section]  ← or "Brief section added" / "Brief already present"
- .orchestra/README.md
- .orchestra/adr/ADR-000-the-score.md
- .orchestra/work/TEMPLATES/prd.md
- .orchestra/work/TEMPLATES/spec.md
- .orchestra/uml/
- .orchestra/devlog/{quarter}/

### Next Step
Fill in the Brief section in README.md, then run /orchestra-roadmap.

The Brief is the minimum needed to seed the roadmap without typing it twice:

    ## Brief
    **Vision:** {what done looks like at the highest level}
    **Audience:** {who benefits}

Vision and audience are stable from day one. Milestones are a planning output —
/orchestra-roadmap derives them from the vision in conversation with you.

/orchestra-roadmap will read the Brief and propose milestones for your approval.
If no Brief is present it will ask you the questions interactively.
```

Stop here. Do not ask about the project. Do not generate a roadmap.
