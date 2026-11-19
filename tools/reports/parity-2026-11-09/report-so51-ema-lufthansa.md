# ema-lufthansa: standing order 51 (2026-11-19, what order 50's sweep listed for Discover, Brussels and ITA)

About 20:00 to 21:00 UTC.

**How it was measured:** full Chrome, Liberation Sans for Arial, airline hosts refused per request. DA was read only, and it answered 200, so every row is built on DA's current copy. Nothing was uploaded, previewed or published.

## Pushed

| commit | what | documents reached | gate |
|---|---|---|---|
| a3a1d1a5 | micro-frontend: Discover's culinary hub and its design system from discover.turnsthe.page's /digitalhangar/ | 3 (culinaryjourney de/de, de/en, xx/fr) | no recorded page-width has the block |
| 666f7906 | ita.css: a divider-below closing separator after a padded column view or an FAQ accordion keeps its place; delta-so51-brussels-faults; sweep-so50 notes | 3 (pre-check-in at/de, sea-destinations it/it, bid-upgrade it/en) | 82 recorded ITA page-widths: 0 moved, sum 52.67 → 52.67; nothing new flagged |
| this commit | this report | — | — |

## 1. ITA, the tab-block rule's reach check (finished)

- **What was missing:** the two documents not reached and the phone load that timed out: nl/nl mice 390, xx/en mice and xx/ja baggage-assistance.
- **Result:** all three were rendered with the served CSS (the rule is live) at 1440 and 390. The rule matched once at each width with no fault: no overflow, nothing cut off, no empty box, no sweep fault. Nothing moved.
- **Noted** in sweep-so50-ema-lufthansa.txt.

## 2. ITA, separators drawn into the block above them

- **The cause, the same on all three:**
  - The section has the divider-below style, so it ends with a wrapper holding only the closing separator.
  - styles.css takes 16 px back above such a wrapper after a block.
  - These two blocks draw to their own end, so the line ran into them:
    - a padded column view: 6 px into its grey box (pre-check-in at/de, sea-destinations it/it);
    - an FAQ accordion: through its last item (bid-upgrade it/en).
- **The broad form was tried first:** no take-back in any divider-below section.
  - It also moved travel-briefing's 9 copies by 16 px. Their jump links leave space under them, so nothing drawn crossed there, and order 50 had classed them by design. Dropped.
- **The rule pushed:** after a padded column view or an FAQ accordion, in a divider-below section, no take-back.
- **Gate:**
  - None of the 82 recorded ITA page-widths moves (the broad form moved none either, and the narrow form is part of it).
  - The sum is 52.67 → 52.67. It is not lower, because no recorded page has the fault.
- **Reach:** the 66 ITA documents with the divider-below style, each rendered with and without the rule at 1440 and 390, with the sweep's checks.
  - Moved: the 3 documents only, +16 px each, and their overlaps are gone.
  - Nothing new is flagged.
- No row was needed, so there is no delta-so51-ita-faults.txt.

## 3. Brussels

**ch/it travel-companion: the grey column view is 1,307 px on phones against be/en's 440.**
- **The cause:** the related-topics card block. ch/it's is `carousel-cards grid four-up`, which stacks its four cards on phones (about 1,150 px). be/en's has the phone-slider option, so its cards slide one at a time (283 px). At 1440 the two draw alike.
- **Where:** 7 documents lack the option that every other market copy has (be/en, be/fr, be/nl, de/de, es/es, it/it):
  - travel-companion bf/en, bf/fr, ch/fr, ch/it;
  - reservation-price-guarantee ca/en, ca/fr, us/en.
- **Rows, not a rule:** the option is in each document, and nothing in the structure sets these 7 apart from the copies that already slide.
- **The rows:** delta-so51-brussels-faults.txt / .json, 1 row each, `carousel-cards grid four-up` → `carousel-cards grid four-up phone-slider`.
  - Each is checked on DA's copy: applied once, no style token, the revert byte for byte. A block option is a carrier, not a token.
  - The render with the row: 390 is 866 to 867 px shorter (ch/it 4,011 → 3,144), 1440 is unchanged. Nothing broken, lost or sideways.
- **Status HOLD (parity):**
  - The importer adds phone-slider only where www's own copy carries the phone swiper, so www's copies of these 7 may stack their cards too.
  - None of the 7 is recorded. A 390 recording of ch/it travel-companion decides: if www slides, the rows are READY as written; if www stacks, they are dropped.

**bf/fr charter: the request form is 480 px shorter than be/en's (1,023 against 1,503 at 1440).**
- **Content, no row.** The page text is the same, but the form is another form definition (the document's own Form block table):
  - Its "Contact details" group (salutation, first name, last name, email, phone, company) has the rule `hidden`. That is 444 of the 480 px: without the flag the form renders 1,467 px tall. The importer writes `hidden` only where www's fieldset is collapsed, so it comes from www's bf/fr copy.
  - Like bf/en, it has no Departure or Return Date fields, and its flights group repeats ("Add another flight").
- **Nothing on our host reveals the group.** The form block makes hidden sections not required, so the form still submits.
- **If a bf/fr recording shows the group open,** the row is the one-cell change of that rule from `hidden` to empty.

## 4. Discover culinary-journey (de/de, de/en, xx/fr)

- **What it loaded, from where:** the block asked www.discover-airlines.com for the design system (v1.38.0 discover.css, maui-design-system.js) and the app (culinary-hub-latest.js). No visitor's browser should ask the airline's www, and our measurements refuse it, so nothing of the app drew on our host. The block waited with an empty 400 px section.
- **Our side could draw it:**
  - lh-edge already answers discover.turnsthe.page/digitalhangar/ from www.discover-airlines.com (SITE_DESIGN_HOSTS discover), as for Austrian, ITA, SWISS and Brussels.
  - The block now loads all three files from there (aem.page and localhost from discover.turnsthe.page) (a3a1d1a5, test micro-frontend-apps).
- **What answers:** all three files answer 200 from our host. The app draws its entry in each document's language: booking details or no booking, booking code or ticket number, names, airline, flight number, travel class.
  - 476 px at 1440; 803 / 776 / 803 px at 390.
  - No sideways scroll, nothing drawn over it. No API call is made on load.
- **What stays the airline's (a function that stays a link):**
  - After the entry, the app reads and orders through the airline's one-catering API: `api.travelid.lufthansa.com/one-catering/v1` (`/offer-previews`, offers by booking, `/orders`, with the page's apiKey).
  - That is the airline's live ordering system. It was not asked from here (an airline host).
  - Like the claim apps' Travel ID APIs, it is expected to answer www's origin only. Looking up a booking and ordering a meal would then need the airline's own host, or the API allowing our hosts.

## Is anything of ours left?

- **Discover:** no. The culinary journey's entry draws; the lookup and ordering are the airline's API.
- **Brussels:** nothing to fix in code. The 7 phone-slider rows wait for one phone recording (parity). The charter form is www's bf/fr definition (content).
- **ITA:** no. Order 50's listed faults are fixed by 304ea56d and 666f7906; the rest are content or by design.

## Checks

- **Before the push of a3a1d1a5 and 666f7906:**
  - whole-repo `npm run lint`: exit 0;
  - stylelint on styles/themes/ita.css and blocks/micro-frontend/micro-frontend.css: exit 0;
  - the full suite (folder-reading tests included): pass 4,941, fail 0;
  - the push loop rebased onto f235480e and ran lint again (exit 0), then pushed 666f7906.
- **Before this report's push:** whole-repo lint and the folder-reading tests.
- **Before 666f7906:** the new test test/sweep-so51.test.mjs and test/sweep-so50.test.mjs passed (4 of 4), as did every test/micro-frontend-*.test.mjs.
- **Kept out of git:** .migration/project.json, every recording, render and log (.scratch).
