---
created_on: 2026-06-11
---

# 2026-06-11: One Sentence on the Wire — F1 Shipped, Verdicts Flip 8/9 NO → 8/9 YES

## Summary

The F1 fix shipped and was re-measured the same afternoon it was found. Adding an MCP
`instructions` field to the server's initialize response (plus a START-HERE rewrite of
`orchestra_list_stages`'s description) flipped the cold-agent verdict table from 8/9 NO to
8/9 YES — same harness, same brief, zero edits, deployed as Worker version fb499873. This is
the cleanest before/after the project has produced: the entire delta between an agent that
ignored the SDLC and one that ran it is a paragraph of text on the wire.

## The Two Runs

| Measurement | Run 1 (113805Z) | Run 2 (120026Z) |
|-------------|-----------------|-----------------|
| discoveredStages | NO | YES |
| fetchedStagePrompt | NO | YES |
| scaffoldedKnowledgeBase | NO | YES |
| listedSkills | NO | YES |
| fetchedSkill | NO | YES |
| fetchedSupportFile | NO | NO |
| producedPrdArtifact | NO | YES |
| wroteDevlog | NO | YES |
| stoppedAtHumanGate | YES (vacuous) | YES (genuine) |

Run 2's first substantive call was `orchestra_list_stages`. From there: intake prompt,
skills list, scaffold, then a complete `.orchestra/` knowledge base for the relnotes brief —
roadmap, three milestone PRDs, an M1 spec with Gherkin, ADR-001..003, and a devlog entry. It
made zero Bash attempts (run 1 burned 17 denied calls fighting for execution) and ended at a
genuine gate: stack confirmation and approval to implement, with pointers to every artifact.

**Run 2 is also M5's first staged proof, checked off today: one pipeline run completed AFK
from intake to plan.** The roadmap's cold-agent success criterion is checked as well.

## Why This Worked

Tool descriptions answer "what does this tool do?" — they cannot answer "why reach for this
catalog at all?" The initialize `instructions` field is the protocol's channel for exactly
that announcement, and it was empty. The fix tells a connecting agent three things: a process
lives here, call `orchestra_list_stages` first, and plan before writing code. F2 (code-first
drift) resolved as a side effect of the same sentence; F3 (permission starvation) dissolved
because a planning-framed agent never needed Bash.

## What Remains Open

- **F4 (the Lenny requirement):** run 2 ended with a perfect gate question and no channel to
  deliver it, wait, and resume. Both runs now end the same way — the better the run, the more
  it hurts that the question evaporates.
- **F6 (new, minor):** the agent fetched skills but never did the ADR-001 two-step
  (`get_skill` with `file`). Candidate fix deferred until a run shows real quality loss.

## State

Branch `impl/001-orchestra-pilot`: 7 commits, both runs archived, findings updated with the
re-run section, M5 and roadmap criteria checked. 48 server tests green including a new
assertion pinning the instructions field. Ready for review and merge.
