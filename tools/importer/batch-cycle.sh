#!/usr/bin/env bash
# One capture + import cycle, sized to finish in about 10 minutes:
#   1. capture the next pages through the warm Bright Data session (stale captures first),
#   2. import every captured page that is not imported yet (offline, from snapshots),
#   3. rebuild the recorded live data from the responses the pages loaded themselves.
# Prints one progress line. Usage: tools/importer/batch-cycle.sh [capture-batch]
cd "$(dirname "$0")/../.." || exit 1
BATCH="${1:-18}"
timeout 490 node tools/importer/bd-session.mjs --list tools/importer/urls-capture.txt --batch "$BATCH" \
  --since 2026-10-21T18:46:00Z --format jpg --widths 1440,768,390 --parity-list tools/importer/urls-parity.txt 2>&1 \
  | grep -E "^bd-session: .*(captured|BLOCKED)|BLOCKED|net-error|error page" | tail -3
for t in $(node -e "console.log(require('./tools/importer/page-templates.json').templates.map((t) => t.name).join(' '))"); do
  node tools/importer/import-batch.mjs "$t" --batch 60 2>&1 | grep -v "nothing to import" | grep -o "^[a-z-]*: [0-9]*/[0-9]* imported"
done
node tools/importer/record-live-data.mjs 2>/dev/null | grep -o "index now [0-9]* entries"
node -e "
const p = require('./tools/importer/import-progress.json');
const c = {};
Object.entries(p).filter(([, v]) => v.status === 'ok').forEach(([u]) => {
  const path = new URL(u).pathname;
  const k = path.startsWith('/lhg/') ? 'aircore' : path.split('/').slice(1, 3).join('/');
  c[k] = (c[k] || 0) + 1;
});
const s = require('./tools/source-export/bd-session-state.json');
const ok = Object.values(s.pages).filter((v) => v.status === 'ok').length;
console.log('imported', JSON.stringify(c), '| captured', ok);
"
