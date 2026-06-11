---
id: ADR-003
status: proposed
created_on: 2026-06-11
---

# ADR-003: Conventional-Commits-first classification with heuristic fallback

## Decision

Classify each commit by parsing the subject as a
[Conventional Commits](https://www.conventionalcommits.org) header
(`type(scope)!: description`). Map types to display groups. When a commit's
subject is not Conventional-Commits-shaped, fall back to keyword heuristics on the
subject to pick a group, defaulting to an "Other" group rather than dropping it.

## Decision detail

- **Type → group map (defaults):** `feat`→Features, `fix`→Bug Fixes,
  `perf`→Performance, `refactor`→Refactoring, `docs`→Documentation,
  `test`→Tests, `build`/`ci`/`chore`→Internal (excluded by default; see below).
- **Breaking changes:** a `!` before the colon (`feat!:`, `feat(api)!:`) **or** a
  `BREAKING CHANGE:` / `BREAKING-CHANGE:` token in the body/footer promotes the
  commit into a dedicated, top-of-document "⚠ Breaking Changes" section (it still
  also appears under its normal group).
- **Noise (dropped by default):** merge commits, empty subjects, and subjects
  matching noise patterns (`^wip\b`, `^fixup!`, `^squash!`, release/version-bump
  chores like `chore(release):`). Configurable in M2.
- **Fallback heuristics:** subjects containing `fix`/`bug` → Bug Fixes,
  `add`/`introduce` → Features, etc.; otherwise → Other.

## Rationale

Conventional Commits is the dominant machine-readable convention and gives clean
grouping and breaking-change detection with no guessing. But many repos don't use
it, so the tool must still produce *something* useful — hence the heuristic
fallback and an "Other" catch-all so no real change silently disappears.

## Consequences

- Output quality scales with how disciplined the repo's commit messages are; this
  is expected and documented for users.
- The type→group map, noise patterns, and which groups are excluded by default are
  all configuration surface delivered in M2.
- The "never silently drop a real commit" rule (everything unmatched lands in
  Other) is a testable invariant.
