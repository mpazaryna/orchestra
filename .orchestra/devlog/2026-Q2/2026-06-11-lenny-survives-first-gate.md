---
created_on: 2026-06-11
---

# 2026-06-11: Lenny Survives His First Gate — F4 Closed, the Question Got Answered

## Summary

M3 Agent Lenny went from approved plan to deployed, demoed conductor in one session — and the
demo closed F4, the finding both pilot runs ended on. The run-2 moment (an agent reaching a
perfect human decision and the question evaporating) was replayed through deployed Lenny:
gate raised at 13:10:01Z, answered at 13:44:59Z through the async HTTP channel — 35 minutes,
three Worker redeploys, and a Durable Object eviction later — and the session resumed with
every artifact intact, recorded the human's decision as an ADR, and moved into the spec stage.
The pipeline survived its first human gate. It then raised a second gate at the correct next
decision point, proving the loop cyclical: gate → answer → work → next gate.

## What Shipped (branch impl/m3-agent-lenny)

- `apps/agent-lenny` rebuilt as the conductor: Think-based Durable Object, `claude-opus-4-8`
  with adaptive thinking, the deployed MCP server mounted natively via `addMcpServer` with
  Bearer auth (replacing the spec's hand-written proxies — a deviation, strictly better:
  zero schema drift, the server's real tool descriptions).
- The F4 machinery: `raise_gate` tool → persisted gate with one-time token → webhook/ntfy
  push with tap-to-answer link → mobile HTML form or authed JSON API → `submitMessages`
  resume. Heartbeat cron re-notifies stale gates once and continues idle work under a
  25-run cap.
- 16 tests green (13 unit: gate lifecycle, notification adapter; 3 integration against the
  live MCP server) plus tsconfig and typecheck.
- Deployed at orchestra-agent-lenny.mpazbot.workers.dev with 4 secrets.

## The Demo (demo.md has the full timeline)

Turn 1 was the pilot's run-2 behavior reproduced on a Durable Object: orient via
`orchestra_list_stages` (the ADR-002/F1 instructions doing their job through the MCP mount),
scaffold, roadmap, 4 PRDs, devlog via the deployed tool — 14 files in the DO workspace —
then a textbook gate: plan approval + stack + git access + range syntax, Go recommended,
artifacts attached. After the 35-minute pause the human overrode to Python; Lenny wrote
ADR-001 recording the decision and derived m1-skeleton/spec.md from it. Conversation count:
3 messages — brief, turn, answer. Nothing re-explained.

## Found Along the Way

- **ntfy 429 on first push** — the notification adapter's failure path earned its keep on
  day one: the error was recorded on the gate, the gate stayed answerable, a manual retry
  delivered. Re-notify-on-429 (not just at 24h staleness) is a cheap hardening item.
- **Workspace export bugs** — `glob()` returns FileInfo objects and dot-directories need a
  readDir walk; fixed live mid-demo across two redeploys, which accidentally strengthened
  the resume evidence (the DO state survived every deploy).
- **Lenny disagreed with the cold pilot** — run 2 recommended Python; Lenny recommended Go.
  The gate channel is exactly where that disagreement belongs: the human decided.
- **Lenny has no clock** — artifacts dated 2025-06-13 (a guess). Inject the current date
  into the system prompt; follow-up item.

## Milestone Math

M5's "human gates produce a notification and block until answered" criterion is now
demonstrated. With the pilot's intake→plan proof, what remains for the amped goal
(intake→shipped AFK) is the execute stage under Lenny plus the workspace→git path —
the deliberate M3 scope cut (artifacts live in DO storage; export endpoints exist).

## Next

orchestra-review on impl/m3-agent-lenny, then merge. Candidate follow-ups, evidence-backed:
notification retry hardening, workspace→git sync (the missing leg of intake→shipped),
date injection into the conductor prompt, and a configurable re-notify window.
