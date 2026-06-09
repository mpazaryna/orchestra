import { routeAgentRequest } from 'agents';
import { OrchestraAgent } from './agent.js';

export { OrchestraAgent };

export default {
  async fetch(request: Request, env: { ANTHROPIC_API_KEY: string; OrchestraAgent: DurableObjectNamespace }): Promise<Response> {
    if (new URL(request.url).pathname === '/health') {
      return Response.json({ status: 'ok', service: 'orchestra-agent' });
    }
    return (await routeAgentRequest(request, env)) ?? new Response('orchestra-agent', { status: 404 });
  },
};
