# b2b-member

Custom **b2b-member** block. Purpose: one view of Lufthansa Group for Business' member area (lh-b2b `/<root>/home`, `fund`, `history`, `usermanagement`, `reports`, `profile`, `lhghome`), its texts from the document and its data from lh-backends on the site's own host.

What the block reads is the brief's contract for lh-backends, nothing more: the session (`{ company, experts }`, each null or the person's name, e-mail and home), the accounts of `user/roles` (`accountId`, `accountName`, `companyId`, `companyName`, `programme`, `roles`; 401 when signed out) and the views' endpoints (403 without the rights). The block knows no role names and no answer shapes beyond that: access is the backend's 403, and the fund, history, users and reports answers are shown as they come.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, 2 columns, label | value; every row optional. The variant names the view:

| Variant | Page | Shows | Asks |
| --- | --- | --- | --- |
| `dashboard` (default) | home | greeting with the person's name, the document's tiles, the accounts | session, user/roles |
| `fund` | fund | the answer for the account | `csf/accounts/{accountId}` |
| `history` | history | the answer for the account | `csf/accounts/{accountId}/orders/history` |
| `users` | usermanagement | the answer for the account's company | `companies/{companyId}/users` |
| `reports` | reports | the answer for the account's company (no Tableau) | `POST reporting/overview/{companyId}` |
| `profile` | profile | the person's fields (not `home`), company and account | session, user/roles |
| `accounts` | lhghome | the companies, their programme, accounts and roles | user/roles |

The account: `?account=` or `?company=` when the visitor has it, else the first of `user/roles`.

Rows:

- Texts (English and German built in; a row with the key overrides it): `Loading`, `Empty`, `Forbidden`, `Error`, `Greeting` (`{name}` is the person's name), `Accounts title`, `Name label`, `Company label`, `Account label`, `Programme label`, `Roles label`.
- `Fund tile | link`, `History tile | link`, `Reports tile | link`, `Users tile | link`: the dashboard's tiles, in this order; with none of them the four pages with the built-in texts. Every tile is shown: a page the visitor has no rights for answers with `Forbidden`.
- `Label <field> | text`: the label of an answer's field (without a row the field's name in words, `validFrom` as "Valid from").
- `Value <value> | text`: the text of a value (a code).
- `Hide | field, field`: fields left out.
- `Login page | link`: where a signed-out visitor goes (default `/<root>/login?redirect=<this page>`).

Unknown rows are ignored.

## Behaviour

An answer is shown as it comes: an object as a list of its fields, a list of objects as a table (one column per field), a list of values as a list; numbers and dates (`YYYY-MM-DD`, ISO times) in the page's language. 401 (roles or the view): the login page, back here after the sign-in; 403: `Forbidden`; nothing to show: `Empty`; any other failure: `Error`. The member pages' gate in lh-edge sends a signed-out visitor to the sign-in before the page is served on the site's host; the block's own checks cover preview hosts and an expired session.

## Universal Editor fields

N/A (Document Authoring project)
