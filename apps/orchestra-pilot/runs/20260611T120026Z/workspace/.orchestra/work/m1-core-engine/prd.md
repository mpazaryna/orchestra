---
ticket: m1-core-engine
status: draft
created_on: 2026-06-11
---

# M1 — Core Engine (range → classified → rendered markdown)

## Objective

Ship a working `relnotes <from> <to>` that reads the commit range between two
git refs, classifies each commit, drops noise, highlights breaking changes, and
prints polished markdown release notes to stdout. This is the end-to-end MVP: a
maintainer can produce usable notes for a real release with a single command.

## Success Criteria

- [ ] `relnotes <from> <to>` resolves the commit range and exits non-zero with a
      clear message if either ref is missing or the range is empty.
- [ ] With `<to>` omitted it defaults to `HEAD`; with both omitted it uses the
      latest tag as `<to>` and the previous tag as `<from>`.
- [ ] Commits are grouped under stable section headings (Features, Bug Fixes,
      Performance, Refactoring, Documentation, Other) driven by Conventional
      Commits, with a heuristic fallback for non-CC subjects.
- [ ] Breaking changes (`type!:` or `BREAKING CHANGE:`) appear in a dedicated
      "⚠ Breaking Changes" section at the top of the document.
- [ ] Noise commits (merges, `wip`/`fixup!`/`squash!`, release/version bumps,
      empty subjects) are excluded by default.
- [ ] Output is deterministic: the same commit range always yields byte-identical
      markdown.
- [ ] No real (non-noise) commit is silently dropped — anything unclassified lands
      in "Other".
- [ ] Markdown is valid and renders cleanly on GitHub (verified against a golden
      fixture).

## Context

First milestone of the [relnotes Roadmap](../../roadmap.md). It delivers the core
value proposition; M2 (configuration) and M3 (polish/distribution) build on the
engine and rendering contract established here. The engine is intentionally
self-contained and dependency-free so later milestones add surface area, not
rewrites.

Technical approach follows ADR-001 (Python 3.11+), ADR-002 (git via subprocess),
and ADR-003 (Conventional-Commits-first classification).

## Scope

**In scope (M1):**
- Range/ref resolution including default-tag detection
- `git log` extraction with a record/field-separator pretty-format
- Conventional-Commits parsing + heuristic fallback + breaking-change detection
- Default noise filtering
- Markdown rendering with grouped sections and a breaking-changes block
- CLI: `relnotes [from] [to] [--from REF] [--to REF] [-o FILE] [--version] [--help]`

**Out of scope (deferred):**
- Config file, custom group titles/order, custom ignore patterns → **M2**
- Author/PR/issue linking, GitHub compare links → **M2**
- Non-CC repo heuristic tuning beyond the basic fallback, packaging to PyPI,
  shell completion, rich `--help` examples → **M3**

## Materials

| Deliverable | Location | Status |
|-------------|----------|--------|
| CLI entry point / arg parsing | `src/relnotes/cli.py` | Not Started |
| Git range resolution + log extraction | `src/relnotes/gitlog.py` | Not Started |
| Commit model | `src/relnotes/model.py` | Not Started |
| Classifier (CC parse + fallback + breaking detection) | `src/relnotes/classify.py` | Not Started |
| Noise filter | `src/relnotes/filters.py` | Not Started |
| Markdown renderer | `src/relnotes/render.py` | Not Started |
| Package metadata | `pyproject.toml` | Not Started |
| Unit + integration tests | `tests/` | Not Started |
| Golden-output fixture | `tests/fixtures/` | Not Started |

## References

- Roadmap: [relnotes Roadmap](../../roadmap.md)
- ADR-001: [Implementation stack](../../adr/ADR-001-implementation-stack.md)
- ADR-002: [Git access via subprocess](../../adr/ADR-002-git-access.md)
- ADR-003: [Classification strategy](../../adr/ADR-003-classification-strategy.md)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

## Notes / Open Questions

- **Default section order and titles** are fixed in M1 (configurable in M2). The
  M1 defaults are the rendering contract the golden fixture pins.
- **`build`/`ci`/`chore` are excluded by default** as internal noise. If a user
  wants them, that's M2 config. Flagged as a product decision in the handoff.
- The one decision that gates implementation is ADR-001 (language). PRD, spec,
  and Gherkin are written to survive a language change; only the spec's module
  layout would be rewritten.
