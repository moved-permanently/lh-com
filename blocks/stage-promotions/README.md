# stage-promotions

Custom block. Purpose: the homepage stage by date. Authors keep several stage promotions per locale, each with a start and an end time, and the homepage shows the one that is active now. Nobody edits the homepage when a campaign starts or ends.

## Authoring (Document Authoring)

Model: `standalone`. The homepage holds one `stage-promotions` block where the stage was, with one cell: a link to the locale's promotions document. Without a link it uses `/{cc}/{ll}/fragments/stage-promotions`.

The promotions document (`/de/en/fragments/stage-promotions`, `/de/de/…`, `/at/de/…`, `/gb/en/…`) has **one section per promotion** (sections are separated by `---`). Each section holds the stage itself, today a `hero-card-overlay` block (image, eyebrow, heading, text, CTA link, optional Conditions row; see its README), and a **Section Metadata** table:

| Key | Value | |
| --- | --- | --- |
| Promotion | a name for the authors, e.g. `South Africa FLYZA` | optional; shown as `data-stage-promotion` on the homepage section |
| Start | `2026-11-01`, `2026-11-01 06:00`, `01.11.2026 06:00` or ISO with offset (`2026-11-01T06:00:00+01:00`) | empty: no start |
| End | same formats | empty: no end |

- Times without an offset are the market's local time: Europe/Berlin for `de/*`, Europe/Vienna for `at/de`, Europe/London for `gb/en` (summer and winter time are handled). A date without a time means the whole day: Start `2026-11-01` begins at 00:00 that day, End `2026-10-31` ends at 24:00 that day.
- A promotion is active when Start ≤ now < End. If several are active, the one that started last wins; on a tie, the first in the document. So an undated promotion is the fallback that shows whenever no dated one runs. Keep one undated (or long-running) promotion per locale so the stage is never empty; if none is active, the stage section shows nothing.
- An unreadable Start or End (e.g. `soon`) makes that promotion inactive, so a typo never shows a campaign too early.
- Expired promotions can stay in the document; they never show again. Delete them when convenient.

### Scheduling a promotion (author steps)

1. Open the locale's promotions document in Document Authoring, copy an existing section (stage block plus its Section Metadata), and change image, texts and link.
2. Set its Start and End (and end the promotion it replaces, or let the later Start win).
3. Preview the document. On the preview host you can check any moment with time travel (`?time-travel=…` on the homepage, README "Time travel"), e.g. `https://main--lh-com--moved-permanently.aem.page/de/en/homepage?time-travel=2026-11-01T00:00` (the market's local time; accepted only on `*.aem.page` and localhost, never on the live site). The earlier `?stage-time=…` still works the same way.
4. Publish the promotions document (well before the start). The homepage itself is not touched.

### When the switch shows up

- **At the start or end time itself:** at once, everywhere. The choice is made in the visitor's browser at every page view, from the promotions the page already has, so no publish, cache purge or CDN expiry is involved; the homepage and the promotions document stay byte-identical across the switch. (The browser's clock decides, so a device whose clock is wrong sees the switch at its own wrong time.)
- **After an edit of the promotions document** (a new promotion, changed dates or texts): only once the document is published and the visitor's copy is refreshed. On `*.aem.live` publishing purges the Edge Delivery CDN within seconds; browsers may keep a copy for up to 2 hours (`.plain.html` is served with `cache-control: max-age=7200, must-revalidate`). Behind a customer CDN with push invalidation set up as Edge Delivery documents it, the purge also takes seconds; without push invalidation the CDN's own TTL applies on top. So publish a new promotion at least 2 hours (plus any CDN TTL) before its Start, and its dates then take effect to the minute.

## Behaviour

- Fetches the promotions document (`.plain.html`), reads each section's Section Metadata, picks the active one, then decorates and loads only that section (inactive promotions load no images) and puts its content in place of the block; the section classes of the promotion (e.g. a Style) move to the homepage section.
- The auto fragment loading in `scripts.js` skips the link inside this block.

## Modes of the live stage

The live `.mainstageteaser` (see `/{cc}/{ll}/homepage.model.json`, `promotionAsJson`) has several modes. All four locales use the plain link mode today (`"mode":"link"`: image, title, text, one link), which this block shows with `hero-card-overlay`. Not built (they show fares):

- `automatic` (`automaticModeConfig`, e.g. `tripDuration`): the stage fills in a fare from the fare teaser service for a destination;
- `manual` (`manualModeConfig`): authored origin/destination pairs with fares looked up live;
- the campaign variant (`campaignConfig`, `isLinkCampaignEnabled`) and the button variant (`isButtonEnabled`) of the link mode, which no locale uses today.

## Import

`tools/importer/stage-promotions.mjs` (after the homepage import): moves the imported stage into the promotions document as the first promotion and adds the further promotions of `tools/importer/stage-promotions.json`, built from existing teaser cards of the same homepage; the homepage gets the block. Re-running it after a new homepage import rewrites the promotions documents from that file.

## Universal Editor fields

N/A (Document Authoring project)
