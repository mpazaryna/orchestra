/**
 * E2E tests — hits the live deployed Worker.
 * Requires: ORCHESTRA_MCP_URL env var set to the deployed URL.
 * Run: ORCHESTRA_MCP_URL=https://orchestra-mcp-sdlc.mpazbot.workers.dev pnpm --filter @orchestra/mcp-sdlc test:e2e
 */
import { describe, it, expect } from 'vitest';

const BASE = process.env.ORCHESTRA_MCP_URL;

describe.skipIf(!BASE)('E2E: orchestra-mcp-sdlc (live)', () => {
  it('health check passes on live URL', async () => {
    const res = await fetch(`${BASE}/health`);
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; service: string };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('orchestra-mcp-sdlc');
  });

  it('tools/call orchestra_get_prompt works on live URL', async () => {
    const res = await fetch(`${BASE}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'tools/call',
        params: { name: 'orchestra_get_prompt', arguments: { stage: 'prd' } },
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { result: { content: Array<{ text: string }> } };
    const content = JSON.parse(body.result.content[0].text) as { prompt: string };
    expect(content.prompt.length).toBeGreaterThan(10);
  });
});
