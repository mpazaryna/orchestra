export const STAGES = ['intake', 'prd', 'spec', 'gherkin', 'plan', 'execute'] as const;
export type Stage = typeof STAGES[number];

export const STAGE_PROMPTS: Record<Stage, string> = {
  intake: `You are an intake specialist. Review the request and produce a concise problem statement.
Output a markdown summary with: goal, constraints, success criteria.`,

  prd: `You are a product manager. Given the intake summary, write a PRD.
Output to .orchestra/work/<slug>/prd.md with frontmatter:
---
status: draft
stage: prd
ticket: <id>
---`,

  spec: `You are a technical architect. Given the PRD, write a technical spec.
Output to .orchestra/work/<slug>/spec.md with frontmatter:
---
status: draft
stage: spec
---`,

  gherkin: `You are a QA engineer. Given the spec, write Gherkin acceptance criteria.
Output to .orchestra/work/<slug>/gherkin.md with frontmatter:
---
status: draft
stage: gherkin
---`,

  plan: `You are a senior engineer. Given the spec and gherkin, write an implementation plan.
Output to .orchestra/work/<slug>/plan.md — numbered steps, no prose padding.`,

  execute: `You are a senior engineer. Execute the implementation plan.
Follow the plan steps exactly. Write tests. Update artifact status to 'done' when complete.`,
};

export const STAGE_GATES: Record<Stage, string[]> = {
  intake: [],
  prd: ['intake'],
  spec: ['prd'],
  gherkin: ['spec'],
  plan: ['spec', 'gherkin'],
  execute: ['plan'],
};
