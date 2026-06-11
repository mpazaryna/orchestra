---
id: ADR-004
status: accepted
created_on: 2026-06-11
---

# ADR-004: Gate Notifications over ntfy — and the Presence Requirement

## Context

The AFK loop (ADR-003, work item 002) pauses at human gates. A pause is only
useful if a human learns about it: the gate file sits in the repo, but
nobody polls a repo. The loop needs a push channel that reaches a person
wherever they are, requires no infrastructure of ours, and works from a
shell script.

The channel was chosen during M3 (Lenny's webhook adapter) and carried into
the runner: **ntfy.sh**, a public publish/subscribe notification service. A
publisher POSTs plain HTTP to `https://ntfy.sh/<topic>`; every subscriber
to that topic (phone app, browser, CLI) gets a push.

Alternatives considered:

1. **Email** (e.g. Cloudflare Email Service) — universal, but requires
   domain/DNS setup, sender reputation care, and an HTTP API key; heavier
   than the problem. Kept as a per-message option later (ntfy itself can
   forward to email via an `X-Email` header).
2. **Slack/Discord webhooks** — fine if you live there, but assumes a
   workspace and couples the loop to a third-party account.
3. **Apple/Google push directly** — requires an app and developer accounts;
   absurd for a shell loop.
4. **No push; rely on PR review notifications** — only works once gates are
   PRs on a hosted forge; local-first repos (the current demo) would go
   silent.

ntfy won on fit: zero accounts, zero infrastructure, one `curl`, native
phone apps, and a `Click` header that deep-links straight to the thing
needing attention.

## Decision

Gate notifications publish to a ntfy topic via plain HTTP POST:

- **Message:** body = the gate question + repo + gate file path + how to
  answer; headers carry `Title` (work item), `Priority: high`,
  `Tags`, and where applicable `Click` (a URL that opens the decision).
- **Topic as capability URL:** the topic name contains a random suffix and
  is treated as a secret. Anyone holding it can *read* alerts and *post*
  noise — but cannot act: gate answers require a commit to the repository,
  so the control plane never leaves the repo's own auth. Alert leakage is
  accepted as low-stakes; the topic name must still not be committed to
  public repos or logs.
- **Failure handling:** a failed publish is recorded (M3 recorded it on the
  gate; the runner logs it) and never blocks the pause itself — the gate
  file is the source of truth, the ping is a courtesy. This mattered on day
  one: the very first gate push got a 429 (ntfy rate limit) and the gate
  remained answerable.
- **Configuration:** `NTFY_TOPIC` env var; publishing stays one function /
  one curl so the channel can be swapped (email, Slack) without touching
  gate logic.

## The Presence Requirement (the lesson)

On 2026-06-11 the loop ran for hours, publishing correctly to a topic
**nobody was subscribed to**. Every send returned 200; no human received
anything; the operator's reaction was "I had no idea this was running."
The acceptance criterion "a human receives the notification" had been
verified at the publisher, never at the subscriber — a pub/sub channel
makes that distinction easy to miss, because the publisher cannot see
whether anyone is listening.

Therefore, as part of this decision:

- **Scheduling an AFK loop requires confirmed receipt first.** The install
  flow (runner README / future `install.sh`) must send a test ping and ask
  the operator to confirm it arrived *before* loading the schedule. An
  unconfirmed channel means the loop must not be scheduled.
- **The loop must be discoverable without the channel:** a one-line status
  surface (the launchd label, `/tmp/afk-runner.out.log`, and `git log` of
  the target repo) is documented as the way to answer "what is running on
  my machine?" independent of notifications.
- ntfy.sh caches messages ~12 hours — a late subscriber sees recent
  history, which softens but does not fix the gap.

## Consequences

- Operators get phone-push gate alerts with zero infrastructure; the
  starter README documents subscribe-then-schedule in that order.
- The current topic (`orchestra-lenny-…`) predates the teardown of the
  component it's named after; renaming requires re-subscribing, so it is
  deferred to whenever the channel is next touched.
- Public-instance dependence: ntfy.sh rate limits (seen: 429) and uptime
  are outside our control. Acceptable for gates (the file is the truth);
  if it ever isn't, ntfy is self-hostable and the publish call is one URL
  swap.
- Follow-up work captured: receipt-confirmed install step, runner `status`
  command, optional `X-Email` forwarding, and leading pings with the work
  item name now that multiple items gate (002 finding F-B).
