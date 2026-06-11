---
ticket: m1-core-engine
status: draft
created_on: 2026-06-11
---

# M1 — Core Engine (range → classified → rendered markdown)

> PRD: [prd.md](./prd.md)

## Status

Draft — awaiting approval. Assumes ADR-001 (Python 3.11+) is confirmed. If the
stack changes, the Approach/Deliverables/Testing sections are rewritten; the
Objective and Acceptance Criteria (behavioural) stand.

## Objective

Deliver a working `relnotes <from> <to>` that resolves a git ref range, extracts
its commits, classifies and filters them, and renders deterministic, polished
markdown release notes to stdout (or a file), with breaking changes surfaced in a
dedicated section.

## Architecture

A one-way pipeline; each stage is a pure function over plain data, which keeps the
engine deterministic and trivially unit-testable:

```
cli → gitlog.resolve_range ─▶ gitlog.read_commits ─▶ classify ─▶ filter ─▶ render ─▶ stdout/-o
        (refs → SHA range)      (RawCommit[])         (Commit[])  (drop noise) (markdown)
```

Module layout (`src/relnotes/`, src-layout package):

| Module | Responsibility | Key functions (signatures are the contract) |
|--------|----------------|---------------------------------------------|
| `cli.py` | Argparse, orchestration, exit codes, `-o`/stdout | `main(argv: list[str]) -> int` |
| `gitlog.py` | All `git` subprocess calls + parsing | `resolve_range(from_ref, to_ref) -> tuple[str,str]`; `read_commits(rev_range) -> list[RawCommit]` |
| `model.py` | Immutable data types | `RawCommit`, `Commit`, `Group`, `Notes` (frozen dataclasses); `Category` enum |
| `classify.py` | CC parse, fallback, breaking detection | `classify(raw: RawCommit) -> Commit` |
| `filters.py` | Default noise rules | `is_noise(raw: RawCommit) -> bool`; `NOISE_PATTERNS` |
| `render.py` | Commit[] → markdown string | `render(notes: Notes) -> str` |
| `errors.py` | Typed errors → exit codes | `RelnotesError(message, exit_code)` subclasses |

### Data flow contracts

- **`RawCommit`**: `sha`, `short_sha`, `subject`, `body`, `parents: list[str]`,
  `author`, `date` (ISO). `is_merge` ⇔ `len(parents) > 1`.
- **`Commit`**: `RawCommit` + `category: Category`, `scope: str|None`,
  `description: str` (CC description or cleaned subject), `breaking: bool`,
  `breaking_note: str|None`.
- **`Notes`**: ordered `list[Group]` + `breaking: list[Commit]` + range metadata
  (`from_ref`, `to_ref`). Rendering reads only `Notes` — no git access.

### `git log` extraction format (ADR-002)

```
git log <from>..<to> --no-merges? --pretty=format:%H%x1f%h%x1f%P%x1f%an%x1f%aI%x1f%s%x1f%b%x1e
```

`%x1f` (unit sep) delimits fields, `%x1e` (record sep) delimits commits — both are
control chars that cannot appear in commit text, so multi-line bodies parse
unambiguously. Merges are read in (not `--no-merges`) so the filter, not git,
owns the noise policy and the rule stays testable in one place.

## Approach

TDD throughout: the test file for a module is committed before the module. Each
step ends with the default suite green.

### Step 1 — Project skeleton
`pyproject.toml` (build-system, `project.scripts` → `relnotes = "relnotes.cli:main"`,
`requires-python = ">=3.11"`, pytest config with `integration`/`e2e` markers),
src-layout package, `tests/`. No logic yet. Verifies `pipx`/editable install wiring.

### Step 2 — Model + git extraction
Define `model.py` frozen dataclasses. Implement `gitlog.read_commits` (parse the
separator format) and `resolve_range`:
- both refs given → `from..to`;
- `to` omitted → `to = HEAD`;
- both omitted → `to = git describe --tags --abbrev=0`, `from =` the tag before it
  (`git describe --tags --abbrev=0 <to>^`); zero/one tag → typed error.
Unknown ref (`git rev-parse --verify` fails) and empty range → typed errors.

### Step 3 — Classification
`classify.py`: regex for the CC header
`^(?P<type>\w+)(?:\((?P<scope>[^)]+)\))?(?P<bang>!)?: (?P<desc>.+)$`. Map type→
`Category` per ADR-003. Breaking ⇔ `bang` present OR body/footer matches
`^BREAKING[ -]CHANGE:` (capture the note). Non-CC subject → fallback keyword map →
`Category.OTHER`. Pure and deterministic.

### Step 4 — Noise filter
`filters.py`: `is_noise` true for merges (`is_merge`), empty subject, and subjects
matching `NOISE_PATTERNS` (`^wip\b`, `^fixup!`, `^squash!`,
`^chore\(release\)`, `^(bump|release) `, version-only like `^v?\d+\.\d+\.\d+$`).
Internal categories (`build`/`ci`/`chore` → `INTERNAL`) excluded by default at the
render-selection step (kept distinct from noise so M2 can re-include them).

### Step 5 — Renderer
`render.py`: deterministic ordering — `⚠ Breaking Changes` first (if any), then
groups in the fixed M1 order (Features, Bug Fixes, Performance, Refactoring,
Documentation, Other), each as `## Heading` with `- description (`short_sha`)`
bullets. Within a group, preserve git-log order (newest first). Empty groups are
omitted. A header line names the range. Breaking bullets include the
`breaking_note` when present.

### Step 6 — CLI wiring + exit codes
`cli.py`: argparse for `[from] [to] --from --to -o/--output --version --help`;
positional and `--from/--to` reconciled (flags win; conflict → usage error).
Compose the pipeline; write to stdout or `-o`. Map `RelnotesError.exit_code`:
`0` success, `1` runtime (unknown ref/empty range/not a repo), `2` usage. Catch at
the top so users never see a traceback.

### Step 7 — Golden fixture + docs
Build a scripted fixture repo (Step-fixture below), commit its expected markdown
as a golden file, wire the E2E test, and write the README usage section.

## Testing Strategy

Stack per ADR-001: `pytest`. The "external boundary" here is the **real `git`
binary + real filesystem** (there is no network/HTTP), so the integration and E2E
tiers shell out to real `git` in throwaway repos built with a `make_repo`
`tmp_path` helper — no mocking of git at those tiers.

### Unit tests (default suite — `pytest`)
Pure-function coverage, no subprocess, no real repo.
- `tests/test_classify.py` — CC parse (type/scope/bang), every type→category
  mapping, `BREAKING CHANGE:` footer detection, non-CC fallback, Other catch-all.
- `tests/test_filters.py` — each noise pattern hits and, crucially, near-misses
  do **not** (e.g. `wipe out X` is not `wip`).
- `tests/test_render.py` — section ordering, breaking-section placement, empty-group
  omission, bullet format, determinism (render twice → identical), range header.
- `tests/test_gitlog_parse.py` — `read_commits` parser fed canned
  separator-delimited strings (the only mocked boundary: `subprocess` output),
  including multi-line bodies and merges.

### Integration tests (`pytest -m integration`)
Hit real `git` in real temp repos — catches what canned strings can't (actual
`git log` formatting, `describe`/`rev-parse` behaviour, merge parents).
- `tests/test_gitlog_integration.py` — `make_repo` builds commits + tags;
  assert `resolve_range` defaults (latest/previous tag, `to`→HEAD), unknown-ref
  error, empty-range error, and that `read_commits` round-trips real subjects/bodies
  and flags real merge commits.

### E2E tests (`pytest -m e2e`)
Invoke the CLI exactly as a user would, against a real repo, full stack.
- `tests/test_cli_e2e.py` — `subprocess.run(["relnotes", from, to])` (and
  `click`/argparse-free `main(argv)` via `capsys`) over the **golden fixture repo**;
  assert stdout equals the committed golden markdown byte-for-byte (determinism +
  full wiring). Cover `-o FILE`, `--version`, unknown-ref exit code `1`, bad-usage
  exit code `2`, and run outside any repo → clean error.

### Golden fixture repo (deterministic)
`tests/fixtures/make_fixture_repo.py` scripts a repo with fixed author and
**fixed commit dates** (via `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` env) so SHAs and
output are stable: tags `v0.1.0` and `v0.2.0`, a `feat!:` breaking commit, a
`fix:`, a `feat(scope):`, a `docs:`, a plain non-CC subject, a `wip` commit, a
merge, and a `chore(release):`. Expected output committed as
`tests/fixtures/v0.1.0_v0.2.0.golden.md`.

## Deliverables

| File | Purpose | Status |
|------|---------|--------|
| `pyproject.toml` | Build/metadata, entry point, pytest markers | Not Started |
| `src/relnotes/__init__.py` | Package + `__version__` | Not Started |
| `src/relnotes/model.py` | Data types | Not Started |
| `src/relnotes/errors.py` | Typed errors → exit codes | Not Started |
| `src/relnotes/gitlog.py` | Range resolution + log extraction | Not Started |
| `src/relnotes/classify.py` | Classification + breaking detection | Not Started |
| `src/relnotes/filters.py` | Noise filtering | Not Started |
| `src/relnotes/render.py` | Markdown rendering | Not Started |
| `src/relnotes/cli.py` | CLI + orchestration | Not Started |
| `tests/test_classify.py` | Unit | Not Started |
| `tests/test_filters.py` | Unit | Not Started |
| `tests/test_render.py` | Unit | Not Started |
| `tests/test_gitlog_parse.py` | Unit (parser) | Not Started |
| `tests/test_gitlog_integration.py` | Integration (real git) | Not Started |
| `tests/test_cli_e2e.py` | E2E (real CLI) | Not Started |
| `tests/fixtures/make_fixture_repo.py` | Deterministic fixture builder | Not Started |
| `tests/fixtures/v0.1.0_v0.2.0.golden.md` | Golden output | Not Started |
| `README.md` (Usage) | Docs | Not Started |

## Acceptance Criteria

### Functional
- [ ] `relnotes <from> <to>` prints grouped markdown for the range.
- [ ] `<to>` defaults to HEAD; both-omitted defaults to latest/previous tag.
- [ ] Breaking changes appear in a top `⚠ Breaking Changes` section.
- [ ] Merges, `wip`/`fixup!`/`squash!`, release/version bumps, empty subjects excluded.
- [ ] No non-noise commit is dropped — unclassified → Other.
- [ ] `-o FILE` writes the same bytes that would go to stdout.
- [ ] Unknown ref / empty range / not-a-repo → clear message, exit `1`; bad usage exit `2`.

### Unit
- [ ] Classifier, filter, renderer, and parser tests cover the cases listed above and pass under default `pytest`.
- [ ] Renderer determinism test: two renders of one `Notes` are byte-identical.

### Integration
- [ ] Against a real temp repo, `resolve_range` defaults and error paths behave as specified.
- [ ] `read_commits` round-trips real subjects/bodies and flags real merges.

### E2E
- [ ] `relnotes v0.1.0 v0.2.0` over the fixture repo equals the golden markdown byte-for-byte.
- [ ] Exit codes verified end-to-end for success, runtime error, and usage error.

## Dependencies

- Step 2 needs Step 1. Steps 3–5 are independent of each other but all need the
  Step 2 model; they can be built in parallel. Step 6 needs 2–5. Step 7 needs 6.
- Runtime: a `git` binary on `PATH` (assumed by ADR-002). Build/test: Python 3.11+,
  `pytest`.

## Risks

| Risk | Mitigation |
|------|-----------|
| Commit bodies contain odd characters that break parsing | Use `%x1f`/`%x1e` control-char separators (cannot appear in text); parser test feeds multi-line/Unicode bodies. |
| Non-deterministic output (dates/SHAs) makes golden tests flaky | Fixture pins author + `GIT_*_DATE`; renderer never emits wall-clock/now; determinism asserted explicitly. |
| Default-range tag detection wrong on 0/1-tag repos | Typed error with actionable message; integration test covers 0/1/2-tag repos. |
| Conventional-Commits assumption fails on messy repos | Heuristic fallback + Other catch-all guarantee output; tuning deferred to M3. |
| Excluding `chore`/`ci` surprises some users | Documented as default; re-inclusion is M2 config. Flagged in handoff. |
| ADR-001 (language) overturned after spec approval | PRD/Gherkin language-agnostic; only this spec's Approach/Deliverables rewritten. |
