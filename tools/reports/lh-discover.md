# Discover Airlines on lh-com's code (brief 95)

2026-10-27. Site `moved-permanently/lh-discover` (repoless, lh-com's code), preview
`https://main--lh-discover--moved-permanently.aem.page/`. Nothing on `.aem.live`.

## Theme

Metadata row for lh-discover's `/metadata.json` (`/**`): **`brand` = `discover`**. It loads
`styles/themes/discover.css` (tokens only) through `scripts/brand.js` and names the brand in the
showcase notice ("not an official Discover Airlines website"). Without the row the pages render
with lh-com's look. lh-com sets no `brand`: nothing extra loads there (checked in the preview:
same colours, no theme request).

Tokens: Discover's palette on lh-com's `--lh-*` names (dark sky blue `#003e7b` text, sky blue
`#1e73af` headings, night sky blue `#002554`, sunny yellow `#ffcd00` actions, Discover's greys),
the same LufthansaHead/LufthansaText faces with the Miles & More symbol font in the stacks, a
fifth more space between blocks (Discover's 12px grid unit), and a white header bar
(`--header-bar-*`, new header tokens with lh-com's values as defaults). The logo is the image of
the site's nav documents.

## Pages (DA `moved-permanently/lh-discover`, previewed)

| de/en | de/de |
|---|---|
| /de/en/homepage | /de/de/homepage |
| /de/en/new-destinations | /de/de/new-destinations |
| /de/en/discover/ocean-blue | /de/de/discover/ocean-blue |
| /de/en/book/special-requests/pets | /de/de/my-bookings/services/additional-services/europ-assistance |
| /de/en/book/baggage | /de/de/book/baggage |
| /de/en/my-bookings/services/upgrades | /de/de/my-bookings/services/upgrades |
| /de/en/book/assistance-requirements/accessible-travel | /de/de/book/assistance-requirements/accessible-travel |
| /de/en/my-bookings/manage/customer-service | /de/de/my-bookings/manage/customer-service |
| /de/en/nav, /de/en/footer | /de/de/nav, /de/de/footer |

The pages each homepage links to most prominently (booking app pages, external links and
`/lhg/` left out). Dropped: `culinaryjourney` (both languages) is a micro-frontend
(`<culinary-hub>`) without page content; lh-com's micro-frontend block knows only the trip
management. All 16 pages render on the preview: every block loads, no script errors, no broken
images (checked with the theme).

Source: www.discover-airlines.com through the warm Bright Data session (`bd-session.mjs
--anchor`), imported offline from the snapshots with lh-com's homepage, info and nav importers
into `content-sites/lh-discover/` (`WORKSPACE_PATH`), then `site-postprocess.mjs` (lh-com's
importers resolve relative URLs against www.lufthansa.com: 559 URLs mapped back to
www.discover-airlines.com; links between the demo pages relative), uploaded with
`da-upload.mjs --site lh-discover`.

## Blocks

| Block | Pages | |
|---|---|---|
| header | all (nav documents) | reused with theme tokens (new `--header-bar-*` tokens: white bar) |
| footer | all (footer documents) | reused with theme tokens; the nav importer also reads Discover's `.footer-container` |
| flight-search | homepages | reused with theme tokens; it hands the search to Lufthansa's booking (lh-com's code), not Discover's |
| hero-card-overlay | homepages | reused with theme tokens (its title uses the text token: dark sky blue, Discover sky blue) |
| fare-teaser, destination-finder | homepages | reused with theme tokens; no prices or destination images on lh-discover: they come from Lufthansa's APIs through lh-proxy (allows lh-com and lh-flynet hosts) and lh-com's DAM copy |
| carousel-cards | homepages, new-destinations, upgrades | reused with theme tokens |
| cards-icon | homepages | reused with theme tokens; 6 icons added to `/icons` from www's design-system library (same drawings for Lufthansa and Discover); their colour is in the file (Lufthansa deep blue) |
| accordion-columns | homepages, baggage, pets, upgrades, customer service, europ-assistance | reused with theme tokens |
| columns-media | ocean-blue, baggage, pets, upgrades, customer service, europ-assistance | reused with theme tokens |
| table-striped | accessible travel, baggage | reused with theme tokens |
| hero-campaign, profile-nav | ocean-blue | reused with theme tokens |
| profile-tabs | upgrades | reused with theme tokens |
| flash-teaser | homepages | reused as is: Discover's Message Center strip; lh-discover has no `/message-center/` index, so it shows nothing |
| metadata, section-metadata | all | as is |

New blocks: none.

## As it is (not changed)

- Lufthansa's OneTrust consent comes with lh-com's code and shows on lh-discover unchanged.
- The favicon and manifest are lh-com's (`head.html` is shared).
