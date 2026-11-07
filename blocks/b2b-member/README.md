# b2b-member

Custom **b2b-member** block. Purpose: one view of Lufthansa Group for Business' member area (lh-b2b `/<root>/home`, `fund`, `history`, `usermanagement`, `reports`, `profile`, `lhghome`), its texts from the document and its data from lh-backends on the site's own host.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, 2 columns, label | value; every row optional. The variant names the view:

| Variant | Page | Shows | Role |
| --- | --- | --- | --- |
| `dashboard` (default) | home | greeting, a tile per page the roles open, the accounts | – |
| `fund` | fund | the Corporate Service Fund's balance, validity and categories | `CSF` |
| `history` | history | the fund's transactions | `CSF` |
| `users` | usermanagement | the company's users | `ADMIN` or `KAM` |
| `reports` | reports | the reporting overview and top routes (no Tableau) | `REPORTING` |
| `profile` | profile | name, e-mail, company and account | – |
| `accounts` | lhghome | the companies and accounts a staff member looks after | – |

Rows:

- Texts (English and German built in; a row with the key overrides it): `Loading`, `Empty`, `Forbidden`, `Error`, `Greeting` (`{name}` is the person's name), `Accounts title`, the tiles' texts, and the labels (`Balance label`, `Date label`, `Amount label`, …; see `TEXTS` in b2b-member.js).
- `Fund tile | link`, `History tile | link`, `Reports tile | link`, `Users tile | link`: the dashboard tile's text and address (default `/<root>/fund` and so on).
- `Type-<code> | text`, `Status-<code> | text` (history): the transaction codes' texts (e.g. `Type-purchase | Purchase`); without a row the code.
- `Login page | link`: where a signed-out visitor goes (default `/<root>/login?redirect=<this page>`).

Unknown rows are ignored.

## Behaviour

The block asks lh-backends for the roles first (`GET /service/secured/api/b2bneo/user/roles`):

- 401: the visitor goes to the login page (and back after the sign-in);
- 403, or the view's role on no account: `Forbidden` (the dashboard leaves out the tiles the roles don't open);
- no data: `Empty`; any other failure: `Error`.

`?account=` and `?company=` pick an account with the view's role; else the first. Money, numbers and dates are in the page language's format. The member pages' gate in lh-edge sends a signed-out visitor to the sign-in before the page is served on the site's host; the block's own checks cover preview hosts and an expired session.

## Universal Editor fields

N/A (Document Authoring project)
