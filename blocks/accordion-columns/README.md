# accordion-columns

Custom **accordion** block. Purpose: accordion whose panel splits its content into columns at each heading.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per item. Cell 1: title. Cell 2: content; each heading (of the first heading level used, usually H3) starts a column, followed by its list of links. Content before the first heading spans all columns. A single-cell row uses its first element as the title. Zero-width characters are removed.

Videos and embeds in a panel: a poster image paragraph followed by a paragraph with a link to an .mp4 file (and its settings marker, as in columns-media: `{controls round-play-button}` for a Lufthansa video viewer) is a click-to-play video over the panel width; a YouTube or in-flight entertainment widget link alone in its paragraph is the player (blocks/embed; scripts/media.js). The importer keeps them in place (/de/en/flight-disruptions chat assistant videos and meal voucher YouTube video).

## Supported variations

Options (combinable, written by the importer from the source): `accordion-columns (faq, limited-width, spaced)`, `accordion-columns (faq, column)`, `accordion-columns (faq, tabs)`.

- `faq`: questions and answers. The panel is not split into columns at headings: headings inside an answer stay in one text column; answers (and their headings and lists, which keep their bullets) use 66% of the width from 1025px. The importer sets it for every lufthansa.com accordion whose panels hold no column view (link columns such as the homepage "Popular destinations" keep the column layout).
- `limited-width`: the accordion uses two thirds of the content width from 1025px (lufthansa.com `maui-limited-width`, e.g. feedback, timetable-and-flight-status).
- `column`: the accordion is alone in one column of a column view with several columns (Lufthansa Insights /articles/tags 'Destinations' and /articles/explore-the-world: North America | Europe | Asia). Consecutive column accordions (block after block, nothing between them) share a row: stacked 10px apart on mobile, 2 per row from 768px, all of them side by side (up to 4 per row) from 1025px, 20px apart; answers use the whole column. The importer writes it instead of `spaced`.
- `tabs`: tabs (www.lufthansa-cargo.com's tab component, e.g. /en/speed-flash). The same rows as the accordion (cell 1 the tab's title, cell 2 its content), so a document switches by the option alone: from 1025px a tab bar (one tab per row, the first selected; arrow keys, Home and End move between the tabs and select them; panels are WAI-ARIA tab panels) shows one row's content at a time; below 1025px the accordion as it is (all closed at first; coming back from the tab bar, the selected row stays open). Combine with `faq` for one text column per tab (Cargo's tabs), without it the content splits into columns at its headings as in the accordion. A block with a single row gets no tab bar.
- `filter`: a type-to-filter field over the items, as www.lufthansa-cargo.com/en/support-and-contact's "Find topic by typing" (www lists the matching topics under its field; here the accordion itself narrows). Typing shows only the items whose title or text holds every typed word (case and accents ignored); with none left a no-results line (announced to screen readers); Remove empties the field. Optional rows, only with the option (they are no items): `Filter label | Find topic by typing` (the field's label) and `No results | No topics found.`; without them the built-in English, German or Italian texts (Find topic by typing / Thema durch Eingabe finden / Trova un argomento digitando; No topics found. / Keine Themen gefunden. / Nessun argomento trovato.). Combine with `faq` (Cargo's support topics: `accordion-columns (faq, filter)`). With `tabs` the field is a finder over the tabs, as www.lufthansa-cargo.com's Support & Contact (`accordion-columns (faq, tabs, filter)`): it stays above the tab bar, the tabs stay as they are, and typing lists the matching topics of every tab under the field (each heading of a panel with the text and links after it; a panel without headings: its item).
- `open-first`: the first item starts open (www.discover-airlines.com's families page, whose first collapsible is expanded); not with `tabs`, whose first tab is selected anyway.
- `open-2` … `open-9`: the first N items start open (Austrian's new-destinations, where www expands its first items); not with `tabs`; with `exclusive` only the first.
- `exclusive`: one item open at a time (www.lufthansa-cargo.com's image lists on Facts & Figures: Meet the Executive Board, Compliance): opening an item closes the open one (the items share a `details` name). Not with `tabs`.
- `spaced`: the accordion is part of a text column (after a headline or text in the same column on lufthansa.com): 40px more space below it (all widths, none when it is the last element of its section) and above it (from 768px).

## Universal Editor fields

N/A (Document Authoring project)
