import { Think } from '@cloudflare/think';
import { createAnthropic } from '@ai-sdk/anthropic';
import { tool } from 'ai';
import { z } from 'zod';
import { STAGE_PROMPTS, STAGE_GATES, STAGES } from '@orchestra/core';
import { SYSTEM_PROMPT } from './prompt.js';

export interface Env {
  ANTHROPIC_API_KEY: string;
}

export class OrchestraAgent extends Think<Env> {
  getModel() {
    const anthropic = createAnthropic({ apiKey: this.env.ANTHROPIC_API_KEY });
    return anthropic('claude-sonnet-4-6');
  }

  getSystemPrompt() {
    return SYSTEM_PROMPT;
  }

  getTools() {
    return {
      get_stage_prompt: tool({
        description: 'Get the system prompt for a given SDLC stage.',
        inputSchema: z.object({ stage: z.enum(STAGES) }),
        execute: async ({ stage }) => ({ prompt: STAGE_PROMPTS[stage] }),
      }),

      check_gates: tool({
        description: 'Get the prerequisite stages that must be complete before advancing.',
        inputSchema: z.object({ stage: z.enum(STAGES) }),
        execute: async ({ stage }) => ({ gates: STAGE_GATES[stage] }),
      }),

      list_stages: tool({
        description: 'List all SDLC stages in pipeline order.',
        inputSchema: z.object({}),
        execute: async () => ({ stages: [...STAGES] }),
      }),
    };
  }

  getScheduledTasks() {
    return [];
  }
}
