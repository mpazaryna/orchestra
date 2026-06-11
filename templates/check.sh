#!/usr/bin/env bash
# Drift check: the starter template's promises hold against the live server.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

KEY="${ORCHESTRA_API_KEY:-}"
if [[ -z "$KEY" ]]; then
  DEV_VARS="$HERE/../apps/mcp-sdlc/.dev.vars"
  [[ -f "$DEV_VARS" ]] && KEY="$(grep '^API_KEY=' "$DEV_VARS" | cut -d= -f2-)"
fi
[[ -n "$KEY" ]] || { echo "FAIL: no ORCHESTRA_API_KEY"; exit 1; }

URL="$(python3 -c "import json; print(json.load(open('$HERE/starter/.mcp.json'))['mcpServers']['orchestra']['url'])")"

mcp() {
  curl -s -X POST "$URL" \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d "$1"
}

INIT="$(mcp '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"starter-check","version":"0"}}}')"
echo "$INIT" | grep -q '"instructions"' || { echo "FAIL: initialize has no instructions"; exit 1; }

TOOLS="$(mcp '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}')"
COUNT="$(echo "$TOOLS" | grep -o '"name":"orchestra_' | wc -l | tr -d ' ')"
[[ "$COUNT" == "7" ]] || { echo "FAIL: expected 7 tools, got $COUNT"; exit 1; }

AFK="$(mcp '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"orchestra_get_skill","arguments":{"name":"orchestra-afk"}}}')"
echo "$AFK" | grep -q 'orchestra-afk' || { echo "FAIL: orchestra-afk not served"; exit 1; }

echo "check OK: template matches the live server ($URL — instructions, 7 tools, orchestra-afk)"
