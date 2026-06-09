# Gherkin Scenarios: MCP SDLC Server

> Source: .orchestra/work/m2-mcp-sdlc/spec.md
> Generated: 2026-06-09

```gherkin
Feature: MCP SDLC Server
  A deployed HTTP endpoint that serves orchestra SDLC tools via the MCP protocol

  Background:
    Given the orchestra-mcp-sdlc Worker is deployed and reachable

  Scenario: Health check returns ok
    When I send GET /health
    Then the response status is 200
    And the response body contains status "ok"

  Scenario: tools/list returns all SDLC tools
    When I send POST /mcp with method "tools/list"
    Then the response contains a tools array
    And the tools array includes "orchestra_get_prompt"
    And the tools array includes "orchestra_get_gates"
    And the tools array includes "orchestra_list_stages"

  Scenario: Get prompt for a valid stage
    When I send POST /mcp with method "tools/call" and tool "orchestra_get_prompt" and stage "prd"
    Then the response contains a non-empty prompt string

  Scenario: Get gates for a valid stage
    When I send POST /mcp with method "tools/call" and tool "orchestra_get_gates" and stage "spec"
    Then the response contains a gates array
    And the gates array includes "prd"

  Scenario: List stages returns ordered pipeline
    When I send POST /mcp with method "tools/call" and tool "orchestra_list_stages"
    Then the response contains a stages array
    And "intake" appears before "prd"
    And "prd" appears before "spec"
    And "execute" is the last stage

  Scenario: Unknown tool returns JSONRPC error
    When I send POST /mcp with method "tools/call" and tool "orchestra_nonexistent"
    Then the response contains a JSONRPC error with code -32601

  Scenario: Any project can use the endpoint without local setup
    Given a project outside the orchestra monorepo
    And its .mcp.json references the live orchestra-mcp-sdlc URL
    When Claude Code reads the MCP config
    Then orchestra tools are available in that session
```
