# lh-msm

The DA multi-site worker (da-sites/da-msm), deployed as `lh-msm`: the content source of the sites
that inherit their pages from lh-com (lh-flynet, `tools/channels/`). The code is not copied here:
`.github/workflows/deploy-lh-msm.yaml` checks out da-msm at a pinned commit and runs
`npx -y wrangler@4 deploy --name lh-msm`; a new pin (or a change of the workflow) deploys it.
Callers send their DA token (`x-content-source-authorization`); without it the worker answers 401.

## Two accounts (the parallel run, `../README.md` "Two accounts")

lh-msm deploys to Blackbird (https://lh-msm.aem-poc-lab.workers.dev) and to the second Cloudflare
account (https://lh-msm.benpeter.workers.dev) with the same code: da-msm's `wrangler.toml` has vars
only (`CONTENT_ORIGIN`, `ADMIN_ORIGIN`), so there are no account-specific ids and no secrets.
The sites that use it as content source keep Blackbird's until their config is switched.
Rollback: git revert of the workflow change (both accounts redeploy the previous pin).
