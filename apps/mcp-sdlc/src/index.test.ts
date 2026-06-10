import { describe, it, expect } from 'vitest';
import worker from './index.js';

const TEST_KEY = 'test-api-key';
const env = { API_KEY: TEST_KEY };

async function callWorker(path: string, options: RequestInit = {}) {
  const request = new Request(`http://localhost${path}`, options);
  return worker.fetch(request, env);
}

describe('GET /health', () => {
  it('returns 200 with status ok and correct service name (no auth required)', async () => {
    const res = await callWorker('/health');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, string>;
    expect(body.status).toBe('ok');
    expect(body.service).toBe('orchestra-mcp-sdlc');
  });
});

describe('POST /mcp — auth', () => {
  it('returns 401 with no Authorization header', async () => {
    const res = await callWorker('/mcp', { method: 'POST', body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) });
    expect(res.status).toBe(401);
    const body = await res.json() as { error: { code: number } };
    expect(body.error.code).toBe(-32001);
  });

  it('returns 401 with wrong key', async () => {
    const res = await callWorker('/mcp', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer wrong-key', 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed Authorization header', async () => {
    const res = await callWorker('/mcp', {
      method: 'POST',
      headers: { 'Authorization': TEST_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
    expect(res.status).toBe(401);
  });
});

describe('POST /mcp — authorized', () => {
  async function mcp(body: object) {
    return callWorker('/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEST_KEY}` },
      body: JSON.stringify(body),
    });
  }

  it('initialize returns protocol version and server info', async () => {
    const res = await mcp({ jsonrpc: '2.0', id: 0, method: 'initialize', params: {} });
    expect(res.status).toBe(200);
    const body = await res.json() as { result: { protocolVersion: string; serverInfo: { name: string } }; id: number };
    expect(body.id).toBe(0);
    expect(body.result.protocolVersion).toBe('2024-11-05');
    expect(body.result.serverInfo.name).toBe('orchestra-mcp-sdlc');
  });

  it('tools/list returns all 5 tools', async () => {
    const res = await mcp({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
    expect(res.status).toBe(200);
    const body = await res.json() as { result: { tools: Array<{ name: string }> }; id: number };
    expect(body.id).toBe(1);
    expect(body.result.tools).toHaveLength(5);
  });

  it('tools/call orchestra_get_prompt returns prompt', async () => {
    const res = await mcp({
      jsonrpc: '2.0', id: 2, method: 'tools/call',
      params: { name: 'orchestra_get_prompt', arguments: { stage: 'prd' } },
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { result: { content: Array<{ text: string }> }; id: number };
    expect(body.id).toBe(2);
    const content = JSON.parse(body.result.content[0].text) as { prompt: string };
    expect(content.prompt.length).toBeGreaterThan(10);
  });

  it('tools/call unknown tool returns -32601', async () => {
    const res = await mcp({
      jsonrpc: '2.0', id: 3, method: 'tools/call',
      params: { name: 'orchestra_nonexistent', arguments: {} },
    });
    expect(res.status).toBe(404);
    const body = await res.json() as { error: { code: number }; id: number };
    expect(body.id).toBe(3);
    expect(body.error.code).toBe(-32601);
  });

  it('echoes id back in all responses', async () => {
    const res = await mcp({ jsonrpc: '2.0', id: 'abc-123', method: 'tools/list' });
    const body = await res.json() as { id: string };
    expect(body.id).toBe('abc-123');
  });

  it('unknown method returns -32601 error', async () => {
    const res = await mcp({ jsonrpc: '2.0', id: 4, method: 'tools/unknown' });
    expect(res.status).toBe(400);
    const body = await res.json() as { error: { code: number } };
    expect(body.error.code).toBe(-32601);
  });
});

describe('unknown route', () => {
  it('returns 404', async () => {
    const res = await callWorker('/unknown');
    expect(res.status).toBe(404);
  });
});
