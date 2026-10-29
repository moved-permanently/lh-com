# The Workers of lh-com

| Worker | Folder | Deploy workflow |
| --- | --- | --- |
| lh-edge | `lh-edge/` | `.github/workflows/deploy-lh-edge.yaml` |
| lh-forms | `lh-forms/` | `.github/workflows/deploy-lh-forms.yaml` |
| lh-messages | `lh-messages/` | `.github/workflows/deploy-lh-messages.yaml` |
| lh-proxy | `lh-proxy/` | `.github/workflows/deploy-lh-proxy.yaml` |
| lh-msm | `lh-msm/` (README only: the code is da-sites/da-msm, pinned in the workflow) | `.github/workflows/deploy-lh-msm.yaml` |

lh-backends lives in its own repository (moved-permanently/lh-backends) and deploys the same way.

## Two accounts

The demo lives on a second Cloudflare account and the domain turnsthe.page; its main host is
**lufthansa.turnsthe.page**. The bbird.live hosts on Blackbird are the old ones: they keep answering
exactly as before until they are retired. Until then both accounts run the same code: every deploy
goes to both, and each turnsthe.page twin answers like its bbird.live host.

| | Blackbird | Second account |
| --- | --- | --- |
| Hosts | `*.bbird.live` | `*.turnsthe.page` |
| workers.dev | `*.aem-poc-lab.workers.dev` | `*.benpeter.workers.dev` |
| Deploy token (repository secret) | `CLOUDFLARE_API_TOKEN` | `CLOUDFLARE_API_TOKEN_BENPETER` |
| Account id | in the workflows | the repository variable `CLOUDFLARE_ACCOUNT_ID_BENPETER` (not in the repository) |
| Config | `wrangler.toml` | `wrangler.toml` with `accounts/benpeter.sed` applied |

### Brand hosts

On turnsthe.page each Lufthansa group brand has its own first-level host, `<brand>.turnsthe.page`,
and `<brand>-<role>.turnsthe.page` for its helper hosts: `lufthansa`, `lufthansa-edge`,
`lufthansa-cn`, `lufthansa-forms`; Discover is `discover.turnsthe.page`; later brands the same
(`austrian.turnsthe.page`, `austrian-cn.turnsthe.page`). The brands are one list,
`scripts/demo.js` `TURNSTHE_PAGE_BRANDS` (not the whole domain: other demos may live on
turnsthe.page); the site's demo-host checks and lh-edge's head-URL rewrite read it. Brand hosts that
are no twin (discover and later) have no bbird.live host and never get one.

### Host pairs

The twin gets its bbird.live host's treatment in every list of the code and config
(`test/host-twins.test.mjs` and `lh-edge/test/twins.test.mjs` check them):

| Blackbird | Second account |
| --- | --- |
| lhcom.bbird.live (Adobe's CDN in front, rules in scdemos/demo `workers/adobe/config/cdn.yaml`) | lufthansa.turnsthe.page (lh-edge is the front door, `lh-edge/src/front-door.js`) |
| lhedge.bbird.live | lufthansa-edge.turnsthe.page |
| lhcn.bbird.live | lufthansa-cn.turnsthe.page |
| lhforms.bbird.live | lufthansa-forms.turnsthe.page |
| `*.aem-poc-lab.workers.dev` | `*.benpeter.workers.dev` |

The site calls the second account's Workers everywhere but on the old bbird.live hosts
(`scripts/demo.js` `isBbirdLiveHost`): the form block's worker (`scripts/lh-forms.js`
`FORMS_ENDPOINT`), the data widgets' proxy (`scripts/lh-data.js` `PROXY_ORIGIN`) and the admin
apps' lh-backends (`tools/admin/shared/helpers.js` `DEFAULT_API`); on lhcom, lhedge and lhcn the
`*_BBIRD` constants, Blackbird's, until those hosts are retired.

### Head URLs on turnsthe.page

The site config's production host is still lhcom.bbird.live (lhcom's CDN purge depends on it), so
Edge Delivery writes it into every page's canonical, hreflang, og:* and twitter:* URLs. lh-edge
rewrites them on the turnsthe.page brand hosts to the host (an alias host such as lufthansa-cn: to
its brand's main host), see `lh-edge/README.md` "Head URLs". It goes away (`HEAD_URLS_FROM` empty)
when the production host moves to turnsthe.page.

### The id maps

Names, bindings, vars and code are the same in both accounts; only resource ids differ. Each
Worker that has one keeps them in `<worker>/accounts/benpeter.sed` (`s/<Blackbird id>/<id>/`):

| Worker | Ids |
| --- | --- |
| lh-edge | KV `lh-events-state` (EVENTS) |
| lh-messages | KV `lh-messages-state` (STATE) |
| lh-forms | the Turnstile site key (TURNSTILE_SITE_KEY) |
| lh-proxy, lh-msm | none |

`account-config.sh <map> wrangler.toml <out>` writes the second account's config and fails when
an id of the map is not in `wrangler.toml` (the map is out of date) or still in the output. The
R2 bucket `lh-dam-media` and the service bindings (lh-backends, lh-forms, lh-messages, lh-edge)
go by name.

### How a deploy works

Each workflow runs its tests once, then a matrix with one leg per account (fail-fast off: one
account's failure leaves the other's deploy):
- **blackbird**: as before, `CLOUDFLARE_API_TOKEN`, Blackbird's account id, `wrangler.toml`;
- **benpeter**: `CLOUDFLARE_API_TOKEN_BENPETER`, `vars.CLOUDFLARE_ACCOUNT_ID_BENPETER`, the
  generated config.

A first deploy to an empty account needs the bound Workers to exist, and the five workflows of a
push run at the same time: `wait-for-workers.sh` lets the second leg wait (up to 20 minutes) for
them (lh-forms: lh-backends; lh-edge: lh-backends, lh-forms, lh-messages). lh-messages and lh-edge
bind each other; Cloudflare refuses a binding to a Worker that doesn't exist, so lh-messages'
second leg then deploys without EVENTS_RELAY, waits for lh-edge and deploys again with it (the
first deploy to the second account, 2026-10-28, went that way).

Secrets are set per account in Cloudflare, never by the workflows (see each Worker's README).

### Rollback

- A change: `git revert` of its push; the workflows deploy the reverted code to both accounts.
- One account only: run the Worker's workflow by hand after the revert, or roll back in that
  account's Cloudflare dashboard (Deployments).
- Leaving the parallel run: remove the account's row from the five workflows' matrices (and,
  for Blackbird, its custom domains); the other account keeps deploying.
