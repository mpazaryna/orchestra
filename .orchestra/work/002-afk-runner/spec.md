---
ticket: 002-afk-runner
status: closed
created_on: 2026-06-11
---

# AFK Runner — A Repository Runs Its Own Work Items

> PRD: .orchestra/work/002-afk-runner/prd.md

## Objective

Build the loop that ADR-003 describes: a gate-in-repo convention taught as a
served skill, a runner script that starts scheduled headless Claude Code
sessions against a target checkout, a ntfy ping when a gate appears, and a
demo where the relnotes work item (seeded from Lenny's workspace) travels
through two gate pauses to tests-green — all on the subscription harness.

## Approach

### Step 1: The gate convention, served as a skill (`orchestra-afk`)
New skill `skills/orchestra-afk/SKILL.md` — the conductor discipline for an
unattended session, taught from the wire (the ADR-001 lesson: served
context is the only context). Protocol:
- **Orient:** read `.orchestra/` state (roadmap, work item frontmatter,
  open gates) before anything; trust what exists, never redo it.
- **Gates as files:** a human decision = write
  `.orchestra/work/<item>/gates/NNN-<slug>.md` with frontmatter
  `status: pending`, the question, concrete options, and artifact paths;
  commit; push; **end the session cleanly**.
- **Approval read:** a gate file edited to `status: answered` +
  `answer: …` (committed by the human — terminal, editor, or GitHub UI)
  is the signal to continue; apply the answer, never re-ask.
- **Work on a branch** (`afk/<work-item>`), commit at each meaningful unit,
  push before exiting; devlog via the devlog tool.
Deploy so it's served (`pnpm build:skills` chain). Also append one sentence
to the server's initialize instructions naming `orchestra-afk` as the
playbook for unattended runs.

### Step 2: Runner (`apps/afk-runner/`)
`check-state.mjs` (pure, tested): given a repo path + work item, reads gate
files and frontmatter → verdict: `blocked` (pending gate — do nothing),
`resume` (newly answered gate), `continue` (mid-stage, no gate), `done`.
`run.sh`: `git pull` → check-state → exit 0 if blocked/done; else launch
`claude -p` from the checkout with the repo's own `.mcp.json`
(`--strict-mcp-config`), a one-paragraph prompt pointing at the
`orchestra-afk` skill, `--max-turns` cap, allowlist including Bash (tests
and git need it — the F3 lesson: choose the permission posture
deliberately; documented as trusted-repo-only). After the session:
detect new pending gate file → ntfy ping with repo, branch, gate path,
question. Transcript saved under `runs/` in the runner (not the target).

### Step 3: Scheduling
`com.orchestra.afk-runner.plist` (launchd template, 15-min interval) +
README documenting the cron alternative. Known pitfall: cron/launchd PATH
and Claude Code auth — the template uses absolute paths and the user's
login environment; the demo proves at least one genuinely scheduler-fired
run (not hand-started).

### Step 4: Seed the relnotes repo
`seed.sh`: pull Lenny's workspace export (`GET /workspace?work=relnotes`),
write into `~/workspace/relnotes`, `git init`, normalize the wrong dates
(Lenny thought it was 2025-06-13), initial commit, add `.mcp.json` pointing
at the deployed server. Park note: Lenny's DO remains paused; this export
is the continuity of evidence ADR-003 promised.

### Step 5: The demo
On the seeded repo: runner advances m1-skeleton (spec exists, status
approved from the M3 session) → implementation with real pytest runs →
expect ≥2 gate pauses (e.g., implementation-complete review; any decision
the skill flags) → answer each by editing the gate file (at least one via
a plain `git commit` from the phone-reachable GitHub UI or editor) → runs
resume → tests green on the checkout. Archive the timeline + key transcript
excerpts as `.orchestra/work/002-afk-runner/demo.md`.

## Testing Strategy

### Unit Tests
- Files: `apps/afk-runner/check-state.test.mjs` (+ fixtures: repo trees as temp dirs)
- Covers: verdicts for pending/answered/no gates, malformed frontmatter
  tolerance, gate-file discovery ordering, "answered but already consumed"
  (gate marked `consumed: true` after a resume run starts)
- Mocking: none — fixture directories in, verdict out
- Run: `node --test apps/afk-runner/`
- Commit: tests before check-state.mjs

### Integration Tests
- Files: `apps/afk-runner/preflight.sh`
- Covers: deployed server serves the `orchestra-afk` skill
  (`orchestra_get_skill` round-trip), ntfy topic reachable
- Mocking: nothing — live endpoints
- Commit: before run.sh

### E2E Tests
- The Step 5 demo on the seeded relnotes repo, including one
  scheduler-fired run; archived as demo.md
- Mocking: nothing

## Deliverables

| File | Purpose | Status |
|------|---------|--------|
| skills/orchestra-afk/SKILL.md | Gate-in-repo conductor discipline, served | Delivered |
| apps/mcp-sdlc initialize instructions (one line) | Announce orchestra-afk for unattended runs | Delivered |
| apps/afk-runner/check-state.mjs (+ tests, fixtures) | Repo-state verdict logic | Delivered (7 tests) |
| apps/afk-runner/run.sh | Session wrapper + ntfy ping | Delivered |
| apps/afk-runner/preflight.sh | Live-boundary check | Delivered (green) |
| apps/afk-runner/com.orchestra.afk-runner.plist + README | Scheduling | Delivered (loaded, fired) |
| apps/afk-runner/seed.sh | relnotes repo from Lenny's export | Delivered |
| ~/workspace/relnotes | Seeded target repo (outside this monorepo) | Delivered (M1 merged, M2 active) |
| .orchestra/work/002-afk-runner/demo.md | End-to-end proof | Delivered |

## Acceptance Criteria

### Functional
- [ ] Scheduler-fired run advances the work item unattended (PRD #1)
- [ ] Gate pause = committed gate file + ntfy ping + clean exit (PRD #2)
- [ ] Editing the gate file to answered resumes on the next run, context intact (PRD #3)
- [ ] relnotes reaches implemented-with-tests-green across ≥2 gate pauses (PRD #4, #5)
- [ ] Loop runs entirely on subscription headless Claude Code (PRD #6)

### Unit
- [ ] `node --test apps/afk-runner/` green

### Integration
- [ ] preflight green: orchestra-afk served, ntfy reachable

### E2E
- [ ] demo.md archived with timeline and a scheduler-fired run

## Dependencies

- Deployed MCP server (live); skills codegen chain (exists)
- Lenny's workspace export endpoint (live, paused DO retains state)
- `claude` CLI on the runner machine with subscription auth
- ntfy topic (existing: orchestra-lenny-d25adf95a628, or a fresh one)

## Risks

| Risk | Mitigation |
|------|-----------|
| Headless session ignores the gate convention | Same fix that worked twice today: served instructions (skill + initialize line); check-state guards the loop regardless — an undisciplined session can't corrupt gates, only fail to advance |
| Unattended Bash in a real repo | Trusted-repo-only posture, documented; the target repo is a sandbox project; allowlist excludes network/system tools beyond git/pytest |
| cron/launchd lacks claude auth or PATH | launchd template with absolute paths + login env; demo requirement keeps us honest; fallback documented (terminal `/loop`) |
| Runner double-fires (overlapping sessions) | lockfile in run.sh; check-state exits `blocked` instantly so overlaps are cheap |
| Lenny's export has wrong dates / DO unavailable later | seed.sh normalizes dates; export already verified working today |
