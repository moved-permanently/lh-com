#!/bin/bash
# wait-for-workers.sh [--check] <name>...: whether each Worker exists in the account of
# CLOUDFLARE_ACCOUNT_ID (token CLOUDFLARE_API_TOKEN). Without --check, waits up to 20 minutes for
# them. For the first deploy to a new account: a service binding needs its target Worker, and the
# deploy workflows of one push run at the same time (README "Account").
set -uo pipefail
check=
if [ "${1:-}" = --check ]; then check=1; shift; fi
exists() {
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/$1/settings")
  [ "$code" = 200 ]
}
for name in "$@"; do
  if [ -n "$check" ]; then
    exists "$name" || { echo "$name: not in the account"; exit 1; }
    continue
  fi
  for i in $(seq 1 80); do
    if exists "$name"; then echo "$name: in the account"; continue 2; fi
    [ "$i" = 1 ] && echo "$name: not in the account yet, waiting (up to 20 minutes)"
    sleep 15
  done
  echo "::error::$name is not in the account after 20 minutes (its deploy failed or did not run)"
  exit 1
done
