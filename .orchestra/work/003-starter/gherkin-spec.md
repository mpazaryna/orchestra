# Gherkin Scenarios: Starter — From Empty Directory to Running Work Item

> Source: .orchestra/work/003-starter/spec.md
> Generated: 2026-06-11

```gherkin
Feature: Starter — From Empty Directory to Running Work Item
  One command and one README take a newcomer to a connected, running Orchestra project

  Background:
    Given the orchestra monorepo is checked out
    And the deployed MCP server is live

  Scenario: One command creates a ready workspace repo
    Given a target path that does not exist
    When create.sh is run with the path and a one-line idea
    Then the target contains the README, a working .mcp.json, and a .gitignore
    And the idea appears in the README's brief slot
    And the target is a git repository with an initial commit
    And the three next steps are printed

  Scenario: Existing targets are refused
    Given a target path that already exists
    When create.sh is run with that path
    Then it exits non-zero without modifying anything

  Scenario: The README is complete enough to act on
    When the template README is inspected
    Then it documents the first session, keyboard workflow, AFK workflow, status checks, auth handling, and troubleshooting
    And every workflow is expressed as copy-paste steps

  Scenario: Secrets cannot land in the repo
    When the template .gitignore and README are inspected
    Then env and key files are ignored
    And the README names the env var and warns what never gets committed

  Scenario: The template cannot drift silently
    When check.sh runs against the live server
    Then initialize answers with instructions present
    And exactly 7 tools are served
    And the orchestra-afk skill is fetchable

  Scenario: A stamped project really works
    Given a fresh project stamped by create.sh
    When a session is started with exactly the README's first-session prompt
    Then .orchestra/ is scaffolded and intake → PRD artifacts appear
    And the session stops at a human decision
    And the run is archived as validation.md
```
