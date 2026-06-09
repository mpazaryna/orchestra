---
ticket: m2-mcp-sdlc
status: complete
created_on: 2026-06-09
---

# MCP SDLC Server

> PRD: .orchestra/work/m2-mcp-sdlc/prd.md

## Objective
Deploy orchestra-mcp-sdlc as a live, tested Cloudflare Worker so any project can reach 
orchestra's SDLC tools via a single HTTP endpoint.

## Approach

### Step 1: Validate and fix the Worker source
Review `apps/mcp-sdlc/src/index.ts` and `tools.ts`. Confirm:
- JSONRPC 2.0 envelope is correct for MCP streamable HTTP transport
- `id` field is echoed back in responses (required by spec)
- Error responses use the correct JSONRPC error shape
- `service` field in `/health` matches the deployed name (`orchestra-mcp-sdlc`)

### Step 2: Add TypeScript config
Add `tsconfig.json` to `apps/mcp-sdlc/` configured for Cloudflare Workers 
(`"types": ["@cloudflare/workers-types"]`). Ensures wrangler can compile cleanly.

### Step 3: Write unit tests
Test `handleTool()` in isolation — all three tools, valid inputs, and unknown tool error.
Test the fetch handler routing — `/health`, `/mcp POST`, unknown routes.

### Step 4: Write integration tests
Stand up the Worker locally with `wrangler dev` and make real HTTP calls to verify 
`tools/list` and `tools/call` over the wire.

### Step 5: Deploy to Cloudflare
Run `wrangler deploy` from `apps/mcp-sdlc/`. Confirm the live URL responds to `/health` 
and `tools/list`.

### Step 6: Wire one project
Add the live URL to `.mcp.json` in the orchestra repo itself as the first consumer.

## Testing Strategy

### Unit Tests
- Files: `apps/mcp-sdlc/src/tools.test.ts`, `apps/mcp-sdlc/src/index.test.ts`
- Covers: `handleTool()` for all three tools, unknown tool throws, fetch routing
- Mocking: none — pure functions
- Run: `pnpm --filter @orchestra/mcp-sdlc test`
- Commit: test files before any source changes

### Integration Tests
- Files: `apps/mcp-sdlc/src/integration.test.ts`
- Covers: real HTTP to `wrangler dev` — `GET /health`, `POST /mcp tools/list`, `POST /mcp tools/call orchestra_get_prompt`
- Mocking: nothing — hits the real Worker runtime
- Run: `pnpm --filter @orchestra/mcp-sdlc test:integration`
- Commit: test file before Step 5 (deploy)

### E2E Tests
- Files: `apps/mcp-sdlc/src/e2e.test.ts`
- Covers: live deployed URL — health check + one tool call confirms production routing
- Mocking: nothing
- Run: `pnpm --filter @orchestra/mcp-sdlc test:e2e` (requires `ORCHESTRA_MCP_URL` env var)
- Commit: after Step 5, before Step 6

## Deliverables

| File | Purpose | Status |
|------|---------|--------|
| apps/mcp-sdlc/src/index.ts | Worker fetch handler | Done |
| apps/mcp-sdlc/src/tools.ts | Tool definitions + handler | Done |
| apps/mcp-sdlc/src/tools.test.ts | Unit tests | Done |
| apps/mcp-sdlc/src/index.test.ts | Handler routing tests | Done |
| apps/mcp-sdlc/src/integration.test.ts | Integration tests | Done |
| apps/mcp-sdlc/src/e2e.test.ts | E2E against live URL | Done |
| apps/mcp-sdlc/tsconfig.json | TypeScript config | Done |
| .mcp.json | orchestra as first consumer | Done |

## Acceptance Criteria

### Functional
- [ ] Live endpoint responds to `/health` with `{ status: "ok" }`
- [ ] `POST /mcp` with `tools/list` returns all 3 SDLC tools
- [ ] `POST /mcp` with `tools/call orchestra_get_prompt` returns a non-empty prompt string
- [ ] Unknown tool returns JSONRPC error with code -32601
- [ ] `.mcp.json` in orchestra repo points at the live URL

### Unit
- [ ] All `handleTool()` cases pass
- [ ] Unknown tool throws with the right message
- [ ] Fetch handler routes `/health`, `/mcp`, and 404 correctly

### Integration
- [ ] `wrangler dev` serves correct responses to real HTTP calls

### E2E
- [ ] Live URL passes health check and one tool call from outside the monorepo

## Dependencies
- `@orchestra/core` workspace package must resolve correctly in the Worker build
- Cloudflare account ID `01bfa3fc31e4462e21428e9ca7d63e98` must have Workers enabled
- `wrangler` authenticated in the deploy environment

## Risks
| Risk | Mitigation |
|------|-----------|
| `@orchestra/core` workspace import fails in wrangler build | Add `node_modules` resolution to tsconfig; test with `wrangler build` before deploy |
| JSONRPC envelope doesn't match Claude Code's MCP client expectations | Validate against MCP streamable HTTP spec; test with a real Claude Code session |
