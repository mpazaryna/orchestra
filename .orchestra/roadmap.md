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
- [x] Human gates produce a notification and block until a human answers — AFK, not human-free (M3 demo: gate raised 13:10Z, answered 13:45Z, session resumed intact)
- [ ] One full pipeline run completes AFK from intake to shipped
- [ ] A scheduled repo-centric runner (headless Claude Code on a checkout, per ADR-003) survives human gates: pause in the repo, resume on approval
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
| M5: AFK (repo-centric runner) | .orchestra/work/m5-afk/prd.md | In progress — 001 done, 002 next |
| M3: Agent Lenny | .orchestra/work/m3-agent-lenny/prd.md | Parked — gate machinery proven, conductor-in-DO rejected (ADR-003) |
| M4: Workshop | .orchestra/work/m4-workshop/prd.md | Last — ideally shipped *by* the pipeline |

## References

- ADR-000: [The Score](.orchestra/adr/ADR-000-the-score.md)
- ADR-002: [AFK First](.orchestra/adr/ADR-002-afk-first.md)
- ADR-003: [The Repo Is the Workspace](.orchestra/adr/ADR-003-the-repo-is-the-workspace.md)
