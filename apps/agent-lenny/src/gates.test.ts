import { describe, it, expect } from 'vitest';
import { GateStore, type GateKV } from './gates.js';

function memoryKV(): GateKV {
  const map = new Map<string, unknown>();
  return {
    async get<T>(key: string) {
      return (map.get(key) as T) ?? undefined;
    },
    async put(key: string, value: unknown) {
      map.set(key, value);
    },
    async list<T>(options: { prefix: string }) {
      const out = new Map<string, T>();
      for (const [k, v] of map) if (k.startsWith(options.prefix)) out.set(k, v as T);
      return out;
    },
  };
}

const PAYLOAD = {
  question: 'Python or Go?',
  options: ['Python', 'Go'],
  artifactPaths: ['.orchestra/work/m1/spec.md'],
};

describe('GateStore', () => {
  it('raises a gate as pending with a one-time token', async () => {
    const store = new GateStore(memoryKV(), () => 1000);
    const gate = await store.raise(PAYLOAD);
    expect(gate.status).toBe('pending');
    expect(gate.token).toHaveLength(32);
    expect(gate.raisedAt).toBe(1000);
    expect((await store.pending()).map((g) => g.id)).toEqual([gate.id]);
  });

  it('answers a pending gate with a valid token', async () => {
    const store = new GateStore(memoryKV(), () => 1000);
    const gate = await store.raise(PAYLOAD);
    const result = await store.answer(gate.id, { token: gate.token }, 'Python, proceed');
    expect(result.ok).toBe(true);
    const updated = await store.get(gate.id);
    expect(updated?.status).toBe('answered');
    expect(updated?.answer).toBe('Python, proceed');
    expect(await store.pending()).toHaveLength(0);
  });

  it('answers via authenticated caller without a token', async () => {
    const store = new GateStore(memoryKV(), () => 1000);
    const gate = await store.raise(PAYLOAD);
    const result = await store.answer(gate.id, { viaAuth: true }, 'Go');
    expect(result.ok).toBe(true);
  });

  it('rejects a bad token without changing the gate', async () => {
    const store = new GateStore(memoryKV(), () => 1000);
    const gate = await store.raise(PAYLOAD);
    const result = await store.answer(gate.id, { token: 'wrong' }, 'Python');
    expect(result).toEqual({ ok: false, error: 'bad-token' });
    expect((await store.get(gate.id))?.status).toBe('pending');
  });

  it('rejects a second answer', async () => {
    const store = new GateStore(memoryKV(), () => 1000);
    const gate = await store.raise(PAYLOAD);
    await store.answer(gate.id, { token: gate.token }, 'Python');
    const second = await store.answer(gate.id, { viaAuth: true }, 'Go');
    expect(second).toEqual({ ok: false, error: 'already-answered' });
    expect((await store.get(gate.id))?.answer).toBe('Python');
  });

  it('rejects answers to unknown gates', async () => {
    const store = new GateStore(memoryKV(), () => 1000);
    expect(await store.answer('nope', { viaAuth: true }, 'x')).toEqual({
      ok: false,
      error: 'not-found',
    });
  });

  it('finds stale pending gates and marks renotification exactly once', async () => {
    let now = 0;
    const store = new GateStore(memoryKV(), () => now);
    const gate = await store.raise(PAYLOAD);
    now = 25 * 60 * 60 * 1000; // 25h later
    let stale = await store.stalePending(24 * 60 * 60 * 1000);
    expect(stale.map((g) => g.id)).toEqual([gate.id]);
    await store.markRenotified(gate.id);
    stale = await store.stalePending(24 * 60 * 60 * 1000);
    expect(stale).toHaveLength(0);
  });

  it('records notification failures on the gate', async () => {
    const store = new GateStore(memoryKV(), () => 1000);
    const gate = await store.raise(PAYLOAD);
    await store.recordNotifyError(gate.id, 'webhook 500');
    expect((await store.get(gate.id))?.notifyError).toBe('webhook 500');
  });
});
