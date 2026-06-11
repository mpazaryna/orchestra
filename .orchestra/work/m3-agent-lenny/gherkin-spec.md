# Gherkin Scenarios: M3: Agent Lenny

> Source: .orchestra/work/m3-agent-lenny/spec.md
> Generated: 2026-06-11

```gherkin
Feature: M3: Agent Lenny
  A conductor that survives human gates: pause, notify, accept an async answer, resume

  Background:
    Given Lenny is deployed with the orchestra MCP server configured as its SDLC source
    And a webhook receiver is configured for gate notifications

  Scenario: Work begins from a brief
    Given an authenticated client
    When it POSTs a work brief to /work
    Then Lenny starts the conductor loop for that work item
    And the loop discovers the SDLC through the deployed orchestra tools, not local copies

  Scenario: A human gate pauses the loop and notifies a human
    Given the conductor reaches a decision that requires a human
    When the model calls raise_gate with a question, options, and artifact paths
    Then the gate is persisted as pending with a one-time answer token
    And the webhook receives the question, the options, and an answer link
    And the loop ends its turn without proceeding past the gate

  Scenario: An async answer resumes the session intact
    Given a pending gate on a session that has been idle for at least 10 minutes
    When the human submits an answer via the tokened link or the API
    Then the gate is marked answered
    And the conductor loop resumes with the answer appended
    And previously produced workspace artifacts and conversation history are still present

  Scenario: A gate cannot be answered twice or with a bad token
    Given a gate that has already been answered
    When a second answer is submitted
    Then the request is rejected
    And submitting any answer with an invalid token is rejected without changing the gate

  Scenario: The heartbeat keeps unattended work moving
    Given a gate that has been pending for more than 24 hours
    When the scheduled heartbeat runs
    Then the human is re-notified exactly once
    And given idle work in a gateless stage, the heartbeat continues the loop

  Scenario: Status reflects reality at any time
    Given a work item mid-pipeline with one pending gate
    When a client GETs /status
    Then the response names the current stage, the pending gate, the turn count, and last activity

  Scenario: The run-2 moment completes end to end
    Given the relnotes brief submitted to deployed Lenny
    When the stack-choice gate is raised, notified, and answered "Python, proceed" after an idle period
    Then the conductor resumes and produces implement-stage artifacts in the workspace
    And the exchange is archived as demo.md with timestamps
```
