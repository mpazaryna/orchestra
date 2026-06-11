---
id: ADR-001
status: proposed
created_on: 2026-06-11
---

# ADR-001: Implementation stack — Python 3.11+

## Status

**Proposed — awaiting human confirmation at the first planning gate.** This is
the single most consequential decision and is flagged for human sign-off.

## Decision

Implement `relnotes` in **Python 3.11+**, distributed as a console-script entry
point installable with `pipx install relnotes` (PyPI). Standard library only for
the core engine; `tomllib` (stdlib in 3.11) for config. No runtime dependency on
a git library.

## Rationale

- **Speed of iteration** — the core work is text munging (parsing `git log`,
  classifying subjects, rendering markdown). Python is the shortest path to a
  correct, readable implementation.
- **Zero-friction parsing** — `re`, `dataclasses`, `tomllib`, and f-strings
  cover the whole engine without third-party packages.
- **Accessible contribution** — the target audience (maintainers) overwhelmingly
  have Python available; `pipx` gives clean isolated installs.
- **Testability** — `pytest` plus temporary git repos make the behaviour easy to
  pin down with fast, hermetic tests.

## Alternatives considered

- **Go** — single static binary is the best distribution story and many modern
  dev CLIs choose it. Rejected for v1 only because it slows iteration on the
  text-heavy logic. *This is the most likely reason to overturn this ADR:* if
  "ships as one dependency-free binary" outranks iteration speed, choose Go.
- **Rust** — best binary + performance, steepest build cost. Overkill for an
  I/O-and-string tool at this scale.
- **Node/TypeScript** — fine fit, but `npx` distribution and the dependency tree
  are heavier than `pipx` for a tool this small.

## Consequences

- Distribution is `pipx`/PyPI, not a single binary. Users need a Python runtime.
- If this is overturned in favour of Go/Rust, the M1 spec's module layout and
  testing sections are rewritten, but the PRDs and Gherkin scenarios (which are
  language-agnostic) remain valid.
