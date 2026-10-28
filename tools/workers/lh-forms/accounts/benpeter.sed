# The second Cloudflare account (turnsthe.page; CI: CLOUDFLARE_API_TOKEN_BENPETER,
# vars.CLOUDFLARE_ACCOUNT_ID_BENPETER): wrangler.toml with these ids replaced
# (tools/workers/account-config.sh). Names, bindings, vars and code are the same in both accounts;
# the Durable Object migration and the rate limit namespace apply there on the first deploy.
# Turnstile widget of the account (its secret TURNSTILE_SECRET is set there)
s/0x4AAAAAAFnIbr4JnmqxGNVc/0x4AAAAAAFqInbtR3tz5FcF4/
