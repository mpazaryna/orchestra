---
created_on: 2026-06-11
---

# 2026-06-11: relnotes: project bootstrap and M1 planning to the implementation gate

## Summary

Took the `relnotes` idea — a CLI that turns the git history between two tags into
polished markdown release notes — from an empty directory to a complete,
reviewable planning package: scaffold, roadmap, three ADRs, three milestone PRDs
(M1 fully fleshed out), an M1 execution spec, and M1 Gherkin scenarios. Stopped at
the implementation gate, where a human decision (the language/stack) is genuinely
required before any code is written.

## What shipped

- `.orchestra/` scaffold + `README.md` (with a filled-in Brief) + `CLAUDE.md`.
- `roadmap.md` — vision, success criteria, and 3 milestones:
  M1 Core Engine, M2 Configuration, M3 Polish & Distribution.
- ADR-001 (Python 3.11+, **proposed**, flagged for sign-off), ADR-002 (git via
  subprocess), ADR-003 (Conventional-Commits-first classification with heuristic
  fallback + "never silently drop a real commit" invariant).
- `work/m1-core-engine/` — full PRD, spec, and `gherkin-spec.md` (11 active
  scenarios + 2 `@wip` deferred to M2). M2/M3 are stub PRDs.

## Key decisions and rationale

- **Pipeline architecture** — `cli → gitlog → classify → filter → render`, each a
  pure function over frozen dataclasses. Chosen so the engine is deterministic and
  unit-testable without git, with real-git tests at the integration/E2E tiers.
- **Control-char separators** (`%x1f`/`%x1e`) in the `git log` pretty-format so
  multi-line commit bodies parse unambiguously.
- **Determinism is a first-class requirement** — golden-file E2E test over a
  fixture repo with pinned author and `GIT_*_DATE`, renderer never emits wall-clock.
- **`build`/`ci`/`chore` excluded by default** as internal noise, kept distinct
  from "noise" so M2 config can re-include them.

## The one open decision (the gate)

ADR-001 is **proposed, not accepted**. Python is the recommended default for
iteration speed and `pipx` distribution; Go is the live alternative if "ships as a
single dependency-free binary" matters more. The PRDs and Gherkin are
language-agnostic by design — only the spec's Approach/Deliverables/Testing
sections depend on this choice, so overturning it is cheap (no code yet).

## What comes next

Human reviews the roadmap + M1 PRD/spec at the gate and confirms (a) the stack,
(b) that `chore`/`ci`/`build` excluded-by-default is acceptable, and (c) the
default section set/order. On approval, run `/orchestra-implement m1-core-engine`
against the spec — Step 1 (skeleton) through Step 7 (golden fixture + docs).
