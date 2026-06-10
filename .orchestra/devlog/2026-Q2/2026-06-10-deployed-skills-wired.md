---
created_on: 2026-06-10
---

# 2026-06-10: Production Deploy + All 17 Skills Wired Into MCP

## Summary

Deployed orchestra-mcp-sdlc to Cloudflare Workers and proved the full loop on a fresh project: registered the server with Claude Code in orchestra-pilot and initialized it via orchestra_scaffold over the wire. Then wired all 17 skills/*/SKILL.md playbooks into the server as two new tools — orchestra_list_skills and orchestra_get_skill — bringing the tool count to 7.

## Details

Two fixes/decisions worth remembering. First: Claude Code sends notifications/initialized after the initialize handshake, and the server was returning 400 Method-not-found, which would have broken every client connection — notifications (no id) now get 202 per the Streamable HTTP spec. Second: Workers have no runtime filesystem, so skills are baked in at build time by scripts/build-skills.mjs, which parses each SKILL.md frontmatter (validating name matches its directory) and emits src/skills.generated.ts (~92KB). The codegen is chained into dev/test/deploy scripts so the module cannot go stale, and the output is gitignored via *.generated.ts. Gotcha: pnpm deploy is a reserved pnpm command — use pnpm run deploy. Verified live: list_skills returns 17, get_skill serves full playbooks, orchestra-pilot shows Connected. Tests: 36 passing. Commits: 2e87418 (fix), c24c2c4 (feat).

## Next

Open a Claude Code session in orchestra-pilot and run the roadmap stage against the served skills — first real consumer of the full catalog. Then M3: Agent Lenny, Durable Object for stateful multi-turn SDLC sessions.