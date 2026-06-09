---
ticket: m2-mcp-sdlc
status: draft
created_on: 2026-06-09
---

# M2: MCP SDLC

**Objective:** Deploy orchestra-mcp-sdlc as a live Cloudflare Worker so any project can add it to `.mcp.json` and get SDLC tools immediately.

## Success Criteria

- [ ] `wrangler deploy` succeeds from `apps/mcp-sdlc/`
- [ ] `/health` returns `{ status: ok }` at the live URL
- [ ] `tools/list` returns all SDLC tools over MCP HTTP
- [ ] At least one project has the live URL in its `.mcp.json`

## Context

Part of the [Orchestra Roadmap](.orchestra/roadmap.md).

The MCP server is stateless — it serves stage prompts and gate definitions. No storage needed. This is the entry point for any project adopting orchestra.

## Materials

| Material | Location | Status |
|----------|----------|--------|
| MCP Worker | apps/mcp-sdlc/ | Not Started |
| Cloudflare deployment | wrangler deploy | Not Started |
| .mcp.json integration | target project | Not Started |

## Notes

Run `/orchestra-plan m2-mcp-sdlc` to start the planning loop.
