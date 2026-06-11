#!/usr/bin/env bash
# Integration check: the deployed Orchestra MCP server is reachable, the key
# works, and the catalog serves exactly the 7 expected tools.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENDPOINT="${ORCHESTRA_ENDPOINT:-https://orchestra-mcp-sdlc.mpazbot.workers.dev/mcp}"

KEY="${ORCHESTRA_API_KEY:-}"
if [[ -z "$KEY" ]]; then
  DEV_VARS="$HERE/../mcp-sdlc/.dev.vars"
  [[ -f "$DEV_VARS" ]] && KEY="$(grep '^API_KEY=' "$DEV_VARS" | cut -d= -f2-)"
fi
if [[ -z "$KEY" ]]; then
  echo "FAIL: no API key (set ORCHESTRA_API_KEY or populate apps/mcp-sdlc/.dev.vars)" >&2
  exit 1
fi

mcp() {
  curl -s -X POST "$ENDPOINT" \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d "$1"
}

INIT_RESPONSE="$(mcp '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"orchestra-pilot-preflight","version":"0.0.1"}}}')"
echo "$INIT_RESPONSE" | grep -q '"serverInfo"' || {
  echo "FAIL: initialize did not return serverInfo: $INIT_RESPONSE" >&2
  exit 1
}

TOOLS_RESPONSE="$(mcp '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}')"
TOOL_COUNT="$(echo "$TOOLS_RESPONSE" | grep -o '"name":"orchestra_' | wc -l | tr -d ' ')"
if [[ "$TOOL_COUNT" != "7" ]]; then
  echo "FAIL: expected 7 orchestra tools, got $TOOL_COUNT" >&2
  exit 1
fi

echo "preflight OK: initialize 200, 7 tools served at $ENDPOINT"
