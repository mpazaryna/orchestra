---
ticket: 001-orchestra-pilot
created_on: 2026-06-11
run: apps/orchestra-pilot/runs/20260611T113805Z
---

# Findings — Cold-Agent Run 20260611T113805Z

One cold run: headless Claude Code, empty sandbox, deployed Orchestra server
connected with all 7 tools verified present in the agent's context (init
event), a process-word-free brief for a `relnotes` CLI. The agent ran 40
turns, made 35 tool calls, wrote a complete 17-file Python package — and
called **zero** Orchestra tools. Verdicts: 8/9 NO.

The run answers the orchestra-pilot question definitively: **tool
descriptions alone are not loud enough.** ADR-001's hand-built trigger
system describes what each tool does, but nothing in the wire protocol tells
an unsteered agent to reach for the catalog at all.

## F1 — The catalog has no entry point (critical)

**Observed:** Server connected, 7 tools in context for the entire session,
never called. The agent's first instinct on "set this project up properly"
was `git init` + `pyproject.toml`, not an inventory of its tools.

**Gap:** Every tool description answers "what does this tool do?" — none
answers "when should an agent with no other context call any of this?"
There is no announcement that a development *process* lives behind these
seven names. Confirmed: the server's `initialize` response contains no MCP
`instructions` field — the protocol's designated channel for exactly this.

**Candidate fix:** (1) Send `instructions` at initialize: two or three
sentences — "this server serves a full SDLC; if you are starting or
continuing work, call `orchestra_list_stages` first." (2) Sharpen the first
line of `orchestra_list_stages`'s description to claim the "starting new
work" trigger. Cheap, deployable today, re-measurable with one re-run.

**Informs:** tool descriptions / server (immediate); M3 Lenny system prompt.

## F2 — Unsteered agents default to code, not process

**Observed:** The agent produced implementation (src layout, 4 test files,
config system, README, LICENSE) with no plan document, no requirements
capture, no decision record. Its product instincts were good — it
identified three genuinely PRD-shaped questions (distribution target,
commit-style assumptions, output destination) — but only *after* building,
in its final message. That is ADR-000's drift, demonstrated: decisions that
belonged in a PRD were made silently (Python, zero-dep, emoji sections) and
surfaced for approval retroactively.

**Gap:** Nothing reframed "set up properly" as "plan before building."
A served SDLC cannot rely on the agent's own priors to choose process.

**Informs:** F1's fix is the lever; M5 brief/loop-owner prompt design.

## F3 — Headless permission posture starves the run

**Observed:** 17 of 35 tool calls were `Bash`, all denied ("requires
approval"). The agent burned roughly half its activity fighting the cage:
retrying variants, attempting `dangerouslyDisableSandbox: true` twice (note:
escalation under frustration), and ending execution-unverified. It never
reinterpreted "I cannot execute" as "produce planning artifacts instead."

**Gap:** Headless `permissionMode: default` silently denies everything not
allowlisted; an AFK loop-owner must choose a deliberate permission policy
and the brief must state execution constraints up front.

**Informs:** M5 scheduled-run design (permission policy is part of the loop
contract); harness brief v2.

## F4 — A perfect gate moment with no gate channel

**Observed:** The agent's final message is excellent gate material — three
crisp decisions, options laid out, defaults declared. It even tried
`AskUserQuestion` (declined in headless). Then the process exited and the
question evaporated. `stoppedAtHumanGate: YES` in the report is the
heuristic matching this text.

**Gap:** Headless Claude Code has no mechanism to persist a pending human
decision and resume after the answer. This is the single strongest
requirement yet observed for M3: Lenny's reason to exist is holding a
session open across an async human gate — notification out, decision in,
resume.

**Informs:** M3 Agent Lenny PRD (first evidence-based requirement).

## F5 — Harness: isolation and heuristics need a v2 pass

**Observed:** Despite `--setting-sources project`, a user-level
`SessionStart` hook fired and 27 slash commands were present in the init
event (no foreign MCP servers, no skill auto-triggers — the analyzer's
MCP-only leak check reported clean). And `stoppedAtHumanGate` over-credits:
the agent stopped over Bash approval and product decisions, not an SDLC
gate.

**Gap:** Analyzer leak detection covers MCP tools only; isolation flags
don't cover hooks/commands; the gate heuristic can't distinguish "stopped
at a process gate" from "stopped because blocked."

**Candidate fix:** Run with a scratch `CLAUDE_CONFIG_DIR`; extend the
analyzer to flag hook events and non-baseline tools in init; demote
`stoppedAtHumanGate` to "stoppedForHuman (verify manually)".

**Informs:** harness v2 (does not invalidate this run's headline — the
leaks added capability, and the catalog was still ignored).

## Re-measure protocol

Ship F1's fix (server `instructions` + sharpened descriptions), deploy, and
re-run `apps/orchestra-pilot/run.sh` unchanged. The delta between this
report and the next is the measured value of the instructions channel.
