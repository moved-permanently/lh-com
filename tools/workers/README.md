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

The demo moves to a second Cloudflare account and the domain turnsthe.page. During the parallel
run both accounts run the same code: every deploy goes to both, and each turnsthe.page host
answers like its bbird.live twin.

| | Blackbird | Second account |
| --- | --- | --- |
| Hosts | `*.bbird.live` | `*.turnsthe.page` |
| workers.dev | `*.aem-poc-lab.workers.dev` | `*.benpeter.workers.dev` |
| Deploy token (repository secret) | `CLOUDFLARE_API_TOKEN` | `CLOUDFLARE_API_TOKEN_BENPETER` |
| Account id | in the workflows | the repository variable `CLOUDFLARE_ACCOUNT_ID_BENPETER` (not in the repository) |
| Config | `wrangler.toml` | `wrangler.toml` with `accounts/benpeter.sed` applied |

Host pairs (the new host gets its twin's treatment in every list of the code and config;
`test/host-twins.test.mjs` and `lh-edge/test/twins.test.mjs` check them):

| Blackbird | Second account |
| --- | --- |
| lhcom.bbird.live (Adobe's CDN in front, rules in scdemos/demo `workers/adobe/config/cdn.yaml`) | lufthansa.turnsthe.page (lh-edge is the front door, `lh-edge/src/front-door.js`) |
| lhedge.bbird.live | lufthansa-edge.turnsthe.page |
| lhcn.bbird.live | lufthansa-cn.turnsthe.page |
| lhforms.bbird.live | lufthansa-forms.turnsthe.page |
| lhdiscover.bbird.live | lufthansa-discover.turnsthe.page |
| `*.aem-poc-lab.workers.dev` | `*.benpeter.workers.dev` |

The site picks the second account's Workers on the turnsthe.page hosts (`scripts/demo.js`
`isTurnsThePageHost`: the form block's worker, the data widgets' proxy); the admin apps' default
lh-backends (`tools/admin/shared/helpers.js` `DEFAULT_API`) stays Blackbird's until the switch.

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
