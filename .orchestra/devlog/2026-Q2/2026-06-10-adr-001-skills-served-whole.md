---
created_on: 2026-06-10
---

# 2026-06-10: ADR-001 Implemented — Skills Served Whole Over MCP

## Summary

Implemented ADR-001: the MCP server now serves skill directories whole. `build-skills.mjs` bakes
every file in each `skills/*` directory (not just SKILL.md), and `orchestra_get_skill` gained an
optional `file` argument — `name` alone returns the SKILL.md body plus a support-file manifest;
`name` + `file` returns that file. The dead-end found in yesterday's live test is closed: a remote
consumer can now follow "load `examples/devlog.md`" all the way to the 13.5KB playbook.

## Why Not Inline

The first suggestion was to inline the playbook into SKILL.md and redeploy. Rejected (see ADR-001):
the agent skills spec's two-layer pattern — small always-loaded router, support files on demand — is
the point, not an inconvenience. Flattening would have forked skills into "real" and "MCP copies"
and destroyed progressive disclosure for local use. The goal is first-class skills over the wire so
consumer agents need no local `.claude/skills/` install: the server must be a faithful transport, a
skill filesystem over MCP. The `file` argument is the Read tool, reimplemented over the wire.

## Shipped

- ADR-001 accepted and committed (`6f15b63`)
- `d3a2db2` test: manifest, file fetch, unknown-file error, schema two-step (6 new cases, 47 passing)
- `707805d` feat: recursive directory bake in `build-skills.mjs`; `files` manifest + `file` argument
  in `orchestra_get_skill`
- Deployed version `04c7e088`; bundle 124K → 196K (well within Worker limits)
- Verified live: manifest lists 6 support files, `examples/devlog.md` fetches whole, unknown file
  returns an error that lists what exists

## Consequences Now Active

- Skill authors may reference any file inside their skill directory; the server serves it.
- Flattening a skill "for MCP" is a process violation — fix the skill, not the transport.
- Local/remote parity is a server-maintained property.

## Next

The originally planned end-to-end test: a devlog written from orchestra-pilot by an agent that has
never seen this repo, following tool descriptions alone — devlog tool → skill → support file → entry.
