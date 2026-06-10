import { STAGES, STAGE_PROMPTS, STAGE_GATES } from '@orchestra/core';
import { SKILLS, SKILL_NAMES } from './skills.generated.js';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: object;
}

export const TOOL_DEFINITIONS: McpTool[] = [
  {
    name: 'orchestra_get_prompt',
    description:
      'Get the system prompt for a given SDLC stage. Most stages have a richer full playbook ' +
      'served as a skill — call orchestra_list_skills to find it (e.g. prd → orchestra-prd, ' +
      'spec → orchestra-spec, execute → orchestra-implement) and orchestra_get_skill to fetch it.',
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
    description:
      'Compose a devlog entry. Returns the file path and formatted markdown content ready to write locally. ' +
      'Before composing the body, call orchestra_get_skill with "orchestra-devlog" and follow that playbook — ' +
      'it defines the structure, style, and quality bar for entries.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'ISO date YYYY-MM-DD' },
        slug: { type: 'string', description: 'Short kebab-case name for the entry, e.g. m2-shipped' },
        title: { type: 'string', description: 'Full title of the entry' },
        body: {
          type: 'string',
          description:
            'Full markdown body of the entry (everything after the H1 — the tool adds frontmatter and title). ' +
            'Compose freely with ## sections: a short Summary, then sections that fit the session — key decisions ' +
            'with rationale, gotchas, what shipped, what comes next. Use lists, tables, and code blocks; include ' +
            'commit hashes, file paths, and test counts. Write readable multi-paragraph prose, not one compressed paragraph.',
        },
      },
      required: ['date', 'slug', 'title', 'body'],
    },
  },
  {
    name: 'orchestra_scaffold',
    description: 'Generate all .orchestra/ scaffold files for a new project. Returns a files array (path + content) ready to write locally, plus readme helpers (create or append the Brief section) and claude_md helpers (create CLAUDE.md or append the Orchestra workflow section to an existing one).',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'ISO date YYYY-MM-DD — used for ADR-000 created_on and devlog quarter dir' },
        project_name: { type: 'string', description: 'Project name — used in README heading if no README exists yet' },
      },
      required: ['date'],
    },
  },
  {
    name: 'orchestra_list_skills',
    description: 'List all Orchestra skills with their descriptions and when to use each. Skills are full playbooks (PRD writing, spec writing, review, merge, etc.) — richer than the stage prompts.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'orchestra_get_skill',
    description:
      'Get the full instructions (SKILL.md body) for an Orchestra skill, plus a manifest of its ' +
      'support files. Follow the returned content as the playbook for that activity. When the ' +
      'playbook says to load a support file (e.g. examples/devlog.md), call this tool again with ' +
      'the file argument to fetch it.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', enum: SKILL_NAMES, description: 'Skill name, e.g. orchestra-prd' },
        file: {
          type: 'string',
          description:
            'Optional path to a support file within the skill directory, e.g. "examples/devlog.md". ' +
            'Omit to get the SKILL.md body plus the list of available support files.',
        },
      },
      required: ['name'],
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
  const { date, title, body, summary, details, next } = args;
  const head = [`---`, `created_on: ${date}`, `---`, ``, `# ${date}: ${title}`, ``];
  if (body) return [...head, body.trim()].join('\n');
  // Legacy skeleton for callers predating the free-form `body` field.
  const lines = [...head, `## Summary`, ``, summary];
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

const CLAUDE_MD_SECTION = `
## Orchestra SDLC — required workflow

This project follows the Orchestra SDLC, served by the \`orchestra-sdlc\` MCP server.
The \`.orchestra/\` directory is the agent knowledge base — read \`roadmap.md\` and
relevant ADRs before acting on any work item.

Before starting any non-trivial work:

1. Call \`orchestra_list_skills\` to see the available playbooks.
2. Call \`orchestra_get_skill\` for the relevant activity (PRD, spec, gherkin,
   implement, review, merge, …) and follow it as the playbook.
3. Respect the gates (\`orchestra_get_gates\`): every work item has a PRD before
   a spec, a spec before implementation. Nothing advances without explicit
   human approval at each gate.

Record sessions with \`orchestra_devlog_entry\` (write the returned file), and
record significant decisions as ADRs in \`.orchestra/adr/\`.
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
        claude_md: {
          create: `# CLAUDE.md\n${CLAUDE_MD_SECTION}`,
          section: CLAUDE_MD_SECTION,
        },
      };
    }

    case 'orchestra_list_skills':
      return {
        skills: SKILL_NAMES.map((n) => ({
          name: n,
          description: SKILLS[n].description,
          when_to_use: SKILLS[n].whenToUse,
        })),
      };

    case 'orchestra_get_skill': {
      const skill = SKILLS[args.name];
      if (!skill) throw new Error(`Unknown skill: ${args.name}`);
      if (args.file) {
        const content = skill.files[args.file];
        if (content === undefined) {
          throw new Error(
            `Unknown file "${args.file}" in skill ${skill.name}. Available: ${Object.keys(skill.files).join(', ') || '(none)'}`,
          );
        }
        return { name: skill.name, file: args.file, content };
      }
      return {
        name: skill.name,
        description: skill.description,
        when_to_use: skill.whenToUse,
        content: skill.content,
        files: Object.keys(skill.files),
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
