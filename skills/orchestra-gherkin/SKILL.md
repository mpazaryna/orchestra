---
name: orchestra-gherkin
description: "Generate Gherkin scenarios from an orchestra PRD or spec — produces Feature/Scenario blocks in fenced gherkin markdown."
when_to_use: "Use when translating acceptance criteria or implementation steps into executable BDD scenarios."
argument-hint: "<prd-path | spec-path | work-item-name>"
allowed-tools: Read, Glob, Write
---

# Orchestra Gherkin

Generate Gherkin scenarios from an orchestra work item. Reads either a PRD or spec and produces a `gherkin.md` file alongside it.

## Variables

SOURCE: $ARGUMENTS

## Workflow

### Step 1: Locate the source

If `$ARGUMENTS` is a file path, read it directly.

If `$ARGUMENTS` is a work item name, look for it in `.orchestra/work/`:
```
.orchestra/work/<name>/prd.md
.orchestra/work/<name>/spec.md
```

Prefer `spec.md` if both exist — it has more concrete implementation detail. If only `prd.md` exists, use that.

If no path or name is provided, STOP and ask the user to provide one.

### Step 2: Determine source type

**From a PRD** — extract:
- Problem statement → Feature description
- User goals → high-level scenarios (happy path + edge cases)
- Success criteria → Then clauses
- Scope / out of scope → tag with `@wip` or `@out-of-scope`

**From a spec** — extract:
- Deliverables → Feature description
- Steps / implementation tasks → Scenario steps
- Acceptance criteria → Then clauses
- Risks → negative/error scenarios

### Step 3: Generate Gherkin

Write the output file in the same directory as the source file:
- If source is `spec.md` → write `gherkin-spec.md`
- If source is `prd.md` → write `gherkin-prd.md`

Output format:

````markdown
# Gherkin Scenarios: <Feature Name>

> Source: <relative path to PRD or spec>
> Generated: <date>

```gherkin
Feature: <feature name from PRD/spec title>
  <one-line description of the feature>

  Background:
    Given <any shared preconditions>

  Scenario: <happy path name>
    Given <initial state>
    When <user action or system event>
    Then <expected outcome>
    And <additional assertion>

  Scenario: <alternate path>
    Given <initial state>
    When <different action>
    Then <different outcome>

  Scenario: <error / edge case>
    Given <precondition>
    When <action that triggers the edge case>
    Then <error or fallback outcome>
```
````

### Step 4: Rules

- Every scenario must have at least one `Given`, one `When`, one `Then`
- Use `And` to chain — never repeat `Given`/`When`/`Then` back to back
- Scenario names are sentence case, no punctuation
- Feature name matches the PRD/spec title exactly
- Include a `Background:` block only if 3+ scenarios share the same precondition
- Tag `@wip` on scenarios derived from items marked as out-of-scope or future
- Aim for 3–7 scenarios per feature — more than that, split into multiple features
- All output is wrapped in ` ```gherkin ` fenced blocks inside the markdown file

### Step 5: Report

Tell the user:
- Path to the generated `gherkin-spec.md` or `gherkin-prd.md`
- How many scenarios were generated
- Any acceptance criteria from the source that couldn't be mapped to a scenario (and why)
