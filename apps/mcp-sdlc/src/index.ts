import { TOOL_DEFINITIONS, handleTool } from './tools.js';

interface McpRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method: string;
  params?: { name?: string; arguments?: Record<string, string> };
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'orchestra-mcp-sdlc' });
    }

    if (url.pathname === '/mcp' && request.method === 'POST') {
      const body = await request.json() as McpRequest;
      const id = body.id ?? null;

      if (body.method === 'tools/list') {
        return Response.json({
          jsonrpc: '2.0',
          id,
          result: { tools: TOOL_DEFINITIONS },
        });
      }

      if (body.method === 'tools/call') {
        const { name, arguments: args = {} } = body.params ?? {};
        if (!name) {
          return Response.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Invalid params: missing tool name' },
          }, { status: 400 });
        }
        try {
          const result = handleTool(name, args);
          return Response.json({
            jsonrpc: '2.0',
            id,
            result: { content: [{ type: 'text', text: JSON.stringify(result) }] },
          });
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message },
          }, { status: 404 });
        }
      }

      return Response.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${body.method}` },
      }, { status: 400 });
    }

    return new Response('Not found', { status: 404 });
  },
};
