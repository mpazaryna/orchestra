---
ticket: m2-mcp-sdlc
status: approved
created_on: 2026-06-09
---

# MCP SDLC Server

## Problem
Engineers working across multiple projects have no shared SDLC infrastructure. Each project 
either reinvents its own planning conventions or relies on skills loaded from a local path — 
fragile, inconsistent, and not portable to remote or collaborative contexts. There is no 
single place to point a project at and get consistent SDLC tooling.

## Objective
Make orchestra's SDLC tools available to any project via a single deployed endpoint, so any 
engineer can adopt the full pipeline by adding one entry to their project config.

## Success Criteria
- [ ] A live HTTP endpoint accepts MCP tool calls and returns stage prompts and gate definitions
- [ ] The endpoint is reachable from any Claude Code session without local setup
- [ ] At least one project outside orchestra uses the endpoint in its active workflow
- [ ] The deployment is repeatable — a single command redeploys from source

## Context
This is M2 in the Orchestra roadmap and the foundational unlock for everything that follows. 
M3 (Agent Lenny), M4 (Workshop visibility), and M5 (AFK pipeline) all depend on a stable, 
deployed MCP surface. Without it, orchestra is only usable by engineers who have cloned the 
repo and configured local paths.

## Materials

| Deliverable | Location | Status |
|-------------|----------|--------|
| MCP Worker source | apps/mcp-sdlc/ | Not Started |
| Cloudflare deployment | wrangler deploy | Not Started |
| Health check | /health endpoint | Not Started |
| MCP tool surface | /mcp endpoint | Not Started |
| Integration example | .mcp.json in a target project | Not Started |

## References
- Roadmap: .orchestra/roadmap.md
- ADR-000: .orchestra/adr/ADR-000-the-score.md
- Worker source: apps/mcp-sdlc/src/

## Notes
The server is intentionally stateless — no KV, no Durable Objects. State lives in local 
`.orchestra/` files; the server only serves prompts and logic.
