export function checkAuth(request: Request, env: { API_KEY: string }): Response | null {
  const header = request.headers.get('Authorization') ?? '';
  if (!header.startsWith('Bearer ')) return unauthorized();
  if (header.slice(7) !== env.API_KEY) return unauthorized();
  return null;
}

function unauthorized(): Response {
  return new Response(
    JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Unauthorized' } }),
    { status: 401, headers: { 'Content-Type': 'application/json' } },
  );
}
