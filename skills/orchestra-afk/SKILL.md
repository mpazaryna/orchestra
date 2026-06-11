---
name: orchestra-afk
description: "Conductor discipline for unattended (AFK) sessions — advance the work item from repo state, pause at human decisions by committing a gate file, resume from answered gates. The repo is the workspace; gates are files; approval is a commit."
when_to_use: "Use when running as a scheduled or headless session with nobody at the keyboard — the session must leave the repo in a state the next session (or a human) can pick up cold."
---

# AFK — Unattended Conductor Discipline

You are one session in a scheduled loop. Nobody is watching. Your only
channels are the repository (state, artifacts, gates) and the git history
you leave behind. The next session — or a human reviewer — must be able to
pick up cold from what you commit.

## The Loop You Live In

```
scheduler → session: orient → work → (gate? pause : continue) → commit → push → exit
human: answers gates by editing a file and committing
next session: reads the answer, resumes
```

## 1. Orient (always first)

1. Read `.orchestra/roadmap.md` and the active work item's frontmatter
   statuses — they are the pipeline state.
2. Read `.orchestra/work/<item>/gates/` — every gate file:
   - Any `status: pending` gate → **stop immediately**. The pause is not
     yours to override. Exit without doing work.
   - Any `status: answered` gate not yet `consumed: true` → that answer is
     your instruction. Mark it `consumed: true` in the same commit as your
     first work, then proceed under it.
3. Trust the repo. Never regenerate an artifact that exists; never redo a
   stage whose status says it is done.

## 2. Work

- Operate on branch `afk/<work-item>` (create from the default branch if
  absent; never commit to the default branch directly).
- Follow the stages: fetch the current stage's prompt with
  `orchestra_get_prompt`; fetch the relevant playbook with
  `orchestra_get_skill` before producing a stage artifact.
- PRD before spec, spec before implementation. Run the project's tests
  whenever you change code; never claim green you didn't see.
- Commit at each meaningful unit with conventional messages. Write a devlog
  entry via `orchestra_devlog_entry` for the session and commit it.

## 3. Pause — gates as files

When you reach a decision only a human can make (stage approval, an
irreversible or taste-level choice, anything a playbook marks as a gate):

1. Write `.orchestra/work/<item>/gates/NNN-<slug>.md` (NNN = next number):

```markdown
---
status: pending
raised_on: {YYYY-MM-DD}
---

# Gate NNN: {one-line question}

## Question
{The decision, answerable in one line.}

## Options
1. {concrete option — recommended first, say why}
2. {concrete option}

## Read before deciding
- {artifact path}
- {artifact path}
```

2. Commit it, push the branch, and **end the session**. Do not proceed past
   an unanswered gate. Do not speculate about the answer. Do not start the
   next stage "provisionally."

## 4. Resume — answers are commits

A human answers by editing the gate file:

```markdown
---
status: answered
answer: "{their decision}"
answered_on: {YYYY-MM-DD}
---
```

When you find such a gate during orientation: apply the answer exactly,
mark the file `consumed: true`, and continue from precisely where the work
stopped. Never re-ask an answered question; never reopen a consumed gate.

## 5. Exit clean (every session, every path)

- Working tree committed, branch pushed. A session that exits with
  uncommitted work has failed even if the work is good.
- If you ran out of turns mid-task: commit what is consistent, note the
  exact stopping point in the devlog entry, and exit — the next session
  resumes from your note.
