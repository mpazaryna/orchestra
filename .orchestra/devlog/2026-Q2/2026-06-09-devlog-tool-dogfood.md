---
created_on: 2026-06-09
---

# 2026-06-09: Devlog Tool Dogfood — MCP Calls Its Own Tool

## Summary

Added orchestra_devlog_entry as the 4th MCP tool, deployed to Cloudflare, and proved the full loop: MCP call returns {path, content}, Claude Code writes the file locally. This is the dogfood: the orchestra MCP composing orchestra devlog entries.

## Details

The MCP worker cannot write to the local filesystem — it runs on Cloudflare. The correct split is: MCP computes the path (quarter from month) and formats the markdown, Claude Code writes the file. This call is the proof. Tool count: 4. Auth: Bearer token, same key as savvy-agents. Tests: 21 passing unit tests, devlog_entry covered by 4 dedicated test cases.

## Next

M3: Agent Lenny — Durable Object for stateful multi-turn SDLC sessions.