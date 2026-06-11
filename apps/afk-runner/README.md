# afk-runner

The loop from ADR-003: a scheduler fires headless Claude Code sessions
against a target repository; the repo holds all state; humans answer gates
by committing. No raw API key — sessions run on the subscription harness.

```
scheduler ──▶ run.sh <repo> <work-item>
                ├── check-state.mjs ──▶ blocked? done? → exit (cheap tick)
                ├── claude -p (headless, repo's .mcp.json, orchestra-afk skill)
                │     works on afk/<item>, commits, pauses via gate files
                └── new gate file? ──▶ ntfy ping → human commits an answer
```

## The contract

- **State** = `.orchestra/` frontmatter in the target repo.
- **Gates** = `.orchestra/work/<item>/gates/NNN-*.md` (`status: pending` →
  human edits to `status: answered` + `answer:` and commits → next tick
  resumes and marks `consumed: true`). The convention is taught to the
  session by the served `orchestra-afk` skill — the runner only points
  at it.
- **Permission posture** (the F3 lesson, chosen deliberately): the session
  gets `Bash` because implementation needs tests and git. Run this only
  against repos you trust the loop to modify; everything lands on an
  `afk/` branch, never the default branch.

## Use

```bash
./preflight.sh                                  # live boundaries OK?
./run.sh ~/workspace/relnotes m1-skeleton       # one tick, by hand
```

Schedule it: edit and install `com.orchestra.afk-runner.plist` (launchd,
15-minute tick — see comments in the file), or cron:
`*/15 * * * * /bin/bash .../run.sh /Users/mpaz/workspace/relnotes m1-skeleton`.

Ticks are cheap when blocked: `check-state` answers from the filesystem and
no session starts. Overlap-safe via lockfile. Transcripts archive under
`runs/<timestamp>/` here, not in the target repo (gitignored going forward;
force-add a run if it's evidence worth keeping).

Env: `ORCHESTRA_API_KEY` (falls back to `../mcp-sdlc/.dev.vars`; expanded
into the target's `.mcp.json`), `NTFY_TOPIC`, `AFK_MAX_TURNS` (default 50).

## Tests

```bash
node --test apps/afk-runner/   # unit: check-state verdicts
./preflight.sh                 # integration: served skill + ntfy
```

Work item: `.orchestra/work/002-afk-runner/`.
