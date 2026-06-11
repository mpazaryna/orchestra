# Gherkin Scenarios: AFK Runner — A Repository Runs Its Own Work Items

> Source: .orchestra/work/002-afk-runner/spec.md
> Generated: 2026-06-11

```gherkin
Feature: AFK Runner — A Repository Runs Its Own Work Items
  A scheduled headless session advances repo work items, pausing at gate files

  Background:
    Given a target repository with .mcp.json pointing at the deployed orchestra server
    And the orchestra-afk skill is served by that server

  Scenario: A scheduled run advances unattended work
    Given a work item mid-stage with no pending gate files
    When the scheduler fires the runner
    Then a headless session starts from the checkout
    And it orients from .orchestra/ state and continues the work without redoing anything
    And its commits land on the afk branch and are pushed before exit

  Scenario: A human decision pauses the work in the repo
    Given a session reaches a decision only a human can make
    When it follows the orchestra-afk protocol
    Then a gate file with status pending, the question, options, and artifact paths is committed and pushed
    And a notification ping carries the repo, branch, gate path, and question
    And the session exits cleanly

  Scenario: A pending gate blocks cheaply
    Given a pending unanswered gate file
    When the scheduler fires the runner
    Then check-state reports blocked
    And no headless session is started

  Scenario: An answered gate resumes the work
    Given a gate file edited to status answered with an answer, committed
    When the scheduler fires the runner
    Then check-state reports resume
    And the session applies the answer and continues exactly where the work stopped
    And the gate file is marked consumed so it cannot trigger a second resume

  Scenario: Malformed gate files do not wedge the loop
    Given a gate file with broken frontmatter
    When check-state runs
    Then the malformed file is reported, not crashed on
    And the verdict is computed from the remaining valid state

  Scenario: The relnotes work item completes across two pauses
    Given the relnotes repo seeded from the parked conductor's workspace export
    When scheduled runs advance it through at least two gate pauses with human answers as commits
    Then the implementation passes its tests on the checkout
    And the full history is reviewable as normal git log
    And the timeline is archived as demo.md
```
