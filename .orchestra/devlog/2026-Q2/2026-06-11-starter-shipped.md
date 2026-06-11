---
created_on: 2026-06-11
---

# 2026-06-11: Starter Shipped — One Command, One README, One Paste-Prompt

## Summary

003-starter closes the adoption gap the day kept exposing: everything worked, but only for
whoever assembled it by hand. Now `templates/create.sh <dir> "idea"` stamps a new workspace
repo (README, working `.mcp.json` with env-var auth, secret-refusing `.gitignore`, git
initialized), and the README walks a newcomer through both ways of working — at the keyboard
(gates are conversation) and AFK (gates are files, approvals are commits, the 002 runner does
the driving). The template lives in the monorepo beside the things it documents; `check.sh`
pins it to the live server (initialize instructions, 7 tools, orchestra-afk served) so it
cannot drift silently.

## Validation

A project stamped with "a CLI that converts CSV files to markdown tables" was driven by the
README's first-session prompt, verbatim, headless. Target was intake → PRD; the session
delivered a full knowledge base, three milestone PRDs, a complete M1 spec/gherkin, an ADR,
and an implemented, tested M1 — stopping at three crisp human decisions. Honest notes in
validation.md: it stopped conversationally (correct for the keyboard flow; gate files are
the AFK path, proven by 002), and it overshot "as far as you can" because headless has
nobody to answer gates mid-flight — interactive users get asked at each gate as written.

## Day's Close

Work items 001, 002, 003 and the M3 pivot all planned, gated, built, evidenced, and merged
(003 pending) in one day, each one's findings writing the next one's PRD. The system now
onboards strangers: that was the last piece adoption needed.
