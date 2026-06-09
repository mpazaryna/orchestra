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
];

export function handleTool(name: string, args: Record<string, string>) {
  switch (name) {
    case 'orchestra_get_prompt':
      return { prompt: STAGE_PROMPTS[args.stage as keyof typeof STAGE_PROMPTS] };

    case 'orchestra_get_gates':
      return { gates: STAGE_GATES[args.stage as keyof typeof STAGE_GATES] };

    case 'orchestra_list_stages':
      return { stages: [...STAGES] };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
