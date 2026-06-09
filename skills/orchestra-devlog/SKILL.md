---
name: orchestra-devlog
description: "Write the engineer's journal — session logs, narrative progress notes, and git journals that capture the story behind the commits. The programme notes for whoever works here next."
when_to_use: "Use when capturing what happened during a work session, why decisions were made, or what a future agent or developer will need to know."
allowed-tools: Read, Glob, Bash, Write
---

# Devlog

Document development work. From git commits to narrative logs. Output goes to `.orchestra/devlog/`.

## Report Types

| Type | When to Use | Trigger Phrases |
|------|-------------|-----------------|
| **Git Journal** | Summarize work from commits | "journal this", "journal today's work" |
| **Devlog** | Narrative work documentation | "devlog", "write a devlog" |

## How to Use This Skill

1. **Identify the report type** from the request
2. **Load the appropriate template** from `examples/`:
   - Git journal → Read `examples/github-journal.md`
   - Devlog → Read `examples/devlog.md`
3. **Follow the workflow** in that template
4. **Generate the report** in the specified format

## Quick Reference

| Request | Template |
|---------|----------|
| "Journal this", "journal the last 4 hours" | `examples/github-journal.md` |
| "Write a devlog", "devlog update" | `examples/devlog.md` |

## Report Purposes

### Git Journal
Generates structured journal entries from git commit history. Great for:
- End of day summaries
- Sprint retrospectives
- Documenting refactors or features

### Devlog
Narrative-style work logs with context and decisions. Great for:
- Explaining technical decisions
- Sharing learnings with the team
- Building institutional knowledge

