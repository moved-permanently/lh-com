# b2b-login

Custom **b2b-login** block. Purpose: Lufthansa Group for Business' sign-in (lh-b2b `/<root>/login` for companies, `/<root>/login_internal` for Lufthansa Group staff), sent to lh-backends on the site's own host.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, 2 columns, label | value; every row optional:

- `Type | staff`: the staff sign-in (`loginType=DESMON`, home `/<root>/lhghome`); without it the company sign-in (`EXT`, home `/<root>/home`).
- `Forgotten password | link`: the link's address (default www's `https://business.lufthansagroup.com/<root>/forgotten-password`); the text is the `Forgotten password` text.
- Texts (English and German built in; a row with the key overrides it): `User name label`, `Password label`, `Show password`, `Hide password`, `Forgotten password`, `Submit label`, `Invalid login`, `No rights`, `Backend error`.

Unknown rows are ignored.

## Behaviour

A plain HTML form posted to `/<cc>/<ll>/j_security_check` (`j_username`, `j_password`, `loginType`, `resource`). Without script lh-backends answers with redirects and sends a failed sign-in back to this page with `?error=invalid-login|not-authorized|backend-not-available`; the block shows that error's text.

With script the block posts the same fields with `j_validate=true` and reads the answer:

- 200 with `redirectURL`: goes there (a same-host path only; else the `resource`);
- 403 `{"error":"invalid-login"}`: `Invalid login`;
- header `auth_status: NOT_AUTHORIZED` (staff without B2B rights): `No rights`;
- header `login_status: backend-not-available`, or anything else: `Backend error`.

`resource` (where the backend sends the visitor after the sign-in) is the page's `?redirect=` when it is a path on this host (the member pages' gate and `b2b-member` send the visitor here with it), else the member home. The password field has a show/hide button (`aria-pressed`); the message is a `role=alert`.

## Universal Editor fields

N/A (Document Authoring project)
