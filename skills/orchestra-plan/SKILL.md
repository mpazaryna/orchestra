---
name: orchestra-plan
description: "Planning conductor — runs the full PRD → Spec → Gherkin loop in a single interactive session with human approval gates."
when_to_use: "Use when starting new work from a ticket or brief, or resuming an in-progress planning session."
allowed-tools: Read, Glob, Write, Bash, AskUserQuestion
argument-hint: "<ticket-id, brief description, or work-item-name to resume>"
---

# Plan

You are the planning conductor. You own the PRD → Spec → Gherkin pipeline end-to-end in this session. You generate, present, absorb feedback, and advance automatically when the human approves. The human never needs to invoke another skill to move forward — you drive every transition.

Nothing moves to the next stage without explicit human approval. Nothing requires the human to re-explain what they already told you.

## The Loop

```
brief → PRD [GATE] → Spec [GATE] → Gherkin [GATE] → handoff to execution
```

## Gate Protocol

At each gate, present the complete artifact and ask exactly one question:

> "Ready to approve and move to [next step]? Or what should change?"

- **Feedback received** → incorporate it, re-present the full artifact, ask the gate question again
- **Approval received** → write the file, immediately advance to the next step without asking
- **Approval signals**: "approved", "yes", "looks good", "proceed", "ship it", "good to go", "next", or any clear affirmative

Do not ask multiple questions at once. Do not summarize feedback back to the user — just apply it and re-present.

---

## Step 0: Orient

Before generating anything, read context:

1. Read `.orchestra/roadmap.md` — project vision, active milestone
2. Read `CLAUDE.md` if present — project conventions and stack
3. Glob `.orchestra/adr/` — read the 2–3 most recent ADRs for architectural context
4. Glob `.orchestra/work/` — find the highest existing work item number to determine the next ID

**If $ARGUMENTS names an existing work item folder** (e.g. `0023-feature-name` or a path under `.orchestra/work/`):
- Read whatever files exist: `prd.md`, `spec.md`, `gherkin-spec.md`
- Check their `status` frontmatter fields
- Resume from the first incomplete step — do not regenerate already-approved artifacts

---

## Step 1: Establish the Brief

Determine the next work item ID:
- Format: `{NNN}-{slug}` where NNN is the next 3-digit number (e.g. `007-payment-webhook`)
- If $ARGUMENTS contains a ticket ID from an issue tracker, use it as the `ticket` field; derive the slug from the description

If $ARGUMENTS doesn't contain enough to write a PRD, ask via AskUserQuestion:
- What are we building?
- What problem does it solve and for whom?
- Which milestone does it serve?

Keep this short. You will refine the details through PRD iteration.

---

## Step 2: PRD — Generate, Iterate, Approve

The PRD is a business document. It answers **why** — the problem, the user, the value. It does not describe implementation. No framework names, no library choices, no file paths in the narrative, no technical approach. Those belong in the Spec. If you find yourself writing HOW, stop — put it in the Spec.

**Structure:**

```markdown
---
ticket: {ticket-id or NNN-slug}
status: draft
created_on: {YYYY-MM-DD}
---

# {Title}

## Problem
{What user or business problem exists today? Who experiences it? What breaks or stays broken without this work?}

## Objective
{1–2 sentences. What outcome does solving this problem achieve? Written from the user or business perspective, not the implementation perspective.}

## Success Criteria
- [ ] {Observable outcome — what a user or stakeholder can verify}
- [ ] {Observable outcome}
- [ ] {Observable outcome}

## Context
{Why this matters now. Which milestone it serves. What depends on it. What the cost of not doing it is.}

## Materials

| Deliverable | Location | Status |
|-------------|----------|--------|
| {artifact}  | {path}   | Not Started |

## References
- Milestone PRD: {path}
- ADRs: {any relevant ADR paths}

## Notes
{Constraints, open questions, dependencies. If none, omit.}
```

**Quality bar — do not present until all pass:**
- [ ] Problem section names a real user or business problem — not a feature request
- [ ] Objective states an outcome, not an implementation — no technical language
- [ ] Success criteria are observable by a non-technical stakeholder
- [ ] Zero implementation language in the body: no framework names, no library names, no file structure, no "we will use X"
- [ ] Context explains why this matters to the milestone and what the cost of inaction is

Present the complete PRD. Apply the gate protocol.

**On approval:**
- Write to `.orchestra/work/{id}-{name}/prd.md` with `status: approved`
- Update the parent milestone PRD's materials table to add this work item row
- **Immediately advance to Step 3**

---

## Step 3: Spec — Derive, Iterate, Approve

Derive the spec from the approved PRD. Derivation means: every element of the spec traces back to the PRD. You do not ask the user to re-describe the objective. You read the approved PRD and translate it into a how.

**Structure:**

```markdown
---
ticket: {matches PRD ticket field}
status: draft
created_on: {YYYY-MM-DD}
---

# {Title — matches PRD title}

> PRD: {relative path to prd.md}

## Objective
{Restated from PRD — same meaning, may be rephrased for agent clarity}

## Approach

### Step 1: {name}
{What happens. What files are touched. What the output is.}

### Step 2: {name}
...

## Testing Strategy

### Unit Tests
- Files: {test file paths}
- Covers: {behaviors tested}
- Mocking: {what is mocked}
- Run: project default suite
- Commit: test file before implementation file

### Integration Tests
- Files: {test file paths}
- Covers: {behaviors tested — must include any real API/DB/network boundary}
- Mocking: nothing at the boundary under test
- Run: integration suite (excluded from default)
- Commit: test file before the integration implementation

### E2E Tests
- Files: {test file paths}
- Covers: {full user-facing path}
- Mocking: nothing
- Run: e2e suite (excluded from default)
- Commit: test file before the wiring that makes it pass

## Deliverables

| File | Purpose | Status |
|------|---------|--------|
| {path} | {what it is} | Not Started |

## Acceptance Criteria

### Functional
- [ ] {criterion from PRD success criteria}

### Unit
- [ ] {specific unit test passes}

### Integration
- [ ] {specific integration test passes against real system}

### E2E
- [ ] {full path test passes}

## Dependencies
{What must exist before each step. External services, prior work items, env vars.}

## Risks
| Risk | Mitigation |
|------|-----------|
| {what could go wrong} | {how to handle it} |
```

**TDD is mandatory for any spec that involves code.** All three test tiers must be present. The integration tier must cover any real API, database, or network call — no exceptions. Tests are committed before the implementation they cover.

**Quality bar — do not present until all pass:**
- [ ] Every PRD success criterion maps to at least one acceptance criterion
- [ ] Approach steps are ordered by dependency
- [ ] All three test tiers present with named files and covered behaviors
- [ ] An agent reading only this spec could execute without asking questions
- [ ] Risks have mitigations, not just descriptions of what could go wrong

Present the complete spec. Apply the gate protocol.

**On approval:**
- Write to `.orchestra/work/{id}-{name}/spec.md` with `status: approved`
- **Immediately advance to Step 4**

---

## Step 4: Gherkin — Derive, Iterate, Approve

Derive Gherkin scenarios from the approved spec. Read the spec's acceptance criteria and approach steps — translate them into executable BDD scenarios. This is machine-readable spec: the execution engine reads this to know what "done" means.

**Output format:**

````markdown
# Gherkin Scenarios: {Feature Name}

> Source: .orchestra/work/{id}-{name}/spec.md
> Generated: {YYYY-MM-DD}

```gherkin
Feature: {feature name — matches spec title exactly}
  {one-line description of the feature}

  Background:
    Given {shared preconditions — only include if 3+ scenarios share them}

  Scenario: {happy path name}
    Given {initial state}
    When {user action or system event}
    Then {expected outcome}
    And {additional assertion}

  Scenario: {alternate path}
    Given {initial state}
    When {different action}
    Then {different outcome}

  Scenario: {error or edge case}
    Given {precondition}
    When {action that triggers the edge case}
    Then {error or fallback outcome}
```
````

**Rules:**
- Every scenario: at least one Given, When, Then
- Chain with `And` — never repeat Given/When/Then back to back
- Scenario names: sentence case, no punctuation
- Feature name matches spec title exactly
- 3–7 scenarios per feature; more → split into multiple features
- Tag `@wip` on items derived from out-of-scope or future criteria

**Quality bar — do not present until all pass:**
- [ ] Every spec acceptance criterion maps to at least one scenario
- [ ] At least one error/negative scenario per feature
- [ ] Scenarios describe behavior, not implementation details
- [ ] Scenario coverage is complete enough that passing all of them = the spec is met

Present the complete Gherkin. Apply the gate protocol.

**On approval:**
- Write to `.orchestra/work/{id}-{name}/gherkin-spec.md`
- **Advance to Step 5**

---

## Step 5: Handoff

Planning is complete. Report and stop:

```
Planning complete: {id}-{name}

  .orchestra/work/{id}-{name}/prd.md          [approved]
  .orchestra/work/{id}-{name}/spec.md          [approved]
  .orchestra/work/{id}-{name}/gherkin-spec.md  [approved]

Ready for execution. Run /orchestra-implement {work-item-name} to begin.
```

Do not begin implementation. Your job ends here.
