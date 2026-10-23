# table-price-months

Custom **table** block. Purpose: the "Lowest available fares" chart of the AirCore route pages: twelve month cards with the cheapest round-trip price of each month, each linking to the AirCore deep link of that date, card heights following the price, the cheapest month(s) with a "Best price" badge. A slider with arrows from 768px, a list with yellow bars below.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, no header row.

- Month rows have 4 cells: `Year | Month | Date | Price`
  - Year: `2026` on the first month of a year (shown above that card / as a list heading), empty on the others.
  - Month: `Oct.` (shown on the card from 768px). Date: `28 Oct.` (the cheapest date of the month).
  - Price: a link `from 220 €` to the month's deep link (the text before the first digit is the small "from" line, the rest the price). A bold text after the link (`**Best price**`) marks a best month and is its badge text. A cell without a link or price renders a grey empty card (month / date only, no link).
  - Rows with fewer than 3 cells that are not option rows are ignored, as are months without month, date and price.
- Optional option rows with exactly 2 cells (label | value), the first of each wins: `Heading | Lowest available fares` (h2 inside the block), `Subhead | from Frankfurt to London, 1 traveller, Economy Class, 14 days` (first letter upper-cased), `Best price label` (default EN "Best price", DE "Bestpreis"), `Previous label` / `Next label` (arrow labels, default "Previous slide" / "Next slide").

Computed, never authored: when no month is marked bold, the month(s) with the lowest price get the badge. Card heights come from the prices like the live script: `--bppm-anti` 6rem above the card of the cheapest month down to 0 for the dearest; below 768px the bar row is `--bppm-pct` 65 % (cheapest) to 100 % (dearest) wide, empty months 82 %. Arrows hide at the ends of the slider; one step is the visible width.

## Supported variations

No variations.

## Import

Source: `section.best-price-per-month` on the AirCore route pages /lhg/{de/de,de/en,gb/en}/o-d/cy-cy/* (all nine de/en routes, their de/de twins and gb/en frankfurt-london), as rendered in the raw snapshot (`.bppm-track` filled by the live script; the `<template>`s, `.bppm-loader` and the arrows are dropped).

- `Heading | {.bppm-headline}` and `Subhead | {.bppm-subhead}` as the first two rows.
- Then the 12 `.bppm-track > .bppm-column` in order, one row each:
  - Year: `.bppm-year` text when the column has `.has-year`, else empty (the `&nbsp;` placeholder is not written).
  - Month: `.bppm-month`. Date: `.bppm-date`.
  - Price: `<a href="https://www.lufthansa.com{a.bppm-card href}">{.bppm-from} {.bppm-price}</a>` (the deep link `/aircore/deeplink/redirect/{ll}/{cc}/{ORIG}/{DEST}/{dd.mm.yyyy}/{dd.mm.yyyy}/RT` made absolute: the route exists only on lufthansa.com), followed by ` <strong>{.bppm-badge-inner}</strong>` when the card is `.is-best`. Empty for `.bppm-card--empty`.
- Do not write the `--bppm-anti` / `--bppm-pct` styles: the block derives the bar heights from the prices (same scale as live).
- `Best price label` only when `data-best-price-label` differs from the default of the page language.

## Universal Editor fields

N/A (Document Authoring project)
