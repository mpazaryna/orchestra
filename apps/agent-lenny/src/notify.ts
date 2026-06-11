// Notification adapter — webhook-first (works with ntfy.sh for phone push,
// or any JSON receiver). One function boundary so an email adapter can be
// added without touching gate logic.

import type { Gate } from './gates.js';

export interface Notification {
  title: string;
  message: string;
  answerUrl: string;
  gate: Pick<Gate, 'id' | 'question' | 'options' | 'artifactPaths' | 'raisedAt'>;
}

export type NotifyResult = { ok: true } | { ok: false; error: string };

export function buildNotification(gate: Gate, publicUrl: string, workItem: string): Notification {
  const answerUrl = `${publicUrl.replace(/\/$/, '')}/gates/${gate.id}?work=${encodeURIComponent(
    workItem
  )}&token=${gate.token}`;
  const lines = [
    gate.question,
    '',
    ...gate.options.map((o, i) => `${i + 1}. ${o}`),
    '',
    gate.artifactPaths.length ? `Artifacts: ${gate.artifactPaths.join(', ')}` : '',
    `Answer: ${answerUrl}`,
  ].filter((l, i, arr) => l !== '' || arr[i - 1] !== '');
  return {
    title: `Lenny needs a decision — ${workItem}`,
    message: lines.join('\n'),
    answerUrl,
    gate: {
      id: gate.id,
      question: gate.question,
      options: gate.options,
      artifactPaths: gate.artifactPaths,
      raisedAt: gate.raisedAt,
    },
  };
}

export async function sendNotification(
  webhookUrl: string,
  notification: Notification,
  fetchImpl: typeof fetch = fetch
): Promise<NotifyResult> {
  try {
    let response: Response;
    if (new URL(webhookUrl).host.includes('ntfy')) {
      // ntfy.sh: plain text body, metadata via headers, Click opens the answer form
      response = await fetchImpl(webhookUrl, {
        method: 'POST',
        headers: {
          Title: notification.title,
          Click: notification.answerUrl,
          Priority: 'high',
          Tags: 'orchestra,gate',
        },
        body: notification.message,
      });
    } else {
      response = await fetchImpl(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notification.title,
          message: notification.message,
          answer_url: notification.answerUrl,
          gate: notification.gate,
        }),
      });
    }
    if (!response.ok) return { ok: false, error: `webhook responded ${response.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
