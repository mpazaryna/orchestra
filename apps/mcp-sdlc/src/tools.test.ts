import { describe, it, expect } from 'vitest';
import { handleTool, TOOL_DEFINITIONS } from './tools.js';

describe('TOOL_DEFINITIONS', () => {
  it('exposes exactly 7 tools', () => {
    expect(TOOL_DEFINITIONS).toHaveLength(7);
  });

  it('includes all expected tools', () => {
    const names = TOOL_DEFINITIONS.map(t => t.name);
    expect(names).toContain('orchestra_get_prompt');
    expect(names).toContain('orchestra_get_gates');
    expect(names).toContain('orchestra_list_stages');
    expect(names).toContain('orchestra_devlog_entry');
    expect(names).toContain('orchestra_scaffold');
    expect(names).toContain('orchestra_list_skills');
    expect(names).toContain('orchestra_get_skill');
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

  describe('orchestra_scaffold', () => {
    it('returns 6 files for a Q2 date', () => {
      const result = handleTool('orchestra_scaffold', { date: '2026-06-10', project_name: 'my-app' });
      expect(result.files).toHaveLength(6);
    });

    it('devlog .gitkeep is in the correct quarter dir', () => {
      const result = handleTool('orchestra_scaffold', { date: '2026-06-10', project_name: 'my-app' });
      const paths = result.files.map((f: { path: string }) => f.path);
      expect(paths).toContain('.orchestra/devlog/2026-Q2/.gitkeep');
    });

    it('devlog .gitkeep is in Q1 for a January date', () => {
      const result = handleTool('orchestra_scaffold', { date: '2026-01-15', project_name: 'my-app' });
      const paths = result.files.map((f: { path: string }) => f.path);
      expect(paths).toContain('.orchestra/devlog/2026-Q1/.gitkeep');
    });

    it('all expected paths are present', () => {
      const result = handleTool('orchestra_scaffold', { date: '2026-06-10', project_name: 'my-app' });
      const paths = result.files.map((f: { path: string }) => f.path);
      expect(paths).toContain('.orchestra/README.md');
      expect(paths).toContain('.orchestra/adr/ADR-000-the-score.md');
      expect(paths).toContain('.orchestra/work/TEMPLATES/prd.md');
      expect(paths).toContain('.orchestra/work/TEMPLATES/spec.md');
      expect(paths).toContain('.orchestra/uml/.gitkeep');
    });

    it('ADR-000 contains the supplied date', () => {
      const result = handleTool('orchestra_scaffold', { date: '2026-06-10', project_name: 'my-app' });
      const adr = result.files.find((f: { path: string }) => f.path === '.orchestra/adr/ADR-000-the-score.md');
      expect(adr.content).toContain('created_on: 2026-06-10');
    });

    it('readme.create contains the project name', () => {
      const result = handleTool('orchestra_scaffold', { date: '2026-06-10', project_name: 'my-app' });
      expect(result.readme.create).toContain('# my-app');
    });

    it('readme.create defaults to my-project when no project_name given', () => {
      const result = handleTool('orchestra_scaffold', { date: '2026-06-10' });
      expect(result.readme.create).toContain('# my-project');
    });

    it('readme.brief_section contains the Brief heading', () => {
      const result = handleTool('orchestra_scaffold', { date: '2026-06-10', project_name: 'my-app' });
      expect(result.readme.brief_section).toContain('## Brief');
    });
  });

  describe('orchestra_list_skills', () => {
    it('returns all 17 skills with name, description, and when_to_use', () => {
      const result = handleTool('orchestra_list_skills', {});
      expect(result.skills).toHaveLength(17);
      for (const skill of result.skills) {
        expect(skill.name).toMatch(/^orchestra-/);
        expect(skill.description.length).toBeGreaterThan(10);
      }
    });

    it('includes the core loop skills', () => {
      const result = handleTool('orchestra_list_skills', {});
      const names = result.skills.map((s: { name: string }) => s.name);
      for (const expected of ['orchestra-roadmap', 'orchestra-prd', 'orchestra-spec', 'orchestra-gherkin', 'orchestra-plan', 'orchestra-implement', 'orchestra-review', 'orchestra-merge']) {
        expect(names).toContain(expected);
      }
    });
  });

  describe('orchestra_get_skill', () => {
    it('returns full content for a known skill', () => {
      const result = handleTool('orchestra_get_skill', { name: 'orchestra-prd' });
      expect(result.name).toBe('orchestra-prd');
      expect(result.content).toContain('# Write PRD');
      expect((result.content as string).length).toBeGreaterThan(1000);
    });

    it('content excludes frontmatter', () => {
      const result = handleTool('orchestra_get_skill', { name: 'orchestra-prd' });
      expect(result.content).not.toContain('allowed-tools:');
    });

    it('throws for an unknown skill', () => {
      expect(() => handleTool('orchestra_get_skill', { name: 'orchestra-bogus' })).toThrow('Unknown skill: orchestra-bogus');
    });
  });

  describe('unknown tool', () => {
    it('throws with the tool name in the message', () => {
      expect(() => handleTool('orchestra_nonexistent', {})).toThrow('Unknown tool: orchestra_nonexistent');
    });
  });
});
