#!/usr/bin/env node
// Repo-state verdict for the AFK loop (ADR-003: the repo is the state store).
// blocked  → a pending gate awaits a human; do not start a session
// resume   → an answered, unconsumed gate; start a session to apply it
// continue → mid-stage, nothing pending; start a session
// done     → the work item's spec is closed; nothing to do

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1').trim();
  }
  return fields;
}

export function checkState(repoRoot, workItem) {
  const itemDir = join(repoRoot, '.orchestra', 'work', workItem);
  const gates = [];
  const malformed = [];

  const specPath = join(itemDir, 'spec.md');
  if (existsSync(specPath)) {
    const spec = parseFrontmatter(readFileSync(specPath, 'utf8'));
    if (spec?.status === 'closed' || spec?.status === 'complete') {
      return { verdict: 'done', gates, malformed };
    }
  }

  const gatesDir = join(itemDir, 'gates');
  if (existsSync(gatesDir)) {
    for (const name of readdirSync(gatesDir).filter((f) => f.endsWith('.md')).sort()) {
      const file = join(gatesDir, name);
      const fm = parseFrontmatter(readFileSync(file, 'utf8'));
      if (!fm || !fm.status) {
        malformed.push(file);
        continue;
      }
      gates.push({
        file,
        status: fm.status,
        answer: fm.answer,
        consumed: fm.consumed === 'true',
      });
    }
  }

  if (gates.some((g) => g.status === 'pending')) {
    return { verdict: 'blocked', gates: gates.filter((g) => g.status === 'pending'), malformed };
  }
  const unconsumed = gates.filter((g) => g.status === 'answered' && !g.consumed);
  if (unconsumed.length > 0) {
    return { verdict: 'resume', gates: unconsumed, malformed };
  }
  return { verdict: 'continue', gates: [], malformed };
}

import { fileURLToPath } from 'node:url';
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [repoRoot, workItem] = process.argv.slice(2);
  if (!repoRoot || !workItem) {
    console.error('usage: check-state.mjs <repo-root> <work-item>');
    process.exit(2);
  }
  const result = checkState(repoRoot, workItem);
  console.log(JSON.stringify(result, null, 2));
}
