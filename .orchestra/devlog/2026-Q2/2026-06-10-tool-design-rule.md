---
created_on: 2026-06-10
---

# 2026-06-10: Decision — One Tool Needed Fixing, A Rule So Future Tools Don't

## Summary

Decision point following the devlog tool rework: do the other six tools need the same free-form-body
treatment? Audited all seven and the answer is no — but the audit produced a taxonomy, a written
design rule, and one discovery-polish change. This entry was composed by walking the full consumer
flow against the live server: `tools/list` → follow the description to `orchestra_get_skill` →
compose → `orchestra_devlog_entry`.

## The Taxonomy

The devlog failure mode was specific: *caller-composed prose squeezed through flat schema fields*.
Classifying all seven tools by content direction shows it was the only instance:

| Contract | Tools | Risk |
|---|---|---|
| Pure retriever (id in, content out) | get_prompt, get_gates, list_stages, list_skills, get_skill | none |
| Server-side generator | scaffold | none |
| Caller-composed prose | devlog_entry | fixed in `14d430f` |

## The Understanding

The durable insight is about the MCP model itself: **schema and tool descriptions are the only
guidance that is always in a consumer's context** — everything else (skills, prompts) must be
actively fetched, and an agent won't fetch what it doesn't know exists. So quality guidance belongs
in the schema, and discovery guidance belongs in tool descriptions that cross-reference each other.
The server's seven tools should behave like a connected catalog, not seven isolated endpoints.

## Shipped

- CLAUDE.md tool-design rule: prose-accepting tools take ONE free-form markdown `body`, quality bar
  in the field description, skill cross-reference in the tool description, server contributes only
  path/frontmatter/structure (`1b2a11a`)
- `orchestra_get_prompt` description now points consumers at the richer skill playbooks via
  list_skills/get_skill (`97dc497` test, `1b2a11a` source)
- Deployed version `8a964e65`; 42 unit tests passing

## Gap Found During Testing

The served `orchestra-devlog` skill is only the SKILL.md body (~1.3KB) — a router that tells the
reader to load `examples/devlog.md`. But `build-skills.mjs` bakes only SKILL.md files, so MCP
consumers following the new cross-reference reach a template they can't fetch. Options: inline the
playbook into SKILL.md, bake `examples/` into the codegen, or serve skill support files via a new
tool argument. Needs a decision before the cross-reference is fully honest.

## Next

Decide how to serve skill example/template files over MCP, then run the originally planned test:
a devlog written from orchestra-pilot by an agent that has never seen this repo.
