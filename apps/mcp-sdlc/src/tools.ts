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
];

function devlogPath(date: string): string {
  const [year, month] = date.split('-');
  const quarter = Math.ceil(parseInt(month) / 3);
  return `.orchestra/devlog/${year}-Q${quarter}/${date}`;
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
  if (details) {
    lines.push('', '## Details', '', details);
  }
  if (next) {
    lines.push('', '## Next', '', next);
  }
  return lines.join('\n');
}

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

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
