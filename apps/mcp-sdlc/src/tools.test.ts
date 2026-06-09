import { describe, it, expect } from 'vitest';
import { handleTool, TOOL_DEFINITIONS } from './tools.js';

describe('TOOL_DEFINITIONS', () => {
  it('exposes exactly 3 tools', () => {
    expect(TOOL_DEFINITIONS).toHaveLength(3);
  });

  it('includes orchestra_get_prompt, orchestra_get_gates, orchestra_list_stages', () => {
    const names = TOOL_DEFINITIONS.map(t => t.name);
    expect(names).toContain('orchestra_get_prompt');
    expect(names).toContain('orchestra_get_gates');
    expect(names).toContain('orchestra_list_stages');
  });
});

describe('handleTool', () => {
  describe('orchestra_get_prompt', () => {
    it('returns a non-empty prompt for each stage', () => {
      for (const stage of ['intake', 'prd', 'spec', 'gherkin', 'plan', 'execute']) {
        const result = handleTool('orchestra_get_prompt', { stage });
        expect(result).toHaveProperty('prompt');
        expect(typeof result.prompt).toBe('string');
        expect((result.prompt as string).length).toBeGreaterThan(10);
      }
    });
  });

  describe('orchestra_get_gates', () => {
    it('returns an array of gate stages', () => {
      const result = handleTool('orchestra_get_gates', { stage: 'spec' });
      expect(result).toHaveProperty('gates');
      expect(Array.isArray(result.gates)).toBe(true);
      expect(result.gates).toContain('prd');
    });

    it('returns empty gates for intake (no prerequisites)', () => {
      const result = handleTool('orchestra_get_gates', { stage: 'intake' });
      expect(result.gates).toHaveLength(0);
    });
  });

  describe('orchestra_list_stages', () => {
    it('returns all 6 stages in order', () => {
      const result = handleTool('orchestra_list_stages', {});
      expect(result).toHaveProperty('stages');
      expect(result.stages).toEqual(['intake', 'prd', 'spec', 'gherkin', 'plan', 'execute']);
    });
  });

  describe('unknown tool', () => {
    it('throws with the tool name in the message', () => {
      expect(() => handleTool('orchestra_nonexistent', {})).toThrow('Unknown tool: orchestra_nonexistent');
    });
  });
});
