---
id: ADR-002
status: accepted
created_on: 2026-06-11
---

# ADR-002: AFK First — Prove the Loop Before Building the Conductor

## Context

The original roadmap sequenced the remaining milestones conservatively: M3
(Agent Lenny) before M4 (Workshop) before M5 (AFK), with M5's PRD declaring a
hard dependency on M3. AFK — the system advancing pipeline stages without a
human at the keyboard — was positioned as the final payoff, gated behind
building a Durable Object agent first.

Two findings from the M2 cycle undermine that ordering (devlog
`2026-06-10-skills-as-a-service`):

1. The MCP layer is harness-agnostic. Any loop-owner that can call tools gets
   the identical SDLC — the server does not care whether the caller is Lenny,
   headless Claude Code, or an Agent SDK harness. The layer that doesn't change
   is already deployed.
2. Headless Claude Code exists today, already speaks MCP, and can run on a
   schedule. It is the cheapest possible first AFK loop-owner. Building Lenny
   first means designing a conductor from speculation instead of from observed
   failures of a real AFK run.

The roadmap's headline ambition is also being raised: not "routine stages
advance automatically," but a full work item going from intake to shipped code
away from keyboard, with humans only at the gates.

Alternatives considered:

1. **Keep the original ordering (M3 → M4 → M5)** — rejected: it spends the
   largest build (a stateful DO agent) before any evidence about what an AFK
   loop-owner actually needs. Lenny's PRD would be fiction.
2. **Lenny maximal — merge M3 and M5** — build Lenny from day one as the
   autonomous conductor with scheduling and async gates. Rejected: same
   speculation problem, bigger blast radius, and no intermediate proof point.
3. **Self-hosting first — the AFK pipeline builds M4** — rejected as the
   *starting* point: debugging the loop and delivering real scope
   simultaneously couples two failure domains. It is the right *finish line*
   (see Consequences).

## Decision

The roadmap objective becomes: **one Orchestra-managed work item goes from
intake to shipped, AFK, with humans only at the PRD and spec gates.**

The sequence inverts — prove the loop with the cheapest loop-owner, then let
evidence design the conductor:

1. **orchestra-pilot cold-agent test** — a fresh agent with only the deployed
   tool catalog in context. Measures whether tool descriptions alone trigger
   the skills (the hand-built trigger system ADR-001 left us with).
2. **Headless Claude Code on a schedule** becomes the first AFK loop-owner,
   driving a real work item through the pipeline.
3. **What breaks in those runs writes the M3 Lenny PRD.** Lenny is built to
   fix observed failures — long-lived sessions, async human gates, state the
   headless harness can't hold — not imagined ones.
4. **Lenny replaces headless Claude Code** as the loop-owner once its PRD is
   earned.
5. **M4 Workshop moves last** and renders what the pipeline produced — ideally
   delivered *by* the pipeline as its self-hosting proof.

## Consequences

- `roadmap.md` is rewritten: new objective, new success criteria, milestone
  order M5 → M3 → M4. M5 no longer depends on M3; the dependency points the
  other way (M3's PRD is an *output* of M5's first runs).
- M5's scope is amped from "intake to plan" to "intake to shipped," staged:
  first AFK run reaches plan, the milestone closes when a run ships.
- M3's success criteria as currently drafted (generic agent responding to
  prompts) are provisional; the real criteria arrive as findings from M5 runs.
  No Lenny implementation starts before at least one scheduled headless run
  has produced a failure list.
- Human gates remain non-negotiable. AFK means away from keyboard, not
  human-free — gate notifications must reach a human and block until answered.
- Risk accepted: headless Claude Code may hit walls (session lifetime, no
  async gate mechanism) that stall the first runs. That is the point — those
  walls are M3's requirements document.
