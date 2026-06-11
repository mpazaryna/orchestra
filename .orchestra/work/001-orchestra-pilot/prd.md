---
ticket: 001-orchestra-pilot
status: approved
created_on: 2026-06-11
---

# Orchestra Pilot — Cold-Agent Test

## Problem

Everything in M5 rests on one untested assumption: that an agent nobody is
steering — no installed skills, no project instructions, only the deployed
Orchestra tool catalog — will discover the SDLC and follow it. ADR-001 traded
the harness's automatic skill-triggering for hand-written tool descriptions,
and we have never measured whether that trigger system is loud enough. We
found a dead trigger in our own PRDs yesterday; we have no idea how many more
silent gaps a cold consumer would hit. Until this is measured, every hour
spent on scheduled AFK runs or Agent Lenny is built on a guess.

## Objective

Know, with evidence, whether a fresh agent given only the deployed Orchestra
endpoint and a bare work brief follows the SDLC unprompted — and have a
written list of exactly where it stumbles.

## Success Criteria

- [ ] A cold agent (no local skills, no project instructions, only the deployed tool catalog) is given a bare brief and observed end to end
- [ ] The run produces a verdict for each step: did the agent discover the stages, fetch the right playbooks, and produce artifacts that follow Orchestra conventions — without being told they exist?
- [ ] Every stumble is written up as a finding with the gap that caused it (these findings are the raw material for the M3 Lenny PRD)
- [ ] The test is repeatable — it can be re-run after any server change to check whether triggering improved or regressed
- [ ] The run and its findings are committed to the knowledge base

## Context

First work item under [M5: AFK](.orchestra/work/m5-afk/prd.md), reordered to
the front of the roadmap by [ADR-002](.orchestra/adr/ADR-002-afk-first.md).
The cost of skipping it: M3 Lenny gets designed from speculation, and AFK
runs fail in ways we could have caught with one afternoon of measurement.
The devlog of 2026-06-10 named this test as the next step; today it ships.

## Materials

| Deliverable | Location | Status |
|-------------|----------|--------|
| Pilot harness (repeatable cold-run setup) | apps/orchestra-pilot/ | Done |
| Captured run transcript | apps/orchestra-pilot/runs/20260611T113805Z/ | Done |
| Findings report | .orchestra/work/001-orchestra-pilot/findings.md | Done |

## References

- Milestone PRD: .orchestra/work/m5-afk/prd.md
- ADR-001: .orchestra/adr/ADR-001-skills-served-whole-over-mcp.md
- ADR-002: .orchestra/adr/ADR-002-afk-first.md
