# form

Custom **form** block. Purpose: render-only forms built from an authored field table; nothing is ever sent.

Two looks:

- `Form`: the lufthansa.com feedback form (`.feedbackforms` / `dcep-feedback-form`, /de/en/feedback):
  two field columns in the card at desktop, required asterisks, topic-dependent modules.
- `Form (core)` (variant `core`): the lufthansa.com AEM core forms (`form.cmp-form`, POST to
  `www.lufthansa.com/content/lh/markets/...`): anmeldung-tiere-frachtraum, refund-form,
  feedback-past-flight, register-ammunition, register-animal-cabin, special-needs / betreuungsbedarf,
  add-sports-baggage / sportgepaeck-hinzufuegen, group-travel, passenger-receipt-90. One field column
  (fields 335px wide), maui "optional" marks instead of asterisks, sub-sections shown and hidden by
  checkboxes, repeatable sections, a file drop zone, live's validation messages, the submit button
  right-aligned below the last grey band.

Render-only: the form has no action and no method, every submit is prevented, no file is uploaded
and nothing is posted anywhere. The only requests are read-only GETs some fields need for display
(region select: `catalogs/countries`; airport field: `suggestions/airports`; feedback modules:
`catalogs/feedbackForm`, labels), live from www.lufthansa.com where it answers cross-origin, else
the recordings (`scripts/lh-data.js`, `data-lh-source` on the block). A valid submit shows the sent
message ("This is a preview form. Nothing has been sent."); an invalid one shows the inline
messages and moves to the first invalid field.

## Authoring (Document Authoring)

Model: `standalone`

One block table. The first row is the header; columns are matched by their header word (English or
German, any order, any column may be left out); without a recognizable header row the order below
is used. Then one row per field, heading or text, in page order.

| Column | Header words | Content |
| --- | --- | --- |
| Label | Label, Bezeichnung | Field label (maui `label` / `buttontriggerlabel`), group question, band headline, heading, button text; for `note` the rich text itself |
| Type | Type, Typ | Row type, see below. Unknown types render as text fields |
| Name | Name, Feldname | Field name (live `name`); also the key of a sub-section. Empty: derived from the label; names are made unique |
| Required | Required, Pflichtfeld | `yes` (ja, true, x): required. Any other text, e.g. `optional`: not required, and that text is shown as the field's optional mark (core). Empty or `no`: not required, no mark |
| Options | Options, Optionen | One option per line (paragraph, list item or line break): `value=Label`; `=Label` is an option with an empty value (e.g. `=Please select`); a plain `Label` gets a value derived from it; `{selected}` at the end preselects it. Long lists (243 countries) stay one cell. `hidden`: the value |
| Help text | Help text, Hilfetext, Hint | Hint under the field (may contain links); band description for `step` |
| Placeholder | Placeholder, Platzhalter | Select: empty first option (Form); region: its empty option; file: the button text |
| Validation message | Validation message, Fehlermeldung | Shown when a required field is empty (live `data-cmp-required-message` / `data-customerror`) |
| Constraint message | Constraint message, Formatfehler | Shown when the value has the wrong format: pattern, e-mail, telephone, date (live `data-cmp-constraint-message`); falls back to the Validation message |
| Rules | Rules, Regeln | One rule per line, `key=value` (or `key: value`) or a flag, see below |

Row types:

- `step`: a grey band (live `.form-section`): Label = headline, Help text = description; the following
  rows go into its white card.
- `fieldset` (subsection): a sub-section of the card (live `div#subsection-{Name} > fieldset`): Label = its
  heading (may be empty), Name = its key. Rules `hidden`: hidden at load (live class `collapse` /
  `d-none`). Rules `repeat=N`: a repeatable section, see below. The section ends at the next
  `fieldset`, `end`, `step` or `submit` row.
- `end`: ends the current sub-section; the following fields belong to the card again.
- `text`, `email`, `tel`, `number`: maui-input (label inside the empty field, floating when filled).
- `date`: maui-masked-input variant date (core): the mask (Rules `mask=DD/MM/YYYY`; default
  DD/MM/YYYY in English, DD.MM.YYYY in German) stands in the field, separators are typed for you,
  only complete real dates are valid. In `Form` a native date input.
- `textarea`: Rules `rows=7`.
- `select`: Options; Label = the trigger label shown in the empty field.
- `region`: the state / region select of a country (live `forms-country`): Rules `country=` the Name
  of the country select; hidden until a country with regions is chosen, then filled from
  `catalogs/countries` (AU, BR, CA, CN, JP, US); Placeholder = its empty option.
- `radio`, `radio-cards`: Label = question, Options = choices.
- `checkbox`: with Options, a checkbox group (Label = its heading, may be empty; required = at
  least one checked); without Options, one checkbox with the Label as its text. Rules
  `toggles=key1, key2`: checking shows those sub-sections (hidden ones) or hides them (ones shown
  at load), as live `data-target`; hidden sections are cleared, not required and not validated.
- `stepper`: maui-stepper (− value +): Rules `min=`, `max=`, `value=` (start value).
- `autocomplete`: airport field (maui-autocomplete) with live airport suggestions.
- `file`: Form: a file input (Options: accepted types and `multiple`). Form (core): the drop zone
  (live `forms-filedrop`): Label = drop prompt, Placeholder = button text, Help text = format hint,
  Required = `yes` or the optional text; Rules `accept=`, `max-files=`, `max-size=` (bytes),
  `not-allowed=` (characters not allowed in file names). Added files are checked and listed with a
  delete button, never uploaded.
- `hidden`: Name and value (Options); never shown, never sent.
- `note`: static rich text in the card (Label cell: paragraphs, lists, links, bold); paragraph
  markers such as `{copytext-small}` work.
- `submit`: the button; Label = its text (empty: Submit / Absenden). Form (core): below the last band.
- `label`: UI text override (Name = key, Label = text), see below.
- `feedback-modules` (Form only; Name = the topic select): the topic's sections from
  `/service/api/catalogs/feedbackForm` and the feedbackform / common labels, then the submit button
  (blocks/form/feedback-modules.js: modules A, B/O/P, G, H, I, J, L, M; F renders nothing; flight
  data, refund and voucher modules are not rendered).

Rules keys: `pattern=` (whole value, live `pattern` / `data-cmp-pattern`), `maxlength=`,
`minlength=`, `inputmode=` (numeric, tel, email), `uppercase` (booking codes), `mask=`, `rows=`,
`min=`, `max=`, `value=`, `step=`, `toggles=`, `hidden`, `country=`, `accept=`, `max-files=`,
`max-size=`, `not-allowed=`, and for repeatable sections `repeat=`, `add=`, `remove=`, `remaining=`.

Repeatable section (live `forms-repeatable-section`, e.g. Flight 1–4, Person 1–7): one `fieldset`
row with Rules `repeat=4` (copies in total), `add=add another flight` (link text),
`remove=Delete Flight` (label of the delete icon), `remaining=You can {n} add additional flights.`
(counter text, `{n}` = copies still hidden); Label `Flight {n}`. The rows up to the next `end`
are authored once, with base names (`carrier`, not `carrier_1`): the block renders copies 1..N with
names `carrier_1`..`carrier_N` (a region's `country=` follows), shows copy 1, adds the next one on
the link, lets the last shown copy be removed again (cleared) and hides link and counter when all
are shown. Hidden copies are not validated.

UI text overrides: a row with Type `label`, Name = key, Label = text. Keys and defaults (English /
German): sent message = This is a preview form. Nothing has been sent. / Dies ist ein
Vorschauformular. Es wurden keine Daten gesendet.; submit label = Submit / Absenden; required
marker = * / *; required text (screen-reader text for required groups) = (required) / (Pflichtfeld);
file none label = No file selected / Keine Datei ausgewählt; checkbox group error = Please select
at least one option. / Bitte wählen Sie mindestens eine Option aus.; required error / format error
(when a row has no message) = Please fill in this field. / Bitte füllen Sie dieses Feld aus.,
Please check your entry. / Bitte überprüfen Sie Ihre Eingabe.; file prompt, file or, file select,
file list headline, file remove ({NAME}), file required, file invalid type, file too big, file
invalid name, file too many ({MAX}) = the lufthansa.com common.fileupload labels (en / de);
stepper decrease / increase, repeat remove (screen-reader labels).

### Validation (as live)

Live (forms/container renderer.js, forms/text site.js, forms/options renderer.js): nothing is
checked before the first submit; the first submit checks every visible field, shows the messages
(the message replaces the hint), scrolls to the first error and focuses it; from then on every
field is re-checked while typing. Text fields: empty and required → Validation message; wrong
e-mail / telephone / pattern / date → Constraint message. Selects, radio groups, checkboxes,
autocomplete: the control's message. Fields in hidden sub-sections and hidden repeat copies are
not required and not checked (live removes `required` / `pattern` from hidden fields and clears
them). `Form` (feedback) keeps its behaviour: messages on submit, re-checked once invalid.

## Import (for the `form-core` parser)

Parser: `tools/importer/parsers/form-core.js` (block `form-core`, mapped first in the form, hub and
info templates). Source: `form.cmp-form` (one per page, `action` on www.lufthansa.com) → one block `Form (core)`
replacing the whole form (all `.form-section` bands are rows of the block, not page sections).
Read the raw snapshots (`tools/importer/bd-snapshots/...`, attributes such as `data-cmp-*`, `hint`,
`optional`, `data-target` are not in cleaned.html). Header row:
`Label | Type | Name | Required | Options | Help text | Placeholder | Validation message | Constraint message | Rules`.
Never write the form's `action`, its hidden inputs or any lufthansa.com POST URL.

Walk the form in document order and write:

| Source element | Row |
| --- | --- |
| `.form-section` | `step`: Label = `h2.form-section-headline` text (may be empty), Help text = `p.form-section-description` content |
| `div[id^="subsection-"]:not(.forms-repeatable-section) > fieldset` | `fieldset`: Label = `legend h3` text (may be empty), Name = the div id without `subsection-` (keep spaces), Rules `hidden` when the div has class `collapse` or `d-none`; then the rows of its content; then `end` |
| `div.forms-repeatable-section` (N `fieldset`s) | one `fieldset`: Label = the first legend with its number as `{n}` (`Flight 1` → `Flight {n}`), Name = the id without `subsection-`, Rules `repeat=N`, `add=` text of `maui-link-button.forms-repeat-add`, `remove=` `aria-label` of `button.forms-repeat-hide`, `remaining=` text of `p.forms-repeat-remaining` with the `span.forms-repeat-counter` as `{n}`; then the rows of the first fieldset only, Names without the trailing `_1`; then `end` |
| `.richtext` (text component) | `note`: Label cell = its HTML (p, ul/ol/li, a, strong/b, br); drop `em.lh` arrow icons, `.sr-only` spans and zero-width characters as for default content; `p.copytext-small` → paragraph + ` {copytext-small}`; a single-cell layout `table` → its cell content (see the bug below) |
| `maui-input` (in `.cmp-form-text`) | Type: `email` for type email, `tel` for tel, else `text` (pnr, anyAirlineTicketNumber, milesandmore: `text`); Label = `label`; Name = `name`; Required = `yes` when the input has `required` or the closest `.cmp-form-text` has `data-cmp-required`, else the `optional` attribute value (`optional` / `Optional`), else empty; Help text = `hint`; Validation message = the wrapper's `data-cmp-required-message`, else `data-customerror`; Constraint message = the wrapper's `data-cmp-constraint-message`; Rules: `pattern=` (`pattern`, else the wrapper's `data-cmp-pattern`), `maxlength=` (as authored, e.g. 6, 13, 1414), `inputmode=` (when not text), `uppercase` for type pnr |
| `maui-masked-input[variant=date]` + inner `maui-input` | `date`: Label/Name/Required/messages from the inner maui-input and wrapper as above; Help text = `hint` as shown (e.g. `Please enter the date of your flight. - DD/MM/YYYY`); Rules `mask=` the `mask` attribute (DD/MM/YYYY, DD.MM.YYYY); skip `input[name=date-format]` |
| `.streetAddress` (`label.label` + `input.autocomplete-input`) | `text`: Label = the label text, Name = input `name`, Required/messages from the input and wrapper as above |
| `maui-textarea` | `textarea`: Label, Name, Help text = `hint`, Required as above (or the `optional` value), Validation message = wrapper message, else `errormessage` / `customerrormessage`; Rules `rows=` |
| `maui-select` (not region) | `select`: Label = `buttontriggerlabel`; Name; Options = every `maui-option`: `optionvalue=text` (empty value as `=Please select`), `{selected}` for `selected`, skip `disabled` separators; country selects (`data-catalog`) keep the snapshot's full list; Required = `required` or wrapper `data-cmp-required="true"`; Validation message = `data-customerror`, else wrapper message |
| `.forms-region-dropdown-wrapper maui-select` | `region`: Label = `buttontriggerlabel` (live: `Staat/Region` on every locale), Name, Placeholder = `data-empty-option` (`Bitte wählen`), Required = wrapper `data-cmp-required="true"`, Validation message = the select's `data-customerror` (live shows it, e.g. `Country is a mandatory field.`), Rules `country=` the Name of the `maui-select.forms-country-dropdown-select` in the same `.countrydropdown`; no Options |
| `maui-radio-group` | `radio`: Label = `label`, Name, Options = `maui-radio` `value=text`, Required = `required` or wrapper `data-cmp-required="true"`, Validation message = `data-customerror`, else wrapper message |
| `div[data-cmp-type=checkbox]` (`h3.form-group-headline` + `maui-checkbox`es) | `checkbox`: Label = the h3 text (may be empty), Name = the checkboxes' `name`, Options = every `maui-checkbox` `value=label`, Required = `yes` when a checkbox has `required` or the wrapper `data-cmp-required="true"`, Validation message = `data-customerror`, else wrapper message; Rules `toggles=` the `data-target` values (comma-separated) |
| `maui-stepper` | `stepper`: Label, Name, Help text = `hint`, Required as above, Validation message = wrapper message, else `errormessage`; Rules `min=`, `max=`, `value=` (`selected`) |
| `maui-autocomplete.forms-autocomplete-airport` | `autocomplete`: Label = `buttontriggerlabel`, Name, Required as above, Validation message = `data-customerror`, else wrapper message, else `errormessage`; skip the hidden `*-code` input |
| `.filedrop-wrapper section.forms-filedrop` | `file`: Name = the hidden input `name` without `-fileIds`; Label = `.filedrop-desc div:first-child` text; Placeholder = the `maui-button` text; Help text = `p.footnote` (`#forms-filedrop-hint`); Required = `yes` unless the `data-forms-filedrop` JSON has `optional: true`, then the `.hint` text (`optional`); Validation message = JSON `requiredError`; Rules `accept=` acceptedFiles, `max-files=` maxFiles, `max-size=` maxFileSize, `not-allowed=` notAllowedCharacters |
| `maui-button#submit-btn` | `submit`: Label = its text (Book now, Submit, Send, Buchen, Absenden …) |
| `input[type=hidden]` (`:formstart`, `:redirect`, `_charset_`, `UUID`, `date-format`, `*-code`, `*-fileIds`) | nothing (AEM and upload internals) |

Notes from the snapshots:

- The region select is hidden on load on every locale; its texts are German in AEM on /de/en and
  /gb/en too (`Staat/Region`, `Bitte wählen`, wrapper message `Staat/Region ist ein Pflichtfeld.`),
  which is why the flattened import showed "Bitte wählen" seven times (Person 1–7). Write them as
  they are: live shows them once a country with regions is chosen (the select's own message is
  English, `Country is a mandatory field.`).
- Label texts keep live's marks (`Ticket number(s)*`, `Breed*`): they are part of the label.
- `at/de/feedback-past-flight.html` (186 KB) holds no `form.cmp-form` (no `<main>`): re-capture it.

### Bug: table cells as block names (add-sports-baggage / sportgepaeck-hinzufuegen)

On all four locales the conditional sub-sections bikeData, tandemData, golfData and skiData hold a
rich-text layout table around the conditions list:
`<div class="richtext limited-width"><table width="481" class="rte-forcedborder"><tbody><tr><td><ul><li>Booking no later than 72 hours …</li>…</ul></td></tr></tbody></table></div>`.
No parser or transformer maps or unwraps such source tables (no mapping for `.richtext table`,
the cleanup leaves tables alone), so the table reaches the document as is, and in a DA / Edge
Delivery document every table is a block whose first cell is the block name. The one cell is the whole list, so its slugified text became the
block name (`booking-no-later-than-72-hours-before-departure-…`, `buchung-bis-sp-testens-72-stunden-…`,
`maximum-1-baggage-item-1-tandem-…`, `maximal-1-gep-ckst-ck-1-tandem-…`; ä/ü become `-`) and the
block has no rows: the conditions lists are missing on preview and the page requests a block
script that does not exist. Only these four snapshots contain `rte-forcedborder` tables.

Fix (browser agent, importer): in `lufthansa-cleanup.js` `beforeTransform`, before the parsers run,
replace every source table with exactly one cell (`table` whose rows/cells are 1 × 1, as
`table.rte-forcedborder`) by the cell's child nodes (here the `ul`), so the list stays default
content (or `note` content inside the Form (core) block). Source tables with more cells must go
through a table block parser (e.g. table-striped), never stay as bare tables. Then re-import the
four pages.

Done: `unwrapSingleCellTables()` in `lufthansa-cleanup.js` (only these four snapshots have such tables);
the empty-component cleanup also leaves `form.cmp-form` alone (a band with only fields has no text).

## Supported variations

- `core` (`Form (core)`): AEM core forms, see above.

## Universal Editor fields

N/A (Document Authoring project)

## Tests

`node tools/importer/test-form.mjs`: the parsing and validation rules (`form-rules.js`) and a
decorate() run of a Form (core) table in a small DOM shim (no browser, no network).
