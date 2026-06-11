---
id: ADR-003
status: accepted
created_on: 2026-06-11
---

# ADR-003: The Repo Is the Workspace

## Context

M3 built Agent Lenny — a Durable Object conductor that survived human gates
(raise → notify → async answer → resume; see m3 demo.md). The demo succeeded
and simultaneously exposed an architectural wrong turn: in building the gate
machinery, *execution* migrated into the DO. Lenny ran his own model loop on
a raw API key and wrote artifacts (including source code) into DO-local
SQLite — a workspace with no git, no test runner, no connection to any
repository, and a second billing path beside the Claude subscription.

Meanwhile the cold pilot's run 2 had already proven the simpler thing: a
headless Claude Code session in a real checkout, with only `.mcp.json`
pointed at the deployed server, runs the full Orchestra process on a real
filesystem where git and tests exist. What that run lacked was only loop
ownership (a schedule) and a gate channel (F4) — neither of which requires
moving execution to the cloud.

The human's framing, which this ADR adopts: the target is *a repository
that runs a work item using Orchestra, with skills served over MCP*.

## Decision

The repository is the workspace, the state store, and the gate surface.

- **Executor:** headless Claude Code on a checkout (developer box or
  runner), with the deployed MCP server as the SDLC source. No model loop
  in the cloud; no raw API key in the path — the subscription harness does
  the work.
- **Pipeline state:** `.orchestra/` frontmatter statuses in the repo —
  already the convention this repo runs on.
- **Gates:** expressed in the repo's own review surface (a branch/PR, or a
  `status:` edit), announced by a notification ping. Approval is a commit;
  the next run reads it and resumes.
- **Loop ownership:** a scheduler that starts headless runs — cron/launchd
  or CI to begin with. A cloud component may later hold *only* schedule +
  gate-notify + trigger duties; it must never call the model or store
  artifacts.

**Lenny is parked.** The M3 code merges as historical record and stays
deployed but paused; its conductor loop is retired from the roadmap. What
M3 contributes forward: the proven gate lifecycle (raise → notify → answer
→ resume), the notification adapter, and the demo evidence that async gates
work. What it taught by failing: artifacts must live where they can be
reviewed, diffed, and executed.

## Consequences

- Work item 002 is re-scoped from "repo bridge" (bringing repos to Lenny)
  to "AFK runner" (bringing the loop to the repo).
- The roadmap's loop-owner criterion changes from "Lenny replaces headless
  Claude Code" to "a scheduled repo-centric runner survives human gates."
  M3's milestone row closes as parked-with-findings.
- The relnotes artifacts in Lenny's DO workspace are exported and seeded
  into a real repository as the runner's first work item — continuity of
  evidence across the pivot.
- Any future cloud conductor proposal must clear this bar: it may hold
  state about the pipeline, never the pipeline's artifacts, and never its
  own model loop.

## Addendum — full teardown (2026-06-11, same day)

"Parked" lasted one afternoon. Once 002 (AFK runner) and 003 (starter)
shipped, nothing referenced the deployment or the code, and what remained
was pure liability: a live endpoint holding a raw `ANTHROPIC_API_KEY` in
Worker secrets, plus a heartbeat cron waking the DO every 30 minutes
forever. Decision, by the human:

- **Deployment deleted** (`wrangler delete orchestra-agent-lenny`) — the
  endpoint, secrets, Durable Object storage, and schedule are gone. The
  DO's final state was archived first:
  `.orchestra/work/m3-agent-lenny/archive/` (6 messages, 36 workspace
  files, 2 gates).
- **Code deleted from the tree** (`apps/agent-lenny/`). Git history is the
  record — the code as built and demoed lives at merge commit `92b1281`
  ("gate-survival conductor — built, demoed, parked"). The demo evidence
  (demo.md), the findings, and this ADR remain in place.
- `apps/afk-runner/seed.sh` is now historical (its source endpoint no
  longer exists); it already served its one purpose — seeding
  `~/workspace/relnotes`.

What M3 permanently contributed is unchanged: the proven gate lifecycle
(raise → notify → async answer → resume), now living on as files and
commits in the AFK runner, and the demo that forced this ADR.
