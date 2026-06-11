import { describe, it, expect, vi } from 'vitest';
import { buildNotification, sendNotification } from './notify.js';
import type { Gate } from './gates.js';

const GATE: Gate = {
  id: 'g1',
  token: 't'.repeat(32),
  question: 'Python or Go?',
  options: ['Python', 'Go'],
  artifactPaths: ['.orchestra/work/m1/spec.md'],
  status: 'pending',
  raisedAt: 1000,
};

describe('buildNotification', () => {
  it('includes question, options, artifacts, and the tokened answer URL', () => {
    const n = buildNotification(GATE, 'https://lenny.example.com', 'relnotes');
    expect(n.title).toContain('relnotes');
    expect(n.message).toContain('Python or Go?');
    expect(n.message).toContain('Python');
    expect(n.message).toContain('.orchestra/work/m1/spec.md');
    expect(n.answerUrl).toBe(
      `https://lenny.example.com/gates/g1?work=relnotes&token=${'t'.repeat(32)}`
    );
  });
});

describe('sendNotification', () => {
  it('POSTs JSON to a generic webhook', async () => {
    const fetchMock = vi.fn(async () => new Response('ok', { status: 200 }));
    const n = buildNotification(GATE, 'https://lenny.example.com', 'relnotes');
    const result = await sendNotification('https://hooks.example.com/x', n, fetchMock);
    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://hooks.example.com/x');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    const body = JSON.parse(init.body as string);
    expect(body.answer_url).toBe(n.answerUrl);
    expect(body.message).toContain('Python or Go?');
  });

  it('sends ntfy-style text with Title and Click headers for ntfy URLs', async () => {
    const fetchMock = vi.fn(async () => new Response('ok', { status: 200 }));
    const n = buildNotification(GATE, 'https://lenny.example.com', 'relnotes');
    await sendNotification('https://ntfy.sh/my-topic', n, fetchMock);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Title).toBe(n.title);
    expect(headers.Click).toBe(n.answerUrl);
    expect(typeof init.body).toBe('string');
    expect(init.body as string).toContain('Python or Go?');
  });

  it('reports failure without throwing', async () => {
    const fetchMock = vi.fn(async () => new Response('nope', { status: 500 }));
    const n = buildNotification(GATE, 'https://lenny.example.com', 'relnotes');
    const result = await sendNotification('https://hooks.example.com/x', n, fetchMock);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('500');
  });

  it('catches network errors', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('connection refused');
    });
    const n = buildNotification(GATE, 'https://lenny.example.com', 'relnotes');
    const result = await sendNotification('https://hooks.example.com/x', n, fetchMock);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('connection refused');
  });
});
