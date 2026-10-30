# The Workers of lh-com

| Worker | Folder | Deploy workflow |
| --- | --- | --- |
| lh-edge | `lh-edge/` | `.github/workflows/deploy-lh-edge.yaml` |
| lh-forms | `lh-forms/` | `.github/workflows/deploy-lh-forms.yaml` |
| lh-messages | `lh-messages/` | `.github/workflows/deploy-lh-messages.yaml` |
| lh-proxy | `lh-proxy/` | `.github/workflows/deploy-lh-proxy.yaml` |
| lh-msm | `lh-msm/` (README only: the code is da-sites/da-msm, pinned in the workflow) | `.github/workflows/deploy-lh-msm.yaml` |

lh-backends lives in its own repository (moved-permanently/lh-backends) and deploys the same way.

## Account

All Workers run on one Cloudflare account, with the domain turnsthe.page; the main host is
**lufthansa.turnsthe.page**, also the site config's production host (`cdn.prod`). Blackbird, the
first account (the bbird.live hosts, `*.aem-poc-lab.workers.dev`), is retired: lhcom.bbird.live
answers 301 to lufthansa.turnsthe.page, the other bbird.live hosts go with the account. Until
2026-10-30 every deploy went to both accounts (the parallel run); the repository's history has it.

| | |
| --- | --- |
| Hosts | `*.turnsthe.page` (attached in the Cloudflare dashboard, no routes in `wrangler.toml`) |
| workers.dev | `*.benpeter.workers.dev` |
| Deploy token (repository secret) | `CLOUDFLARE_API_TOKEN_BENPETER` |
| Account id | the repository variable `CLOUDFLARE_ACCOUNT_ID_BENPETER` (not in the repository) |
| Config | `wrangler.toml` as is (the account's KV ids and Turnstile site key are in it) |

### Brand hosts

On turnsthe.page each Lufthansa group brand has its own first-level host, `<brand>.turnsthe.page`,
and `<brand>-<role>.turnsthe.page` for its helper hosts: `lufthansa`, `lufthansa-edge`,
`lufthansa-cn`, `lufthansa-forms`; Discover is `discover.turnsthe.page`; later brands the same
(`austrian.turnsthe.page`, `austrian-cn.turnsthe.page`). The brands are one list,
`scripts/demo.js` `TURNSTHE_PAGE_BRANDS` (not the whole domain: other demos may live on
turnsthe.page); the site's demo-host checks read it. `test/host-lists.test.mjs` checks that no
retired host is left in a Worker's vars or defaults (lh-edge's `ALIAS_REWRITE_HOSTS` keeps the old
lhcom and lhedge hosts on purpose, so old links still move to the alias host).

The site calls the account's Workers on every host: the form block's worker (`scripts/lh-forms.js`
`FORMS_ENDPOINT`), the data widgets' proxy (`scripts/lh-data.js` `PROXY_ORIGIN`) and the admin
apps' lh-backends (`tools/admin/shared/helpers.js` `DEFAULT_API`).

### Head URLs

Edge Delivery writes the production host, lufthansa.turnsthe.page, into every page's canonical,
hreflang, og:* and twitter:* URLs. lh-edge's head-URL rewrite (`lh-edge/README.md` "Head URLs") is
off (`HEAD_URLS_FROM` empty).

### How a deploy works

Each workflow runs its tests, then deploys `wrangler.toml` with `CLOUDFLARE_API_TOKEN_BENPETER` and
`vars.CLOUDFLARE_ACCOUNT_ID_BENPETER`. The service bindings (lh-backends, lh-forms, lh-messages,
lh-edge) go by name.

A first deploy to an empty account needs the bound Workers to exist, and the five workflows of a
push run at the same time: `wait-for-workers.sh` waits (up to 20 minutes) for them (lh-forms:
lh-backends; lh-edge: lh-backends, lh-forms, lh-messages). lh-messages and lh-edge bind each other;
Cloudflare refuses a binding to a Worker that doesn't exist, so lh-messages then deploys without
EVENTS_RELAY, waits for lh-edge and deploys again with it (the first deploy to this account,
2026-10-28, went that way). In the account as it is, all of them exist and nothing waits.

Secrets are set in Cloudflare, never by the workflows (see each Worker's README).

### Rollback

- A change: `git revert` of its push; the workflows deploy the reverted code.
- Without a push: run the Worker's workflow by hand (workflow_dispatch) or roll back in the
  Cloudflare dashboard (Deployments).
