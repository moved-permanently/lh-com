# accordion-columns

Custom **accordion** block. Purpose: accordion whose panel splits its content into columns at each heading.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per item. Cell 1: title. Cell 2: content; each heading (of the first heading level used, usually H3) starts a column, followed by its list of links. Content before the first heading spans all columns. A single-cell row uses its first element as the title. Zero-width characters are removed.

## Supported variations

Options (combinable, written by the importer from the source): `accordion-columns (faq, limited-width, spaced)`.

- `faq`: questions and answers. The panel is not split into columns at headings: headings inside an answer stay in one text column; answers (and their headings and lists, which keep their bullets) use 66% of the width from 1025px. The importer sets it for every lufthansa.com accordion whose panels hold no column view (link columns such as the homepage "Popular destinations" keep the column layout).
- `limited-width`: the accordion uses two thirds of the content width from 1025px (lufthansa.com `maui-limited-width`, e.g. feedback, timetable-and-flight-status).
- `spaced`: the accordion is part of a text column (after a headline or text in the same column on lufthansa.com): 40px more space below it (all widths, none when it is the last element of its section) and above it (from 768px).

## Universal Editor fields

N/A (Document Authoring project)
