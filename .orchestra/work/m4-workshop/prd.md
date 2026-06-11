---
ticket: m4-workshop
status: draft
created_on: 2026-06-09
---

# M4: Workshop

**Objective:** All orchestra-managed projects are visible and navigable in the workshop Astro site, including work items, devlogs, and READMEs.

## Success Criteria

- [ ] orchestra project appears in the workshop project list
- [ ] Work items from `.orchestra/work/` are visible on the project page
- [ ] Devlog entries from `.orchestra/devlog/` are visible on the project page
- [ ] workshop config/projects/orchestra.json exists and is correct

## Context

Part of the [Orchestra Roadmap](.orchestra/roadmap.md).

Workshop (~/workspace/workshop) aggregates all .orchestra/ folders across ~/workspace/*. Once orchestra has a config/projects entry it will show up automatically — no code changes needed.

## Materials

| Material | Location | Status |
|----------|----------|--------|
| orchestra.json project config | workshop/config/projects/ | Not Started |
| Devlog entries | .orchestra/devlog/ | Not Started |

## Notes

To start the planning loop, fetch the `orchestra-plan` skill (locally via
`.claude/skills/`, or remotely via `orchestra_get_skill("orchestra-plan")`) and
follow it for `m4-workshop`.
