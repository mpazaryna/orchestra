# Gate-Survival Demo — 2026-06-11

The run-2 moment from 001-orchestra-pilot, replayed through deployed Lenny —
and this time the question got answered. One work item, multiple sessions,
zero restarts.

Deployed: `https://orchestra-agent-lenny.mpazbot.workers.dev`
Work item: `relnotes` (same process-word-free brief as the pilot runs)

## Timeline (all UTC, 2026-06-11)

| Time | Event |
|------|-------|
| 13:07:41 | `POST /work` — brief accepted, conductor loop starts |
| 13:07–13:10 | Turn 1: orients via `orchestra_list_stages` → intake prompt → skills; scaffolds the knowledge base; writes roadmap, 3 stub PRDs, full M1 PRD, devlog (via the deployed devlog tool) — 14 files in the DO workspace |
| 13:10:01 | **Gate 96c3a3f9 raised**: "Approve the relnotes plan (4-milestone roadmap + M1 walking-skeleton PRD) and confirm the M1 build decisions…" — 4 options, Go recommended, artifact paths attached. Turn ends. |
| 13:10:01 | First webhook push → ntfy responded **429** (rate-limited); error recorded on the gate, gate remains answerable |
| 13:19 | Notification retried manually → 200, tap-to-answer link delivered |
| 13:10–13:44 | Lenny idle/hibernated. During this window the Worker was **redeployed three times** (workspace-export fixes) — DO evicted and state survived |
| 13:44:59 | **Gate answered** via authed `POST /gates/96c3a3f9/answer`: "Approve the plan but build in Python instead of Go — keep shell-out + A..B / bare-A ranges. Proceed." (34m58s after raise) |
| 13:45–13:47 | **Resume**: same session, full context. Lenny records the decision as `ADR-001-python-cli-shell-out-to-git.md` and produces `m1-skeleton/spec.md` with Python applied. All 14 pre-gate files intact. |

## What this proves (PRD success criteria)

1. **Notification without a terminal** — gate question + artifacts + answer
   link pushed to an ntfy topic (with a real-world lesson: the first push hit
   ntfy rate limiting; the failure was recorded on the gate, not lost).
2. **Async answer, full retention** — answered ~35 minutes later through the
   HTTP channel; the session resumed with every artifact and the entire
   conversation intact, despite Worker redeploys and DO eviction in between.
3. **The run-2 moment completed** — the pilot's evaporating stack question is
   now an answered gate, an ADR recording the decision, and a spec built on
   it. The pipeline survived its first human gate.

## The Second Cycle

The resume turn didn't just apply the answer — it completed M1 planning
(spec, Gherkin, 10-step plan, all derived from the approved PRD) and raised
a **second gate** (`f7ba4fc5`, spec approval) at the correct next decision
point, proving the loop is cyclical: gate → answer → work → next gate.
Answered "Approved — implement" at 13:50:51Z; Lenny proceeded into
implementation of the walking skeleton.

## Notes

- Lenny's plan diverged from the pilot's in an interesting way: cold run 2
  recommended Python; Lenny recommended Go (single static binary) and the
  human overrode to Python. The gate channel is where that disagreement
  belongs.
- The transcript of turn 1 (orient → scaffold → plan → gate) is observable
  via `GET /messages?work=relnotes`; the workspace via `GET /workspace`.
- Remaining criteria (heartbeat re-notify at 24h, scheduled continuation)
  are wired and unit-tested but not exercised by this demo's window.
- Lenny dates his artifacts `2025-06-13` — the model has no clock and no
  date in its context. Harmless here, wrong in general: inject the current
  date into the system prompt or brief (follow-up item).
