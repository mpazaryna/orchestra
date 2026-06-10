---
id: ADR-001
status: accepted
created_on: 2026-06-10
---

# ADR-001: Skills Are Served Whole Over MCP

## Context

Orchestra skills follow the agent skills spec: a small `SKILL.md` router that is
always loaded, plus support files (`examples/`, templates) loaded on demand. This
progressive disclosure is the point of the pattern — context is spent only on the
layer the agent actually needs. 15 of the 17 skills in `skills/` have support
files beyond `SKILL.md`.

The MCP server (`apps/mcp-sdlc`) is the delivery channel for these skills:
consumer projects connect over Streamable HTTP and are not expected to install
anything locally — no `.claude/skills/` folder. This is the path to AFK
operation: a remote agent runs the full SDLC using only what the server serves.

The gap: `build-skills.mjs` bakes only `SKILL.md` files into
`skills.generated.ts`. A consumer calling `orchestra_get_skill("orchestra-devlog")`
receives a router that says "load `examples/devlog.md`" — a file the server does
not serve and the consumer cannot read. The reference is a dead end. This was
discovered during the live test of the devlog tool rework (devlog
`2026-06-10-tool-design-rule`).

Alternatives considered:

1. **Inline/distill playbooks into `SKILL.md`** — makes each served skill one
   self-contained blob. Rejected: it breaks the skill spec's two-layer pattern,
   destroys progressive disclosure for local use, and forks the content into
   "real skill" vs "flattened MCP copy."
2. **Consumers install skills locally** (server returns skill directories to
   write into `.claude/skills/`) — rejected: defeats the serve-over-the-wire
   goal, and installed copies drift from the deployed source of truth.
3. **Serve support files as MCP resources** — rejected for now: tool calls are
   the channel every MCP client reliably supports; resources add a second
   protocol surface for the same bytes.

## Decision

The MCP server serves skill directories whole. `build-skills.mjs` bakes every
file in each skill directory, and `orchestra_get_skill` gains an optional `file`
argument: called with `name` alone it returns `SKILL.md` plus a manifest of
support files; called with `name` + `file` it returns that support file. Served
skills are never flattened, distilled, or inlined.

The server is a faithful transport — a skill filesystem over the wire. Skills
stay authored exactly to the spec, work unchanged locally, and keep their
context economy remotely: consumers pull the small router for free and pay for
the full playbook only when they need it. The `file` argument is the Read tool,
reimplemented over MCP.

## Consequences

- `build-skills.mjs` walks each skill directory and emits a `path → content`
  map per skill; the codegen chain (`dev`/`test`/`deploy`) keeps it from going
  stale. Bundle size grows by the support files (~tens of KB) — well within
  Worker limits.
- `orchestra_get_skill` responses include a `files` manifest, and the tool
  description teaches the two-step ("SKILL.md may instruct loading support
  files; call this tool again with the `file` argument"). Per the CLAUDE.md
  tool-design rule, the description is the always-in-context channel for this.
- Skill authors may use support files freely — the server will serve them. A
  `SKILL.md` may reference any file inside its own directory by relative path;
  references outside the skill directory are not served and must not be used.
- Flattening a skill "for MCP" is now a process violation, not a judgment call.
  If a served skill reads badly over the wire, fix the skill, not the transport.
- Consumer agents never need a local skills folder; parity between what a local
  agent and a remote agent can see is a property the server must maintain.
