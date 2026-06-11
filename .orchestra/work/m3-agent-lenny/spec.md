---
ticket: m3-agent-lenny
status: complete
created_on: 2026-06-11
---

# M3: Agent Lenny

> PRD: .orchestra/work/m3-agent-lenny/prd.md

## Objective

Extend the existing `apps/agent-lenny` skeleton (Cloudflare Durable Object via
the Think framework + AI SDK Anthropic provider) into a conductor that
survives human gates: it drives a work item using the deployed Orchestra MCP
server as its SDLC source, pauses when the model raises a gate, notifies a
human over a channel they actually check, accepts the answer asynchronously
over HTTP, and resumes the same session with everything intact — plus a
scheduled heartbeat that keeps unattended work moving.

## Approach

### Step 1: Point Lenny at the deployed SDLC
Replace the three local stage tools in `src/agent.ts` (which import
`@orchestra/core` directly and bypass skills entirely) with proxies for all
7 orchestra tools, calling `tools/call` on
`https://orchestra-mcp-sdlc.mpazbot.workers.dev/mcp` with Bearer
`ORCHESTRA_API_KEY`. Schemas mirror the server's (stable; drift risk
accepted and noted). The server stays the layer that doesn't change.

### Step 2: Durable workspace
Lenny needs somewhere for artifacts to live between sessions: `write_file` /
`read_file` / `list_files` tools backed by Durable Object storage (a
`path → content` table). `GET /workspace` returns the full tree as JSON;
`GET /workspace/:path` returns one file. Git sync is explicitly out of scope
for M3 (recorded in Notes).

### Step 3: The gate tool — F4's fix
A `raise_gate` tool: `{ question, options[], artifact_paths[] }`. Execute:
persist the gate (id, payload, status=pending, raised_at) in DO storage,
fire the notification (Step 4), return "gate raised — end your turn now."
System prompt rewritten around conductor discipline: follow the stages,
raise a gate at every human decision, never proceed past an unanswered gate,
write devlog entries via the devlog tool.

### Step 4: Notification adapter
`notify(gate)` POSTs JSON (question, options, artifact pointers, one-time
answer URL) to `NOTIFY_WEBHOOK_URL`. Webhook-first because it works with
zero infrastructure (ntfy.sh topic → phone push, or any receiver); the
adapter is one function so an email implementation can be added without
touching gate logic. Each gate gets a random one-time token in its answer
URL.

### Step 5: The answer channel
Worker routes (Bearer `LENNY_API_KEY`, except the tokened GET):
- `POST /work` — start a work item: `{ brief }` → creates/wakes the DO, begins the loop
- `GET /status` — current stage, pending gates, workspace summary, last activity
- `GET /gates` — pending + answered gates
- `GET /gates/:id?token=…` — minimal HTML form (the link a human taps from the notification)
- `POST /gates/:id/answer` — `{ answer }` (or form post with token): persist answer, mark answered, schedule resume

### Step 6: Resume — the moment that must not break
Answering a gate appends a user message ("Gate <id> answered: …") to the
session and re-enters the agent loop. Conversation history, workspace, and
gate log all live in DO storage, so resume works after eviction/hibernation
— hours or days later. Acceptance requires demonstrating resume after at
least 10 minutes of idle (past hibernation), not a same-second roundtrip.

### Step 7: Scheduled heartbeat
A recurring scheduled task (every 30 min): if a gate is pending > 24h,
re-notify once; if work is in a gateless stage and the loop is idle (e.g.
killed mid-flight), continue it. This is M5's "checks pipeline state on a
schedule" criterion wearing Lenny's clothes.

### Step 8: Model + loop settings
`claude-opus-4-8` via the AI SDK Anthropic provider with adaptive thinking
(replaces hardcoded `claude-sonnet-4-6`). Loop capped per session-run
(turn limit) so a runaway conductor self-terminates; cap noted in /status.

### Step 9: The gate-survival demo
Replay the run-2 moment end-to-end against deployed Lenny: POST the relnotes
brief → Lenny plans via orchestra tools → raises the stack gate → webhook
notification arrives → wait past hibernation → answer "Python, proceed" →
Lenny resumes and produces implement-stage artifacts in the workspace.
Transcript of the exchange archived as `demo.md` in this work item; devlog
written; this is the milestone's proof.

## Testing Strategy

### Unit Tests
- Files: `apps/agent-lenny/src/gates.test.ts`, `src/notify.test.ts`, `src/mcp-proxy.test.ts`
- Covers: gate lifecycle (raise → pending → answer → consumed; double-answer rejected; bad token rejected), notification payload shape (contains question, options, tokened URL), MCP proxy request/response mapping and error surfacing
- Mocking: `fetch` for proxy/notify; in-memory storage stub for gates
- Run: `pnpm test` in `apps/agent-lenny` (vitest, mirroring mcp-sdlc; add config + devDependency)
- Commit: tests before each module

### Integration Tests
- Files: `apps/agent-lenny/src/integration.test.ts`
- Covers: MCP proxy against the **live deployed server** — tools/call `orchestra_list_stages` returns 6 stages; auth failure surfaces cleanly. Skipped when `ORCHESTRA_API_KEY` is absent (same pattern as mcp-sdlc).
- Mocking: nothing at the boundary under test
- Commit: before the proxy lands in the agent

### E2E Tests
- Files: the Step 9 demo (manual, against deployed Lenny), archived as `.orchestra/work/m3-agent-lenny/demo.md`
- Covers: brief → gate → notification → async answer after hibernation → resume → artifacts
- Mocking: nothing
- Commit: harness/demo notes after the run

## Deliverables

| File | Purpose | Status |
|------|---------|--------|
| (superseded) mcp-proxy.ts | Replaced by native `addMcpServer` mount in agent.ts — zero drift, framework MCP client | Superseded |
| (superseded) workspace.ts | Think's built-in DO workspace + export RPCs in agent.ts | Superseded |
| apps/agent-lenny/src/gates.ts (+ test) | Gate store + lifecycle | Delivered |
| apps/agent-lenny/src/notify.ts (+ test) | Webhook notification adapter | Delivered |
| apps/agent-lenny/src/index.ts | HTTP routes (work/status/gates/answer/workspace/messages) | Delivered |
| apps/agent-lenny/src/agent.ts | Conductor loop, raise_gate, opus-4-8, heartbeat | Delivered |
| apps/agent-lenny/src/prompt.ts | Conductor system prompt | Delivered |
| apps/agent-lenny vitest + tsconfig + integration.test.ts | Test wiring | Delivered |
| .orchestra/work/m3-agent-lenny/demo.md | Gate-survival demo transcript | Delivered |

## Acceptance Criteria

### Functional
- [ ] Gate raised → webhook notification received with question + answer link (PRD #1)
- [ ] Answer posted after ≥10 min idle → session resumes with prior context intact (PRD #2)
- [ ] Scheduled task re-notifies stale gates and continues idle gateless work (PRD #3)
- [ ] Run-2 replay completes end-to-end through implement-stage artifacts (PRD #4)
- [ ] GET /status answers "where is the pipeline?" from stored state (PRD #5)
- [ ] Devlog entries composed via the deployed devlog tool appear in the workspace (PRD #6)

### Unit
- [ ] `pnpm test` green in apps/agent-lenny: gates, notify, proxy

### Integration
- [ ] Live-server proxy test passes (list_stages → 6 stages)

### E2E
- [ ] demo.md archived showing the full gate-survival exchange with timestamps

## Dependencies

- Deployed MCP server with initialize instructions (live, fb499873)
- Secrets: `ANTHROPIC_API_KEY`, `ORCHESTRA_API_KEY`, `LENNY_API_KEY`, `NOTIFY_WEBHOOK_URL`
- A webhook receiver the human checks (ntfy.sh topic suggested for the demo)
- Think framework supports re-entering the loop with appended messages (verify in Step 3; fallback below)

## Risks

| Risk | Mitigation |
|------|-----------|
| Think framework can't pause/resume the loop the way gates need | Fall back to the raw Agents SDK `Agent` class (already a dependency) and own the loop — gate/workspace/notify modules are framework-agnostic by design |
| Tool schema drift between proxy and server | Integration test pins tool count + list_stages shape; later improvement: build proxies from live tools/list |
| DO eviction mid-loop loses an in-flight turn | Heartbeat (Step 7) detects idle non-gated work and continues; history is persisted per turn |
| Runaway loop burns tokens unattended | Per-run turn cap + /status exposes turn count; heartbeat won't restart a capped run without a human poke |
| Webhook receiver unavailable at demo time | notify() failures are stored on the gate and retried by the heartbeat; gate is still answerable via GET /gates |

## Notes

Out of scope for M3, recorded deliberately: git sync of the workspace
(artifacts live in DO storage; export endpoint exists), email adapter
(webhook first), multi-work-item concurrency (one DO instance per work item
name is the routing model; only one exercised in the demo). Anthropic's
Managed Agents was considered as an alternative runtime (server-managed
sessions + hosted workspace would cover Steps 2/6 natively) and set aside to
stay on the repo's Cloudflare stack and keep Lenny a thin consumer of the
deployed MCP server — worth an ADR during implementation.
