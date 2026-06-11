#!/usr/bin/env bash
# Cold-agent run: headless Claude Code in an isolated sandbox with ONLY the
# deployed Orchestra MCP server. Archives transcript + produced workspace,
# then renders the verdict report.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENDPOINT="${ORCHESTRA_ENDPOINT:-https://orchestra-mcp-sdlc.mpazbot.workers.dev/mcp}"
MAX_TURNS="${PILOT_MAX_TURNS:-40}"

KEY="${ORCHESTRA_API_KEY:-}"
if [[ -z "$KEY" ]]; then
  DEV_VARS="$HERE/../mcp-sdlc/.dev.vars"
  [[ -f "$DEV_VARS" ]] && KEY="$(grep '^API_KEY=' "$DEV_VARS" | cut -d= -f2-)"
fi
[[ -n "$KEY" ]] || { echo "FAIL: no API key" >&2; exit 1; }

"$HERE/preflight.sh"

SANDBOX="$(mktemp -d /tmp/orchestra-pilot.XXXXXX)"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_DIR="$HERE/runs/$RUN_ID"
mkdir -p "$RUN_DIR"
echo "sandbox: $SANDBOX"
echo "run dir: $RUN_DIR"

cat > "$SANDBOX/.mcp.json" <<EOF
{
  "mcpServers": {
    "orchestra": {
      "type": "http",
      "url": "$ENDPOINT",
      "headers": { "Authorization": "Bearer $KEY" }
    }
  }
}
EOF

BRIEF="$(cat "$HERE/brief.md")"

cd "$SANDBOX"
set +e
claude -p "$BRIEF" \
  --mcp-config .mcp.json \
  --strict-mcp-config \
  --setting-sources project \
  --allowedTools "mcp__orchestra" Read Write Edit Glob Grep TodoWrite \
  --max-turns "$MAX_TURNS" \
  --output-format stream-json \
  --verbose \
  > "$RUN_DIR/transcript.jsonl" 2> "$RUN_DIR/stderr.log"
CLAUDE_EXIT=$?
set -e
echo "claude exit: $CLAUDE_EXIT"

# Archive whatever the cold agent produced (excluding our own injected config)
mkdir -p "$RUN_DIR/workspace"
rm -f "$SANDBOX/.mcp.json"
if [[ -n "$(ls -A "$SANDBOX" 2>/dev/null)" ]]; then
  cp -R "$SANDBOX/." "$RUN_DIR/workspace/"
fi
rm -rf "$SANDBOX"

node "$HERE/analyze.mjs" "$RUN_DIR"
echo
echo "archived: $RUN_DIR"
