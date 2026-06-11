import { Think } from '@cloudflare/think';
import { createAnthropic } from '@ai-sdk/anthropic';
import { tool } from 'ai';
import { z } from 'zod';
import { SYSTEM_PROMPT } from './prompt.js';
import { GateStore, type Gate } from './gates.js';
import { buildNotification, sendNotification } from './notify.js';

export interface Env {
  ANTHROPIC_API_KEY: string;
  ORCHESTRA_API_KEY: string;
  ORCHESTRA_MCP_URL: string;
  NOTIFY_WEBHOOK_URL: string;
  LENNY_PUBLIC_URL: string;
}

interface LennyConfig {
  workItem: string;
  briefPreview: string;
  phase: 'idle' | 'working' | 'gated' | 'done';
  startedAt: number;
  lastActivity: number;
  turnRuns: number;
  mcpConnected?: boolean;
  heartbeatScheduled?: boolean;
}

const STALE_GATE_MS = 24 * 60 * 60 * 1000; // re-notify after 24h
const IDLE_CONTINUE_MS = 45 * 60 * 1000; // heartbeat continues working-but-silent runs after 45m
const MAX_TURN_RUNS = 25; // runaway guard: heartbeat won't restart past this without a human poke

export class OrchestraAgent extends Think<Env> {
  override waitForMcpConnections = true;
  override maxSteps = 30;

  private gateStore() {
    return new GateStore(this.ctx.storage as unknown as ConstructorParameters<typeof GateStore>[0]);
  }

  private config(): LennyConfig | null {
    return this.getConfig<LennyConfig>();
  }

  private updateConfig(patch: Partial<LennyConfig>) {
    const current = this.config();
    if (current) this.configure<LennyConfig>({ ...current, ...patch });
  }

  override async onStart() {
    await super.onStart?.();
    if (!this.config()?.mcpConnected) {
      await this.addMcpServer('orchestra', this.env.ORCHESTRA_MCP_URL, {
        transport: {
          type: 'streamable-http',
          headers: { Authorization: `Bearer ${this.env.ORCHESTRA_API_KEY}` },
        },
      });
      if (this.config()) this.updateConfig({ mcpConnected: true });
    }
  }

  getModel() {
    const anthropic = createAnthropic({ apiKey: this.env.ANTHROPIC_API_KEY });
    return anthropic('claude-opus-4-8');
  }

  getSystemPrompt() {
    return SYSTEM_PROMPT;
  }

  override beforeTurn() {
    return {
      providerOptions: { anthropic: { thinking: { type: 'adaptive' } } },
    };
  }

  getTools() {
    return {
      raise_gate: tool({
        description:
          'Raise a human gate: pause the pipeline on a decision only a human can make ' +
          '(stage approvals, irreversible choices). The human is notified and will answer ' +
          'asynchronously — END YOUR TURN immediately after calling this.',
        inputSchema: z.object({
          question: z.string().describe('The decision, phrased so it can be answered in one line'),
          options: z.array(z.string()).describe('Concrete options, recommended first'),
          artifact_paths: z
            .array(z.string())
            .describe('Workspace paths the human should read before deciding'),
        }),
        execute: async ({ question, options, artifact_paths }) => {
          const store = this.gateStore();
          const gate = await store.raise({ question, options, artifactPaths: artifact_paths });
          this.updateConfig({ phase: 'gated', lastActivity: Date.now() });
          const notification = buildNotification(
            gate,
            this.env.LENNY_PUBLIC_URL,
            this.config()?.workItem ?? this.name
          );
          const result = await sendNotification(this.env.NOTIFY_WEBHOOK_URL, notification);
          if (!result.ok) await store.recordNotifyError(gate.id, result.error);
          return {
            gate_id: gate.id,
            status: 'pending',
            notified: result.ok,
            instruction: 'Gate raised. End your turn now; you will be resumed with the answer.',
          };
        },
      }),
    };
  }

  // ---- RPC surface (called from the Worker router) ----

  async startWork(brief: string): Promise<{ started: boolean; workItem: string }> {
    this.configure<LennyConfig>({
      workItem: this.name,
      briefPreview: brief.slice(0, 200),
      phase: 'working',
      startedAt: Date.now(),
      lastActivity: Date.now(),
      turnRuns: 1,
      mcpConnected: this.config()?.mcpConnected,
    });
    if (!this.config()?.heartbeatScheduled) {
      await this.schedule('*/30 * * * *', 'heartbeat' as keyof this & string);
      this.updateConfig({ heartbeatScheduled: true });
    }
    await this.submitMessages([
      {
        id: crypto.randomUUID(),
        role: 'user',
        parts: [{ type: 'text', text: brief }],
      },
    ]);
    return { started: true, workItem: this.name };
  }

  async getStatus() {
    const cfg = this.config();
    const gates = await this.gateStore().all();
    return {
      workItem: cfg?.workItem ?? this.name,
      phase: cfg?.phase ?? 'idle',
      briefPreview: cfg?.briefPreview ?? null,
      startedAt: cfg?.startedAt ?? null,
      lastActivity: cfg?.lastActivity ?? null,
      turnRuns: cfg?.turnRuns ?? 0,
      turnCap: MAX_TURN_RUNS,
      maxStepsPerTurn: this.maxSteps,
      pendingGates: gates.filter((g) => g.status === 'pending'),
      answeredGates: gates.filter((g) => g.status === 'answered').length,
      messageCount: this.messages.length,
    };
  }

  async listGates(): Promise<Gate[]> {
    return this.gateStore().all();
  }

  async getGateView(id: string, token: string) {
    const gate = await this.gateStore().get(id);
    if (!gate || gate.token !== token) return null;
    const { token: _token, ...view } = gate;
    return view;
  }

  async answerGate(id: string, credential: { token?: string; viaAuth?: boolean }, answer: string) {
    const result = await this.gateStore().answer(id, credential, answer);
    if (!result.ok) return result;
    this.updateConfig({
      phase: 'working',
      lastActivity: Date.now(),
      turnRuns: (this.config()?.turnRuns ?? 0) + 1,
    });
    await this.submitMessages([
      {
        id: crypto.randomUUID(),
        role: 'user',
        parts: [
          {
            type: 'text',
            text: `Gate ${id} answered by the human: "${answer}". Apply this decision and continue from exactly where you stopped.`,
          },
        ],
      },
    ]);
    return { ok: true as const, gateId: id };
  }

  async readWorkspace(): Promise<Record<string, string>> {
    const files: Record<string, string> = {};
    const seen = new Set<string>();
    const walk = async (dir: string): Promise<void> => {
      if (seen.has(dir)) return;
      seen.add(dir);
      let entries;
      try {
        entries = await this.workspace.readDir(dir);
      } catch {
        return;
      }
      for (const entry of entries) {
        if (String(entry.type).startsWith('d')) {
          await walk(entry.path);
        } else {
          const content = await this.workspace.readFile(entry.path);
          if (content !== null) files[entry.path] = content;
        }
      }
    };
    for (const root of ['/', '', '.']) await walk(root);
    return files;
  }

  async readWorkspaceFile(path: string): Promise<string | null> {
    for (const candidate of [path, '/' + path, path.replace(/^\//, '')]) {
      try {
        const content = await this.workspace.readFile(candidate);
        if (content !== null) return content;
      } catch {
        // try next candidate
      }
    }
    return null;
  }

  async readMessages(): Promise<unknown[]> {
    return this.messages.map((m) => ({
      role: m.role,
      parts: (m.parts ?? []).map((p) => {
        const part = p as Record<string, unknown>;
        if (part.type === 'text') return { type: 'text', text: String(part.text).slice(0, 600) };
        return {
          type: part.type,
          tool: part.toolName ?? undefined,
          state: part.state ?? undefined,
          input: part.input ? JSON.stringify(part.input).slice(0, 300) : undefined,
          output: part.output ? JSON.stringify(part.output).slice(0, 300) : undefined,
          errorText: part.errorText ?? undefined,
        };
      }),
    }));
  }

  async heartbeat() {
    const store = this.gateStore();
    const cfg = this.config();
    // Re-notify stale gates exactly once.
    for (const gate of await store.stalePending(STALE_GATE_MS)) {
      const notification = buildNotification(
        gate,
        this.env.LENNY_PUBLIC_URL,
        cfg?.workItem ?? this.name
      );
      const result = await sendNotification(this.env.NOTIFY_WEBHOOK_URL, notification);
      await store.markRenotified(gate.id);
      if (!result.ok) await store.recordNotifyError(gate.id, result.error);
    }
    // Continue working-but-silent runs (e.g. evicted mid-flight), within the cap.
    const pending = await store.pending();
    if (
      cfg?.phase === 'working' &&
      pending.length === 0 &&
      Date.now() - cfg.lastActivity > IDLE_CONTINUE_MS &&
      cfg.turnRuns < MAX_TURN_RUNS
    ) {
      this.updateConfig({ lastActivity: Date.now(), turnRuns: cfg.turnRuns + 1 });
      await this.submitMessages([
        {
          id: crypto.randomUUID(),
          role: 'user',
          parts: [
            {
              type: 'text',
              text: 'Heartbeat: the previous session appears to have stopped mid-stage. Review the workspace and continue from where the work left off. If you are actually at a human decision, raise a gate.',
            },
          ],
        },
      ]);
    }
  }
}
