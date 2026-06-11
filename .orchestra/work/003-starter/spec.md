---
ticket: 003-starter
status: closed
created_on: 2026-06-11
---

# Starter — From Empty Directory to Running Work Item

> PRD: .orchestra/work/003-starter/prd.md

## Objective

A `templates/starter/` directory in this monorepo (consumer-facing README,
working `.mcp.json`, `.gitignore`) plus `templates/create.sh` that stamps it
into a new git workspace repo — validated by actually creating a fresh
project and driving it intake → PRD using only what the README says.

## Approach

### Step 1: The template (`templates/starter/`)
- **README.md** — the handholding document, written for someone who has
  never seen this monorepo. Sections: what this is; prerequisites (Claude
  Code + `ORCHESTRA_API_KEY`); your first session (paste-prompt + what to
  expect); working at the keyboard; going AFK (gate files, answering by
  commit, runner + schedule, ntfy); checking status; troubleshooting.
- **.mcp.json** — orchestra server, Streamable HTTP,
  `Authorization: Bearer ${ORCHESTRA_API_KEY}`.
- **.gitignore** — `.env`, `.dev.vars`, OS noise.

### Step 2: `templates/create.sh`
`create.sh <target-dir> ["one-line idea"]`: refuses existing targets,
copies the template, writes the idea into the README's Brief slot if
given, `git init -b main`, initial commit, prints the three next steps
(export key, `cd`, `claude`). No network calls — stamping is offline.

### Step 3: Drift check (`templates/check.sh` + unit test)
- `check.sh` (integration tier): `.mcp.json` parses; its URL answers
  `initialize` with `instructions` present; `tools/list` = 7;
  `orchestra-afk` served.
- `template.test.mjs` (unit tier, `node --test`): template `.mcp.json` is
  valid JSON with the `${ORCHESTRA_API_KEY}` placeholder; README contains
  the required sections; create.sh exists and is executable.

### Step 4: Validation run
Stamp `/tmp/starter-validation` with a small idea ("a CLI that converts
CSV to markdown tables"), then run one headless session from it using
exactly the README's first-session prompt. Verify intake → PRD artifacts
appear in `.orchestra/` and the session stops at a decision. Archive as
`.orchestra/work/003-starter/validation.md`. Update CLAUDE.md's layout
section to mention `templates/`.

## Testing Strategy

### Unit Tests
- Files: `templates/template.test.mjs`
- Covers: `.mcp.json` validity + placeholder, README required sections,
  create.sh present/executable
- Run: `node --test templates/template.test.mjs`
- Commit: test before/with template

### Integration Tests
- Files: `templates/check.sh` — live server matches the README's promises
- Commit: with template

### E2E Tests
- Step 4 validation run from a stamped project, archived as validation.md

## Deliverables

| File | Purpose | Status |
|------|---------|--------|
| templates/starter/README.md | Consumer handholding doc | Delivered |
| templates/starter/.mcp.json | Working server config | Delivered |
| templates/starter/.gitignore | Secret hygiene | Delivered |
| templates/create.sh | One-command stamp-out | Delivered |
| templates/check.sh | Live drift check | Delivered (green) |
| templates/template.test.mjs | Unit tier | Delivered (4/4) |
| .orchestra/work/003-starter/validation.md | Fresh-project proof | Delivered (PASS, exceeded) |
| CLAUDE.md layout note | templates/ documented | Delivered |

## Acceptance Criteria

### Functional
- [ ] `create.sh /tmp/x "idea"` → ready repo in one command (PRD #1)
- [ ] README covers keyboard + AFK + status workflows as copy-paste steps (PRD #2)
- [ ] Auth documented: env var, never committed, .gitignore enforces (PRD #3)
- [ ] Validation run reaches intake → PRD from the README prompt alone (PRD #4)
- [ ] check.sh green against the live server (PRD #5)

### Unit
- [ ] `node --test templates/template.test.mjs` green

### Integration
- [ ] `templates/check.sh` exits 0

### E2E
- [ ] validation.md archived

## Dependencies

- Merged 002 (runner the README references) — done
- Live deployed server — green as of the 002 preflight

## Risks

| Risk | Mitigation |
|------|-----------|
| README drifts from server/runner reality | check.sh pins the live contract; template lives beside the things it documents |
| Headless validation ≠ a real newcomer's interactive session | Same MCP surface and prompt; noted honestly in validation.md; a human walkthrough is the cheap follow-up |
| Key distribution is still manual | Out of scope here; README says exactly where the key goes and what never gets committed |
