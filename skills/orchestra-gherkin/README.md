# orchestra-gherkin

Generate Gherkin BDD scenarios from an orchestra PRD or spec.

## Quick Start

```
/orchestra-gherkin .orchestra/work/my-feature/spec.md
/orchestra-gherkin .orchestra/work/my-feature/prd.md
/orchestra-gherkin my-feature
```

## What It Does

Reads a PRD or spec from `.orchestra/work/` and writes alongside it:
- `gherkin-spec.md` when sourced from a spec
- `gherkin-prd.md` when sourced from a PRD

**From a PRD** — maps user goals and success criteria to high-level scenarios.

**From a spec** — maps deliverables, steps, and acceptance criteria to concrete scenarios.

Output format:

````markdown
```gherkin
Feature: User Authentication
  Users can sign in with email and password

  Background:
    Given the authentication service is running

  Scenario: Successful login
    Given a registered user with email "user@example.com"
    When they submit valid credentials
    Then they receive an access token
    And are redirected to the dashboard

  Scenario: Invalid password
    Given a registered user
    When they submit an incorrect password
    Then they see an error message
    And remain on the login page
```
````

## Rules

- Prefers `spec.md` over `prd.md` if both exist
- 3–7 scenarios per feature
- `Background:` block only when 3+ scenarios share preconditions
- `@wip` tags on out-of-scope items
- Generates `gherkin-spec.md` or `gherkin-prd.md` depending on source

## See Also

- `orchestra-spec` — generate the spec first
- `orchestra-prd` — generate the PRD first
