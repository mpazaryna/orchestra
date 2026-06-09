---
name: orchestra-spec
description: "Generate an execution spec from an approved PRD — define approach, steps, deliverables, acceptance criteria, and risks."
when_to_use: "Use when a PRD is approved and the work needs a concrete execution plan."
allowed-tools: Read, Glob, Grep, Write
argument-hint: "<prd-path or work-item-name>"
disable-model-invocation: false
---

# Write Spec

Generate an execution spec from an approved PRD. The spec is the contract between the conductor (you) and the orchestra (agents).

## Prerequisites

- A PRD must exist at `.orchestra/work/{id}-{name}/prd.md`
- The PRD should be approved (user has confirmed objective and success criteria)

## Steps

### 1. Read the PRD

- Find the PRD from $ARGUMENTS (path or work item name)
- Read the PRD completely — objective, success criteria, materials table, context
- Read the parent milestone PRD for broader context
- Read any referenced ADRs

### 2. Analyze the Codebase (if applicable)

If the work involves code changes:
- Glob for relevant files mentioned in the PRD
- Read existing patterns and conventions from CLAUDE.md
- Identify integration points and dependencies
- Note existing tests that may need updating

### 3. Design the Approach

Break the work into concrete steps:
- Each step should be independently executable
- Steps should be ordered by dependency
- Identify which steps could be parallelized
- Note which steps need human input vs. agent execution

### 4. Design the Testing Strategy

TDD is mandatory across three tiers. For every spec that involves code, design all three layers before writing the approach steps:

**Unit tests** — mock external boundaries (network, filesystem, DB). Fast, deterministic. Committed before the implementation they cover. Run as the project default suite — no external dependencies required.

**Integration tests** — exercise real subsystems at the boundary being tested (real API, real DB, real filesystem). No mocks at the boundary. Excluded from the default run — require external access. Must include any external API call so redirect behavior, auth, and response shape are verified against reality.

**E2E tests** — exercise the full user-facing interface from end to end (CLI invocation, HTTP endpoint, browser). Hits real external dependencies. Excluded from the default run — require the full running stack.

For each tier, specify:
- Which file(s) hold the tests
- Which behaviors are covered
- What is mocked (unit) or not mocked (integration/E2E)
- The commit ordering constraint (tests before implementation)

### 5. Generate the Spec

Generate the spec with this structure:

- **Title**: Matches the PRD title
- **PRD link**: Relative path to the PRD
- **Status**: Draft
- **Objective**: Restated from PRD
- **Approach**: Step-by-step execution plan with details
- **Testing Strategy**: Explicit unit / integration / E2E sections (see Step 4)
- **Deliverables table**: Concrete output files with paths and status
- **Acceptance criteria**: Separated into Functional, Unit, Integration, and E2E sections
- **Dependencies**: What must exist before each step
- **Risks**: What could go wrong and how to mitigate

### 6. Write the File

Save to: `.orchestra/work/{id}-{name}/spec.md` (alongside the PRD)

Include YAML frontmatter at the top of the file:

```yaml
---
ticket: {ticket-id or slug — matches the work item folder name}
status: draft
created_on: {today's date in YYYY-MM-DD format}
---
```

Status vocabulary for specs: `draft` → `approved` → `in-progress` → `complete`

### 7. Present for Approval

Show the user the spec. Ask:
- Does the approach make sense?
- Are any steps missing or out of order?
- Are the acceptance criteria specific enough for an agent to verify?
- Should any steps be broken into separate tickets?

## Quality Checks

- [ ] Every PRD success criterion maps to at least one acceptance criterion in the spec
- [ ] Steps are ordered by dependency — no step requires output from a later step
- [ ] Deliverables table has concrete file paths, not vague descriptions
- [ ] Risks have mitigations, not just "this could go wrong"
- [ ] An agent reading only this spec could execute the work without asking questions
- [ ] All three test tiers are present: unit, integration, and E2E — each with named files and covered behaviors
- [ ] Integration tests cover any external API or network call so real redirect/auth/shape issues are caught
- [ ] Acceptance criteria are split into Functional / Unit / Integration / E2E sections
- [ ] TDD commit ordering is stated explicitly for each tier

## Spec vs. PRD

| | PRD | Spec |
|---|---|---|
| **Answers** | What and why | How |
| **Audience** | Composer (strategic) | Orchestra (execution) |
| **Language** | Business/outcome | Tactical/technical |
| **Approval** | Before spec | Before implementation |
| **Lifespan** | Until milestone closes | Until work is done |

---

## TDD Policy

Every spec that involves code must plan for three test tiers. All three are non-negotiable. Each tier has a different purpose, a different mocking stance, and a different run profile.

### Tier 1 — Unit Tests

**Purpose:** Verify logic in isolation. Fast, deterministic, no I/O.

**Mocking stance:** Mock everything outside the unit under test — network, filesystem, DB, time. Use purpose-built mocking tools (e.g. `pytest-httpx`, `monkeypatch`, `unittest.mock`).

**Run profile:** Default — `uv run pytest` with no flags. Must pass on every commit.

**What they catch:** Logic errors, branching, edge cases, error paths.

**What they do NOT catch:** Redirect behavior, real API response shape, real DB schema changes, real filesystem permissions — anything that only exists at the real boundary.

**TDD constraint:** Test file committed before the implementation file it covers.

---

### Tier 2 — Integration Tests

**Purpose:** Verify that the code works correctly against the real external boundary — the actual API, the actual DB, the actual filesystem. This is where mocks lie and reality bites.

**Mocking stance:** No mocks at the boundary being tested. If you are testing an HTTP API integration, hit the real HTTP endpoint. If you are testing a DB layer, use a real DB. Internal helpers may still be mocked if they are not the subject of the test.

**Run profile:** `uv run pytest -m integration` — excluded from the default run because they are slow and require network/external access.

**What they catch:** Redirect chains, auth failures, unexpected response shapes, rate limits, SSL issues, schema drift — anything that only reveals itself against the real system.

**What they do NOT catch:** Full user-facing behavior or multi-layer interaction.

**TDD constraint:** Integration test file committed before the integration implementation it covers.

> **Mandatory rule:** Any spec that touches an external API, database, or remote service MUST include at least one integration test that hits the real endpoint. "We tested it with mocks" is not sufficient. Mocks encode assumptions; integration tests verify them.

---

### Tier 3 — E2E Tests

**Purpose:** Verify the complete user-facing interface from entry point to output, exercising the full stack with real external dependencies.

**Mocking stance:** Nothing mocked. The test invokes the system exactly as a user would — CLI command, HTTP request, UI action.

**Run profile:** `uv run pytest -m e2e` — excluded from the default run. May require live credentials or network access.

**What they catch:** Wiring failures between layers, misconfigured entry points, broken CLI argument parsing, missing env vars in production config, deployment regressions.

**What they do NOT catch:** Fine-grained logic (that's unit territory) or boundary-specific behavior (that's integration territory).

**TDD constraint:** E2E test file committed before the final wiring that makes it pass.

---

### Mocking Decision Table

| Scenario | Unit | Integration | E2E |
|----------|------|-------------|-----|
| External HTTP API | Mock with `pytest-httpx` | **Hit real endpoint** | **Hit real endpoint** |
| Database | Mock or in-memory | **Real DB** | **Real DB** |
| Filesystem | `tmp_path` fixture | **Real filesystem** | **Real filesystem** |
| Time / clock | `monkeypatch` | Real time | Real time |
| Internal functions | Mock if needed | Real | Real |

---

### Tooling by Stack

Pick the right tools for the stack. The three-tier rule is language-agnostic; the tools are not.

#### Python

| Tier | Tools |
|------|-------|
| Unit | `pytest`, `pytest-httpx` (HTTP mocking), `monkeypatch` (env/time/functions), `tmp_path` (filesystem) |
| Integration | `pytest` + `@pytest.mark.integration`, real `httpx`/`requests` calls, real DB via `pytest-postgresql` / `pytest-mongo` / SQLite |
| E2E | `pytest` + `@pytest.mark.e2e`, `subprocess` or `click.testing.CliRunner` against real dependencies |

Run profiles:
```bash
uv run pytest                        # unit only (default)
uv run pytest -m integration         # integration suite
uv run pytest -m e2e                 # E2E suite
uv run pytest -m "integration or e2e" # all live tests
```

#### TypeScript / Node

| Tier | Tools |
|------|-------|
| Unit | `vitest` or `jest`, `msw` (Mock Service Worker for HTTP), `vi.mock` / `jest.mock` |
| Integration | `vitest` / `jest` with real HTTP (`fetch`/`axios`), real DB via `testcontainers` or a local instance |
| E2E | **Playwright** — full browser automation, also works for API-level E2E via `request` context |

Run profiles:
```bash
npx vitest run                       # unit only
npx vitest run --project integration # integration suite
npx playwright test                  # E2E suite
```

#### Web UI (any stack)

For anything with a browser interface, **Playwright is the default E2E tool**. Prefer the **Playwright MCP** (`dev-playwright` skill) when generating tests — it drives a real browser, explores the UI, and produces assertions grounded in what the page actually renders rather than what the code assumes it renders.

```bash
npx playwright test                  # run all E2E specs
npx playwright test --ui             # interactive mode
```

Key Playwright practices for specs:
- Record tests against the real running UI, not against mocked API responses
- Use `page.getByRole` / `page.getByLabel` locators — more resilient than CSS selectors
- Test the happy path and at least one failure path (form validation, API error state)
- Run against a real backend (staging or local with seeded data) — not a mocked server

---

### The Rule in One Sentence

> Mocks are allowed in unit tests to keep them fast and isolated. Integration tests MUST hit the real system at the boundary being tested — no exceptions. E2E tests MUST invoke the real user interface against the real stack.

Violating this rule means tests can pass while the system is broken in production. A common failure mode: all unit tests pass against mocked responses, but the real external service returns a redirect or unexpected shape that the mock never encoded — crashing the system at runtime in a way no unit test could have caught.

---

### TDD as an Agentic Essential

In human-paced development, a regression is caught within minutes — someone runs the app and notices it's broken. In agentic development, an autonomous agent can execute dozens of steps, commit multiple files, and close a milestone before anyone looks at the output. Regressions don't surface until review, or worse, production.

**Tests are the agent's conscience.** They are the only mechanism that runs continuously, independent of the agent's intent, and reports objective truth about the system state. An agent that writes no tests is operating on faith that its own reasoning is correct — and agents, like humans, make mistakes.

**The "do no harm" principle:** Every spec must treat the existing test suite as a hard constraint. Before implementing anything new:

1. Run the full suite and record the baseline — every test must be passing
2. No new commit should leave the suite in a failing state
3. If a new feature requires changing existing behavior, update the affected tests explicitly and justify the change — do not silently delete or weaken assertions to make tests pass

**Regressions are silent failures.** A test that was passing and now fails is information. A test that was deleted to avoid a failure is deception. Agents must never remove or weaken a test to make a build green — if a test is failing, stop, surface it, and resolve the root cause.

**Milestones build on each other.** In a multi-milestone project like this one, each milestone's test suite is inherited by the next. The integration tests from Live Rates must still pass when Multi-Currency ships. The E2E tests from Basic Converter must still pass at Polish & Ship. The full suite across all milestones is the definition of "the system works."

> **For autonomous agents running long loops:** run `uv run pytest` (or the equivalent) at the start of every session before touching code, and at the end of every step before committing. A red suite is a stop signal, not a obstacle to route around.
