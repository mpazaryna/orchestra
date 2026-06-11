#!/usr/bin/env bash
# Seed a real repository from parked Lenny's workspace export (ADR-003
# continuity: the relnotes work item continues where the conductor left off).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-$HOME/workspace/relnotes}"
LENNY_URL="${LENNY_URL:-https://orchestra-agent-lenny.mpazbot.workers.dev}"
TODAY="$(date +%Y-%m-%d)"

LKEY="${LENNY_API_KEY:-}"
if [[ -z "$LKEY" ]]; then
  DEV_VARS="$HERE/../agent-lenny/.dev.vars"
  [[ -f "$DEV_VARS" ]] && LKEY="$(grep '^LENNY_API_KEY=' "$DEV_VARS" | cut -d= -f2-)"
fi
[[ -n "$LKEY" ]] || { echo "FAIL: no LENNY_API_KEY"; exit 1; }
[[ -e "$TARGET" ]] && { echo "FAIL: $TARGET already exists"; exit 1; }

mkdir -p "$TARGET"
curl -s "$LENNY_URL/workspace?work=relnotes" -H "Authorization: Bearer $LKEY" \
  | python3 - "$TARGET" "$TODAY" <<'PYEOF'
import json, sys, os
target, today = sys.argv[1], sys.argv[2]
files = json.load(sys.stdin)
for path, content in files.items():
    # Lenny had no clock and dated everything 2025-06-13; normalize.
    content = content.replace('2025-06-13', today).replace('2025-Q2', '2026-Q2')
    rel = path.lstrip('/').replace('2025-Q2', '2026-Q2')
    dest = os.path.join(target, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w') as fh:
        fh.write(content)
print(f"wrote {len(files)} files to {target}")
PYEOF

cat > "$TARGET/.mcp.json" <<'EOF'
{
  "mcpServers": {
    "orchestra": {
      "type": "http",
      "url": "https://orchestra-mcp-sdlc.mpazbot.workers.dev/mcp",
      "headers": { "Authorization": "Bearer ${ORCHESTRA_API_KEY}" }
    }
  }
}
EOF

cd "$TARGET"
git init -q -b main
git add -A
git commit -q -m "chore: seed from Orchestra conductor workspace (ADR-003 continuity)

Planning artifacts and partial implementation produced by Agent Lenny
(parked, see orchestra ADR-003) for the relnotes work item. Dates
normalized from the conductor's clockless guesses."
echo "seeded: $TARGET ($(git -C "$TARGET" rev-parse --short HEAD))"
