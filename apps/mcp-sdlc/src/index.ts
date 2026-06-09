import { TOOL_DEFINITIONS, handleTool } from './tools.js';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'orchestra-mcp' });
    }

    // MCP over HTTP (streamable transport)
    if (url.pathname === '/mcp' && request.method === 'POST') {
      const body = await request.json() as { method: string; params?: { name?: string; arguments?: Record<string, string> } };

      if (body.method === 'tools/list') {
        return Response.json({
          jsonrpc: '2.0',
          result: { tools: TOOL_DEFINITIONS },
        });
      }

      if (body.method === 'tools/call') {
        const { name, arguments: args = {} } = body.params ?? {};
        if (!name) return Response.json({ error: 'missing name' }, { status: 400 });
        try {
          const result = handleTool(name, args);
          return Response.json({ jsonrpc: '2.0', result: { content: [{ type: 'text', text: JSON.stringify(result) }] } });
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ jsonrpc: '2.0', error: { code: -32601, message } }, { status: 404 });
        }
      }

      return Response.json({ error: 'unknown method' }, { status: 400 });
    }

    return new Response('orchestra-mcp', { status: 404 });
  },
};
