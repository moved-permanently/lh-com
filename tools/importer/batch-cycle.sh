#!/usr/bin/env bash
# One capture + import + upload cycle, sized to finish in about 10 minutes:
#   1. capture the next pages through the warm Bright Data session (stale captures first),
#   2. import every captured page that is not imported yet (offline, from snapshots),
#   3. page metadata from the live head (head-metadata.mjs), then the Edge Delivery media limits
#      (postprocess-media.mjs),
#   4. upload new or changed documents to DA and preview them (preview only, never live),
#   5. rebuild the recorded live data from the responses the pages loaded themselves.
# Prints one progress line. Usage: tools/importer/batch-cycle.sh [capture-batch]
cd "$(dirname "$0")/../.." || exit 1
BATCH="${1:-14}"
timeout 400 node tools/importer/bd-session.mjs --list tools/importer/urls-capture.txt --batch "$BATCH" \
  --since 2026-10-21T18:46:00Z --format jpg --widths 1440,768,390 --parity-list tools/importer/urls-parity.txt \
  > /tmp/bd-session.log 2>&1
CAPTURE_EXIT=$?
grep -E "^bd-session: .*(captured|BLOCKED)|BLOCKED|net-error|error page" /tmp/bd-session.log | tail -3
CAPTURED=$(grep -c " ok https://" /tmp/bd-session.log)
# a silent run (e.g. the remote browser did not connect) must not look like success
if [ "$CAPTURED" = "0" ]; then
  echo "capture: nothing captured (exit $CAPTURE_EXIT): $(grep -v -i 'endpoint\|wss://' /tmp/bd-session.log | grep -iE 'error|timeout|blocked' | head -2 | cut -c1-160)"
fi
# shared lock /tmp/lh-local-browser.lock: the importer starts a local Chromium (one local browser
# at a time) and import/upload state files must not be written by two processes at once
exec 9> /tmp/lh-local-browser.lock
flock 9
for t in $(node -e "console.log(require('./tools/importer/page-templates.json').templates.map((t) => t.name).join(' '))"); do
  node tools/importer/import-batch.mjs "$t" --batch 60 2>&1 | grep -v "nothing to import" | grep -o "^[a-z-]*: [0-9]*/[0-9]* imported"
done
node tools/importer/head-metadata.mjs 2>&1 | tail -1
node tools/importer/share-sections.mjs 2>&1 | tail -2
node tools/importer/stage-promotions.mjs 2>&1 | tail -4
node tools/importer/postprocess-media.mjs --all 2>&1 | grep -E "FAIL|fragments written|^postprocess-media:"
node tools/importer/build-upload-list.mjs > /tmp/upload-list.log 2>&1
timeout 150 node tools/importer/da-upload.mjs --list tools/importer/upload-all.txt 2> /tmp/da-upload.err | grep -E "^da-upload:|^  "
flock -u 9
node tools/importer/record-live-data.mjs 2> /tmp/record.err | grep -o "index now [0-9]* entries"
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
