---
ticket: m3-agent-lenny
status: approved
created_on: 2026-06-09
updated_on: 2026-06-11
---

# M3: Agent Lenny

## Problem

Both cold-agent pilot runs ended the same way: the agent reached the exact
moment Orchestra exists for — a crisp human decision, artifacts ready, options
laid out — and then the process exited and the question evaporated (finding
F4, 001-orchestra-pilot). Run 2 took an idea from intake to an
approved-ready plan AFK, asked "Python or Go, and may I proceed?", and nobody
will ever answer, because nothing holds the session open, delivers the
question, or resumes with the answer. Today the pipeline can *reach* every
human gate on its own; it cannot *survive* one. Every AFK run is therefore a
single-shot: whatever it achieves before its first gate is all it achieves.

A second observed gap: each run starts cold and ends silent. Nothing wakes
up later to check whether a gate was answered, whether a stage finished, or
what the pipeline should do next — the loop has no owner between human
touches (M5's open criterion).

## Objective

A work item keeps moving for days, not minutes: the pipeline pauses at each
human gate, the human answers when convenient — minutes or days later — and
the work resumes exactly where it stopped, with nothing re-explained and
nothing lost. Lenny is the conductor who keeps the score open between
performances.

## Success Criteria

- [ ] When a pipeline run reaches a human gate, the human receives the gate question with pointers to the artifacts — without watching a terminal
- [ ] The human answers on their own schedule; the pipeline resumes from the gate with the answer applied, retaining everything already decided and produced
- [ ] Between human touches, Lenny checks pipeline state on a schedule and advances stages that have no human gate, unattended
- [ ] The run-2 moment replayed through Lenny completes: the relnotes stack question reaches a human, the answer comes back hours later, and implementation proceeds — one work item, multiple sessions, zero restarts
- [ ] A human can ask Lenny "where is the pipeline?" at any time and get a faithful answer drawn from the knowledge base
- [ ] Every Lenny-driven advance is recorded in the project's knowledge base the same way a keyboard session would record it

## Context

Part of the [Orchestra Roadmap](.orchestra/roadmap.md), resequenced by
[ADR-002](../../adr/ADR-002-afk-first.md): Lenny is built from observed
failures, not speculation, and the evidence is now in
[001-orchestra-pilot findings](../001-orchestra-pilot/findings.md). F4 is
the core requirement (the async gate channel); F3 contributes a second
(each run's execution permissions are part of the loop contract Lenny
owns, chosen per stage rather than fought mid-run). The deployed MCP
server stays the single source of the SDLC — Lenny consumes it like any
other client (the layer that doesn't change). Headless Claude Code remains
the baseline loop-owner; Lenny earns its place only by surviving the gates
headless cannot. Cost of not doing this: M5's remaining criteria —
scheduled advancement, gates that block until answered, intake→shipped —
are unreachable, and AFK stays single-shot.

## Materials

| Deliverable | Location | Status |
|-------------|----------|--------|
| Agent app | apps/agent-lenny/ | Not Started |
| Gate notification + answer channel | TBD in spec | Not Started |
| Scheduled pipeline check | TBD in spec | Not Started |
| Gate-survival demo (run-2 moment, end-to-end) | .orchestra/work/m3-agent-lenny/ | Not Started |

## References

- Milestone PRD: this file (M3 is a roadmap milestone)
- Findings: .orchestra/work/001-orchestra-pilot/findings.md (F3, F4)
- ADR-002: .orchestra/adr/ADR-002-afk-first.md
- Devlogs: 2026-06-11-cold-agent-first-run.md, 2026-06-11-f1-fix-verdict-flip.md

## Notes

Named for Leonard Bernstein. Scope discipline: Lenny conducts — he does not
serve the SDLC (the deployed server does) and does not replace the worker
agent's judgment. Open question for the spec, not the PRD: the notification
medium for gate questions (the channel a human actually checks). M4
Workshop may later render what Lenny conducts.
