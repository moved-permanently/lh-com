# fare-comparison

TAP's fare comparison, as on www.flytap.com's fare pages (`/pt-pt/reservas/tarifas-tap`, `/en-pt/bookings/tap-fares`, `/pt-br/reservas/tarifas-tap`, `/de-ch/buchungen/tarife-tap` and the other languages; measured 2026-11-05 at 1440 and 390; brief 374, TAP parity row 99). TAP only: its colours and fonts.

## What it shows

- **Route groups:** the route groups as pills (tabs). Each group shows its title, its cabins as tabs (underlined from 1024px, pills on phones) and the cabin's title.
- **The table:** from 1024px the cabin's fares are card columns, a top border coloured by the fare, a label column as wide. On phones the table scrolls sideways: 128px columns, a dark "Services" corner, tinted fare heads with a 4px bar, the cabin over the fare, and two scroll buttons.
- **Cells:** ✓ shows as a green circle with a white check, ✕ as a thin cross. Each is named for screen readers by the caption's text ("Service included").
- **Notes:** each note is an (i) button with a tooltip. It opens on hover, keyboard focus and a tap. It closes on leaving, blur, Escape, a second tap or a tap elsewhere. The (i) is named by "Info".
- **Compare:** "Compare fares" opens a dialog with the group's fares by cabin. Up to four can be chosen, with Clear and Compare. Compare shows the chosen fares side by side; each column carries its cabin, no cabin tab is selected, and the button reads "Compare fares (2)". A fare whose table lacks a row shows an empty cell. A cabin tab, or Clear followed by Compare, goes back to the cabin view.
- **Caption box:** below the table, the legend with its icons and the notes.

## Authoring (Document Authoring)

One block table, **Fare comparison**, with two or more columns. The rows, in order:

| First cell | Other cells | Meaning |
| --- | --- | --- |
| `Group` | the route group's name | starts a route group (a pill and its title) |
| `Cabin` | the cabin's name | starts a cabin of the group (a tab and its title) |
| *(empty)*, or the corner's text | one cell per fare: `Discount`, `Classic`, … | the cabin's header row: the row right after `Cabin` |
| a service: `Hand baggage` | one cell per fare, in the header's order | a service row; any number |
| `Caption` | a list: `✓ Service included`, `✕ Service not included` | the legend; after a cabin's rows it is that cabin's, before the first `Group` it is everyone's |
| `Notes` | text | the notes under the legend; placed as Caption |
| `Compare label`, `Dialog note`, `Clear label`, `Apply label`, `Close label`, `Info label`, `Services label`, `Previous label`, `Next label`, `Caption label`, `Notes label` | a text | optional: overrides www's text of the page's language (below) |

- **Cells:**
  - The cell's plain text is its value.
  - Its italic text (`<em>`, after a line break) is its note, shown as the (i) tooltip and not in the cell. A note works on service names and on values.
  - `✓` (or `✔`) and `✕` (or `✗`, `✘`, `×`) alone are the icons, and may carry a note too.
- **Colours:** a fare column's colour comes from the fare's name. Below, the desktop top border, then the phone bar and tint:
  - Discount and Executive: #424045, then #1e5227 and #d2efd7.
  - Top Executive: #173f1e, then #1e5227 and #d2efd7.
  - Prime and Top Prime: #a11218, then #a11218 and #fbe0e0.
  - Basic, Classic, Plus and any other name: #bfd730, then #bfd730 and #f2f8dd.
- **Fare names:** they stay English in every language, as on www.
- **Reserved words:** `Group`, `Cabin`, `Caption`, `Notes` and the label keys, in a two-cell row; a service can't be named one of these.

Example (one group, one cabin, shortened):

| Fare comparison | | | |
| --- | --- | --- | --- |
| Caption label | Caption | | |
| Notes label | Notes | | |
| Group | Flights to Europe and North Africa | | |
| Cabin | Economy | | |
| | Discount | Classic | Plus |
| Hand baggage *Additionally, you can take a personal item with you.* | 1 x 10 kg / 22 lbs | 1 x 10 kg / 22 lbs | 1 x 10 kg / 22 lbs |
| Seat booking | Additional cost | ✓ *Booking a seat in the Comfort Area … has an additional cost.* | ✓ |
| Premium Check-in | ✕ | ✕ | ✓ |
| Caption | • ✓ Service included • ✕ Service not included | | |
| Notes | The fares shown here may not be available on all TAP flights. | | |
| Cabin | Business | | |
| | Executive | Top Executive | |
| … | | | |
| Group | Intercontinental flights | | |
| … | | | |

The page's intro (H1, "Choose how you want to travel", the fare list) stays default content before the block. The route groups' H2s that the documents had before come from the block now, so the import leaves them out.

The test fixtures are today's documents (2026-11-05) converted to this shape: `test/fixtures/fare-comparison/en-pt.plain.html` and `pt-pt.plain.html`. Each `accordion-columns (tabs)` block of a document became a `Group` with one `Cabin` per tab. A tab's table rows became the header and service rows, unchanged. Its Caption list and Notes became the cabin's `Caption` and `Notes` rows, and their headings became the `Caption label` and `Notes label` rows.

## Texts

These are www's, per page language (en, pt, es, fr, it, de): "Compare fares", the dialog's note ("You can select up to four fares to compare."), Clear, Compare, close (lower case, as www), Info and Services. The caption's and notes' headings default to www's ("Caption", "Notes"; pt "Legenda", "Notas"); the documents' `Caption label` and `Notes label` rows win. The phone scroll buttons have no name on www, so ours are named ("Previous", "Next").

## Universal Editor fields

N/A (Document Authoring project)
