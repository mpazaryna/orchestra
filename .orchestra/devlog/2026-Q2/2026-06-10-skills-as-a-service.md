---
created_on: 2026-06-10
---

# 2026-06-10: Skills as a Service — Why MCP Skill Serving Exists (AFK, Not Keyboard)

## Summary

A crucial framing landed today, answering "why serve skills over MCP at all when Claude Code already
has skills?" Inside an interactive Claude Code session, native local skills are strictly better —
they auto-trigger, load instantly, and progressive disclosure is just the Read tool. The MCP skill
catalog is not for that case. It is for applying these skills **away from keyboard**: skills as a
service instead of skills as copied artifacts.

## The Distinction

| | Local skills (in Claude Code) | Skills over MCP |
|---|---|---|
| Triggering | Harness auto-matches request to skill description | Nothing announces the skill — tool descriptions must |
| Delivery | Installed files, per-repo copies | One deployed server, current as of last deploy |
| Consumers | Your configured Claude Code | Any MCP client: headless runs, Agent SDK harnesses, Lenny |
| Drift | Ten repos = ten stale copies | `pnpm run deploy` updates every consumer at once |

If the only consumer were a keyboard-attached Claude Code session, serving skills over MCP would be
over-engineering. The investment exists because AFK loop-owners — headless Claude Code, Agent Lenny
on a Durable Object, anything built on the Agent SDK — have no `.claude/skills/` folder. Over MCP,
any client that can call tools gets the full SDLC.

## The Cost, and Where It Was Paid

The price of leaving the harness is **auto-triggering**. A served skill does not announce itself; a
remote agent learns a playbook exists only if a tool description says so. Every fix this week
converged on that one place: the devlog tool's body-field guidance, get_prompt's cross-reference to
skills, get_skill's two-step file instruction. The tool catalog is a hand-built trigger system for
skills delivered over the wire. Tool descriptions and schemas are the only context a remote consumer
gets for free — they must carry what the harness's native skill-matching carries locally.

## Architecture Note for M5

MCP is passive — it answers, it cannot initiate. AFK requires an active loop-owner calling the model
with this server mounted as its tool source. Two candidates: headless Claude Code (exists today,
already speaks MCP — cheapest first AFK run) and Agent Lenny (M3 — earns its keep on long-lived
sessions and asynchronous human gates, which AFK still requires; away-from-keyboard does not mean
human-free). The week's work is harness-agnostic either way: swap loop-owners and the SDLC they
receive is identical. We built the layer that does not change.

## Precise Statement

Locally, the harness applies skills *for* you. What this server sets up is everything an agent needs
to apply them *by itself, anywhere*. Whether the hand-built triggering is loud enough for an agent
nobody is steering is exactly what the orchestra-pilot cold-agent test will measure.

## Next

Run the orchestra-pilot test (cold agent, tool descriptions only), then let what breaks in a
scheduled headless run write the PRD for M3 Agent Lenny.
