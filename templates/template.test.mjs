import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const starter = join(here, 'starter');

test('.mcp.json is valid JSON pointing at the orchestra server with the env placeholder', () => {
  const config = JSON.parse(readFileSync(join(starter, '.mcp.json'), 'utf8'));
  const server = config.mcpServers.orchestra;
  assert.equal(server.type, 'http');
  assert.match(server.url, /^https:\/\/orchestra-mcp-sdlc\..+\/mcp$/);
  assert.equal(server.headers.Authorization, 'Bearer ${ORCHESTRA_API_KEY}');
});

test('README covers every promised workflow section', () => {
  const readme = readFileSync(join(starter, 'README.md'), 'utf8');
  for (const required of [
    'Your first session',
    'Working at the keyboard',
    'Going AFK',
    'Checking status',
    'ORCHESTRA_API_KEY',
    'Troubleshooting',
    'gates/',
    'status: answered',
  ]) {
    assert.ok(readme.includes(required), `README missing: ${required}`);
  }
});

test('.gitignore keeps secrets out', () => {
  const ignore = readFileSync(join(starter, '.gitignore'), 'utf8');
  assert.ok(ignore.includes('.env'));
  assert.ok(ignore.includes('.dev.vars'));
});

test('create.sh exists and is executable', () => {
  const mode = statSync(join(here, 'create.sh')).mode;
  assert.ok(mode & 0o111, 'create.sh not executable');
});
