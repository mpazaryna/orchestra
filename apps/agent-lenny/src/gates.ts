// Gate lifecycle — the F4 fix. A gate is a persisted human decision point:
// raised by the model, notified out, answered asynchronously, consumed on resume.
// Storage is any KV with prefix listing; the Durable Object's ctx.storage
// satisfies GateKV directly, and tests use an in-memory map.

export interface Gate {
  id: string;
  token: string;
  question: string;
  options: string[];
  artifactPaths: string[];
  status: 'pending' | 'answered';
  answer?: string;
  raisedAt: number;
  answeredAt?: number;
  renotifiedAt?: number;
  notifyError?: string;
}

export interface GateKV {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
  list<T = unknown>(options: { prefix: string }): Promise<Map<string, T>>;
}

export type AnswerResult =
  | { ok: true; gate: Gate }
  | { ok: false; error: 'not-found' | 'already-answered' | 'bad-token' };

const PREFIX = 'gate:';

function randomToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class GateStore {
  constructor(
    private kv: GateKV,
    private now: () => number = () => Date.now()
  ) {}

  async raise(input: {
    question: string;
    options: string[];
    artifactPaths: string[];
  }): Promise<Gate> {
    const gate: Gate = {
      id: randomToken().slice(0, 8),
      token: randomToken(),
      question: input.question,
      options: input.options,
      artifactPaths: input.artifactPaths,
      status: 'pending',
      raisedAt: this.now(),
    };
    await this.kv.put(PREFIX + gate.id, gate);
    return gate;
  }

  async get(id: string): Promise<Gate | undefined> {
    return this.kv.get<Gate>(PREFIX + id);
  }

  async all(): Promise<Gate[]> {
    const map = await this.kv.list<Gate>({ prefix: PREFIX });
    return [...map.values()].sort((a, b) => a.raisedAt - b.raisedAt);
  }

  async pending(): Promise<Gate[]> {
    return (await this.all()).filter((g) => g.status === 'pending');
  }

  async answer(
    id: string,
    credential: { token?: string; viaAuth?: boolean },
    answer: string
  ): Promise<AnswerResult> {
    const gate = await this.get(id);
    if (!gate) return { ok: false, error: 'not-found' };
    if (gate.status === 'answered') return { ok: false, error: 'already-answered' };
    if (!credential.viaAuth && credential.token !== gate.token) {
      return { ok: false, error: 'bad-token' };
    }
    const answered: Gate = {
      ...gate,
      status: 'answered',
      answer,
      answeredAt: this.now(),
    };
    await this.kv.put(PREFIX + id, answered);
    return { ok: true, gate: answered };
  }

  async stalePending(olderThanMs: number): Promise<Gate[]> {
    const cutoff = this.now() - olderThanMs;
    return (await this.pending()).filter(
      (g) => g.raisedAt <= cutoff && g.renotifiedAt === undefined
    );
  }

  async markRenotified(id: string): Promise<void> {
    const gate = await this.get(id);
    if (gate) await this.kv.put(PREFIX + id, { ...gate, renotifiedAt: this.now() });
  }

  async recordNotifyError(id: string, error: string): Promise<void> {
    const gate = await this.get(id);
    if (gate) await this.kv.put(PREFIX + id, { ...gate, notifyError: error });
  }
}
