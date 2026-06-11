#!/usr/bin/env bash
# Integration check: the live boundaries the AFK loop depends on.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENDPOINT="${ORCHESTRA_ENDPOINT:-https://orchestra-mcp-sdlc.mpazbot.workers.dev/mcp}"
NTFY_TOPIC="${NTFY_TOPIC:-orchestra-lenny-d25adf95a628}"

KEY="${ORCHESTRA_API_KEY:-}"
if [[ -z "$KEY" ]]; then
  DEV_VARS="$HERE/../mcp-sdlc/.dev.vars"
  [[ -f "$DEV_VARS" ]] && KEY="$(grep '^API_KEY=' "$DEV_VARS" | cut -d= -f2-)"
fi
[[ -n "$KEY" ]] || { echo "FAIL: no ORCHESTRA_API_KEY"; exit 1; }

SKILL_RESPONSE="$(curl -s -X POST "$ENDPOINT" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"orchestra_get_skill","arguments":{"name":"orchestra-afk"}}}')"
echo "$SKILL_RESPONSE" | grep -q 'orchestra-afk' || { echo "FAIL: orchestra-afk not served"; exit 1; }
echo "$SKILL_RESPONSE" | grep -q 'gates' || { echo "FAIL: served skill missing gate protocol"; exit 1; }

NTFY_CODE="$(curl -s -o /dev/null -w "%{http_code}" "https://ntfy.sh/$NTFY_TOPIC/json?poll=1&since=10s")"
[[ "$NTFY_CODE" == "200" ]] || { echo "FAIL: ntfy topic unreachable ($NTFY_CODE)"; exit 1; }

command -v claude >/dev/null || { echo "FAIL: claude CLI not on PATH"; exit 1; }

echo "preflight OK: orchestra-afk served, ntfy reachable, claude present"
