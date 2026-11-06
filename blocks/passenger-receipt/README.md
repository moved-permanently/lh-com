# passenger-receipt

www.lufthansa.com's passenger receipt download form (www's `passenger-receipt-portal` app on
`/{cc}/{ll}/book-and-manage/pax-receipt`; capture lh-parity-003, 2026-11-06).

## Authoring (Document Authoring)

An empty block table (`passenger-receipt`) where the form goes: on the pax-receipt pages right
after the "Request passenger receipt" link. Nothing to author: every text comes from the block
(`passenger-receipt-texts.js`: en and de as www's labels, the other languages of lufthansa.com the
replica's own) and, when it answers, the label service (`/service/api/labels/passengerreceipt/lh/<lang>`),
whose texts win. The importer maps www's `.wrapper > passenger-receipt-portal` to it (info template).

## Behaviour

- Fields as www: Ticket number (hint "Enter your 13-digit ticket number"), First name, Last name
  (side by side from 768px), "This receipt is for business purposes" (not sent; www only counts it),
  "Download Passenger Receipt".
- www's rules: the ticket number required, at most 14 characters, 13 digits written
  `2201234567890` or `220-1234567890` (the dash is dropped), starting with 220; first name 1-56,
  last name 1-57 characters of www's letters. A field is checked once it has been left after typing,
  then on every change; all fields on submit.
- On leaving a name field its accented letters are converted by www's table of the page language
  (`accents.js`, generated from www's script; German umlauts to AE/OE/UE), with www's note.
- Errors: a box above the fields (count, headline, a link to each field; it gets the focus) and a
  message under each field (aria-invalid, aria-describedby).
- Hand-off (scripts/handoff.js): off the airline's own www host the valid form opens the same page
  on www, where the visitor downloads the receipt; nothing is sent from this site. On the own host
  (or with `?handoff=post`) the block does what www's script does: it reads
  `/digitalhangar/passenger-receipt-portal/passenger-receipt-portal/runtime-config.json` on its own
  origin (the service URL and its key), POSTs `{ticketNumber, firstName, lastName}` to
  `<service>/download` with `X-API-KEY`, `X-Tenant-id: LH` and `Accept-Language`, saves the PDF of
  the answer (`documentContent`) as `<ticket>.pdf` and shows www's success texts; an error answer's
  codes show www's texts (`passengerreceipt.errors.bff.*`), else its general error. Without that
  config (every host but the own www today) nothing is sent and the general error shows. The key is
  never in this code.

## Supported variations

None.

## Universal Editor fields

N/A (Document Authoring project)
