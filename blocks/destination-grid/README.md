# destination-grid

TAP's destinations grid, as www.flytap.com's destinations page shows it (`/pt-pt/destinos`,
`/en-pt/destinations` …; tools/reports/tap/parity.md row 84). On www it is Smartvel's
Explore&Go widget, drawn in the browser from Smartvel's service. Here it is drawn from a sheet of
the version, written from the capture of the widget's answers (tap-smartvel-001).

## Authoring

| destination-grid | |
| --- | --- |
| Source | `/<version>/destinations/destination-grid.json` |

On each version's destinations page, in place of the "See on flytap.com" paragraph (www's
`ComponentWidgetFreeBlockModel` with `exploreandgo`), above or below the poi-map.

## The sheet

One per version, written by `tools/tap-data/destination-grid-sheet.mjs`:

```
node tools/tap-data/destination-grid-sheet.mjs --capture <tap-smartvel-001>/smartvel \
  --version pt-pt --out <sheet.json>
```

A row each, columns `type, id, name, country, area, tags, text, link, image`:

| type | id | name | other columns |
| --- | --- | --- | --- |
| destination | Smartvel's region id | the city | country; area (the slug of its country's area in `geo/sm_areas.json`, of the four the config offers); tags (the category chips it carries, their ids, comma-separated); text (the description without HTML); link (the widget's shop button: the market's banner link, else the shop link); image (the cover on Smartvel's CDN, see below) |
| chip | the chip id | its name | |
| area | the area slug | its name in the version's language | |
| label | the widget's key (`SEARCH_PLACEHOLDER`, `FILTERS_BTN` …) | its text | |

The destinations come in the widget's order (`region_priority` first). For en-pt, fr-fr, pt-br and
pl-pl the widget's market has no per-city links, so every link is the shop link, as on www.

**Pictures:** Smartvel's pictures are licensed (Shutterstock, credited in each picture's fields), so
they are not copied: the cards load them straight from Smartvel's CDN, as www does (row 84, Ben's
call). The sheet writes each cover as www's srcset loads it, `cover.cc_photo` + `_medium` (about
150 KB, not the original of up to ~1.8 MB); their alt is empty, as on www. `--photos no` leaves the
column empty; a card without a picture shows its text only.

## Behaviour

- The bar: a search box (the destinations by name or country, accents and case aside), Filters,
  and the category chips in one row that scrolls; a chip filters at once, several keep the
  destinations with every one of them (www's AND).
- Filters opens a panel: the areas (Worldwide first), the categories, Clear (both reset) and Apply
  (the panel's choice, the panel closed, the focus back on Filters). Escape closes it.
- The cards: the city (linked to its page on www, the whole card clickable), the country, the text
  cut to www's 200 characters and three lines, a chevron. 16 at a time; "Load more destinations"
  adds 16. No match: www's "No destinations found" (a search) or "There are no results within
  selected area".
- The map (brief 478, parity row 112): the page's poi-map block, in the section before or after
  the grid's, moves into the grid between the bar and the list (`placeMap`), as www's widget is one
  piece: on phones the map between the bar and the list; from 1024 px the list a 365 px column
  scrolling in a 790 px box beside the 790 px map. The map's own region pills are left out there
  (the Filters panel has the areas). Without a poi-map next to it the grid is as before.
- Not as www: the panel a card opens on www (the city's places, events and travel tips; the link
  goes to www's page instead), the chips' icons, the pictures (above), Smartvel's map style.
