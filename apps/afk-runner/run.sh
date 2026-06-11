#!/usr/bin/env bash
# AFK runner — one scheduled tick of the loop (ADR-003).
# Reads repo state; if work can proceed, runs one headless Claude Code
# session from the checkout; pings ntfy when a new human gate appears.
set -euo pipefail

REPO="${1:?usage: run.sh <repo-path> <work-item>}"
WORK_ITEM="${2:?usage: run.sh <repo-path> <work-item>}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NTFY_TOPIC="${NTFY_TOPIC:-orchestra-lenny-d25adf95a628}"
MAX_TURNS="${AFK_MAX_TURNS:-50}"

# Orchestra API key for the repo's .mcp.json (${ORCHESTRA_API_KEY} expansion)
if [[ -z "${ORCHESTRA_API_KEY:-}" ]]; then
  DEV_VARS="$HERE/../mcp-sdlc/.dev.vars"
  [[ -f "$DEV_VARS" ]] && export ORCHESTRA_API_KEY="$(grep '^API_KEY=' "$DEV_VARS" | cut -d= -f2-)"
fi

# One runner at a time per repo.
LOCK="/tmp/afk-runner-$(echo "$REPO" | shasum | cut -c1-12).lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "another runner holds $LOCK — exiting"
  exit 0
fi
trap 'rmdir "$LOCK"' EXIT

cd "$REPO"
git remote get-url origin >/dev/null 2>&1 && git pull --quiet || true

VERDICT_JSON="$(node "$HERE/check-state.mjs" "$REPO" "$WORK_ITEM")"
VERDICT="$(echo "$VERDICT_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['verdict'])")"
echo "check-state: $VERDICT"

case "$VERDICT" in
  blocked) echo "pending gate awaits a human — nothing to do"; exit 0 ;;
  done)    echo "work item closed — nothing to do"; exit 0 ;;
esac

GATES_BEFORE="$(ls "$REPO/.orchestra/work/$WORK_ITEM/gates" 2>/dev/null | sort || true)"

RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_DIR="$HERE/runs/$RUN_ID"
mkdir -p "$RUN_DIR"

PROMPT="You are an unattended scheduled session working in this repository.
Nobody is at the keyboard. First call orchestra_get_skill with name
\"orchestra-afk\" and follow that playbook exactly — it defines how you
orient, work, pause at human gates, and exit. The active work item is
\"$WORK_ITEM\". Honor any answered gate before doing anything else."

set +e
claude -p "$PROMPT" \
  --mcp-config .mcp.json \
  --strict-mcp-config \
  --setting-sources project \
  --allowedTools "mcp__orchestra" Bash Read Write Edit Glob Grep TodoWrite \
  --max-turns "$MAX_TURNS" \
  --output-format stream-json \
  --verbose \
  > "$RUN_DIR/transcript.jsonl" 2> "$RUN_DIR/stderr.log"
CLAUDE_EXIT=$?
set -e
echo "session exit: $CLAUDE_EXIT (transcript: $RUN_DIR/transcript.jsonl)"

# Ping if the session raised a new gate.
GATES_AFTER="$(ls "$REPO/.orchestra/work/$WORK_ITEM/gates" 2>/dev/null | sort || true)"
NEW_GATES="$(comm -13 <(echo "$GATES_BEFORE") <(echo "$GATES_AFTER") | grep -v '^$' || true)"
if [[ -n "$NEW_GATES" ]]; then
  for G in $NEW_GATES; do
    GATE_PATH=".orchestra/work/$WORK_ITEM/gates/$G"
    QUESTION="$(grep -m1 '^# Gate' "$REPO/$GATE_PATH" | sed 's/^# //' || echo "$G")"
    curl -s -o /dev/null -X POST "https://ntfy.sh/$NTFY_TOPIC" \
      -H "Title: AFK gate — $WORK_ITEM" \
      -H "Priority: high" \
      -H "Tags: orchestra,gate" \
      -d "$QUESTION
Repo: $REPO
Gate file: $GATE_PATH
Answer: edit status to 'answered' + add answer:, then commit." || true
    echo "pinged ntfy for $G"
  done
fi
