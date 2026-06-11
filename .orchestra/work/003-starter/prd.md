---
ticket: 003-starter
status: approved
created_on: 2026-06-11
---

# Starter — From Empty Directory to Running Work Item

## Problem

Orchestra works, but only for people who already know it works. Today's
evidence: every successful run (cold pilot, relnotes) needed hand-assembly —
someone who knew to write `.mcp.json` with the right URL and auth header,
knew the runner exists, knew gates are files you answer with commits. None
of that is written down anywhere a newcomer would find it. The deployed
server's instructions teach *agents* the process; nothing teaches the
*human* setting up a project. Adoption currently requires having been in
this room.

## Objective

Anyone — starting from an empty directory — gets a working Orchestra
project in one command and one README: connected to the deployed SDLC,
documented for both ways of working (at the keyboard, and AFK with gates),
with the first work item a guided exercise rather than a leap of faith.

## Success Criteria

- [ ] One command creates a new workspace repo: README, working `.mcp.json`, git initialized — ready for a first session
- [ ] The README walks the standard workflows end to end: start an idea at the keyboard (plan → gates → implement), run it AFK (runner, schedule, gate files, answering by commit), and check status — each as copy-paste steps
- [ ] Auth is handled honestly: where the key comes from, where it lives, what never gets committed
- [ ] A fresh project stamped from the template completes intake → PRD on the first try, following only the README (validation run, archived)
- [ ] The template cannot drift silently: it lives in this monorepo and a check ties it to the live server (endpoint reachable, tool count, skill present)

## Context

Serves the roadmap's adoption criterion ("any project can point .mcp.json
at a deployed orchestra endpoint") by making it true for people who didn't
build the endpoint. Builds on merged 002 (the README documents the
runner) and ADR-003 (the template repo *is* the workspace pattern).
Cost of skipping: Orchestra stays a single-operator system and every new
project re-derives setup from devlogs.

## Materials

| Deliverable | Location | Status |
|-------------|----------|--------|
| Template (README, .mcp.json, .gitignore) | templates/starter/ | Not Started |
| create.sh (stamp out a new workspace repo) | templates/create.sh | Not Started |
| Template drift check | TBD in spec | Not Started |
| Validation run (fresh project, intake → PRD) | .orchestra/work/003-starter/ | Not Started |

## References

- ADR-003, 002-afk-runner (runner + gate convention the README documents)
- apps/afk-runner/README.md (operator-facing; starter README is consumer-facing)

## Notes

Out of scope: publishing a standalone GitHub template repo (can be a later
CI sync if wanted); multi-endpoint config; anything that duplicates what
orchestra_scaffold already generates — the README's first session lets the
agent scaffold `.orchestra/` itself, which is also the guided exercise.
