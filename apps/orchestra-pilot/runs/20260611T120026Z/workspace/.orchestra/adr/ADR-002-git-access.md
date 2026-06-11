---
id: ADR-002
status: proposed
created_on: 2026-06-11
---

# ADR-002: Git access via subprocess, not a library

## Decision

Read repository history by shelling out to the system `git` binary via
`subprocess`, using a machine-parseable `git log` pretty-format with an
unambiguous record/field separator. Do **not** depend on GitPython, pygit2, or
libgit2 bindings.

## Rationale

- **No native build chain** — pygit2/libgit2 introduce wheels and version-matching
  pain; GitPython is pure-Python but adds a dependency and its own quirks.
- **`git` is already a hard requirement** — the tool operates on a git repo, so
  the binary is present by definition.
- **Robust, stable interface** — a pinned `--pretty=format:` with `%x1f` (unit
  separator) between fields and `%x1e` (record separator) between commits parses
  deterministically and survives multi-line bodies.
- **Range/tag resolution for free** — `git log <from>..<to>`,
  `git describe --tags --abbrev=0`, and `git rev-parse` already do the hard work.

## Consequences

- The tool requires `git` on `PATH`; absence is a clear, handled error.
- Parsing is our responsibility — covered by the record/field-separator format and
  unit tests over fixture repos.
- Porting to another language keeps the same git command surface.
