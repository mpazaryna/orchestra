---
created_on: 2026-04-05
---

# Agent Task Execution — Sequence Diagram

> Illustrates a multi-phase agentic workflow: parallel tool loading, parallel inference, retry-backed model call, and structured result delivery.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Orchestrator as OrchestratorAgent
    participant ToolA as ToolA (MCP)
    participant ToolB as ToolB (MCP)
    participant ToolC as ToolC (MCP)
    participant Model as FoundationModel
    participant Output as OutputHandler

    rect rgb(227, 242, 253)
    Note over User,ToolC: Phase 1: Session Init (parallel tool warmup)
    User->>Orchestrator: Submit task prompt
    Orchestrator->>Orchestrator: Parse intent + select tools

    par Parallel Tool Init
        Orchestrator->>ToolA: initialize()
        ToolA-->>Orchestrator: Ready
    and
        Orchestrator->>ToolB: initialize()
        ToolB-->>Orchestrator: Ready
    and
        Orchestrator->>ToolC: initialize()
        ToolC-->>Orchestrator: Ready
    end
    end

    rect rgb(232, 245, 233)
    Note over Orchestrator,ToolC: Phase 2: Parallel Data Gathering
    par Parallel Tool Calls
        Orchestrator->>ToolA: fetch(query)
        Note right of ToolA: Search + filter
        ToolA-->>Orchestrator: ResultSet A
    and
        Orchestrator->>ToolB: fetch(query)
        ToolB-->>Orchestrator: ResultSet B
    and
        Orchestrator->>ToolC: fetch(query)
        ToolC-->>Orchestrator: ResultSet C
    end
    Orchestrator->>Orchestrator: Merge + deduplicate results
    end

    rect rgb(255, 243, 224)
    Note over Orchestrator,Model: Phase 3: Model Synthesis (with retry)
    Orchestrator->>Orchestrator: Build prompt from merged results
    Orchestrator->>Model: generate(prompt, systemInstructions)

    loop Retry up to 3x
        Model->>Model: Inference
        alt Success
            Model-->>Orchestrator: Structured response
        else Parse error or timeout
            Model->>Model: Backoff (1s → 2s → 4s)
        end
    end
    end

    rect rgb(224, 242, 241)
    Note over Orchestrator,Output: Phase 4: Deliver Result
    Orchestrator->>Orchestrator: Validate + format response
    Orchestrator->>Output: stream(result)
    Output-->>User: Display structured output
    end
```

## Key Patterns Demonstrated

- **`autonumber`** — auto-increments step labels for reference in docs and reviews
- **`actor`** — use for humans; `participant` for systems/agents/services
- **`rect rgb(...)`** — color-coded phases make complex flows scannable
- **`par` / `and`** — parallel execution blocks; essential for agentic systems with concurrent tool calls
- **`loop`** — retry logic with bounded attempts
- **`alt` / `else`** — conditional branching (success vs. failure paths)
- **`Note over`** — phase labels that span multiple participants
- **`->>`** / **`-->>`** — solid arrow = call/request, dashed arrow = return/response

## When to Use This Pattern

Use a sequence diagram when documenting:
- Agent-to-tool interactions with specific ordering
- Parallel MCP server calls and their merge point
- Retry or fallback logic in model calls
- Multi-phase workflows where phase boundaries matter

## How to Render

1. **GitHub** — paste into any `.md` file; renders natively
2. **VS Code** — install the "Mermaid Preview" extension
3. **Online** — [mermaid.live](https://mermaid.live) for interactive editing and export
4. **Obsidian / Notion** — both render Mermaid code blocks natively

## References

- [Mermaid sequenceDiagram docs](https://mermaid.js.org/syntax/sequenceDiagram.html)
- orchestra:uml skill (uml/SKILL.md)
