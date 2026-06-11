---
ticket: 001-orchestra-pilot
status: closed
created_on: 2026-06-11
---

# Orchestra Pilot — Cold-Agent Test

> PRD: .orchestra/work/001-orchestra-pilot/prd.md

## Objective

Build a repeatable harness that runs a cold agent — headless Claude Code in an
empty sandbox, no user/project settings, only the deployed Orchestra MCP
server — against a bare work brief, captures the full transcript, and produces
a per-step verdict report of whether the tool catalog alone triggered the SDLC.

## Approach

### Step 1: Harness skeleton
Create `apps/orchestra-pilot/` (plain Node, no Worker, no deps — `node:test`
only). Files: `README.md`, `brief.md`, `run.sh`, `analyze.mjs`,
`preflight.sh`, `fixtures/transcript.jsonl`, `analyze.test.mjs`, `runs/`
(committed — transcripts are evidence).

### Step 2: The brief (`brief.md`)
A bare, realistic intake brief: a small concrete product idea (a CLI that
turns a git changelog into release notes), phrased with **zero** mention of
Orchestra, SDLC, stages, skills, or process. Instruction: "set this project
up properly and take the idea as far toward an executable plan as you can
without human input; stop where a human decision is required." The absence of
process words is the experimental control — discovery must come from tool
descriptions alone.

### Step 3: Preflight (`preflight.sh`)
Resolves the API key (`$ORCHESTRA_API_KEY`, falling back to
`apps/mcp-sdlc/.dev.vars`), then hits the deployed endpoint with `initialize`
and `tools/list`; fails loudly on non-200 or a tool count ≠ 7. This is the
integration tier — real network, nothing mocked.

### Step 4: Cold run (`run.sh`)
1. `mktemp -d` sandbox **outside** the repo (no CLAUDE.md inheritance)
2. Write `sandbox/.mcp.json` pointing at
   `https://orchestra-mcp-sdlc.mpazbot.workers.dev/mcp` with Bearer auth
3. Copy `brief.md` into the sandbox
4. From the sandbox cwd, run:
   `claude -p "$(cat brief.md)" --mcp-config .mcp.json --strict-mcp-config
   --setting-sources project --allowedTools "mcp__orchestra" Read Write Edit
   Glob Grep TodoWrite --output-format stream-json --verbose
   --max-turns 40 > transcript.jsonl`
   (no Bash in the allowlist — the cold agent writes files, it doesn't execute)
5. Archive into `runs/<UTC-timestamp>/`: `transcript.jsonl` + the sandbox's
   produced file tree under `workspace/`
6. Invoke `analyze.mjs` on the run dir → `report.md`

### Step 5: Analyzer (`analyze.mjs`)
Parses stream-json transcript. Emits `report.md`: ordered list of MCP tool
calls with arguments, files written, and a verdict table — one row per
measurement: discovered stages? fetched a stage prompt? scaffolded
`.orchestra/`? fetched any skill? fetched a skill support file (the ADR-001
two-step)? produced PRD-shaped artifacts? stopped at a human gate? Pure
function of the transcript: `analyze(lines) → report` exported for tests.

### Step 6: Execute and write findings
Run preflight, then one real cold run. Read the transcript and report; write
`.orchestra/work/001-orchestra-pilot/findings.md` — one finding per stumble
(observed behavior, the gap that caused it, candidate fix, which consumer it
informs: tool descriptions vs M3 Lenny). Update materials tables; devlog;
commit.

## Testing Strategy

### Unit Tests
- Files: `apps/orchestra-pilot/analyze.test.mjs`
- Covers: transcript parsing (tool-call extraction, file-write detection,
  verdict derivation) against `fixtures/transcript.jsonl`; malformed-line
  tolerance; empty-transcript → all-NO verdicts
- Mocking: none needed — fixture file in, report out
- Run: `node --test apps/orchestra-pilot/`
- Commit: test + fixture before `analyze.mjs`

### Integration Tests
- Files: `apps/orchestra-pilot/preflight.sh`
- Covers: deployed server reachable, Bearer auth valid, `initialize` 200,
  `tools/list` returns exactly 7 tools
- Mocking: nothing — real deployed endpoint
- Run: `./preflight.sh` (manual / pre-run gate, needs key)
- Commit: before run.sh

### E2E Tests
- Files: `apps/orchestra-pilot/run.sh` (the cold run **is** the E2E)
- Covers: full path — sandbox isolation, MCP handshake, agent behavior,
  transcript capture, report generation
- Mocking: nothing
- Run: `./run.sh` (manual; costs one headless Claude session)
- Commit: harness before first archived run

## Deliverables

| File | Purpose | Status |
|------|---------|--------|
| apps/orchestra-pilot/README.md | How to run, what it measures | Delivered |
| apps/orchestra-pilot/brief.md | Process-word-free intake brief | Delivered |
| apps/orchestra-pilot/preflight.sh | Live-server integration check | Delivered |
| apps/orchestra-pilot/run.sh | Cold-run orchestrator | Delivered |
| apps/orchestra-pilot/analyze.mjs | Transcript → verdict report | Delivered |
| apps/orchestra-pilot/analyze.test.mjs + fixtures/ | Unit tier | Delivered |
| apps/orchestra-pilot/runs/20260611T113805Z/ | First archived run (evidence) | Delivered |
| .orchestra/work/001-orchestra-pilot/findings.md | Findings → M3 input | Delivered |

## Acceptance Criteria

### Functional
- [ ] Cold agent observed end to end with only the deployed catalog (PRD #1)
- [ ] Report contains a per-step verdict table (PRD #2)
- [ ] findings.md has one entry per stumble with cause + candidate fix (PRD #3)
- [ ] Re-running `run.sh` after a server change requires zero harness edits (PRD #4)
- [ ] Transcript, report, findings committed (PRD #5)

### Unit
- [ ] `node --test apps/orchestra-pilot/` passes; fixture transcript yields expected verdicts

### Integration
- [ ] `preflight.sh` exits 0 against the live deployed server, asserts 7 tools

### E2E
- [ ] One archived run in `runs/` with transcript.jsonl, workspace/, report.md

## Dependencies

- M2 deployed server (live — preflight 200 confirmed today)
- `claude` CLI with `--setting-sources` / `--strict-mcp-config` (confirmed today)
- API key in `apps/mcp-sdlc/.dev.vars` (present, validated)

## Risks

| Risk | Mitigation |
|------|-----------|
| Cold agent ignores the catalog entirely | That is a *finding*, not a harness failure — the report records all-NO verdicts and findings.md captures it |
| `--setting-sources project` still leaks user-level skills/plugins | Analyzer flags any non-orchestra MCP tools or Skill invocations in the transcript; rerun with tighter flags if leaked |
| Headless run stalls or burns turns | `--max-turns 40` cap; transcript is still analyzable on truncation |
| stream-json schema drift breaks analyzer | Parser tolerates unknown line types; unit fixture pins the current schema |
