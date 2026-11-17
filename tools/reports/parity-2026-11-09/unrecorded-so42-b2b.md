# Group for Business: the unrecorded pages (standing order 42, item 2)

ema-lufthansa, 2026-11-17, about 07:00 to 08:30 UTC. Every figure was taken as served on b2b.turnsthe.page, main as deployed, in full Chrome (not the headless shell) with airline hosts refused per request. Nothing was uploaded, previewed or published, and nothing was written to DA.

## Documents checked

- **733 served documents.** Every `.plain.html` answered 200.
- **Page loads.** 717 documents answer the page itself with 200. The other 16 are member pages (fund, history, home, lhghome, profile, reports, usermanagement and experts-members, de/de and de/en). The edge sends signed-out visitors from them to login with a 302.
  - In the plain census those 16 measured the login page. They were therefore rendered again with their own content inside the served page shell, with the member API answering 404, so the block shows its error state and does not redirect.
  - The two experts-members pages go to the experts login, so there is no page to render. They are checked as bytes only.
- **Widths.** 390 and 1440: 1,466 page-widths.

## Market copies against their source

The structure of each served copy (block sequence and variants, section count, headings by level, pictures per block) was compared with its source:

- de/de or de/en for de and en copies;
- xx/de or xx/en where no de source exists.

There are 115 copies with a source: 90 are the same, and 25 differ. Where www recordings exist for both the copy and its source (b2b-parity-001 to -017), 11 of the 25 can be ruled against www:

| copies | what differs | ruling |
|---|---|---|
| mx/en news; gb/en programs-and-groups; ch/en and xx/en entertainment-on-board | more news items, headings and pictures than the source | the copy differs from its source the same way on www: local content, imported |
| ch/en discover-airlines | 1 section and 5 card headings; the de/en source has 5 and 15 | www has the five cards once, on both copy and source; the source's two extra card sets do not show (de/en is within 0.63 % of www at 390, ch/en within 1.01 %); no row |
| xx/de and xx/en news | 8 sections against 5; same headings and pictures | same as www by headings; section count only |
| xx/de and xx/en swiss-senses corporates- and intermediaries-start-of-booking (4) | one H1 where www's copy has two (an H1 as H2) | passes the one-H1 check; recorded pages, already in the parity lists; no row |

The other 14 have no www recording of the copy:

- al/de: about-us, the china and singapore joint ventures, terms-of-use, travel-management and tips-and-services;
- ca/en and us/en homepage;
- ch/en: frankfurt-airport, munich-airport, travel-classes-and-booking and its discover-airlines page;
- cn/en cash-and-points;
- mx/en privacy.

With no www recording of the copy, these 14 are not ruled here. They pass the no-breakage render below.

## No-breakage render, by class

| class | documents | what it is | row or rule |
|---|---|---|---|
| broken pictures, unknown blocks, horizontal overflow | 0 | | |
| empty closing section | 96 | the metadata block stands in a section of its own, so the served page ends with an empty section (24 px on most pages, up to 48) | delta-so42-b2b-empty-last-section: 91 rows, HOLD (DA dry run not run); 5 pages OUT, where the empty section gives www's end gap |
| closing section with only a section style | 11 | the same cause, but the closing section carries `wide-text` (on the news pages also a tab name). Documents: ch/en, de/en and xx/en meals-on-board; ch/en and de/en entertainment-on-board; de/en, gb/en and xx/en programs-and-groups; mx/en, xx/de and xx/en news | HOLD, no row drafted: the DA markup depends on how DA holds the style, and all 11 are recorded pages where the empty end can be www's gap; drafted against DA's copies when they can be read |
| more than one H1 | 58 (31 with 2, 2 with 3, 15 with 4, 9 with 5, 1 with 11) | Columns Media, grey bands and default content imported with www's heading levels; all 19 with a www recording carry exactly www's H1 count | no row: www's own structure |
| no H1 | 4 | de/de and de/en nav and footer fragments, not pages | none |
| words in the plain not in main | 29 after the check without URLs and file paths (104 before) | 13 media and video link texts (players), 14 form and block configuration rows (login, raffle, businesstogo, contact, member pages), 2 market-scoped sections (ca/en and us/en, bg/en and kw/en) hidden by design elsewhere | no row: no reader text lost |
| member pages | 16 | the edge redirects signed-out visitors to login; rendered with their own content: one H1, nothing broken, the only flags are the empty closing section (in the batch) and the block's state labels | none |

## Gate of the empty-section rows

Both sides were rendered in the same served page shell: the served `.plain.html` as is, and with the closing empty section removed.

- **40-document sample (seed 42).** Empty sections dropped by exactly one on every page-width, and nothing else changed (H1s, pictures, blocks, words, width).
- **All 96.** The same result on the 94 that render. The recorded page-widths among them are all closer to www or within 0.5 points, except discover-airlines de/en at 1440: +0.36 → −1.79 %. Figures per row are in the list.

## What is left

- **The DA dry run.** The migration session's helper runs it on DA's current copies (backup first, byte-for-byte revert check) and applies the 91 rows. Their list is unchanged.
- **The closing-style class of 11.** It is drafted once DA's markup for those copies is known.
