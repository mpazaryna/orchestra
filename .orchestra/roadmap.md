---
status: active
created_on: 2026-06-09
---

# Orchestra Roadmap

**Objective:** A suite of SDLC tools — agents, MCP servers, and skills — that together cover the full software development lifecycle, from idea intake through shipping and review. Any project can adopt the pieces it needs.

## Success Criteria

- [x] Any project can point `.mcp.json` at a deployed orchestra endpoint and get SDLC tools immediately
- [ ] A Think-based agent handles multi-turn SDLC sessions without constant human prompting
- [ ] All orchestra-managed projects are visible and navigable in the workshop Astro site
- [ ] Routine pipeline stages advance without human-in-the-loop (AFK capable)

## Context

Orchestra started as a set of Claude Code skills living in agentic-factory. The goal is to graduate it into a proper deployed suite — MCP server, agent, and skills in one monorepo — so the SDLC can run across any project with minimal setup.

## Milestones

| Milestone | Location | Status |
|-----------|----------|--------|
| M1: Skills | .orchestra/work/m1-skills/prd.md | Done |
| M2: MCP SDLC | .orchestra/work/m2-mcp-sdlc/prd.md | Done |
| M3: Agent Lenny | .orchestra/work/m3-agent-lenny/prd.md | Not Started |
| M4: Workshop | .orchestra/work/m4-workshop/prd.md | Not Started |
| M5: AFK | .orchestra/work/m5-afk/prd.md | Not Started |

## References

- ADR-000: [The Score](.orchestra/adr/ADR-000-the-score.md)
