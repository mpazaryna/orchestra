---
created_on: 2026-06-11
---

# 2026-06-11: First Cold-Agent Run — The Catalog Was Connected, and Completely Ignored

## Summary

The orchestra-pilot harness (work item 001, first numbered work item under M5) was planned,
built TDD-first, and executed today — the working example ADR-002's amped goal called for. The
result is the most valuable kind: a clean, decisive negative. A cold agent (headless Claude
Code, empty sandbox, deployed Orchestra server connected, all 7 tools verified in its context,
a brief with zero process words) ran 40 turns, made 35 tool calls, built a complete 17-file
Python package — and never called a single Orchestra tool. Verdicts: 8/9 NO.

ADR-001 traded harness auto-triggering for hand-written tool descriptions. Today we measured
that trade: **tool descriptions alone do not trigger anything.** They answer "what does this
tool do?" — nothing on the wire answers "why would an unsteered agent reach for this catalog
at all?"

## What Shipped

| Artifact | Location |
|----------|----------|
| Pilot harness (brief, preflight, run.sh, analyzer + 7 unit tests) | apps/orchestra-pilot/ |
| First archived run (transcript, workspace, report) | apps/orchestra-pilot/runs/20260611T113805Z/ |
| Five findings | .orchestra/work/001-orchestra-pilot/findings.md |

Built on branch `impl/001-orchestra-pilot` following the implement playbook: tests committed
before implementation, preflight verified against the live server (initialize 200, 7 tools),
every acceptance criterion checked.

## The Findings, Compressed

1. **F1 (critical): the catalog has no entry point.** Confirmed the server sends no MCP
   `instructions` field at initialize — the protocol channel built for exactly this. Cheapest
   fix with the highest expected value: announce the SDLC and the starting tool
   (`orchestra_list_stages`) in `instructions`, sharpen the first line of the entry tool's
   description, deploy, re-run.
2. **F2: unsteered agents default to code, not process.** The agent made PRD-shaped decisions
   silently and surfaced them for approval only after building — ADR-000's drift, observed in
   the wild.
3. **F3: headless permission posture starves the run.** 17 denied Bash calls, ~half its
   activity spent fighting the cage, including two `dangerouslyDisableSandbox` attempts.
   Permission policy is part of the AFK loop contract.
4. **F4: a perfect gate moment with no gate channel.** Its final message was textbook gate
   material — three crisp decisions awaiting a human — and then the process exited and the
   question evaporated. This is the first evidence-based requirement for M3 Agent Lenny:
   hold a session open across an async human gate.
5. **F5: harness v2 items.** A user SessionStart hook and slash commands leaked past
   `--setting-sources project`; the gate heuristic over-credits. Neither invalidates the
   headline — the leaks added capability and the catalog was still ignored.

## The Run Itself, As Anthropology

The cold agent was *good*. Zero-dependency design, conventional-commits parsing with heuristic
fallback, four test files, honest "execution-unverified" disclosure, and genuinely PRD-quality
questions at the end. The failure is not agent quality — it is that nothing told it a process
existed. Orchestra's entire value proposition for AFK rests on closing that one gap.

## Next

1. Ship F1: `instructions` at initialize + entry-point tool description, deploy.
2. Re-run `run.sh` unchanged; diff the verdict tables — that delta is the measured value of
   the instructions channel.
3. Feed F4 into the M3 Lenny PRD as its first real requirement.
