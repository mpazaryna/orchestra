---
ticket: m5-afk
status: draft
created_on: 2026-06-09
updated_on: 2026-06-11
---

# M5: AFK

**Objective:** A real work item advances through the pipeline away from
keyboard — the loop-owner schedules and executes SDLC stages autonomously,
surfacing only the gates that require a human decision. Scope amped per
[ADR-002](../../adr/ADR-002-afk-first.md): the milestone closes when a run
ships, not when it plans.

## Success Criteria

- [x] orchestra-pilot cold-agent test passes: a fresh agent with only the deployed tool catalog in context discovers and applies the skills unprompted (run 20260611T120026Z, after the F1 instructions fix — see 001 findings)
- [ ] A scheduled headless Claude Code run checks pipeline state and advances stages without a human gate automatically
- [ ] Human gates (PRD approval, spec approval) produce a notification or summary and block until answered
- [x] First staged proof: one pipeline run completes AFK from intake to plan (run 20260611T120026Z: cold agent took the relnotes brief from intake through roadmap, PRDs, spec, gherkin, ADRs, devlog — stopped at the implement gate)
- [ ] Milestone close: one pipeline run completes AFK from intake to shipped
- [ ] Failure list from the headless runs is written up as input to the M3 Lenny PRD

## Context

Part of the [Orchestra Roadmap](.orchestra/roadmap.md).

This is the AFK SDLC vision — the system does the work, humans make the calls.
ADR-002 inverted the original dependency: this milestone no longer waits for
M3. Headless Claude Code (which exists today and already speaks MCP) is the
first loop-owner; Agent Lenny is built afterward, from the failures these runs
expose. Requires only M2 (MCP SDLC), which is live.

## Materials

| Material | Location | Status |
|----------|----------|--------|
| orchestra-pilot cold-agent test | .orchestra/work/001-orchestra-pilot/prd.md | Built & first run complete (verdict: catalog not discovered — see findings) |
| Scheduled headless run design | TBD | Not Started |
| Gate notification mechanism | TBD | Not Started |
| End-to-end pipeline test | .orchestra/work/ | Not Started |
| Failure list → M3 PRD input | .orchestra/work/001-orchestra-pilot/findings.md | First findings delivered (F4 = first Lenny requirement) |

## Notes

To start the planning loop, fetch the `orchestra-plan` skill (locally via the
`skills/orchestra-plan/` symlink in `.claude/skills/`, or remotely via
`orchestra_get_skill("orchestra-plan")`) and follow it for `m5-afk`. Depends on M2 only.
