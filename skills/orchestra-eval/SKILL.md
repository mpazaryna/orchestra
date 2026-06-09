---
name: orchestra-eval
description: "Grade the outputs of an orchestra skill run against its eval assertions — reads produced files, checks each assertion, and writes a grading report."
when_to_use: "Use after running an orchestra skill to verify it produced correct outputs. Run orchestra-eval <skill-name> [work-item-id] in the project where the skill was just executed."
allowed-tools: Read, Glob, Grep, Bash, Write
argument-hint: "<skill-name> [work-item-id]"
---

# Orchestra Eval

Grade an orchestra skill's output against its eval assertions. This skill does not run the skill under test — it grades what was already produced.

## Variables

SKILL_NAME: first word of $ARGUMENTS
WORK_ITEM: second word of $ARGUMENTS (optional)

## Step 1: Load the Eval Suite

Find the skill's evals.json:

```bash
${CLAUDE_SKILL_DIR}/../{SKILL_NAME}/evals/evals.json
```

If the file doesn't exist, stop: "No evals found for {SKILL_NAME}. Add evals/evals.json to the skill directory."

Read the file. Note how many test cases exist.

## Step 2: Identify the Work Item

The grader needs to know which output to evaluate.

**If WORK_ITEM is provided in $ARGUMENTS:**
- Use `.orchestra/work/{WORK_ITEM}/` as the output directory

**If no WORK_ITEM:**
- Glob `.orchestra/work/*/` to find all work items
- Find the most recently modified one:
  ```bash
  ls -t .orchestra/work/ | head -1
  ```
- Use that as the work item
- Report which work item was auto-detected

If no work items exist, stop: "No .orchestra/work/ items found in this project. Run the skill first, then eval."

## Step 3: Grade Each Test Case

For each test case in evals.json, grade every assertion. Record PASS or FAIL with specific evidence.

### Assertion types and how to check them

**File existence** — "X file exists at path":
```bash
ls .orchestra/work/{id}/prd.md 2>/dev/null && echo "EXISTS" || echo "MISSING"
```
PASS if file exists and is non-empty. FAIL if missing or empty.

**Section presence** — "contains a ## X section":
```bash
grep -c "^## X" .orchestra/work/{id}/prd.md
```
PASS if count > 0. FAIL if absent.

**Frontmatter field** — "frontmatter has status: approved":
```bash
grep "^status:" .orchestra/work/{id}/prd.md
```
PASS if value matches. FAIL if missing or wrong value.

**Absence checks** — "contains no X":
Read the file content. Look for the prohibited term or pattern.
- For "no framework or library names": scan for: pytest, click, argparse, zoneinfo, pytz, flask, fastapi, django, httpx, requests, sqlalchemy, pydantic
- For "no HTTP method names": scan for: GET, POST, PUT, DELETE, PATCH as standalone words
- For "no endpoint paths": scan for patterns like /api/, /v1/, starting with /
- For "no technical implementation language": use model judgment — read the section and evaluate whether it describes outcomes or implementations
PASS if prohibited content is absent. FAIL with the specific term or line found.

**Count assertions** — "at least N X":
Count the relevant items and compare.

**Model judgment assertions** — assertions about quality, tone, or semantic content that can't be mechanically verified:
Read the relevant section and reason about whether it passes. State explicitly: "Model judgment: [reasoning]. Result: PASS/FAIL."

### Grading rules

- **Require evidence for every PASS.** Quote the file content or show the grep result.
- **Require specifics for every FAIL.** Name the exact term, missing section, or wrong value.
- **Never give benefit of the doubt.** If an assertion says "contains no technical language" and the file has one framework name, that's a FAIL even if everything else is clean.

## Step 4: Write the Grading Report

Write to `.orchestra/eval/{skill-name}/{date}-{work-item}.json`:

```json
{
  "skill": "{skill-name}",
  "work_item": "{id}",
  "graded_at": "{YYYY-MM-DD}",
  "test_cases": [
    {
      "id": 1,
      "prompt": "{prompt from evals.json}",
      "assertion_results": [
        {
          "text": "{assertion text}",
          "passed": true,
          "evidence": "{quoted content or command output that confirms it}"
        },
        {
          "text": "{assertion text}",
          "passed": false,
          "evidence": "{exactly what was found or missing}"
        }
      ],
      "summary": {
        "passed": N,
        "failed": N,
        "total": N,
        "pass_rate": 0.NN
      }
    }
  ],
  "overall": {
    "passed": N,
    "failed": N,
    "total": N,
    "pass_rate": 0.NN
  }
}
```

Create `.orchestra/eval/` directory if it doesn't exist.

## Step 5: Report to User

Present a clean summary:

```
## Eval: {skill-name} — {work-item}

Overall: {passed}/{total} assertions passed ({pass_rate}%)

### Test Case 1
✓ prd.md exists at .orchestra/work/{id}/prd.md
✓ prd.md frontmatter has status: approved
✓ prd.md contains a ## Problem section
✗ prd.md contains no framework or library names
  → Found "pytest" in line 12: "Success criteria: pytest tests pass"
✓ spec.md contains a ### Unit Tests subsection
...

### Failed Assertions ({N} total)
1. [test-1] prd.md contains no framework or library names
   → Found "pytest" in line 12
2. [test-1] gherkin-spec.md contains at least one error scenario
   → No scenario with error, invalid, or fail in its name

### Next Steps
Fix the {N} failing assertions in {skill-name}/SKILL.md then re-run the skill and eval.
```

## Rules

- Grade the assertions in evals.json for the relevant test case, not all test cases — match by which test case fits what was produced
- If multiple test cases exist and only one was run, grade the one whose prompt best matches the produced work item
- Do not modify the skill under test — only read and grade
- The grading.json is the authoritative record; the console output is for the human

## Hard Stop

After presenting the report and writing grading.json, **stop completely**. Do not:
- Run any other skill
- Start any new work
- Interpret project state as a signal to do something
- Invoke orchestra-plan, orchestra-implement, or any other skill

Your job is grading. It ends when the report is written.
