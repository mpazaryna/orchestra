---
ticket: m3-agent-lenny
status: draft
created_on: 2026-06-09
---

# M3: Agent Lenny

**Objective:** Deploy OrchestraAgent (agent-lenny) as a Cloudflare Durable Object so it can handle multi-turn SDLC sessions with memory and scheduled tasks.

## Success Criteria

- [ ] `wrangler deploy` succeeds from `apps/agent-lenny/`
- [ ] Agent responds to a session prompt via the agents SDK routing
- [ ] `get_stage_prompt`, `check_gates`, and `list_stages` tools function correctly
- [ ] Agent can be reached from Claude Code via MCP or direct HTTP

## Context

Part of the [Orchestra Roadmap](.orchestra/roadmap.md).

Named for Leonard Bernstein. Lenny is the conductor — it holds session state, knows where the pipeline is, and routes to the right stage prompt. Think-based Durable Object enables multi-turn sessions without losing context.

## Materials

| Material | Location | Status |
|----------|----------|--------|
| Agent Durable Object | apps/agent-lenny/ | Not Started |
| Cloudflare deployment | wrangler deploy | Not Started |
| Session routing | src/index.ts | Not Started |

## Notes

Run `/orchestra-plan m3-agent-lenny` to start the planning loop.
