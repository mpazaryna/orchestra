// Integration tier: the live deployed MCP server Lenny depends on.
// Skipped without ORCHESTRA_API_KEY (mirrors the mcp-sdlc pattern).
import { describe, it, expect } from 'vitest';

const KEY = process.env.ORCHESTRA_API_KEY;
const URL = process.env.ORCHESTRA_MCP_URL ?? 'https://orchestra-mcp-sdlc.mpazbot.workers.dev/mcp';

async function mcp(body: object) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify(body),
  });
  return res;
}

describe.skipIf(!KEY)('deployed orchestra MCP server (Lenny boundary)', () => {
  it('initialize carries the SDLC entry-point instructions', async () => {
    const res = await mcp({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'lenny-it', version: '0' } },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { result: { instructions?: string } };
    expect(body.result.instructions).toContain('orchestra_list_stages');
  });

  it('tools/call list_stages returns the 6 stages', async () => {
    const res = await mcp({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: { name: 'orchestra_list_stages', arguments: {} },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { result: { content: Array<{ text: string }> } };
    const text = body.result.content.map((c) => c.text).join('');
    for (const stage of ['intake', 'prd', 'spec', 'gherkin', 'plan', 'execute']) {
      expect(text).toContain(stage);
    }
  });

  it('rejects a bad bearer token', async () => {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer wrong', 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} }),
    });
    expect(res.status).toBe(401);
  });
});
