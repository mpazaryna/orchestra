---
name: orchestra-merge
description: "Merge a reviewed implementation branch into main — resolve conflicts, close the work item, and clean up the branch."
when_to_use: "Use when an implementation has passed review and is ready to ship."
allowed-tools: Read, Glob, Write, Edit, Bash
argument-hint: "<spec-path or work-item-name>"
---

# Merge

Merge a reviewed implementation branch into main. Resolve any conflicts, close the work item, and clean up.

## Prerequisites

- Spec `status` must be `reviewed`
- `impl/{ticket-id}` branch must exist
- Review must have produced a PASS verdict

## Steps

### 1. Load the Spec

- Locate the spec from $ARGUMENTS (path or work item name)
- Confirm `status: reviewed` in the frontmatter — stop if not reviewed
- Note the branch name: `impl/{ticket-id}`

### 2. Sync with Main

Ensure main is up to date before merging:

```bash
git checkout main
git pull
```

### 3. Merge the Branch

```bash
git merge impl/{ticket-id} --no-ff -m "feat({ticket-id}): {spec title}"
```

Use `--no-ff` to preserve the branch history as a distinct unit of work.

### 4. Resolve Conflicts If Any

If conflicts arise:

- Read each conflicting file fully before resolving
- Prefer the implementation branch's intent — it was reviewed
- If a conflict involves logic that is genuinely ambiguous, stop and surface it to the user rather than guessing
- After resolving all conflicts, stage and complete the merge:
  ```bash
  git add .
  git commit -m "feat({ticket-id}): merge impl branch, resolve conflicts"
  ```

### 5. Mark Closed

Update the spec frontmatter:

```yaml
status: closed
```

Commit:

```bash
git add .orchestra/work/{id}-{name}/spec.md
git commit -m "chore({ticket-id}): close work item"
```

### 6. Delete the Branch

```bash
git branch -d impl/{ticket-id}
```

Only delete after a successful merge — confirm `git branch -d` (safe delete) not `-D` (force).

### 7. Update the Roadmap

Find the row for this milestone in `.orchestra/roadmap.md` and update its status to `Done`:

```markdown
| {Milestone Name} | .orchestra/work/{slug}/prd.md | Done |
```

Commit alongside any other cleanup:

```bash
git add .orchestra/roadmap.md
git commit -m "chore({ticket-id}): update roadmap status to Done"
```

### 8. Push to Origin

```bash
git push
```

### 9. Report

Output a concise summary:

- Merged branch and commit range
- Conflicts resolved (if any) and how
- Work item closed
- Roadmap updated
- Pushed to origin
- Final status: `closed`

## Quality Checks

- [ ] Spec status was `reviewed` before proceeding — not `complete` or `draft`
- [ ] `--no-ff` used to preserve branch history
- [ ] No conflicts left unresolved
- [ ] Branch deleted cleanly with `-d` (not `-D`)
- [ ] Spec status updated to `closed`
- [ ] Roadmap row updated to `Done`
- [ ] Pushed to origin

## Boundaries

- Do not close the branch if the merge failed — leave it for inspection
- Do not skip the status check — merging an unreviewed branch defeats the pipeline
