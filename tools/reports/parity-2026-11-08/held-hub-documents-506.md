# The five held hub documents (brief 506 item 5)

ema-adobe, 2026-11-08. The harness held five hub documents of reimport-497 because www's server HTML (the market-diff
run's) lacks parts of them. Where those parts sit in what is already captured, and what imports them without a new
capture. /de/de/gepaeck stays untouched (edited in DA after its import; Ben decides); /de/en/overview-manage needs
nothing.

## Where the data sits

- The lh-snapshots archives the harness holds (-085, -062, -061; the market roots' -046 / -039 / -032 / -019) don't
  have these five pages.
- The Bright Data captures of 2026-10-21 do, rendered (the browser's DOM after www's scripts): lh-bd-ema-004
  (de/de: fluege, lufthansa-reiseklassen, speisen-und-getraenke) and lh-bd-ema-005 (de/en: flights,
  lufthansa-travel-classes), each as bd-snapshots/www.lufthansa.com/<path>.html (the importer's snapshot layout) and
  source-export/recapture/<path>.html. The two archives are among the 16 lh-bd-ema archives in logs/b493/bd-archives
  that wait for upload links (not yet with the harness).
- Imported offline from those captures with main's hub bundle, all parts are there: speisen-und-getraenke Hero
  Campaign, Hero Banner (4 panes: pictures, labels, headlines, the menu links), Columns Media, Carousel Cards (two-up),
  the FAQ; both travel-classes pages the class tabs (Profile Nav), the Hero Banner (4 panes with pictures and texts),
  two Columns Media, Carousel Cards; both flights pages the Destination Finder (its 7 rows), the Feedback block, Carousel
  Cards, Columns Media, a Divider.

## Per document

| Document | What the server HTML lacks | Where it sits in the server HTML | Without a capture |
| --- | --- | --- | --- |
| /de/de/speisen-und-getraenke | the hero slider (Hero Banner) and its menu links | `.dcep-hero-banner[data-dcep]`: all panes as JSON (picture, tab label, headline, text, button text and link, overlay) | **yes**: hub-dcep-render (c23899d) builds www's rendered panes from the JSON; the import then equals the capture's |
| /de/en/lufthansa-travel-classes | the class panels (Hero Banner: pictures and texts) | the same JSON | **yes**, the same rule |
| /de/de/lufthansa-reiseklassen | the same | the same | **yes**, the same rule |
| /de/en/flights | the Destination Finder and the Feedback block | the finder: `.dcep-destination-finder[data-dcep]`, its configuration only (trip duration, offers, priority, smart search and destination links, origin); its texts (headline "Best offers", the smart search label, the price note, the conditions link) are the micro-frontend's and vary per page (smart search on 147 of 225 finder pages, "General Conditions" or "Conditions"). The feedback block: `<feedback-questionnaire data-configuration="66f1381107e0a98cb19441f5">`, its question from the Travel ID API | **no**: a rule would have to guess the finder's texts. Import from the capture (lh-bd-ema-005) |
| /de/de/fluege | the same | the same | **no**: from the capture (lh-bd-ema-004) |

- The rule for the three Hero Banner pages (hub-dcep-render, first of the hub template's transformers, onLoad): checked
  on the captures with their panes removed (as the server HTML has them): byte-identical imports. A capture with its
  panes rendered imports as before.
- The feedback question could be rebuilt (configuration 66f1381107e0a98cb19441f5 renders "Did you find this
  information useful? *" / Yes, No in English on 178 captured pages and "Fanden Sie diese Informationen nützlich?" /
  Ja, Nein in German on 183; 32 rendered nothing), but without the finder's texts the flights documents would still be
  incomplete, so no rule for it.

## For the harness

- speisen-und-getraenke, lufthansa-travel-classes, lufthansa-reiseklassen: import from the server HTML it holds with
  main's hub bundle (from c23899d on). They also get the column view carrier where they have column views (none).
- flights, fluege: from lh-bd-ema-005 / -004 once their upload links are there (with main's hub bundle; flights then also
  gets its column-view section, 7438076).
