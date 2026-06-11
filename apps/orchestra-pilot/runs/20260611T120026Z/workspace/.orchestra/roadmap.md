# relnotes Roadmap

**Objective:** A maintainer runs `relnotes <from-tag> <to-tag>` and gets
polished, human-readable release notes in markdown — changes grouped by type,
noise commits dropped, and breaking changes called out — ready to paste into a
GitHub release or CHANGELOG.

## Success Criteria

- [ ] `relnotes v1.0.0 v1.1.0` on a real repo emits valid, well-structured
      markdown grouping commits into sections (Features, Fixes, etc.)
- [ ] Noise commits (merges, version bumps, `wip`/`fixup!`) are excluded by default
- [ ] Breaking changes are detected and surfaced in a dedicated, prominent section
- [ ] Output is deterministic for a given commit range (same input → same notes)
- [ ] Behaviour is configurable without code changes (ignore patterns, group titles)
- [ ] Installable as a single command via a standard package manager

## Context

Maintainers tag releases in git but hand-curating changelog-quality notes from
raw commit logs is tedious and inconsistent. `relnotes` automates the 80% case:
it reads the commit range between two tags, classifies each commit, filters
noise, highlights breaking changes, and renders clean markdown. It leans on the
[Conventional Commits](https://www.conventionalcommits.org) convention where
present and degrades gracefully to heuristics where it isn't.

This roadmap assumes the technical defaults recorded in the ADRs below
(Python + shelling out to `git` + Conventional-Commits-first classification).
Those are the primary items awaiting human confirmation at the first gate.

## Milestones

| Milestone | Location | Status |
|-----------|----------|--------|
| M1 — Core engine (MVP: range → classified → rendered markdown) | .orchestra/work/m1-core-engine/prd.md | Not Started |
| M2 — Configuration & customization | .orchestra/work/m2-configuration/prd.md | Not Started |
| M3 — Polish & distribution | .orchestra/work/m3-polish-distribution/prd.md | Not Started |

## References

- ADR-000: [The Score](.orchestra/adr/ADR-000-the-score.md)
- ADR-001: [Implementation stack](.orchestra/adr/ADR-001-implementation-stack.md)
- ADR-002: [Git access via subprocess](.orchestra/adr/ADR-002-git-access.md)
- ADR-003: [Commit classification strategy](.orchestra/adr/ADR-003-classification-strategy.md)
