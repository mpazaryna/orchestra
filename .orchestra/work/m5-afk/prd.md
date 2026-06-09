---
ticket: m5-afk
status: draft
created_on: 2026-06-09
---

# M5: AFK

**Objective:** Routine pipeline stages advance without human-in-the-loop — the agent schedules and executes SDLC steps autonomously, surfacing only the gates that require a human decision.

## Success Criteria

- [ ] Agent Lenny runs scheduled tasks that check pipeline state
- [ ] Stages without a human gate advance automatically
- [ ] Human gates (PRD approval, spec approval) produce a notification or summary for review
- [ ] At least one full pipeline run completes AFK from intake to plan

## Context

Part of the [Orchestra Roadmap](.orchestra/roadmap.md).

This is the AFK SDLC vision — the system does the work, humans make the calls. Requires M2 (MCP SDLC) and M3 (Agent Lenny) to be complete and stable first.

## Materials

| Material | Location | Status |
|----------|----------|--------|
| Scheduled task design | apps/agent-lenny/ | Not Started |
| Gate notification mechanism | TBD | Not Started |
| End-to-end pipeline test | .orchestra/work/ | Not Started |

## Notes

Run `/orchestra-plan m5-afk` to start the planning loop. Depends on M2 and M3.
