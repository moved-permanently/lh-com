# table-flightplan

Custom **table** block. Purpose: the "Flightplan" of the AirCore route pages: outbound / return tabs with a moving underline, one row per flight (departure and arrival time and airport, operator, duration, flight number, the seven weekdays with a plane where the flight operates), the first rows visible and "Show more" for the rest, a disclaimer under each panel.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, no header row. Rows are read top to bottom:

- `Tab | Frankfurt → London` starts a direction (tab). The label is split at `→`, `->`, `–`, `—` or ` - ` into origin, plane icon, destination; any other label is shown as it is. Flight rows before the first Tab row form an unnamed first tab. The tab bar is hidden when there is only one unnamed tab.
- Flight rows have 6 cells: `Departure | Arrival | Flight | Duration | Operated by | Days`
  - Departure, Arrival: `08:00 FRA` (time and IATA code; a line break between them is fine).
  - Flight: `LH900`. Duration: `01:40` (the "Flight duration:" label is added by the block).
  - Operated by: the operating carrier code (`VL`), empty for Lufthansa's own flights (the cell must still be there).
  - Days: the weekdays the flight operates, comma or space separated: `We, Th, Fr, Sa`. Understood: the labels of the Weekdays row, the English and German abbreviations (Mo/Tu/We/Th/Fr/Sa/Su, Mo/Di/Mi/Do/Fr/Sa/So) and the full names.
  - Rows with fewer than 5 cells that are not a Tab or option row are ignored.
- Optional option rows with exactly 2 cells (label | value), anywhere in the table; the first of each wins:

| Row | Default EN | Default DE |
| --- | --- | --- |
| Visible rows | 6 | 6 |
| Weekdays | Mo, Tu, We, Th, Fr, Sa, Su | Mo, Di, Mi, Do, Fr, Sa, So |
| Duration label | Flight duration: | Flugdauer: |
| Operated by label | Operated by: | Durchgeführt von: |
| Show more label | Show more | Mehr anzeigen |
| Show less label | Show less | Weniger anzeigen |
| Flight day label | flight | Flug |
| No flight label | no flight | kein Flug |
| Disclaimer | Please note that the flight schedule changes regularly. | Bitte beachten Sie, dass sich der Flugplan regelmäßig ändert. |
| Tabs label | Flightplan | Flugplan |

Show more is omitted when a tab has no more than Visible rows flights. The weekday of the visitor's today gets the class `today` (no style, as live). The heading "Flightplan" is default content above the block.

## Supported variations

No variations.

## Import

Source: `h2#flightplan-section` followed by `.fp.flight-table-wrapper` (inside `.column.event`) on the AirCore route pages /lhg/{de/de,de/en,gb/en}/o-d/cy-cy/* that have a schedule (frankfurt-london, frankfurt-amman, frankfurt-new-york, frankfurt-tokyo / frankfurt-tokio, munich-barcelona / muenchen-barcelona, munich-los-angeles / muenchen-los-angeles, munich-new-york / muenchen-new-york; berlin-rome and hamburg-palma-de-mallorca have none).

- Keep `h2#flightplan-section` as a default-content h2 before the block (its text "Flightplan" / "Flugplan"; the fi-cards' "Flights per week" links point to `#flightplan`, the id EDS gives that heading).
- Per `.fp-nav .fp-nav-element` (in order; `aria-controls` names its `.fp-tab`): a row `Tab | {first span} → {last span}`, followed by one flight row per `.fp-row` of that `.fp-tab` (hidden rows included):
  - Departure / Arrival: the first / last `div` of `.times` as `HH:MM IATA` (`08:00 <br> FRA` → `08:00 FRA`).
  - Flight: the second `div` of `.flight-info`. Duration: the first `div` of `.flight-info` without the `Flight duration:` / `Flugdauer:` prefix.
  - Operated by: `.operated` without the `Operated by:` / `Durchgeführt von:` prefix (empty cell when `.operated` is empty).
  - Days: the `span[data-weekday]` texts of the `.flight-schedule` items whose second span is `.lh-airplane-outbound`, joined with `, ` (`-` = no flight, not written).
- `Visible rows | {data-visible-count}` only when `.read-more[data-visible-count]` is not 6. No label rows when the texts equal the defaults above (`.fp-disclaimer`, `.toggle-more`, `.toggle-less`, the weekday spans); write `Disclaimer | {text}` etc. only when they differ.
- Drop the rendered UI: `.moving-bar`, `.read-more-toggle`, the plane icons, the `aria-label`s of the rows.

## Universal Editor fields

N/A (Document Authoring project)
