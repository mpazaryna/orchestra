import { STAGES, STAGE_PROMPTS, STAGE_GATES } from '@orchestra/core';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: object;
}

export const TOOL_DEFINITIONS: McpTool[] = [
  {
    name: 'orchestra_get_prompt',
    description: 'Get the system prompt for a given SDLC stage.',
    inputSchema: {
      type: 'object',
      properties: {
        stage: { type: 'string', enum: [...STAGES] },
      },
      required: ['stage'],
    },
  },
  {
    name: 'orchestra_get_gates',
    description: 'Get the prerequisite stages that must be complete before advancing to a stage.',
    inputSchema: {
      type: 'object',
      properties: {
        stage: { type: 'string', enum: [...STAGES] },
      },
      required: ['stage'],
    },
  },
  {
    name: 'orchestra_list_stages',
    description: 'List all SDLC stages in order.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'orchestra_devlog_entry',
    description: 'Compose a devlog entry. Returns the file path and formatted markdown content ready to write locally.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'ISO date YYYY-MM-DD' },
        slug: { type: 'string', description: 'Short kebab-case name for the entry, e.g. m2-shipped' },
        title: { type: 'string', description: 'Full title of the entry' },
        summary: { type: 'string', description: '1-3 sentence summary of what happened' },
        details: { type: 'string', description: 'Body content — decisions, findings, context' },
        next: { type: 'string', description: 'What comes next' },
      },
      required: ['date', 'slug', 'title', 'summary'],
    },
  },
  {
    name: 'orchestra_scaffold',
    description: 'Generate all .orchestra/ scaffold files for a new project. Returns a files array (path + content) ready to write locally, plus readme helpers for creating or appending the Brief section.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'ISO date YYYY-MM-DD — used for ADR-000 created_on and devlog quarter dir' },
        project_name: { type: 'string', description: 'Project name — used in README heading if no README exists yet' },
      },
      required: ['date'],
    },
  },
];

// ── devlog helpers ────────────────────────────────────────────────────────────

function devlogPath(date: string): string {
  const [year, month] = date.split('-');
  const quarter = Math.ceil(parseInt(month) / 3);
  return `.orchestra/devlog/${year}-Q${quarter}/${date}`;
}

function devlogQuarterDir(date: string): string {
  const [year, month] = date.split('-');
  const quarter = Math.ceil(parseInt(month) / 3);
  return `.orchestra/devlog/${year}-Q${quarter}`;
}

function devlogContent(args: Record<string, string>): string {
  const { date, title, summary, details, next } = args;
  const lines = [
    `---`,
    `created_on: ${date}`,
    `---`,
    ``,
    `# ${date}: ${title}`,
    ``,
    `## Summary`,
    ``,
    summary,
  ];
  if (details) lines.push('', '## Details', '', details);
  if (next) lines.push('', '## Next', '', next);
  return lines.join('\n');
}

// ── scaffold helpers ──────────────────────────────────────────────────────────

const ORCHESTRA_README = `# .orchestra/

Agent knowledge base for this project. All agents read this folder before acting.

## Structure

- \`roadmap.md\` — The score. Project vision and milestone index.
- \`adr/\` — Architecture Decision Records. Decisions that affect future agents.
- \`work/\` — Per-work-item folders. Each contains a PRD, spec, and gherkin.
- \`uml/\` — Mermaid diagrams for architecture, workflows, and state machines.
- \`devlog/\` — Chronological journal of development sessions.

## The Loop

\`\`\`
/orchestra-roadmap   → define vision and milestones
/orchestra-plan      → PRD → Spec → Gherkin for a work item
/orchestra-implement → execute an approved spec
/orchestra-review    → validate implementation against spec
/orchestra-merge     → merge and close the work item
\`\`\`

## Rules

- Agents read the roadmap and relevant ADRs before acting on any work item
- Every work item has a PRD before a spec; every spec before implementation
- Nothing moves forward without explicit human approval at each gate
`;

function adr000(date: string): string {
  return `---
id: ADR-000
status: accepted
created_on: ${date}
---

# ADR-000: The Score

## Decision

This project uses Orchestra — a software development lifecycle encoded for agents. PRDs are the unit of work. Every significant piece of work has a PRD before a spec, and a spec before implementation.

## Rationale

Without a written PRD, work drifts. Without a spec, agents have no contract to
execute against. Without Gherkin, there is no definition of done an agent can verify.

The \`.orchestra/\` folder is the shared knowledge base. Agents read it. Humans update
it at each gate. The score doesn't change mid-performance without a new ADR.

## Consequences

- No implementation without an approved spec
- No spec without an approved PRD
- All significant architectural decisions are recorded as ADRs
`;
}

const PRD_TEMPLATE = `---
ticket:
status: draft
created_on:
---

# {Title}

## Objective
{What does "done" look like? 1–2 sentences.}

## Success Criteria
- [ ] {Testable criterion}

## Context
{Why this matters. Which milestone it serves.}

## Materials

| Deliverable | Location | Status |
|-------------|----------|--------|
| | | Not Started |

## References

## Notes
`;

const SPEC_TEMPLATE = `---
ticket:
status: draft
created_on:
---

# {Title}

> PRD: {path}

## Objective
{Restated from PRD}

## Approach

### Step 1: {name}

## Testing Strategy

### Unit Tests
### Integration Tests
### E2E Tests

## Deliverables

| File | Purpose | Status |
|------|---------|--------|

## Acceptance Criteria

### Functional
### Unit
### Integration
### E2E

## Dependencies

## Risks

| Risk | Mitigation |
|------|-----------|
`;

const README_BRIEF_SECTION = `
## Brief

**Vision:** {what done looks like at the highest level — fill this in}
**Audience:** {who benefits — fill this in}
`;

function readmeCreate(projectName: string): string {
  return `# ${projectName}

> {one-line description — fill this in}

## Brief

**Vision:** {what done looks like at the highest level — fill this in}
**Audience:** {who benefits — fill this in}

## Usage

{fill in after first milestone ships}
`;
}

function scaffoldFiles(date: string): Array<{ path: string; content: string }> {
  return [
    { path: '.orchestra/README.md', content: ORCHESTRA_README },
    { path: '.orchestra/adr/ADR-000-the-score.md', content: adr000(date) },
    { path: '.orchestra/work/TEMPLATES/prd.md', content: PRD_TEMPLATE },
    { path: '.orchestra/work/TEMPLATES/spec.md', content: SPEC_TEMPLATE },
    { path: `${devlogQuarterDir(date)}/.gitkeep`, content: '' },
    { path: '.orchestra/uml/.gitkeep', content: '' },
  ];
}

// ── tool router ───────────────────────────────────────────────────────────────

export function handleTool(name: string, args: Record<string, string>) {
  switch (name) {
    case 'orchestra_get_prompt':
      return { prompt: STAGE_PROMPTS[args.stage as keyof typeof STAGE_PROMPTS] };

    case 'orchestra_get_gates':
      return { gates: STAGE_GATES[args.stage as keyof typeof STAGE_GATES] };

    case 'orchestra_list_stages':
      return { stages: [...STAGES] };

    case 'orchestra_devlog_entry': {
      const dir = devlogPath(args.date);
      return {
        path: `${dir}-${args.slug}.md`,
        content: devlogContent(args),
      };
    }

    case 'orchestra_scaffold': {
      return {
        files: scaffoldFiles(args.date),
        readme: {
          create: readmeCreate(args.project_name || 'my-project'),
          brief_section: README_BRIEF_SECTION,
        },
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
