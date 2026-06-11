# relnotes

Generate polished, human-readable release notes from a git repository's commit
history. `relnotes` reads the commits between two tags, groups them into
sections, drops noise (chores, merges, version bumps), and highlights breaking
changes — emitting clean Markdown ready to paste into a release or `CHANGELOG.md`.

- **Zero dependencies.** Pure Python standard library; shells out to `git`.
- **Convention-aware, but not convention-bound.** Understands
  [Conventional Commits](https://www.conventionalcommits.org/) and falls back to
  keyword heuristics for repos that don't use them.
- **Breaking changes up front.** `feat!:` headers and `BREAKING CHANGE:` footers
  are surfaced in a dedicated section.
- **Configurable.** Override sections and noise rules via TOML.

## Install

```bash
pip install -e .          # from a checkout
# or, once published:
pip install relnotes
```

Requires Python 3.9+ and `git` on your `PATH`.

## Usage

```bash
# Notes for the latest tag (vs. the tag before it):
relnotes

# An explicit range:
relnotes --from v1.2.0 --to v1.3.0

# Unreleased changes since the last tag:
relnotes --to HEAD

# With commit links and a date, written to a file:
relnotes --from v1.2.0 --to v1.3.0 \
  --repo-url https://github.com/you/project \
  --date 2026-06-11 \
  -o RELEASE_NOTES.md
```

### Key options

| Option | Description |
| --- | --- |
| `--from REF` | Start ref (exclusive). Defaults to the tag before `--to`. |
| `--to REF` | End ref (inclusive). Defaults to the latest tag, else `HEAD`. |
| `-C, --repo PATH` | Repository path (default: current directory). |
| `--version-label NAME` | Heading text (default: the `--to` ref). |
| `--date YYYY-MM-DD` | Date shown beside the heading. |
| `--repo-url URL` | Base URL for commit / compare links. |
| `--config PATH` | TOML config overriding sections and noise rules. |
| `-o, --output PATH` | Write to a file instead of stdout. |
| `--include-merges` | Keep merge commits (dropped by default). |
| `--list-tags` | List tags newest-first and exit. |

## Example output

```markdown
## v1.3.0 (2026-06-11)

### ⚠️ Breaking Changes

- Drop v1 endpoints — clients must migrate to /v2 (`a1b2c3d`)

### ✨ Features

- **api:** Add widgets endpoint (`d4e5f6a`)

### 🐛 Bug Fixes

- Handle empty payloads (`b7c8d9e`)

<sub>4 noise commit(s) (chore/style/test/merge/etc.) omitted.</sub>
```

## How commits are classified

1. **Noise filter.** Commits whose type is a noise type (`chore`, `style`,
   `test`, `ci`) or whose subject matches a noise pattern (merges, version
   bumps, `wip`, `fixup!`) are dropped — *unless* they carry a breaking change.
2. **Breaking detection.** A `!` after the type/scope (`feat(api)!:`) or a
   `BREAKING CHANGE:` footer promotes a commit into the Breaking Changes section.
3. **Routing.** Conventional types map to sections (`feat` → Features, etc.).
   Non-conventional subjects are routed by keyword heuristics, falling back to
   "Other Changes".

See `relnotes.toml.example` to customize any of this.

## Development

```bash
pip install -e ".[dev]"
pytest
```

## License

MIT — see [LICENSE](LICENSE).
