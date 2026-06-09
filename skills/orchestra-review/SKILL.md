---
name: orchestra-review
description: "Review a completed implementation branch against its spec and acceptance criteria — catch gaps, shortcuts, and quality issues before merge."
when_to_use: "Use when an implementation branch is complete and ready for review."
allowed-tools: Read, Glob, Grep, Bash, Write
argument-hint: "<spec-path or work-item-name>"
---

# Review

Validate a completed implementation against its spec. Check every acceptance criterion, catch shortcuts or incomplete work, and produce a clear pass/fail verdict before the branch is merged.

## Prerequisites

- Spec `status` must be `complete`
- An `impl/{ticket-id}` branch must exist with commits
- Working tree must be on the `impl/{ticket-id}` branch or you must be able to read it

## Steps

### 1. Load the Spec and Branch

- Locate the spec from $ARGUMENTS (path or work item name)
- Read the spec: objective, approach steps, deliverables table, acceptance criteria
- Read the PRD for original intent
- Confirm the branch exists:
  ```bash
  git log impl/{ticket-id} --oneline
  ```
- Review the full diff against main:
  ```bash
  git diff main...impl/{ticket-id}
  ```

### 2. Check Every Acceptance Criterion

Work through each criterion from the spec one by one:

- Read the criterion
- Find the evidence in the diff or deliverables
- Mark **PASS** or **FAIL** with specific file/line evidence
- Do not mark PASS without evidence — "looks fine" is not evidence

### 3. Verify the Deliverables Table

For each row in the spec's deliverables table:

- Confirm the file exists at the specified path
- Confirm it is non-empty and contains real content, not a placeholder
- Flag any deliverable marked delivered but missing or incomplete

### 4. Spot-Check the Implementation

Review the diff for quality issues beyond the acceptance criteria:

- Shortcuts or workarounds that technically pass criteria but are fragile
- Hard-coded values that should be dynamic
- Missing error handling at system boundaries
- Spec steps that appear skipped or only partially executed
- Anything that would surprise a future reader

**TDD tier check — treat missing tiers as a FAIL:**
- Unit tests present and committed before their implementation? If not: FAIL
- Integration tests present for any external boundary (network, DB, filesystem)? If absent: FAIL
- E2E tests present for the user-facing interface (CLI, HTTP endpoint)? If absent: FAIL
- Are integration tests hitting the real boundary (no mocks at the seam being tested)? If mocked: FAIL

### 5. Produce the Verdict

Output a structured review report:

```
## Review: {ticket-id}

**Verdict:** PASS | FAIL

### Acceptance Criteria
- [ ] {criterion 1} — PASS: {evidence}
- [ ] {criterion 2} — FAIL: {what's missing}

### Deliverables
- {path} — present / missing / incomplete

### Issues
{list any quality issues found, or "None"}

### Required Before Merge
{list blocking items if FAIL, or "None — ready for /orchestra-merge"}
```

### 6. If FAIL — Do Not Merge

If the verdict is FAIL:
- List each blocking issue clearly
- Do not update the spec status
- Signal: return to `/orchestra-implement` to address the issues, then re-run `/orchestra-review`

### 7. If PASS — Update Status

Update the spec frontmatter:

```yaml
status: reviewed
```

Signal: ready for `/orchestra-merge`

### 8. Write the Devlog

After producing the verdict, write a devlog entry regardless of PASS or FAIL.

File path: `.orchestra/devlog/{YYYY}-Q{N}/{YYYY-MM-DD}-review-{ticket-id}.md`

```markdown
---
created_on: {YYYY-MM-DD}
---

# {YYYY-MM-DD}: Review — {ticket-id}

## Verdict
{PASS | FAIL}

## What Was Reviewed
{1–2 sentences: what the work item did and what was checked}

## Findings
{Key passing criteria, failing criteria, and quality issues found.
Be specific — file paths, criterion names, what evidence was or wasn't there.}

## Next Step
{If PASS: ready for /orchestra-merge}
{If FAIL: return to /orchestra-implement — list the blocking issues}
```

## Quality Checks

- [ ] Every acceptance criterion evaluated with evidence, not assumed
- [ ] Every deliverable in the materials table confirmed to exist
- [ ] Diff reviewed for shortcuts or incomplete steps
- [ ] Verdict is unambiguous — PASS or FAIL, not "mostly done"
- [ ] If the work item involves code: all three test tiers confirmed present (unit, integration, E2E) — absence of any tier is a FAIL
- [ ] If the work item involves code: integration tests verified to hit real boundaries (not mocked at the seam)
- [ ] If the work item involves code: TDD commit ordering verified for all tiers
- [ ] Devlog written regardless of verdict

## Boundaries

- Do not fix issues found — report them and return to `/orchestra-implement`
- Do not merge — that is `/orchestra-merge`
- Do not push the branch
