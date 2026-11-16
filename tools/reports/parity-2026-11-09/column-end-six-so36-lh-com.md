# The six documents the column-end move made worse (standing order 36, item 2, 2026-11-16)

Order 35's gate (delta-so35-column-end-links-lh-com.txt) moved each column end that sat before a view's links to after
the last link, as an own `{tokens}` paragraph. Of the 44 recorded documents, 15 got closer (READY, live since round
468), 23 stayed unchanged and 6 got worse. Below: why each of the six got worse, a second draft form tried on all 44,
and whether a row or an importer change would bring all 44 closer or within 0.5 points.

Everything was measured as drafts on lufthansa.turnsthe.page against the same recordings as order 35, the first
8,000 px, at 1440 and 390. Drift steps come from logs/b460/offsets.mjs and box values from injected queries
(logs/b636, not in git).

## Why the six got worse

| Document | 1440 / 390 (pub -> own paragraph) | Cause |
| --- | --- | --- |
| /de/en/refund | 1.7 -> 5.8 / 3.3 -> 5.9 | The page ends "link paragraph, {spacer-55}". The page-end rule (standing order 8, styles.css: `:is(p.button-wrapper, p.link-wrapper) + p.spacer:last-child` -> the last section's margin 0) no longer matches once the own end paragraph stands between the link and the spacer. The section gap (48px) comes back under the page: the footer is 48px lower (1,742 -> 1,790 at 1440). The links themselves stay within 8px. |
| .../register-sports-baggage/confirmation | 2.1 -> 8.8 / 5.1 -> 9.9 | The same: "To late-night check-in", then {spacer-70} at the page end. |
| /de/en/tiere-als-handgepaeck | 4.5 -> 2.2 / 4.5 -> 5.4 | The same at the page end ({spacer-70}). At 1440 the link stack itself moved closer; at 390 the 48px under the page outweighs it. |
| /de/en/744 | 5.0 -> 6.8 / 11.6 -> 13.0 | The seat-map PDF view: the heading carries both marks ("{column-start-outer column-end-outer}"), the two PDF links follow, then the next section's "Technical data" view. Moving the end below the links gives the heading its margin back and draws the outer padding after the links: +29px at 1440 and +28 at 390 from that point on. This is the nested-view case the importer already treats specially (dropNestedOuterEnds). The published copy matches www's spacing there (drift +16 -> +26px before, +55 after). |
| /de/en/lufthansa-at-berlin-airport | 3.4 -> 4.5 / 13.4 -> 13.3 | Two ends. www's snapshot has the second ("Getting there", its link "More information about getting there") in another view than the text before it: order 35's census flagged it "other view". Moving it is wrong. Moving only the first end (BER Runway, "same view") gives 3.4 / 13.3: no change, no row. |
| /xx/pt/meetings-and-events | 4.1 -> 2.8 / 6.0 -> 6.8 | At 1440 it gets closer like the nine other versions. At 390 the page end is 24px lower than www's after the moved end ("Reservar um grupo" at the page's end, then the footer). www's xx/pt recording ends 24px tighter there than de/en's does. No www snapshot of xx/pt, so the structure can't be checked. |

## A second form: the end mark on the last link paragraph

The importer writes an end mark onto the last leaf when that leaf can hold text, so this form is what an importer
change would produce once links count as leaves: `<p><a ...>To the alternative refund form</a> {column-end}</p>`,
with no own paragraph. The decorated page keeps the link paragraph (link-wrapper) and gives it the end padding. The
link stays directly before the spacer, so the page-end rule still holds.

Gate on all 44 recorded documents (logs/b636/endinl.sh):
- 41 closer or within 0.5:
  - the 15 READY documents with the same figures as the own-paragraph form;
  - refund, confirmation and tiere-als-handgepaeck now unchanged (refund 1.7 / 3.2, confirmation 2.1 / 5.1,
    tiere 4.5 / 4.5: the same as published, no gain);
  - 23 unchanged.
- 3 worse: 744 (6.8 / 13.0), lufthansa-at-berlin-airport (4.5 at 1440) and xx/pt (6.8 at 390), as with the own
  paragraph.

## Rows

None. The 15 that pass are live already. The inline form gains nothing on the three page-end documents. Berlin's
first end alone changes nothing. 744 and xx/pt are worse in either form.

## The importer: proposal only, not pushed

No form of the change brings all 44 recorded documents closer or within 0.5, so nothing was changed. The proposal,
with its gate:

- **Change**, in placeColumnMarks (tools/importer/transformers/lufthansa-cleanup.js): count a link as a view's leaf
  when it is not inside another leaf. At afterTransform www's maui-navigation-links are bare `<a>` in divs;
  convertMauiLinks has run, and the paragraph around them comes later. When such a link is the view's last leaf,
  write the end token as a text node right after the `<a>`, in its parent. The paragraph the import builds around
  the link then reads `<p><a>…</a> {column-end}</p>`: the inline form gated above. A view's links in another view
  are not in the root and are not counted, so Berlin's second end would stay where it is.
- **Expected from the gate:** 42 of 44 closer or within 0.5 (the 41 above, plus Berlin, whose "other view" end
  would not move); 744 +1.8 / +1.4 and xx/pt +0.8 at 390 worse.
- **What it would still need:** an exclusion for 744's case, a heading that carries both marks of a nested outer
  view, then the links. The fleet pages' seat-map download views have this form (order 35's census: 359, 744, crn
and others in several versions), and only 744 is recorded. A look at
  xx/pt's www page (no snapshot here) would also be needed. Then the no-breakage renders of the unrecorded documents
  a re-import would reach: 719 ends in 11-14's published copies, on the info, fleet, legal and app-entry templates.
- The change only acts on re-import; nothing published moves until a document is imported again.
