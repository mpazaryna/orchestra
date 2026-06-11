#!/usr/bin/env bash
# Stamp a new Orchestra workspace repo from the starter template.
# Offline by design — nothing here touches the network.
set -euo pipefail

TARGET="${1:?usage: create.sh <target-dir> [\"one-line idea\"]}"
IDEA="${2:-<replace this with your idea — one or two sentences>}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[[ -e "$TARGET" ]] && { echo "FAIL: $TARGET already exists" >&2; exit 1; }

mkdir -p "$TARGET"
cp -R "$HERE/starter/." "$TARGET/"

NAME="$(basename "$TARGET")"
python3 - "$TARGET/README.md" "$NAME" "$IDEA" <<'PYEOF'
import sys
path, name, idea = sys.argv[1], sys.argv[2], sys.argv[3]
with open(path) as fh:
    text = fh.read()
text = text.replace('{{PROJECT_NAME}}', name).replace('{{IDEA}}', idea)
with open(path, 'w') as fh:
    fh.write(text)
PYEOF

cd "$TARGET"
git init -q -b main
git add -A
git commit -q -m "chore: new Orchestra workspace from starter template"

cat <<EOF
created: $TARGET

next steps:
  1. export ORCHESTRA_API_KEY="<your key>"
  2. cd $TARGET
  3. claude          # then follow "Your first session" in the README
EOF
