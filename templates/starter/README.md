# {{PROJECT_NAME}}

> **Brief:** {{IDEA}}

This project runs on [Orchestra](https://github.com/mpazaryna/orchestra) — a
software development lifecycle your coding agent follows. The process
(stages, playbooks, quality bars) arrives over the wire from a deployed MCP
server; **this repository holds everything else**: the plans, the decisions,
the code, and the gates where you stay in charge.

You don't need to learn the process. Your agent fetches it. You need to know
three things: how to start, how to approve, and how to walk away.

---

## Prerequisites

1. [Claude Code](https://claude.com/claude-code) installed (`claude` on your PATH).
2. The Orchestra API key in your environment:

```bash
export ORCHESTRA_API_KEY="<ask the orchestra operator for this>"
```

Put it in your shell profile, or in a local `.env` you source. **Never
commit it** — this repo's `.gitignore` already refuses `.env` and
`.dev.vars`, and `.mcp.json` references the key only as `${ORCHESTRA_API_KEY}`.

---

## Your first session (5 minutes)

From this directory:

```bash
claude
```

Then paste (edit the idea first if the Brief above is still a placeholder):

```
Here's my idea: {{IDEA}}. Set this project up properly and take it as far
as you can without me; stop where you genuinely need my decision.
```

What you'll see, in order — this is the process working, not the agent
improvising:

1. A `.orchestra/` folder appears: roadmap, work item folders, decision
   records, devlogs. That's the project's knowledge base; it's all markdown,
   all committed, all yours to read.
2. A plan forms *before* any code: a PRD (the why), then a spec (the how).
3. The agent stops and asks you something — approve the plan, pick between
   options. **That question is a gate.** Answer it in the conversation and
   the work continues. You're never bypassed.

## Working at the keyboard

The loop is always the same and the agent drives it:

```
idea → PRD [you approve] → spec [you approve] → implement (tests first) → review → merge
```

Useful things to say:

- `"where is the pipeline?"` — status from `.orchestra/` state
- `"what should we work on next?"` — milestone review
- `"approved"` / `"change X first"` — at any gate
- `"journal this session"` — writes a devlog entry

## Going AFK

When you'd rather review than chaperone, the same gates become **files**,
and your approvals become **commits**. A scheduled headless session advances
the work; when it hits a decision, it writes the question into the repo,
pings your phone, and exits.

**One tick by hand** (from a checkout of the orchestra monorepo):

```bash
orchestra/apps/afk-runner/run.sh /path/to/this-repo <work-item-name>
```

**On a schedule** (every 15 minutes; macOS):

```bash
# edit the repo path + work item inside the plist first
cp orchestra/apps/afk-runner/com.orchestra.afk-runner.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.orchestra.afk-runner.plist
```

**Gate notifications** land on your ntfy topic (`export NTFY_TOPIC=...`,
subscribe at `https://ntfy.sh/<your-topic>` or in the ntfy app).

**Answering a gate** — open the file the ping points at, e.g.
`.orchestra/work/<item>/gates/001-stack-choice.md`, and edit its frontmatter:

```yaml
status: answered
answer: "option 1 — and keep the CLI flags as proposed"
```

Commit it (any editor, terminal, or the GitHub web UI from your phone):

```bash
git add -A && git commit -m "answer gate 001"
```

The next scheduled tick reads your commit and resumes exactly where the work
stopped. Pending gate = the loop waits, costing nothing. That's the whole
contract: **the agent can never pass a gate you haven't committed an answer
to.**

## Checking status

No dashboard — the repo is the status:

- `.orchestra/roadmap.md` — milestones and where they stand
- `.orchestra/work/<item>/` — frontmatter `status:` on prd/spec is the
  pipeline state; `gates/` shows every question asked and answered
- `.orchestra/devlog/` — the narrative, session by session
- `git log` — everything the loop did, reviewable like any colleague's work

## Troubleshooting

| Symptom | Fix |
|---|---|
| Agent says it has no orchestra tools | Run `/mcp` in Claude Code — is the `orchestra` server connected? Is `ORCHESTRA_API_KEY` exported in *this* shell? |
| 401 from the server | Key is wrong or missing; re-export and restart the session |
| AFK tick "does nothing" | That's usually correct: a pending gate (waiting on you) or a closed work item. Check `gates/` for `status: pending` |
| Answered a gate but nothing resumed | Was the edit **committed**? The loop reads commits, not working trees |
| Want to stop the loop | `launchctl unload ~/Library/LaunchAgents/com.orchestra.afk-runner.plist` |
