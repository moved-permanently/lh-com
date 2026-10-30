# lh-msm

The DA multi-site worker (da-sites/da-msm), deployed as `lh-msm`: the content source of the sites
that inherit their pages from lh-com (lh-flynet, `tools/channels/`). The code is not copied here:
`.github/workflows/deploy-lh-msm.yaml` checks out da-msm at a pinned commit and runs
`npx -y wrangler@4 deploy --name lh-msm`; a new pin (or a change of the workflow) deploys it.
Callers send their DA token (`x-content-source-authorization`); without it the worker answers 401.

## Account (`../README.md` "Account")

The demo's main host is lufthansa.turnsthe.page, the site config's production host; the
bbird.live hosts are retired. Hosts on turnsthe.page follow the brand pattern
`<brand>.turnsthe.page` and `<brand>-<role>.turnsthe.page` (`../README.md` "Brand hosts").

lh-msm deploys to the account (https://lh-msm.benpeter.workers.dev): da-msm's `wrangler.toml` has
vars only (`CONTENT_ORIGIN`, `ADMIN_ORIGIN`), so there are no account-specific ids and no secrets.
lh-flynet's content source is `https://lh-msm.benpeter.workers.dev/moved-permanently/lh-flynet`.
Rollback: git revert of the workflow change (the previous pin redeploys).
