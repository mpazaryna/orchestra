# AFK Runner Demo — 2026-06-11

A repository ran its own work items. Target: `~/workspace/relnotes`, seeded
from parked Lenny's workspace export (36 files — ADR-003 continuity).
Scheduler: launchd, 15-minute tick. Executor: subscription headless Claude
Code with the repo's own `.mcp.json`; the gate convention arrived entirely
over the wire via the served `orchestra-afk` skill. No API key in the loop.

## Timeline (UTC, 2026-06-11)

| Time | Actor | Event |
|------|-------|-------|
| 15:2x | seed.sh | relnotes repo created from Lenny's export; dates normalized; m1-skeleton: PRD approved, spec in-progress |
| 15:23:32 | manual tick | verdict `continue` → session: fetched **orchestra-afk first**, oriented, branched `afk/m1-skeleton`, `uv sync`, **ran pytest: 33/33 green (24 unit + 4 integration + 5 e2e)**, smoke-tested the CLI, fetched orchestra-review, closed statuses, devlog, **raised gate `001-approve-m1-merge.md`** → ntfy ping |
| 15:30:08 | human | launchd loaded (900s interval) |
| 15:30:23 | human | **answered gate 001 with a commit** (`10036e1`, "approve") — pause #1 complete |
| 15:45:08 | **launchd** | verdict `resume` → session consumed gate 001, **merged M1 to main** (`ec40091`), roadmap M1 → Done, work item closed, devlog — zero human involvement |
| 16:00:08 | **launchd** | verdict `done` → "nothing to do", no session started (cheap-tick guard) |
| 16:06:09 | human | scheduler repointed at `m2-curation` (see Findings) |
| 16:21:09 | **launchd** | verdict `continue` → session drafted the M2 PRD and **raised gate `001-m2-curation-strategy.md`** (four taste-level curation decisions, recommendations stated) → ntfy ping — pause #2 complete |
| 16:33 | human | answered gate 2 with a commit (`ab1d024`, approve all four); verdict `resume` — the 16:36 tick continues M2 unattended |

## Acceptance criteria — evidence

1. **Scheduler-fired unattended advance** — the 15:45 and 16:21 ticks were
   launchd-fired; the 15:45 one merged a milestone, the 16:21 one drafted a
   PRD and gated it.
2. **Gate pause = committed file + ntfy + clean exit** — twice
   (`001-approve-m1-merge.md`, `001-m2-curation-strategy.md`), both pinged,
   both sessions exited 0.
3. **Approval-as-commit resumes with context intact** — `10036e1` →
   the 15:45 tick consumed the gate and merged; nothing re-asked or redone.
4. **Implemented with tests green across ≥2 pauses** — M1 merged with 33/33
   real pytest passes on the checkout; pauses #1 and #2 on record.
5. **relnotes continuity** — the work item that died in a DO this morning
   was merged to a real `main` by a scheduler this afternoon.
6. **Subscription-only** — `claude -p` from the checkout; the only key in
   play is the orchestra server bearer token for skill delivery.

## Findings

- **F-A: the work item is a static runner argument.** Advancing from M1 to
  M2 required editing the plist. The runner should discover the active work
  item from the roadmap (the 15:45 session already *updated* the roadmap to
  say "M2: Active — next up"; the runner just can't read it yet). Top
  follow-up.
- **F-B: gate numbering is per-work-item** (`gates/001-…` under each item) —
  fine, but the ntfy ping should carry the work item more prominently now
  that multiple items gate.
- **F-C: discipline held without enforcement.** Both sessions fetched
  orchestra-afk before acting, stayed on the afk branch, and exited with
  clean trees — the served-skill channel (ADR-001's bet, F1's fix)
  carried the entire protocol.

## Where this leaves the loop

Still running. launchd fires every 15 minutes; M2 is mid-pipeline with an
answered gate waiting to be consumed. To stop it:
`launchctl unload ~/Library/LaunchAgents/com.orchestra.afk-runner.plist`.
