---
ticket: m2-configuration
status: draft
created_on: 2026-06-11
---

# M2 — Configuration & Customization

**Objective:** Let maintainers shape the output without code changes — custom
group titles/order, additional or relaxed noise patterns, which types are
included, and author/PR/issue linking — via an optional `relnotes.toml`.

## Success Criteria

- [ ] An optional `relnotes.toml` (discovered from the repo root) overrides group
      titles, group order, the type→group map, and noise patterns.
- [ ] Flags can include normally-excluded groups (e.g. `--include chore`) and
      exclude included ones.
- [ ] Optional author attribution and PR/issue linking (e.g. `(#123)` → link) when
      a remote URL is known or configured.
- [ ] All M1 behaviour is preserved when no config file is present (defaults).

## Context

Part of the [relnotes Roadmap](../../roadmap.md). Builds on the M1 engine and
rendering contract. The M1 ADR-003 map and noise patterns become the documented
defaults this milestone makes overridable.

## Materials

| Material | Location | Status |
|----------|----------|--------|
| Config loader (`tomllib`) + schema | `src/relnotes/config.py` | Not Started |
| Linking / attribution in renderer | `src/relnotes/render.py` | Not Started |
| Config + linking tests | `tests/` | Not Started |

## Notes

Run `/orchestra-plan m2-configuration` to flesh this out after M1 is approved.
