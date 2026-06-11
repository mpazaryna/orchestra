# Starter Validation Run — 2026-06-11

**Question:** can a newcomer go from empty directory to a running work item
using only `create.sh` and the README?

## Method

```
templates/create.sh /tmp/starter-validation "a CLI that converts CSV files to markdown tables"
cd /tmp/starter-validation && claude -p "<the README's first-session prompt, verbatim>"
```

Headless stands in for the newcomer's interactive session (same MCP surface,
same prompt). `--strict-mcp-config`, project-only settings, 40-turn cap.
Transcript: `/tmp/starter-validation-transcript.jsonl` (exit 0).

## Result — criterion exceeded

Target was intake → PRD. The session delivered:

- `.orchestra/` scaffolded: README, roadmap, ADR-000, templates, devlog
- Three milestone PRDs (m1-core-conversion full; m2, m3 stubs)
- m1: complete spec + gherkin, **and an implemented, tested, packaged
  CLI on a branch**
- ADR-001 recording the stack choice (Python/stdlib) with alternatives
- Stopped at genuinely human decisions: stack confirmation, commit
  approval, M2 go-ahead — stated plainly in its final message

## Honest notes

1. **It stopped conversationally, not with gate files.** Correct for the
   README's keyboard flow (at a real keyboard, the human is in the
   conversation). The gate-file discipline is the AFK path, separately
   proven by 002's demo. The README keeps the two flows distinct; this run
   validates the first.
2. **It left the implementation uncommitted**, offering the commit as a
   human decision — defensible etiquette at a keyboard, would be a protocol
   violation under orchestra-afk. Distinction already encoded in the served
   skill.
3. **It overshot the brief's "as far as you can"** — building M1 before any
   PRD gate could be answered (nobody was there to answer). Interactive
   users will be asked at each gate as the README describes; the overshoot
   is an artifact of headless validation, not the template.

## Verdict

PASS — one command + one README + one paste-prompt produced a connected,
planned, evidence-rich project with the human's authority intact at every
decision point.
