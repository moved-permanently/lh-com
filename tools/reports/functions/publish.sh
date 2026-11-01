#!/bin/bash
# Upload out/page.html to DA as /migration-status/functions, preview and publish it, then check the served page.
# Needs an IMS token with write access to moved-permanently/lh-com in ~/.aem/da-token.json
# (npx -y github:adobe-rnd/da-auth-helper token). Run render.mjs first.
# Routes: POST /preview/{org}/{site}/{ref}/{path} (updatePreview) and POST /live/{org}/{site}/{ref}/{path}
# (publishResource) in adobe/helix-admin docs/openapi.
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs --check
T=$(python3 -c "import json,os;print(json.load(open(os.path.expanduser('~/.aem/da-token.json')))['access_token'])")
UA='Mozilla/5.0 lh-functions'
curl -sf -A "$UA" -H "Authorization: Bearer $T" -X PUT -F "data=@out/page.html;type=text/html" \
  https://admin.da.live/source/moved-permanently/lh-com/migration-status/functions.html -o /dev/null -w 'upload %{http_code}\n'
for op in preview live; do
  curl -sf -A "$UA" -H "Authorization: Bearer $T" -X POST \
    "https://admin.hlx.page/$op/moved-permanently/lh-com/main/migration-status/functions" -o /dev/null -w "$op %{http_code}\n"
done
node render.mjs --verify
