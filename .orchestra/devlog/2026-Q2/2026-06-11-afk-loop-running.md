---
created_on: 2026-06-11
---

# 2026-06-11: The Loop Is Running — launchd Merged a Milestone While Nobody Watched

## Summary

002-afk-runner shipped and the demo exceeded its spec: a launchd timer fired a headless
Claude Code session that read a human's approval from a git commit, consumed the gate, merged
the M1 walking skeleton to main with 33/33 real pytest passes, updated the roadmap, wrote its
own devlog — and the next tick correctly did nothing because the work was done. A later tick
opened M2, drafted its PRD, and raised the next gate unprompted. The relnotes work item that
existed only as database rows in a parked Durable Object this morning is now a real repository
with a merged milestone, conducted entirely by schedule, gates, and commits. ADR-003, observed
running.

## What Shipped (branch impl/002-afk-runner)

- **orchestra-afk** — the 18th served skill: orient from repo state, pause by committing a
  `gates/NNN-*.md` file with `status: pending`, resume from `status: answered`, mark
  `consumed: true`, exit clean. Initialize instructions route unattended consumers to it.
- **apps/afk-runner/** — `check-state.mjs` (blocked/resume/continue/done verdicts; 7 unit
  tests), `run.sh` (lockfile, cheap blocked ticks, ntfy ping on new gates), `preflight.sh`
  (green), launchd template, `seed.sh` (36 files out of parked Lenny into a real git repo,
  dates normalized).
- **The demo** (demo.md): two gate pauses, two human approvals as commits, two launchd-fired
  sessions doing real work, one cheap no-op tick, 33/33 tests green on the checkout,
  subscription-only — no API key in the loop.

## The Day's Full Arc

Goal amped (ADR-002) → cold pilot built; catalog ignored (8/9 NO) → initialize instructions
shipped; verdicts flipped (8/9 YES) → Lenny built; first async gate survived (35 min, DO
eviction) → human asked the right question ("why is code in a database?") → ADR-003: the repo
is the workspace; Lenny parked → AFK runner: the same gates, now as files; the same resume,
now as commits; the same executor that won the morning's pilot. Every component that survived
the day earned its place by evidence; both that didn't (hand-written tool proxies, the
conductor-in-DO) died to a measurement.

## Findings → Next

- **F-A (top):** the runner takes the work item as a static argument; advancing M1→M2 meant
  editing the plist. The sessions already maintain "Active" in the roadmap — teach
  check-state to read it.
- **F-B:** ntfy pings should lead with the work item now that multiple items gate.
- **F-C (the good one):** discipline held with zero enforcement — both sessions fetched
  orchestra-afk before acting, stayed on afk/ branches, exited with clean trees. The served
  channel carries the whole protocol.

M5 scoreboard: discovery ✓, scheduled advancement ✓, gates notify-and-block ✓, intake→plan ✓.
Remaining for intake→shipped: nothing structural — M2 is mid-pipeline in the loop right now.
The loop is live: launchctl unload to stop it.
