# Gherkin Scenarios: Orchestra Pilot — Cold-Agent Test

> Source: .orchestra/work/001-orchestra-pilot/spec.md
> Generated: 2026-06-11

```gherkin
Feature: Orchestra Pilot — Cold-Agent Test
  Measure whether the deployed tool catalog alone triggers the SDLC for an unsteered agent

  Background:
    Given the Orchestra MCP server is deployed and reachable
    And a valid API key is available from the environment or apps/mcp-sdlc/.dev.vars

  Scenario: Preflight confirms the deployed server is testable
    Given the preflight script resolves the API key
    When it sends initialize and tools/list to the deployed endpoint
    Then both requests return HTTP 200
    And the tool list contains exactly 7 tools
    And the script exits 0

  Scenario: Cold run executes in full isolation
    Given a fresh sandbox directory outside the repository
    And an .mcp.json pointing only at the deployed Orchestra server
    When run.sh launches headless Claude Code with strict MCP config and project-only settings
    Then the transcript records no MCP tools from any other server
    And no skill or instruction file from the host machine appears in the transcript
    And the full stream-json transcript is archived under runs/ with the produced workspace

  Scenario: Analyzer produces a verdict for every measurement
    Given an archived run transcript
    When analyze.mjs processes it
    Then report.md lists every MCP tool call in order with its arguments
    And the verdict table answers each measurement: stages discovered, stage prompt fetched, knowledge base scaffolded, skill fetched, support file fetched, PRD-shaped artifact produced, stopped at a human gate

  Scenario: Agent never discovers the SDLC
    Given a transcript in which no orchestra tool was ever called
    When analyze.mjs processes it
    Then every verdict row reads NO
    And the run is still archived and reportable
    And the outcome is recorded as a finding, not a harness error

  Scenario: Malformed transcript lines do not break analysis
    Given a transcript containing unparseable or unknown-type lines
    When analyze.mjs processes it
    Then unknown lines are skipped
    And verdicts are derived from the parseable remainder

  Scenario: Findings feed the next milestone
    Given a completed run with at least one stumble in the report
    When findings.md is written
    Then each finding names the observed behavior, the gap that caused it, and a candidate fix
    And each finding states whether it informs tool descriptions or the M3 Lenny design
```
