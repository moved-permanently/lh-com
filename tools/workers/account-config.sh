#!/bin/bash
# account-config.sh <map> <wrangler.toml> <out>: a Worker's config for the second Cloudflare account
# (the parallel run, README "Two accounts"): wrangler.toml with the map's resource ids replaced
# (sed lines s/<Blackbird id>/<the account's id>/; names, vars and code stay the same). Fails when
# an id of the map is not in wrangler.toml (the map is out of date) or the output still has it.
set -euo pipefail
map=$1
in=$2
out=$3
sed -f "$map" "$in" > "$out"
n=0
while IFS=/ read -r cmd old new _; do
  [ "$cmd" = s ] || continue
  grep -qF "$old" "$in" || { echo "::error::$map: $old is not in $in"; exit 1; }
  if grep -qF "$old" "$out"; then echo "::error::$map: $old is still in $out"; exit 1; fi
  grep -qF "$new" "$out" || { echo "::error::$map: $new is not in $out"; exit 1; }
  n=$((n + 1))
done < "$map"
echo "$out: $n ids replaced ($map)"
