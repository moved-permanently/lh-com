#!/bin/sh
# Channels setup (C in tools/reports/channels.md): writes the lh-flynet documents and the
# /demo/channels page to DA, measures the inheritance delay, detaches internet-overview and
# previews everything. Preview only, never publishes.
#
#   DA_TOKEN=<IMS token> sh tools/channels/apply.sh [step...]
#   steps: flynet timing detach merge-check inherited demo   (default: all, in this order)
#
# DA_TOKEN is sent as Authorization to admin.da.live and admin.hlx.page and, for previews on
# lh-flynet, also as x-content-source-authorization (the DA multi-site worker
# https://lh-msm.aem-poc-lab.workers.dev answers 401 without it).
# The merge itself is done in the DA editor (Multi-site Manager plugin, see "merge" below).
set -u
ORG=moved-permanently
DIR=$(cd "$(dirname "$0")" && pwd)/da
DA=https://admin.da.live/source/$ORG
ADMIN=https://admin.hlx.page/preview/$ORG
COM=https://main--lh-com--$ORG.aem.page
FLY=https://main--lh-flynet--$ORG.aem.page
TOKEN=${DA_TOKEN:-}
[ -n "$TOKEN" ] || { echo "set DA_TOKEN (IMS token)"; exit 2; }

put() { # site path file type
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H "Authorization: Bearer $TOKEN" \
    -F "data=@$3;type=$4" "$DA/$1/$2")
  echo "DA  $code $1/$2"
}
preview() { # site path
  if [ "$1" = lh-flynet ]; then
    code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H "Authorization: Bearer $TOKEN" \
      -H "x-content-source-authorization: Bearer $TOKEN" "$ADMIN/$1/main/$2")
  else
    code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H "Authorization: Bearer $TOKEN" \
      "$ADMIN/$1/main/$2")
  fi
  echo "PRV $code $1/$2"
}
has() { # url text
  curl -s --compressed "$1?nocache=$(date +%s)" | grep -q "$2"
}

ONBOARD="de/en/services-on-board de/en/menus-on-long-haul-flights de/en/menus-travel-classes
de/en/onboard-delights de/en/childrens-menus-on-board de/en/during-your-trip/lhg-wifi
de/en/lufthansa-first-class-entertainment de/en/children-on-board de/en/doctor-on-board
de/en/miles-and-more de/en/imprint de/de/services-an-bord de/de/menues-auf-langstreckenfluegen
de/de/menues-reiseklassen de/de/onboard-delights de/de/kindermenues-an-bord
de/de/during-your-trip/lhg-wifi de/de/lufthansa-first-class-entertainment de/de/kinder-an-bord
de/de/doctor-on-board de/de/miles-and-more de/de/impressum"

step_flynet() { # sheets, nav, footer, start pages: what lh-flynet holds besides the override
  put lh-flynet metadata.json "$DIR/lh-flynet/metadata.json" application/json
  put lh-flynet flight.json "$DIR/lh-flynet/flight.json" application/json
  for l in de/en de/de; do
    for d in nav footer homepage; do put lh-flynet "$l/$d.html" "$DIR/lh-flynet/$l/$d.html" text/html; done
  done
  preview lh-flynet metadata.json
  preview lh-flynet flight.json
  for l in de/en de/de; do for d in nav footer homepage; do preview lh-flynet "$l/$d"; done; done
}

step_timing() { # source edit on lh-com -> visible on the lh-flynet preview (page still inherited)
  P=de/en/during-your-trip/internet-overview
  put lh-com "$P.html" "$DIR/lh-com/$P.html" text/html
  start=$(date +%s)
  preview lh-com "$P"
  i=0
  while [ $i -lt 40 ]; do
    preview lh-flynet "$P" > /dev/null
    if has "$FLY/$P.plain.html" "Entertainment on board"; then
      echo "TIMING lh-com source edit -> lh-flynet preview shows it after $(( $(date +%s) - start )) s ($((i + 1)) lh-flynet previews)"
      return
    fi
    i=$((i + 1)); sleep 15
  done
  echo "TIMING not visible on lh-flynet after $(( $(date +%s) - start )) s"
}

step_detach() { # what MSM "Detach" does (copyFromSource) plus the onboard-only intro
  for l in de/en de/de; do
    P=$l/during-your-trip/internet-overview
    put lh-flynet "$P.html" "$DIR/lh-flynet/$P.html" text/html
    preview lh-flynet "$P"
  done
}

step_merge_check() { # after the merge in the DA editor (see tools/reports/channels.md)
  P=de/en/during-your-trip/internet-overview
  preview lh-flynet "$P"
  has "$FLY/$P.plain.html" "On board right now" && echo "OK local intro kept" || echo "MISSING local intro"
  has "$FLY/$P.plain.html" "Entertainment on board" && echo "OK upstream change merged" || echo "MISSING upstream change"
}

step_inherited() { # every onboard page the FlyNet nav links to, inherited from lh-com
  for p in $ONBOARD; do preview lh-flynet "$p"; done
}

step_demo() {
  put lh-com demo/channels.html "$DIR/lh-com/demo/channels.html" text/html
  preview lh-com demo/channels
  echo "open $COM/demo/channels"
}

STEPS=${*:-flynet timing detach inherited demo}
for s in $STEPS; do echo "== $s"; "step_$(echo "$s" | tr - _)"; done
echo "FlyNet start pages: $FLY/de/en/homepage $FLY/de/de/homepage"
