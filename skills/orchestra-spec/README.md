# spec

Generate an execution spec from an approved PRD — define approach, steps, deliverables, acceptance criteria, and risks.

## Quick Start

```
/spec voice-input-pipeline
/spec .orchestra/work/86abc-voice-input/prd.md
```

## What It Does

1. Reads the PRD (by work item name or path) — objective, success criteria, materials table, context
2. Reads the parent milestone PRD for broader context
3. Reads relevant ADRs
4. Analyzes the codebase if applicable: globs related files, reads existing patterns, identifies integration points
5. Designs the approach — breaks work into independently executable steps, ordered by dependency, noting what needs human input vs. agent execution
6. Generates the spec with: approach steps, deliverables table (concrete file paths), acceptance criteria (more specific than PRD), dependencies, and risks with mitigations
7. Saves to `.orchestra/work/{id}-{name}/spec.md` alongside the PRD
8. Presents for approval

The spec is the contract between the conductor and the orchestra — an agent reading only the spec should be able to execute without asking questions.

## Prerequisites

- A PRD must exist at `.orchestra/work/{id}-{name}/prd.md`
- The PRD should be in `approved` status

## Spec vs PRD

| | PRD | Spec |
|---|---|---|
| Answers | What and why | How |
| Language | Business/outcome | Tactical/technical |
| Approval | Before spec | Before implementation |

## See Also

- `prd` — generates the PRD that this spec derives from
- `ticket` — capture a work item to feed into PRD/spec
- `adr` — capture decisions made during spec/implementation
