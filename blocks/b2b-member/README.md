# b2b-member

Custom **b2b-member** block. Purpose: one view of Lufthansa Group for Business' member area (lh-b2b `/<root>/home`, `fund`, `history`, `usermanagement`, `reports`, `profile`, `lhghome`), its texts from the document and its data from lh-backends on the site's own host.

What the block reads is the brief's contract for lh-backends, nothing more: the session (`company` = `{ firstName, lastName, email, loginType, home }` for company users and staff, `experts` = `{ name, surname, email, country, language, home }`; each null when not signed in that way), the accounts of `user/roles` (`accountId`, `accountName`, `companyId`, `companyName`, `programme`, `roles`; 401 when signed out) and the views' endpoints (403 without the rights).

The roles (`accounts[].roles`) open the views: `CSF` the fund and the history, `REPORTING` the reports, `ADMIN` or `KAM` the user management (codes in any case). The member home shows only the tiles of the views one of the visitor's accounts opens, and a view asks for an account (or its company) that has the right; when none has it, the view shows `Forbidden` without asking. An answer whose accounts carry no `roles` leaves it to the backend's 403 (every tile shown). Beyond that the block knows no answer shapes: the fund, history, users and reports answers are shown as they come.

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
| `profile` | profile | the name, the person's other fields (not `home` or `loginType`), company and account | session, user/roles |
| `accounts` | lhghome | the companies, their programme, accounts and roles | user/roles |

The account: `?account=` or `?company=` when the visitor has it with the view's right, else the first of `user/roles` that has the right.

Rows:

- Texts (English and German built in; a row with the key overrides it): `Loading`, `Empty`, `Forbidden`, `Error`, `Greeting` (`{name}` is the person's name: `firstName lastName`, or `name surname`), `Accounts title`, `Name label`, `Company label`, `Account label`, `Programme label`, `Roles label`, `Value true`, `Value false` (yes / no, ja / nein), `Role CSF`, `Role REPORTING`, `Role ADMIN`, `Role KAM` (the roles in words).
- `Fund tile | link`, `History tile | link`, `Reports tile | link`, `Users tile | link`: the dashboard's tiles, in this order; with none of them the four pages with the built-in texts. A tile shows when one of the visitor's accounts has its role (see above).
- `Label <the field's words> | text`: the label of an answer's field; `accountId`, `account_id` and `account-id` are all `Label account id` (`Label accountId` works too). Without a row the field's words, so every field shown on a page should have a row in the page's language.
- `Value <value> | text`: the text of a value (a type or status code: `Value ORDER`, `Value COMPLETED`; any case). Booleans use `Value true` and `Value false`.
- `Role <code> | text`: a role's words on the accounts view; codes without words are not shown.
- `Hide | field, field`: fields left out.
- `Login page | link`: where a signed-out visitor goes (default `/<root>/login?redirect=<this page>`).

Unknown rows are ignored.

## Behaviour

An answer is shown as it comes: an object as a list of its fields, a list of objects as a table (one column per field), a list of values as a list; numbers and dates (`YYYY-MM-DD`, ISO times) in the page's language, booleans as yes / no. On a phone the fields stack (label above value) and a table scrolls inside its own box, so the page never scrolls sideways. 401 (roles or the view): the login page, back here after the sign-in; 403: `Forbidden`; nothing to show: `Empty`; any other failure: `Error`. The member pages' gate in lh-edge sends a signed-out visitor to the sign-in before the page is served on the site's host; the block's own checks cover preview hosts and an expired session.

## Universal Editor fields

N/A (Document Authoring project)
