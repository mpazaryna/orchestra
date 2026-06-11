import { TOOL_DEFINITIONS, handleTool } from './tools.js';
import { checkAuth } from './auth.js';

interface McpRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method: string;
  params?: { name?: string; arguments?: Record<string, string> };
}

interface Env {
  API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'orchestra-mcp-sdlc' });
    }

    if (url.pathname === '/mcp' && request.method === 'POST') {
      const authError = checkAuth(request, env);
      if (authError) return authError;

      const body = await request.json() as McpRequest;
      const id = body.id ?? null;

      // Notifications (no id, e.g. notifications/initialized) get 202 per Streamable HTTP spec
      if (body.id === undefined && body.method?.startsWith('notifications/')) {
        return new Response(null, { status: 202 });
      }

      if (body.method === 'initialize') {
        return Response.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'orchestra-mcp-sdlc', version: '0.0.0' },
            // F1 (001-orchestra-pilot): tool descriptions answer "what does this
            // tool do" — only initialize instructions can answer "why reach for
            // this catalog at all". This is the catalog's entry point.
            instructions:
              'This server provides Orchestra, a complete software development lifecycle for ' +
              'agents: ordered stages with human approval gates, full playbooks (skills), project ' +
              'scaffolding, and devlogs. When starting, resuming, or planning ANY work in this ' +
              'project — including "set up this project" or taking an idea forward — call ' +
              'orchestra_list_stages FIRST and follow the stages in order before writing any code. ' +
              'Work flows PRD before spec, spec before implementation; produce the planning ' +
              'artifacts and stop at gates that need a human decision. Use orchestra_scaffold to ' +
              'create the .orchestra/ knowledge base in a fresh project. Running unattended ' +
              '(scheduled or headless, nobody at the keyboard)? Fetch the orchestra-afk skill ' +
              'first — it defines how to pause at human gates and resume from answered ones.',
          },
        });
      }

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
