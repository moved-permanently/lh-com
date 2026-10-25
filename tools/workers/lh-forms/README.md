# lh-forms

A Cloudflare Worker for the lufthansa.com replica (`moved-permanently/lh-com`). The `form` block
on the Edge Delivery Services hosts posts a submission here. The worker checks it and sends one
e-mail per valid submission through Cloudflare Email Service (`send_email` binding `EMAIL`).
Recipients come from a secret. It has no dependencies, and it never logs field values, file
names or addresses.

URL: https://lh-forms.aem-poc-lab.workers.dev

## Endpoints

| Method | Path | Answer |
| --- | --- | --- |
| `POST` | `/submit` | `200 {"ok":true}` or `{"ok":false,"error":"..."}` with the status below |
| `GET` | `/health` | `200 {"configured":true\|false}` |
| `OPTIONS` | `/submit`, `/health` | `204` CORS preflight (allowed origins only) |

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
| `lh_hp` | the honeypot: a hidden, empty text input. If it is not empty, the worker answers `200 {"ok":true}` and sends nothing. |
| any other name | an uploaded file (only for `feedback-past-flight`). An empty part (an empty file input) is ignored. A non-empty text part under any other name gets `400 invalid-parts`. |

Limits for `fields`: at most 400 entries and 256 KB of JSON. `section` can be up to 300
characters, `label` 1000, `name` 200 and `value` 10000.

Files follow the rules of the live dropzone on `/de/en/feedback-past-flight` (`accept=image/png,
image/jpeg, image/jpg, application/pdf`, `max-files=5`, `max-size=3700000`,
`not-allowed=#$%^*()[]`):

- at most 5 files
- each file at most 3,700,000 bytes
- at most 4,500,000 bytes for all files together
- extension `.png`, `.jpg`, `.jpeg` or `.pdf`
- a part type from the list above
- content that really is a PNG, JPEG or PDF (checked by its first bytes)
- no `#$%^*()[]`, slashes or control characters in the file name

Note: Email Service caps a whole message at 5 MiB, attachments included. 4.5 MB of attachments
may be over that cap once encoded for e-mail, and then the send fails with `502 send-failed`.
Lower `FILE_RULES.maxTotal` if that happens.

| Status | `error` |
| --- | --- |
| 200 | (`{"ok":true}`) sent, or the honeypot was filled |
| 400 | `expected-multipart`, `invalid-multipart`, `invalid-parts`, `unknown-form`, `unknown-locale`, `invalid-page`, `missing-fields`, `invalid-fields`, `fields-too-large`, `files-not-allowed`, `too-many-files`, `invalid-file-name`, `invalid-file-type` |
| 403 | `origin-not-allowed` |
| 413 | `payload-too-large` (body over 6 MB), `file-too-large`, `files-too-large` |
| 429 | `rate-limited` |
| 500 | `not-configured`, `no-recipients`, `internal-error` |
| 502 | `send-failed` (Email Service rejected the message; only the error code is logged) |

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
- Reply-To: the first field whose `name` or `label` contains `mail` (so also `email` and
  `e-mail`) and whose value is a valid address. If there is none, no Reply-To is set.
- Attachments: the uploaded files (`disposition: "attachment"`, with the type taken from the
  content).

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

- `FORM_SENDER`: the from address, for example `forms@example.com`. Its domain must be set up
  for sending in Cloudflare Email Service (dashboard → Email → Email Sending: onboard the domain
  and add the DNS records it asks for). Otherwise sends fail with `E_SENDER_NOT_VERIFIED`
  (`502 send-failed`).
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
npx wrangler@4 secret put FORM_SENDER
npx wrangler@4 secret put FORM_CONFIG < FORM_CONFIG.json   # your real file, not committed
```

`GET /health` answers `{"configured":true}` when the `EMAIL` binding is present, `FORM_SENDER`
is a valid address and `FORM_CONFIG` is a valid JSON object. Otherwise it answers
`{"configured":false}`. It never shows addresses.

## Tests

From the repo root (Node 24, no install needed):

```sh
node --test tools/workers/lh-forms/test/
npx eslint tools/workers/lh-forms
```

The tests mock the `EMAIL` binding, the per-minute limiter and the Durable Object namespace (the
real `HourlyLimiter` class runs on in-memory storage). They make no network requests.

## Deployment

Every push to `main` that changes `tools/workers/lh-forms/**` (or
`.github/workflows/deploy-lh-forms.yaml`) runs the "Deploy lh-forms" workflow. It runs `npm test`
in this folder and then `npx wrangler@4 deploy` to the Blackbird Cloudflare account, using the
repository secret `CLOUDFLARE_API_TOKEN`, the same as lh-proxy. You can also start it by hand
(workflow_dispatch). The first deploy creates the Durable Object class (migration `v1`).
Afterwards, set the two secrets and check `curl https://lh-forms.aem-poc-lab.workers.dev/health`.
