# lh-forms

A Cloudflare Worker for the lufthansa.com replica (`moved-permanently/lh-com`). The `form` block
on the Edge Delivery Services hosts posts a submission here. The worker checks it and sends one
e-mail per valid submission through the Cloudflare Email Sending REST API
(`POST https://api.cloudflare.com/client/v4/accounts/{FORM_MAIL_ACCOUNT_ID}/email/sending/send`).
The sending account is another Cloudflare account than the one the worker runs in, so it is the
REST API and not a `send_email` binding. Recipients come from a secret. It has no dependencies, and it never logs field values, file
names or addresses.

URL: https://lhforms.bbird.live (public address, used by the form block); `workers_dev = true`
keeps https://lh-forms.aem-poc-lab.workers.dev as well. The custom domain is attached to the worker in the
Cloudflare dashboard (Workers & Pages → lh-forms → Settings → Domains & Routes); `wrangler.toml`
has no routes or custom domain, because the deploy token cannot manage the bbird.live zone.

## Endpoints

| Method | Path | Answer |
| --- | --- | --- |
| `POST` | `/submit` | `200 {"ok":true}` or `{"ok":false,"error":"..."}` with the status below |
| `GET` | `/health` | `200 {"configured":true\|false}` |
| `GET` | `/config` | `200 {"botCheck":"on"\|"off","turnstileSiteKey":"..."}` (the form block's configuration) |
| `OPTIONS` | `/submit`, `/health`, `/config` | `204` CORS preflight (allowed origins only) |

Any other path answers `404 {"ok":false,"error":"not-found"}`. A wrong method answers `405`.

## CORS and Origin

An `Origin` is allowed if it matches `ALLOWED_ORIGIN_PATTERN` (the same pattern as lh-proxy:
`{branch}--lh-com|lh-flynet--moved-permanently` on aem.page/live and the DA preview, Quick Edit
and UE hosts) or is listed in `EXTRA_ALLOWED_ORIGINS` (`https://lhcom.bbird.live`,
`http://localhost:3000`). Both are `[vars]` in `wrangler.toml`. The worker echoes the allowed
origin and sets `Vary: Origin`. Any other origin gets `403 {"ok":false,"error":"origin-not-allowed"}`,
and so does a `POST /submit` with no `Origin` header. `GET /health` works without an `Origin`
(for curl).

## `POST /submit`

The body is `multipart/form-data` (for example a `FormData`). It has these parts:

| Part | Content |
| --- | --- |
| `form` | the form id, one of: `anmeldung-tiere-frachtraum`, `refund-form`, `feedback-past-flight`, `register-ammunition`, `register-animal-cabin`, `special-needs`, `add-sports-baggage`, `group-travel`, `passenger-receipt-90` |
| `locale` | `de-en`, `de-de`, `at-de` or `gb-en` |
| `page` | the page URL (`http:` or `https:`, at most 2000 characters) |
| `fields` | a JSON array in page order: `[{"section":"...","label":"...","name":"...","value":"..."}]`. All four keys are required and must be strings (`""` is allowed). |
| `cf-turnstile-response` | the Turnstile token (bot check below); needed when `BOT_CHECK` is on, ignored when off |
| `lh_hp` | the honeypot: a hidden, empty text input. If it is not empty, the worker answers `200 {"ok":true}` and sends nothing. |
| any other name | an uploaded file (only for `feedback-past-flight`). An empty part (an empty file input) is ignored. A non-empty text part under any other name gets `400 invalid-parts`. |

Limits for `fields`: at most 400 entries and 256 KB of JSON. `section` can be up to 300
characters, `label` 1000, `name` 200 and `value` 10000.

Files follow the rules of the live dropzone on `/de/en/feedback-past-flight` (`accept=image/png,
image/jpeg, image/jpg, application/pdf`, `max-files=5`, `max-size=3700000`,
`not-allowed=#$%^*()[]`):

- at most 5 files
- each file at most 3,700,000 bytes
- at most 3,500,000 bytes for all files together (before base64)
- extension `.png`, `.jpg`, `.jpeg` or `.pdf`
- a part type from the list above
- content that really is a PNG, JPEG or PDF (checked by its first bytes)
- no `#$%^*()[]`, slashes or control characters in the file name

The REST API takes the attachments base64-encoded in its JSON body and caps the whole message at
5 MiB including that encoding (+33 %), hence the 3.5 MB total before encoding.

| Status | `error` |
| --- | --- |
| 200 | (`{"ok":true}`) sent, or the honeypot was filled |
| 400 | `expected-multipart`, `invalid-multipart`, `invalid-parts`, `unknown-form`, `unknown-locale`, `invalid-page`, `missing-fields`, `invalid-fields`, `fields-too-large`, `files-not-allowed`, `too-many-files`, `invalid-file-name`, `invalid-file-type` |
| 403 | `origin-not-allowed` |
| 413 | `payload-too-large` (body over 6 MB), `file-too-large`, `files-too-large` |
| 429 | `rate-limited` |
| 500 | `not-configured`, `no-recipients`, `internal-error` |
| 502 | `send-failed`: the API answered a non-2xx status or `success: false`, or did not answer. The answer (`"codes"`) and the log carry only the API's error codes and machine messages, e.g. `"codes":["10001 email.sending.error.invalid_request_schema"]`, `http-503`, `network`, `timeout`; never addresses, values or the token |

The body cap is 6,000,000 bytes. A larger `Content-Length` is rejected before the body is read.
Without a `Content-Length`, the cap is enforced while the body is read.

### The e-mail

- From: `FORM_SENDER`. To: from `FORM_CONFIG` (see below).
- Subject: the subject from the config. Without one, `[lh-com] <form title> (<locale>)`. The
  form title is the page h1 in English (`de-en`, `gb-en`) or German (`de-de`, `at-de`). The
  table is `FORMS` in `src/index.js`. `special-needs` and `add-sports-baggage` have no German
  page, so they use the English title.
- HTML and plain text with the same content: the form title, the page URL, the time (ISO,
  UTC), and then one table per section (label | value) in the order the sections first appear.
  The HTML escapes every value, label and section.
- The JSON body: `to`, `from`, `reply_to`, `subject`, `html`, `text`, `attachments`.
- Reply-To (`reply_to`): the first field whose `name` or `label` contains `mail` (so also `email` and
  `e-mail`) and whose value is a valid address. If there is none, no Reply-To is set.
- Attachments: the uploaded files, `{content (base64), filename, type, disposition: "attachment"}`,
  the type taken from the content.

## Bot check (Turnstile, `BOT_CHECK`)

Cloudflare Turnstile widget "lh-com forms (lh-forms)", managed mode. It accepts only
`main--lh-com--moved-permanently.aem.page`, `.aem.live` and `lhcom.bbird.live`; branch previews
and localhost cannot render it (use Cloudflare's test keys there, see the form block).

- `TURNSTILE_SITE_KEY` (`[vars]`, public): served to the block by `GET /config`, never hard-coded
  in the block.
- `TURNSTILE_SECRET` (secret, lh-forms only): Siteverify
  (`https://challenges.cloudflare.com/turnstile/v0/siteverify`, form `secret`, `response`,
  `remoteip`). Never logged or answered.
- `BOT_CHECK` (`[vars]`): `on` (the default when unset) or `off`. On: after the honeypot and
  part checks, `/submit` needs `cf-turnstile-response`; a missing, invalid, spent or expired
  token (or a failed Siteverify call) answers `403 {"ok":false,"error":"bot-check-failed"}` and
  sends nothing; without `TURNSTILE_SECRET` it answers `500 bot-check-not-configured`. Off: no
  check (as www has it). The honeypot and the rate limits stay in both cases.
- RPC entrypoint `BotCheck` (`verify(token, ip) -> boolean`) for other Workers over a service
  binding with `entrypoint = "BotCheck"`: lh-edge's www URL
  `POST /service/secured/api/captcha/verify` uses it, so the secret stays here. It has no route
  and is not reachable from the internet.

## Abuse limits

- The Origin check above. Only the known form ids and locales are accepted.
- Per client IP (`CF-Connecting-IP`): 5 submissions per minute and 20 per hour, `429` when
  limited. The limits are checked before the body is read. Every `POST /submit` that passes the
  Origin, size and content-type checks counts, valid or not.
  - Per minute: the Workers rate limiting binding `RATE_LIMIT_MINUTE` (`limit = 5`,
    `period = 60`). Its count is approximate and per Cloudflare location.
  - Per hour: the rate limiting binding only supports a `period` of 10 or 60 seconds, so this
    limit uses a SQLite-backed Durable Object, `HourlyLimiter` (binding `HOURLY_LIMITER`,
    migration `v1` in `wrangler.toml`). There is one object per IP (`idFromName(ip)`). It stores
    the times of that IP's accepted submissions from the last hour and refuses a 21st
    (a sliding window). Each hit sets an alarm for one hour later, and when the alarm fires it
    deletes the object's storage, so idle IPs leave no data behind. A request that the
    per-minute limit refuses does not count toward the hour.

## Configuration

Secrets. They are not in `wrangler.toml`, so a deploy does not touch them:

- `FORM_MAIL_ACCOUNT_ID`: the Cloudflare account that sends (Email Sending set up there).
- `FORM_MAIL_TOKEN`: an API token of that account with Email Sending permission. Sent only as
  `Authorization: Bearer ...` to api.cloudflare.com, never logged or answered.
- `FORM_SENDER`: the from address, for example `forms@example.com`. Its domain must be set up
  for sending in that account's Email Sending (onboard the domain, add the DNS records it asks
  for); otherwise the API refuses the send (`502 send-failed` with its error code).
- `FORMS_DELIVERY_TOKEN`: the token lh-backends expects in `x-forms-delivery-token` when
  submissions are handed to it (`FORM_DELIVERY` below). Never logged; not in the repository.
- `FORM_CONFIG`: JSON, see `FORM_CONFIG.example.json`:

```json
{
  "default": { "to": ["forms@example.com"], "subject": "optional" },
  "forms": {
    "<form id>": {
      "<locale>": { "to": ["..."], "subject": "optional" },
      "*": { "to": ["..."] }
    }
  }
}
```

The lookup order is `forms[form][locale]`, then `forms[form]["*"]`, then `default`. The first
entry with at least one valid address wins, and invalid addresses are dropped. `to` can be one
string or an array of strings. The subject comes from the winning entry, else from
`default.subject`, else it is the generated one. If no entry has a valid address, the worker
answers `500 no-recipients` and sends nothing.

Set the secrets from this folder (a Cloudflare login or `CLOUDFLARE_API_TOKEN` is needed):

```sh
npx wrangler@4 secret put FORM_MAIL_ACCOUNT_ID
npx wrangler@4 secret put FORM_MAIL_TOKEN
npx wrangler@4 secret put FORM_SENDER
npx wrangler@4 secret put FORM_CONFIG < FORM_CONFIG.json   # your real file, not committed
npx wrangler@4 secret put FORMS_DELIVERY_TOKEN              # only for the hand-over to lh-backends
npx wrangler@4 secret put TURNSTILE_SECRET                  # the bot check
```

`GET /health` answers `{"configured":true}` when all four secrets are there: `FORM_MAIL_ACCOUNT_ID`
and `FORM_MAIL_TOKEN` are not empty, `FORM_SENDER` is a valid address and `FORM_CONFIG` is a valid
JSON object (with `FORM_DELIVERY` using lh-backends also the binding and `FORMS_DELIVERY_TOKEN`;
in `backends` mode instead of the mail secrets). Otherwise it answers
`{"configured":false}`. It never shows addresses.

## Delivery to lh-backends (`FORM_DELIVERY`, off by default)

lh-backends (service binding `DELIVERY`) delivers a submission to the airline's own systems in
production (on the demo it records what it would send). The var `FORM_DELIVERY` decides:

- `email` or unset (the value in `wrangler.toml`): the e-mail only; the binding is never called.
- `email+backends`: the e-mail as before; when it was sent, the same submission also goes to
  lh-backends. The visitor's answer depends on the e-mail only; a failed hand-over is logged
  (status and error code) and changes nothing.
- `backends`: no e-mail; the submission goes to lh-backends instead: `200 {ok:true}` when it
  answers 200 (delivered) or 202 (queued for a retry), otherwise `502 delivery-failed`. The mail
  secrets are not needed; `FORM_CONFIG` still gives recipients and subject (the message is built
  the same way).
- Any other value: `email`, with one warning in the log.

The hand-over is one `POST https://lh-backends/_lh-backends/forms/deliver` over the binding (the
host does not matter), after the fields and files are validated and the message is built:
`content-type: application/json`, `x-forms-delivery-token: <FORMS_DELIVERY_TOKEN>`, body
`{form, locale, page, message, fields, attachments}` (`message`: the object the mail API gets,
`from`, `to`, `subject`, `html`, `text`, `reply_to`; `attachments`: the mail's list, Base64, or
`[]`), 40 s timeout. Only the status and lh-backends' `error` code are logged, never the body,
values, file names, addresses or the token. Without the binding or the token, `/health` answers
`configured: false` in both modes that use it; `/submit` answers `500 not-configured` in
`backends` mode and sends the e-mail without the hand-over (one log line) in `email+backends`.

## Tests

From this folder (Node 24, no install needed; the shim answers `cloudflare:workers`):

```sh
npm test    # node --import ./test/cloudflare-workers-shim.mjs --test test/
npx eslint .
```

The tests mock `fetch` to the REST API (success, `success: false`, non-2xx, network error), the
per-minute limiter and the Durable Object namespace (the
real `HourlyLimiter` class runs on in-memory storage), and Siteverify as it answers Cloudflare's
published Turnstile test secrets (`1x…AA` always passes, `2x…AA` always fails, `3x…AA` token
already spent) with the dummy token `XXXX.DUMMY.TOKEN.XXXX`; never a real secret. They make no
real network requests.

## Deployment

Every push to `main` that changes `tools/workers/lh-forms/**` (or
`.github/workflows/deploy-lh-forms.yaml`) runs the "Deploy lh-forms" workflow. It runs `npm test`
in this folder and then `npx wrangler@4 deploy` to the Blackbird Cloudflare account, using the
repository secret `CLOUDFLARE_API_TOKEN`, the same as lh-proxy. You can also start it by hand
(workflow_dispatch). The worker `lh-forms` exists in that account with the four secrets and the
custom domain lhforms.bbird.live; a deploy replaces only the code (the secrets and the domain
stay). The Durable Object class comes with migration `v1`. Check with
`curl https://lhforms.bbird.live/health`.
