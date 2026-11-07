# b2b-login

Custom **b2b-login** block. Purpose: Lufthansa Group for Business' sign-in (lh-b2b `/<root>/login` for companies, `/<root>/login-internal` for Lufthansa Group staff: www's `/<root>/login_internal`, where staff are sent, is lh-edge's 301 to it, as Edge Delivery has no `_` in page names), sent to lh-backends on the site's own host.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, 2 columns, label | value; every row optional:

- `Type | staff`: the staff sign-in (`loginType=DESMON`); without it the company sign-in (`EXT`).
- `Forgotten password | link`: the link's address (default www's `https://business.lufthansagroup.com/<root>/forgotten-password`); the text is the `Forgotten password` text.
- Texts (English and German built in; a row with the key overrides it): `User name label`, `Password label`, `Show password`, `Hide password`, `Forgotten password`, `Submit label`, `Invalid login`, `No rights`, `Backend error`, `Login failed`.

Unknown rows are ignored.

## Behaviour

What the block reads is the brief's contract for lh-backends' `POST /j_security_check`, nothing more. A plain HTML form posted to `/<cc>/<ll>/j_security_check` (`j_username`, `j_password`, `loginType`, and `resource` when the page has one); without script lh-backends answers with redirects, and a page that comes back with any `?error=` shows `Login failed`.

With script the block posts the same fields with `j_validate=true` and reads the answer:

- 200 with `redirectURL`: goes there (a path on this host only); without one, to the `resource`, else the session's `home`, else `/<root>/home`;
- 403 `{"error":"invalid-login"}`: `Invalid login`;
- header `auth_status: NOT_AUTHORIZED` (staff without B2B rights): `No rights`;
- header `login_status: backend-not-available`, or anything else: `Backend error`.

`resource` (where the backend sends the visitor after the sign-in) is the page's `?redirect=` when it is a path on this host (lh-edge's member gate and `b2b-member` send the visitor here with it); without one the field is left out. The password field has a show/hide button (`aria-pressed`); the message is a `role=alert`.

## Universal Editor fields

N/A (Document Authoring project)
