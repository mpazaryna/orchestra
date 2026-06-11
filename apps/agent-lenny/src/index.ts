import { getAgentByName } from 'agents';
import { OrchestraAgent, type Env as AgentEnv } from './agent.js';

export { OrchestraAgent };

interface Env extends AgentEnv {
  OrchestraAgent: DurableObjectNamespace<OrchestraAgent>;
  LENNY_API_KEY: string;
}

function unauthorized() {
  return Response.json({ error: 'unauthorized' }, { status: 401 });
}

function isAuthed(request: Request, env: Env): boolean {
  return request.headers.get('Authorization') === `Bearer ${env.LENNY_API_KEY}`;
}

function gateFormHtml(workItem: string, gate: {
  id: string;
  question: string;
  options: string[];
  artifactPaths: string[];
}, token: string): string {
  const options = gate.options
    .map(
      (o) =>
        `<button type="submit" name="answer" value="${o.replaceAll('"', '&quot;')}">${o}</button>`
    )
    .join('\n');
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lenny — gate ${gate.id}</title>
<style>
  body { font-family: ui-sans-serif, system-ui; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; }
  button { display: block; width: 100%; margin: .5rem 0; padding: .8rem; font-size: 1rem; cursor: pointer; }
  textarea { width: 100%; min-height: 4rem; font-size: 1rem; }
  .meta { color: #666; font-size: .85rem; }
</style></head>
<body>
  <p class="meta">orchestra · ${workItem} · gate ${gate.id}</p>
  <h2>${gate.question}</h2>
  ${gate.artifactPaths.length ? `<p class="meta">Artifacts: ${gate.artifactPaths.join(', ')}</p>` : ''}
  <form method="POST" action="/gates/${gate.id}/answer?work=${encodeURIComponent(workItem)}&token=${token}">
    ${options}
    <p>Or answer in your own words:</p>
    <textarea name="answer" placeholder="Your decision…"></textarea>
    <button type="submit">Send answer</button>
  </form>
</body></html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/health') {
      return Response.json({ status: 'ok', service: 'orchestra-agent-lenny' });
    }

    const workItem = url.searchParams.get('work') ?? 'main';
    const agent = await getAgentByName(env.OrchestraAgent, workItem);

    // Tokened gate form + answer: reachable from a notification tap, no API key.
    const gateMatch = pathname.match(/^\/gates\/([^/]+)$/);
    if (gateMatch && request.method === 'GET') {
      const token = url.searchParams.get('token') ?? '';
      const view = await agent.getGateView(gateMatch[1], token);
      if (!view) return unauthorized();
      if (view.status === 'answered') {
        return new Response(`<p>Gate ${view.id} already answered: ${view.answer}</p>`, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
      return new Response(gateFormHtml(workItem, view, token), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const answerMatch = pathname.match(/^\/gates\/([^/]+)\/answer$/);
    if (answerMatch && request.method === 'POST') {
      const token = url.searchParams.get('token');
      const authed = isAuthed(request, env);
      if (!token && !authed) return unauthorized();

      let answer: string | null = null;
      const contentType = request.headers.get('Content-Type') ?? '';
      if (contentType.includes('application/json')) {
        answer = ((await request.json()) as { answer?: string }).answer ?? null;
      } else {
        answer = (await request.formData()).get('answer')?.toString() ?? null;
      }
      if (!answer?.trim()) return Response.json({ error: 'missing answer' }, { status: 400 });

      const result = await agent.answerGate(
        answerMatch[1],
        authed ? { viaAuth: true } : { token: token ?? undefined },
        answer.trim()
      );
      if (!result.ok) {
        const status = result.error === 'bad-token' ? 401 : result.error === 'not-found' ? 404 : 409;
        return Response.json(result, { status });
      }
      if (contentType.includes('application/json')) return Response.json(result);
      return new Response(
        `<p>Answer recorded for gate ${answerMatch[1]}. Lenny is resuming — you can close this page.</p>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Everything else requires the API key.
    if (!isAuthed(request, env)) return unauthorized();

    if (pathname === '/work' && request.method === 'POST') {
      const { brief } = (await request.json()) as { brief?: string };
      if (!brief?.trim()) return Response.json({ error: 'missing brief' }, { status: 400 });
      return Response.json(await agent.startWork(brief.trim()));
    }

    if (pathname === '/pause' && request.method === 'POST') {
      return Response.json(await agent.pause());
    }

    if (pathname === '/status' && request.method === 'GET') {
      return Response.json(await agent.getStatus());
    }

    if (pathname === '/gates' && request.method === 'GET') {
      return Response.json(await agent.listGates());
    }

    if (pathname === '/messages' && request.method === 'GET') {
      return Response.json(await agent.readMessages());
    }

    if (pathname === '/workspace' && request.method === 'GET') {
      return Response.json(await agent.readWorkspace());
    }

    const fileMatch = pathname.match(/^\/workspace\/(.+)$/);
    if (fileMatch && request.method === 'GET') {
      const content = await agent.readWorkspaceFile(fileMatch[1]);
      if (content === null) return Response.json({ error: 'not found' }, { status: 404 });
      return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    return Response.json({ error: 'not found' }, { status: 404 });
  },
};
