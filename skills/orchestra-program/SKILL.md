---
name: orchestra-program
description: "Explain what Orchestra is — a software development lifecycle encoded for agents, its SDLC roots, the pipeline, roles, file structure, status vocabulary, and skill index."
when_to_use: "Use when someone asks what Orchestra is, how it works, where its components come from, or where to start."
allowed-tools: Read, Glob
---

# The Program

Present the orchestra methodology as a complete orientation. This is the program handed to every person who walks into the venue — human or agent, new collaborator or returning contributor.

## What to Present

### The Metaphor

Orchestra is a software development lifecycle (SDLC) — the same discipline engineers have practiced for decades, encoded so that agents can execute it. The name comes from the roles:

- **Composer** — the human who sets the vision and approves the work *(Product Owner / Stakeholder)*
- **Conductor** — the agent who interprets the score and leads execution *(Tech Lead — human or agent)*
- **Musicians** — the skills, each playing their part in sequence *(Specialist engineers / sub-agents)*
- **Score** — the spec: the agreed contract before performance begins *(Requirements + Design documents)*

No musician improvises. No step is skipped. The program tells you what will be played, in what order, before the lights go dark.

---

### The Roots

Every component of Orchestra traces to a proven SDLC discipline. Nothing was invented — it was encoded.

| Orchestra | SDLC Ancestor | The Discipline |
|---|---|---|
| Score (PRD + Spec + Gherkin) | Requirements → Technical Design → Acceptance Tests | Spec-driven development — written before execution begins |
| PRD | Product requirements document | *What* and *why*, decided before *how* |
| Spec | Technical design document | *How*, decided before building begins |
| Gherkin | BDD acceptance criteria (Dan North, 2006) | Tests as the contract between intent and implementation |
| ADR | Architecture Decision Records (Nygard, 2011) | Decisions as durable artifacts, not conversation |
| Implement | Branch / commit / test cycle | Execution against the spec — no improvisation |
| Review | Code review + design review | Evidence-based gate before integration |
| Merge | Continuous integration gate | The premiere — the permanent record |
| Devlog | Engineering journal + commit discipline | Programme notes — context for the audience that follows |
| Roadmap | Product roadmap / milestone planning | Vision encoded as checkable states |

The novel layer is the runtime: agents execute against these artifacts as their primary input, rather than humans translating from them.

---

### The Governing Principle

**The score is written before the performance begins.**

Agents execute against artifacts, not instructions. A conductor without a score is improvising. An agent without a spec is guessing. The Q&A phases — PRD, then Spec — exist to make the score tight enough that execution requires no interpretation.

---

### The Pipeline

Every piece of work moves through the same pipeline in two halves: writing the score, then performing it.

**Score — Requirements & Design**

| Stage | Skill | What Happens |
|---|---|---|
| Capture | `/orchestra-ticket` | A work item is captured and scaffolded |
| Define | `/orchestra-prd` | Q&A with the composer produces the PRD — the *what* and *why* |
| Plan | `/orchestra-spec` | Q&A with the composer produces the spec — the *how* |
| Validate | `/orchestra-gherkin` | Acceptance criteria written as testable Gherkin scenarios |
| **Approve** | *(human gate)* | Composer signs off — the score is locked |

**Performance — Build & Deliver**

| Stage | Skill | What Happens |
|---|---|---|
| Implement | `/orchestra-implement` | A branch is created, spec steps executed, commits made |
| Review | `/orchestra-review` | Every acceptance criterion checked with evidence — PASS or FAIL |
| Merge | `/orchestra-merge` | Reviewed branch merged to main, work item closed |

The Q&A before the spec is what makes the rest possible. A tight spec is a spec the implementer can execute without asking questions.

---

### Status Vocabulary

Work items carry a status that tracks exactly where they are in the pipeline. These are *stage gates* — a recognized SDLC pattern in which each status is a decision point that must be explicitly cleared before the next phase begins. Nothing advances automatically.

```
draft → approved → in-progress → complete → reviewed → closed
```

| Status | Meaning |
|---|---|
| `draft` | PRD or spec written, not yet approved |
| `approved` | Composer has signed off — ready for next stage |
| `in-progress` | Implementation underway |
| `complete` | Implementation done, awaiting review |
| `reviewed` | Review passed — ready to merge |
| `closed` | Merged and done |

---

### File Structure

Everything lives under `.orchestra/` in the project root:

```
.orchestra/
├── roadmap.md              — Vision, milestones, active work
├── work/
│   └── {id}-{name}/
│       ├── prd.md          — The what and why
│       ├── spec.md         — The how
│       └── gherkin-spec.md — Acceptance criteria
├── adr/
│   └── 001-*.md            — Architectural decisions, numbered
└── devlog/
    └── YYYY-MM-DD-*.md     — Developer journals
```

Work item folders are named `{ticket-id}-{short-name}`. The ticket ID comes from your issue tracker. If no ticket exists yet, use a descriptive slug.

---

### Skill Index

**Score — Requirements & Design:**

| Skill | Purpose |
|---|---|
| `orchestra-ticket` | Capture a work item and scaffold its folder |
| `orchestra-prd` | Define the *what* and *why* for a piece of work |
| `orchestra-spec` | Generate an execution spec from an approved PRD |
| `orchestra-gherkin` | Generate Gherkin scenarios from a spec |
| `orchestra-plan` | Run the full PRD → Spec → Gherkin loop in one session |
| `orchestra-roadmap` | Read and manage the roadmap |
| `orchestra-milestone` | Review milestone progress, surface gaps, and reverse-check for orphaned work items not tracked by any milestone |
| `orchestra-scaffold` | Bootstrap the `.orchestra/` structure in a new project |

**Performance — Build & Deliver:**

| Skill | Purpose |
|---|---|
| `orchestra-implement` | Execute an approved spec on a branch — includes pre-flight milestone traceability check |
| `orchestra-review` | Review a completed implementation against its spec |
| `orchestra-merge` | Merge a reviewed branch to main and close the work item |
| `orchestra-eval` | Grade skill outputs against acceptance criteria |

**Persistent Record — Spans the Lifecycle:**

| Skill | Purpose |
|---|---|
| `orchestra-adr` | Capture an architectural decision |
| `orchestra-devlog` | Write developer journals |
| `orchestra-uml` | Generate UML diagrams as Mermaid code |

---

### Where to Start

**New to this repo?** Run `/orchestra-roadmap` to see the vision, active milestones, and current work items.

**Starting new work?** Run `/orchestra-ticket` to capture it, then follow the pipeline.

**Picking up existing work?** Find the work item folder under `.orchestra/work/`, read the spec, check the status, and invoke the skill that matches.

**Coming back after a break?** Run `/orchestra-milestone`. It reads `roadmap.md`, finds the first milestone that isn't Done, checks what's missing from its materials table, and tells you exactly what to do next. One command gets you oriented regardless of where you left off — no need to remember where you were.

---

## Reading the Repo

When presenting the program on an active project, always follow with the live state. Read:
- `.orchestra/roadmap.md` — current vision and milestones
- `.orchestra/work/*/prd.md` — active work items and their statuses

Present this after the program overview. The program tells you what will be played; the live state tells you where tonight's performance stands.
