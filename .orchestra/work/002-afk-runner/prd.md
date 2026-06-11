---
ticket: 002-afk-runner
status: approved
created_on: 2026-06-11
---

# AFK Runner — A Repository Runs Its Own Work Items

## Problem

Everything needed for a repository to run a work item AFK now exists except
the loop itself. The deployed MCP server serves the full SDLC to any
checkout (proven by the cold pilot: intake → plan, unprompted, on a real
filesystem). The repo's `.orchestra/` frontmatter already encodes pipeline
state. Human gates work asynchronously (proven by M3's demo). But nothing
connects them: no scheduler starts the next headless session, no convention
tells a session how to pause *in the repo* when it hits a human decision,
and no ping tells the human a decision is waiting. Today a work item moves
only while a human personally drives a session — which is the opposite of
the amped goal (ADR-002: intake → shipped, AFK, humans only at gates).

## Objective

Point the runner at a repository with a work item, walk away, and the work
advances on a schedule: planning artifacts arrive on branches, every human
decision waits as a reviewable change in the repo plus a phone ping, each
approval — a commit, like every approval in software — wakes the work
exactly where it stopped. The subscription harness does all execution; the
repo holds all truth (ADR-003).

## Success Criteria

- [ ] A target repository (`.mcp.json` + `.orchestra/`) has a work item advanced by a scheduled, unattended headless run — no human at the keyboard
- [ ] When a run reaches a human gate, it records the question and its artifacts in the repo (branch with the gate stated), sends a notification ping, and exits cleanly
- [ ] A human approval expressed in the repo (PR approval or a `status:` edit, committed) causes a later scheduled run to resume the work exactly where it stopped — nothing re-explained, nothing redone
- [ ] One work item travels intake → implemented with tests passing on the checkout, across at least two gate pauses, with every artifact reviewable as normal git history
- [ ] The relnotes work item — exported from Lenny's parked workspace into a real repository — is the work item that proves it (continuity of evidence across ADR-003)
- [ ] No raw API key in the loop: execution runs on the subscription harness

## Context

Serves [M5: AFK](.orchestra/work/m5-afk/prd.md) under
[ADR-002](../../adr/ADR-002-afk-first.md) and
[ADR-003](../../adr/ADR-003-the-repo-is-the-workspace.md). This is the
final leg of M5's machinery: 001 proved discovery, M3 proved async gates,
ADR-003 fixed where work must live — 002 assembles the loop from those
proven parts. The cost of not doing it: the SDLC remains
keyboard-attached, and the two checked roadmap criteria stay isolated
proofs instead of a working system.

## Materials

| Deliverable | Location | Status |
|-------------|----------|--------|
| Runner (scheduled headless session wrapper) | TBD in spec | Not Started |
| Gate-in-repo convention (how a run pauses, how approval reads) | TBD in spec — likely a served skill/prompt update | Not Started |
| Notification ping on gate | TBD in spec (ntfy; M3's adapter as prior art) | Not Started |
| relnotes repo seeded from Lenny's workspace export | TBD | Not Started |
| End-to-end demo: two gate pauses, tests green | .orchestra/work/002-afk-runner/ | Not Started |

## References

- ADR-003 (architecture), ADR-002 (goal)
- 001 findings (discovery proof), m3-agent-lenny/demo.md (gate proof)
- M5 PRD: .orchestra/work/m5-afk/prd.md

## Notes

The gate convention is the heart of this work item — the runner is mostly
plumbing. Out of scope: any cloud component (if scheduling later needs to
outlive a laptop, that proposal must clear ADR-003's bar); multi-repo
work items; replacing the repo's own review controls.
