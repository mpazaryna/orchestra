# CLAUDE.md

Orchestra — a software development lifecycle encoded for agents. This monorepo
builds the system; consumer projects connect to the deployed MCP server.

## Layout

- `apps/mcp-sdlc/` — Cloudflare Worker serving the SDLC over MCP (Streamable HTTP,
  Bearer auth). Live at `https://orchestra-mcp-sdlc.mpazbot.workers.dev/mcp`.
- `apps/agent-lenny/` — gate-survival conductor (M3; parked per ADR-003, deployed but paused).
- `apps/afk-runner/` — the repo-centric AFK loop: scheduled headless sessions, gates as
  files, approvals as commits (ADR-003).
- `templates/` — consumer starter (`templates/create.sh <dir> "idea"` stamps a new
  workspace repo; `check.sh` pins the template to the live server).
- `packages/core/` — stages, gates, and stage prompts shared across apps.
- `skills/` — the 18 Orchestra skill playbooks (`*/SKILL.md`). **Source of truth**
  for skill content served by the MCP server.
- `.orchestra/` — this repo's own knowledge base (roadmap, ADRs, work items, devlog).

## MCP tools served (7)

`orchestra_get_prompt`, `orchestra_get_gates`, `orchestra_list_stages`,
`orchestra_devlog_entry`, `orchestra_scaffold`, `orchestra_list_skills`,
`orchestra_get_skill`.

Tools never touch the local filesystem — they return `{path, content}` or a
`files` array, and the calling agent writes the files. Keep that split.

## Dogfooding — this is the SDLC, use it

This repo follows its own process. Read `.orchestra/roadmap.md` and relevant
ADRs before acting on any work item. PRD before spec, spec before
implementation, human approval at each gate. Write devlog entries via the
deployed `orchestra_devlog_entry` tool and commit them.

## Development

```bash
cd apps/mcp-sdlc
pnpm test          # codegen + vitest (unit); integration/e2e are skipped without a live server
pnpm run deploy    # codegen + wrangler deploy — NOT `pnpm deploy` (reserved pnpm command)
pnpm build:skills  # regenerate src/skills.generated.ts from skills/*/SKILL.md
```

- `src/skills.generated.ts` is codegen output (gitignored via `*.generated.ts`).
  Never edit it; edit `skills/*/SKILL.md` and rerun the build. Codegen is chained
  into `dev`/`test`/`deploy` so it can't go stale.
- Editing a skill? The change only reaches consumers after `pnpm run deploy`.
- Adding a tool? Update `TOOL_DEFINITIONS` + `handleTool` in `src/tools.ts`,
  add unit tests, and bump the tool-count assertions in `tools.test.ts` and
  `index.test.ts`.
- Tool design rule: if a tool accepts agent-composed prose (devlog, ADR, ticket),
  take ONE free-form markdown `body` field — never multiple flat strings that
  invite compression. Put the quality bar in the field description, cross-reference
  the relevant skill in the tool description, and let the server contribute only
  path/frontmatter/structure. Schema descriptions are the only guidance always in
  a consumer's context — they are the wire-native channel for quality.
- Auth: `API_KEY` Worker secret (`wrangler secret put API_KEY`); local value in
  `apps/mcp-sdlc/.dev.vars` (gitignored).
- MCP protocol notes: notifications (no `id`) must get a 202, never a JSON-RPC
  error — Claude Code's handshake depends on it.
