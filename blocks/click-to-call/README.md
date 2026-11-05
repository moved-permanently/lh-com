# click-to-call

TAP's call-back card, as www.flytap.com draws it: BySide's window (CoreMedia Engagement Cloud)
placed in the page, and BySide's floating button at the window's bottom right
(tools/reports/tap/parity.md row 66; the capture tap-byside-001, its `click-to-call.json`).

## The table

Rows of a key and a value. Every row is optional; texts are as www renders them for the card's
type and version (the capture's entry: `textHtml`, `scheduleHtml`, `buttonLabels`, `form`,
`smallPrintHtml`, `pictures`, `floatingAnchor`).

| Key | Value | From the capture | Without the row |
| --- | --- | --- | --- |
| Title | the card's title | `title` | no title |
| Text | the text, rich (www bolds part of it) | `textHtml` | no text |
| Schedule | the schedule line, rich (`**Horário:** Seg a Sex – 9:00 às 24:00 (GMT Lisboa)`) | `scheduleHtml` | no line |
| Hours | the opening hours the button follows, Lisbon time: `Mon-Fri 09:00-24:00` | the schedule list BySide used (`time_ranges_pt`) | `Mon-Fri 09:00-24:00` |
| Button | the button's text in the opening hours (`Liguem-me`, `Call me now`) | `buttonLabels.inOpeningHours` | `Call me now` |
| Button outside hours | its text outside them (`Agendar Contacto`, `Schedule contact`) | `buttonLabels.outsideOpeningHours` | `Schedule contact` |
| Phone | the telephone field's placeholder (`Telemóvel`, `Phone number`) | `form.phonePlaceholder` | `Phone number` |
| Days | the day field's options, comma-separated (`Hoje, Amanhã`) | `form.dayOptions` | `Today, Tomorrow` |
| Slots | the first and last half-hour slot (`08:00-23:30`) | `form.timeSlots.firstLast` | `08:00-23:30` |
| Small print | the text under the card, rich, with its links | `smallPrintHtml` | none |
| Image | the wide picture (the right half of the card from 601 px) | `pictures.wide` (`bg_c2call_full_2.png`, 533 x 584) | none |
| Mobile image | the phone picture (on top of the card up to 600 px) | `pictures.mobile` (`Image_container_mobile.png`, 343 x 191) | none |
| Floating button | its two lines, a paragraph each (`Quero mais conforto!` / `Ligamos grátis`) | `floatingAnchor.text`, `floatingAnchor.subText` | no floating button |
| Link | the same page on www, the button's target | the page's URL on www | www's page of the same path |

The country codes are BySide's 37, +351 first (in the block, `COUNTRY_CODES`). The fields' names
for assistive tech come from the page's language.

## Behaviour

- The card: title, text, the telephone with its country code, the day and the half-hour slot, the
  button and the schedule line; the wide picture at the right from 601 px (TAP's green wedge at the
  card's left edge), the phone picture on top up to 600 px; the small print under the card.
- The button reads Button during the opening hours (Hours, Lisbon time) and Button outside hours
  otherwise, as www; the label is set on load and again when a field takes the focus.
- www's form sends the number to TAP's call-back service (BySide). The replica's forms stay on
  TAP's site: the button opens Link (the page on www) in a new tab, and nothing typed here is
  sent anywhere.
- The floating button (Floating button): a dark pill fixed at the window's bottom right; it
  scrolls the page to the card and puts the focus in the telephone field.

## Not as www

- The country code shows no flag: BySide's flag icons are generic and are not in the capture.
- BySide sets its labels in Lato, which the replica does not load: Inter instead.
- The success and error states after a submission: the replica sends nothing.
