#!/bin/bash
# md-run.sh <run dir> <host> <warm-up path> [gap ms, default 500] [urls file, default <run dir>/urls.txt] [md-fetch options...]
# One fetch stream for one host: refuses to start while another md-run.sh stream runs on the same host (lock directory
# ${TMPDIR:-/tmp}/market-diff-<host>.lock; streams on different hosts may run side by side), then runs bin/md-fetch.mjs
# with redirect targets, stop at the first block and any 403 counted as a block; the log goes to <run dir>/fetch.log.
# Extra md-fetch options (e.g. --chrome <path>, --headless, --max 100) follow the urls file.
# Exit code: md-fetch's (0 done, 2 stopped by STOP or limits, 3 blocked, 4 warm-up blocked, 5 warm-up failed without a
# block), or 6 when another stream holds the host.
# Stop it gracefully with: touch <run dir>/STOP (remove the file before the next start).
set -u
DIR="$1"; HOST="$2"; WARM="$3"; GAP="${4:-500}"; URLS="${5:-$1/urls.txt}"
shift $(( $# < 5 ? $# : 5 ))
cd "$(dirname "$0")/.." || exit 1
mkdir -p "$DIR"
LOCK="${TMPDIR:-/tmp}/market-diff-${HOST//[^a-zA-Z0-9.-]/_}.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  other=$(cat "$LOCK/pid" 2>/dev/null)
  if [ -n "$other" ] && kill -0 "$other" 2>/dev/null; then
    echo "$(date -u +%FT%TZ) another stream on $HOST (pid $other): not started" | tee -a "$DIR/fetch.log"
    exit 6
  fi
  echo "$(date -u +%FT%TZ) stale lock of pid ${other:-?} on $HOST removed" >> "$DIR/fetch.log"
fi
echo $$ > "$LOCK/pid"
trap 'rm -rf "$LOCK"' EXIT
# extra options first: md-fetch takes the first value of an option, so they win over the defaults after them
node bin/md-fetch.mjs "$@" --host "$HOST" --urls "$URLS" --out "$DIR" --gap "$GAP" --warmup "$WARM" \
  --redirect-targets --max-blocks 1 --forbidden-is-block >> "$DIR/fetch.log" 2>&1
code=$?
echo "$(date -u +%FT%TZ) md-fetch exit $code" >> "$DIR/fetch.log"
pgrep -f "user-data-dir=$(cd "$DIR" && pwd)/chrome-profile" >/dev/null && echo "$(date -u +%FT%TZ) WARNING: the browser of this run is still open" >> "$DIR/fetch.log"
exit $code
