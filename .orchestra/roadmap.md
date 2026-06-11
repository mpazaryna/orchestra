---
status: active
created_on: 2026-06-09
updated_on: 2026-06-11
---

# Orchestra Roadmap

**Objective:** One Orchestra-managed work item goes from intake to shipped,
AFK, with humans only at the PRD and spec gates. The SDLC suite — skills, MCP
server, agent — exists so the pipeline can run itself; any project can adopt
the pieces it needs. (Amped per [ADR-002](.orchestra/adr/ADR-002-afk-first.md).)

## Success Criteria

- [x] Any project can point `.mcp.json` at a deployed orchestra endpoint and get SDLC tools immediately
- [x] A cold agent with only the deployed tool catalog in context triggers and applies the skills unprompted (orchestra-pilot run 2, after ADR-001's trigger gap was closed with initialize `instructions`)
- [ ] A scheduled headless run advances a real work item through gateless stages without human prompting
- [ ] Human gates produce a notification and block until a human answers — AFK, not human-free
- [ ] One full pipeline run completes AFK from intake to shipped
- [ ] Agent Lenny, built from observed failures of the headless runs, replaces headless Claude Code as loop-owner
- [ ] All orchestra-managed projects are visible and navigable in the workshop Astro site

## Context

Orchestra started as a set of Claude Code skills living in agentic-factory. M1
graduated the skills, M2 deployed them as a service over MCP. The layer that
doesn't change is live; what remains is the loop that runs on top of it.
ADR-002 inverted the original ordering: prove the AFK loop with the cheapest
loop-owner (headless Claude Code, which exists today), and let what breaks in
real runs write Lenny's PRD — instead of building the conductor from
speculation.

## Milestones

| Milestone | Location | Status |
|-----------|----------|--------|
| M1: Skills | .orchestra/work/m1-skills/prd.md | Done |
| M2: MCP SDLC | .orchestra/work/m2-mcp-sdlc/prd.md | Done |
| M5: AFK (headless loop-owner) | .orchestra/work/m5-afk/prd.md | Next |
| M3: Agent Lenny | .orchestra/work/m3-agent-lenny/prd.md | Blocked on M5 findings |
| M4: Workshop | .orchestra/work/m4-workshop/prd.md | Last — ideally shipped *by* the pipeline |

## References

- ADR-000: [The Score](.orchestra/adr/ADR-000-the-score.md)
- ADR-002: [AFK First](.orchestra/adr/ADR-002-afk-first.md)
