import { describe, it, expect } from 'vitest';
import { handleTool, TOOL_DEFINITIONS } from './tools.js';

describe('TOOL_DEFINITIONS', () => {
  it('exposes exactly 4 tools', () => {
    expect(TOOL_DEFINITIONS).toHaveLength(4);
  });

  it('includes all expected tools', () => {
    const names = TOOL_DEFINITIONS.map(t => t.name);
    expect(names).toContain('orchestra_get_prompt');
    expect(names).toContain('orchestra_get_gates');
    expect(names).toContain('orchestra_list_stages');
    expect(names).toContain('orchestra_devlog_entry');
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

  describe('orchestra_devlog_entry', () => {
    it('returns correct path for Q2 date', () => {
      const result = handleTool('orchestra_devlog_entry', {
        date: '2026-06-09',
        slug: 'test-entry',
        title: 'Test Entry',
        summary: 'A test devlog entry.',
      });
      expect(result.path).toBe('.orchestra/devlog/2026-Q2/2026-06-09-test-entry.md');
    });

    it('returns correct path for Q1 date', () => {
      const result = handleTool('orchestra_devlog_entry', {
        date: '2026-02-01',
        slug: 'q1-entry',
        title: 'Q1 Entry',
        summary: 'A Q1 entry.',
      });
      expect(result.path).toBe('.orchestra/devlog/2026-Q1/2026-02-01-q1-entry.md');
    });

    it('content includes frontmatter, title, and summary', () => {
      const result = handleTool('orchestra_devlog_entry', {
        date: '2026-06-09',
        slug: 'test',
        title: 'My Entry',
        summary: 'Something happened.',
      });
      expect(result.content).toContain('created_on: 2026-06-09');
      expect(result.content).toContain('# 2026-06-09: My Entry');
      expect(result.content).toContain('Something happened.');
    });

    it('content includes details and next when provided', () => {
      const result = handleTool('orchestra_devlog_entry', {
        date: '2026-06-09',
        slug: 'test',
        title: 'My Entry',
        summary: 'Summary.',
        details: 'More detail here.',
        next: 'Do this next.',
      });
      expect(result.content).toContain('## Details');
      expect(result.content).toContain('More detail here.');
      expect(result.content).toContain('## Next');
      expect(result.content).toContain('Do this next.');
    });
  });

  describe('unknown tool', () => {
    it('throws with the tool name in the message', () => {
      expect(() => handleTool('orchestra_nonexistent', {})).toThrow('Unknown tool: orchestra_nonexistent');
    });
  });
});
