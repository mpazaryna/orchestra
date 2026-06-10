---
created_on: 2026-06-10
---

# 2026-06-10: Devlog Tool Rework — Free-Form Body Over Compressed Strings

## Summary

Reworked `orchestra_devlog_entry` after noticing that devlogs written through the MCP tool were
markedly worse than ones agents composed directly. The tool now takes a free-form markdown `body`
instead of `summary`/`details`/`next` strings. This entry is the first one written through the new
contract.

## The Problem

Compare two entries from this week: `2026-06-09-m2-shipped.md` (hand-composed — sections, tables,
decisions with rationale) against `2026-06-10-deployed-skills-wired.md` (tool-composed — ten facts
crammed into one wall-of-text paragraph). Same agents, same project. The difference was the tool's
interface:

- Three flat string fields invited pre-compressed, single-paragraph answers.
- The field descriptions carried no quality bar ("Body content — decisions, findings, context").
- The hardcoded Summary/Details/Next skeleton left nowhere to put richer structure.
- Nothing connected the tool to the `orchestra-devlog` skill served by the same server.

## Key Decision

In the MCP model, tool descriptions and schema field descriptions are the only guidance that is
*always* in a consumer's context — they are the wire-native channel for "here's how to do this
well." So the quality bar moved into the schema:

- `body` (required): full markdown after the H1; the description tells agents to use ## sections,
  tables, code blocks, commit hashes, and multi-paragraph prose.
- Tool description now instructs callers to fetch `orchestra_get_skill("orchestra-devlog")` before
  composing.
- The server still owns path computation (quarter dir), frontmatter, and the H1.
- Legacy `summary`/`details`/`next` callers fall back to the old skeleton rather than erroring.

## Shipped

- `d89396a` test: new body contract (6 devlog test cases, including verbatim-passthrough and
  body-wins-over-legacy)
- `14d430f` feat: schema + `devlogContent` rework in `apps/mcp-sdlc/src/tools.ts`
- Deployed to Cloudflare (version `e133efda`), live schema verified via `tools/list`. 41 unit
  tests passing.

## Next

Watch the next few devlog entries written from consumer projects (orchestra-pilot) to confirm the
schema guidance is enough, or whether the tool should return the playbook inline in its result.
