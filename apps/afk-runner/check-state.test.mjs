import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkState } from './check-state.mjs';

function repoWith(gateFiles, workItem = 'm1-skeleton') {
  const root = mkdtempSync(join(tmpdir(), 'afk-fixture-'));
  const gatesDir = join(root, '.orchestra', 'work', workItem, 'gates');
  mkdirSync(gatesDir, { recursive: true });
  for (const [name, content] of Object.entries(gateFiles)) {
    writeFileSync(join(gatesDir, name), content);
  }
  return root;
}

const PENDING = `---\nstatus: pending\nraised_on: 2026-06-11\n---\n\n# Gate 001: Stack?\n`;
const ANSWERED = `---\nstatus: answered\nanswer: "Python, proceed"\nanswered_on: 2026-06-11\n---\n\n# Gate 001: Stack?\n`;
const CONSUMED = `---\nstatus: answered\nanswer: "Python, proceed"\nconsumed: true\n---\n\n# Gate 001: Stack?\n`;

test('no gates directory → continue', () => {
  const root = mkdtempSync(join(tmpdir(), 'afk-fixture-'));
  mkdirSync(join(root, '.orchestra', 'work', 'm1-skeleton'), { recursive: true });
  const result = checkState(root, 'm1-skeleton');
  assert.equal(result.verdict, 'continue');
  rmSync(root, { recursive: true, force: true });
});

test('pending gate → blocked, with gate identified', () => {
  const root = repoWith({ '001-stack.md': PENDING });
  const result = checkState(root, 'm1-skeleton');
  assert.equal(result.verdict, 'blocked');
  assert.match(result.gates[0].file, /001-stack\.md$/);
  rmSync(root, { recursive: true, force: true });
});

test('answered unconsumed gate → resume', () => {
  const root = repoWith({ '001-stack.md': ANSWERED });
  const result = checkState(root, 'm1-skeleton');
  assert.equal(result.verdict, 'resume');
  assert.equal(result.gates[0].answer, 'Python, proceed');
  rmSync(root, { recursive: true, force: true });
});

test('consumed gate → continue (already applied)', () => {
  const root = repoWith({ '001-stack.md': CONSUMED });
  const result = checkState(root, 'm1-skeleton');
  assert.equal(result.verdict, 'continue');
  rmSync(root, { recursive: true, force: true });
});

test('pending wins over answered (still blocked overall)', () => {
  const root = repoWith({ '001-stack.md': ANSWERED, '002-review.md': PENDING });
  const result = checkState(root, 'm1-skeleton');
  assert.equal(result.verdict, 'blocked');
  rmSync(root, { recursive: true, force: true });
});

test('malformed frontmatter is reported, not fatal', () => {
  const root = repoWith({ '001-bad.md': 'no frontmatter at all', '002-ok.md': PENDING });
  const result = checkState(root, 'm1-skeleton');
  assert.equal(result.verdict, 'blocked');
  assert.equal(result.malformed.length, 1);
  rmSync(root, { recursive: true, force: true });
});

test('work item with done status → done', () => {
  const root = repoWith({});
  writeFileSync(
    join(root, '.orchestra', 'work', 'm1-skeleton', 'spec.md'),
    '---\nticket: m1-skeleton\nstatus: closed\n---\n# Spec\n'
  );
  const result = checkState(root, 'm1-skeleton');
  assert.equal(result.verdict, 'done');
  rmSync(root, { recursive: true, force: true });
});
