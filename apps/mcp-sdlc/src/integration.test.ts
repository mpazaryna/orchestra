/**
 * Integration tests — requires `wrangler dev` running on port 8787.
 * Run: pnpm --filter @orchestra/mcp-sdlc test:integration
 */
import { describe, it, expect } from 'vitest';

const BASE = process.env.WORKER_URL;

async function mcp(body: object) {
  return fetch(`${BASE}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe.skipIf(!BASE)('Integration: orchestra-mcp-sdlc', () => {
  it('GET /health returns ok', async () => {
    const res = await fetch(`${BASE}/health`);
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; service: string };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('orchestra-mcp-sdlc');
  });

  it('tools/list returns 3 tools', async () => {
    const res = await mcp({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
    expect(res.status).toBe(200);
    const body = await res.json() as { result: { tools: unknown[] } };
    expect(body.result.tools).toHaveLength(3);
  });

  it('tools/call orchestra_get_prompt returns prompt for prd stage', async () => {
    const res = await mcp({
      jsonrpc: '2.0', id: 2, method: 'tools/call',
      params: { name: 'orchestra_get_prompt', arguments: { stage: 'prd' } },
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { result: { content: Array<{ text: string }> } };
    const content = JSON.parse(body.result.content[0].text) as { prompt: string };
    expect(content.prompt.length).toBeGreaterThan(10);
  });
});
