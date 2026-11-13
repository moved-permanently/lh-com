/* eslint-disable max-len */
/* Lufthansa Cargo parity round 3 (www.lufthansa-cargo.com's capture cargo-parity-001 of
   2026-11-06, en and de at 390 and 1440, rendered at other widths with the capture's own CSS; the
   rows: tools/reports/cargo/parity.md). Cargo's theme only (styles/themes/cargo.css, rules under
   body.brand-cargo). Run: node --max-old-space-size=512 --test test/cargo-round3.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const cargo = () => read('styles/themes/cargo.css');
const has = (css, re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('row 10: the slide\'s button as www\'s, a light outline (2 px #ebebeb, #ccc text, regular 18/24, 50 px, 10 30, 4 px corners), not the theme\'s yellow; white with navy text on hover', () => {
  const css = cargo();
  const S = 'body\\.brand-cargo \\.hero-campaign\\.slider \\.hero-campaign-cta a\\.button:any-link';
  has(css, new RegExp(`${S} \\{[^}]*min-height: 50px;[^}]*padding: 10px 30px;[^}]*border: 2px solid #ebebeb;[^}]*border-radius: 4px;[^}]*background-color: transparent;[^}]*color: #ccc;[^}]*font-size: 18px;[^}]*font-weight: 400;[^}]*line-height: 24px;`));
  has(css, /body\.brand-cargo \.hero-campaign\.slider \.hero-campaign-cta a\.button:is\(:hover, :focus-visible\) \{[^}]*background-color: #fff;[^}]*color: #05164d;/);
});

test('row 14: the story pictures (hero-card-overlay (light), Cargo\'s stories only) as www\'s .module--story: up to 1354 px wide in the middle, as tall as the picture is (no 3:1 crop); the text box white at 90 %, 20 px inside, the title 33/36, the text 16/24; on phones and up to 1024 px under the picture on a grey band, 68 px from the sides; from 1025 px over the picture, 83 px in and 50 px down, a third of the width less 30 px (376 px at 1440)', () => {
  const css = cargo();
  const B = 'body\\.brand-cargo';
  has(css, new RegExp(`${B} main > \\.section > \\.hero-card-overlay-wrapper:has\\(> \\.hero-card-overlay\\.light\\) \\{[^}]*max-width: 1354px;[^}]*margin-inline: auto;`));
  has(css, new RegExp(`${B} \\.hero-card-overlay\\.light \\{[^}]*display: grid;[^}]*border-bottom: 2px solid #d1d1d1;[^}]*background-color: #eaeaea;`), 'www\'s grey band and the line under each module');
  has(css, new RegExp(`${B} \\.hero-card-overlay\\.light \\.hero-card-overlay-media \\{[^}]*aspect-ratio: auto;`));
  has(css, new RegExp(`${B} \\.hero-card-overlay\\.light \\.hero-card-overlay-media img \\{[^}]*height: auto;`));
  has(css, new RegExp(`${B} \\.hero-card-overlay\\.light \\.hero-card-overlay-card \\{[^}]*margin: 0 68px;[^}]*padding: 20px;[^}]*background-color: rgb\\(255 255 255 / 90%\\);`));
  has(css, new RegExp(`${B} \\.hero-card-overlay\\.light \\.hero-card-overlay-card :is\\(h1, h2\\) \\{[^}]*margin: 30px 0 24px;[^}]*font-size: 33px;[^}]*line-height: 1\\.1;`));
  has(css, new RegExp(`${B} \\.hero-card-overlay\\.light \\.hero-card-overlay-card p \\{[^}]*font-size: 16px;[^}]*line-height: 24px;`));
  has(css, new RegExp(`@media \\(width >= 1025px\\) \\{[^@]*${B} \\.hero-card-overlay\\.light \\{[^}]*aspect-ratio: auto;`));
  has(css, new RegExp(`@media \\(width >= 1025px\\) \\{[^@]*${B} \\.hero-card-overlay\\.light :is\\(\\.hero-card-overlay-media, \\.hero-card-overlay-card\\) \\{[^}]*grid-area: 1 / 1;`));
  has(css, new RegExp(`@media \\(width >= 1025px\\) \\{[^@]*${B} \\.hero-card-overlay\\.light \\.hero-card-overlay-media \\{[^}]*position: relative;`));
  has(css, new RegExp(`@media \\(width >= 1025px\\) \\{[^@]*${B} \\.hero-card-overlay\\.light \\.hero-card-overlay-card \\{[^}]*width: calc\\(\\(100% - 136px\\) / 3 - 30px\\);[^}]*margin: 50px 0 50px 83px;[^}]*border-radius: 0;`));
  has(css, new RegExp(`@media \\(width >= 1025px\\) \\{[^@]*${B} \\.hero-card-overlay\\.light\\.right \\.hero-card-overlay-card \\{[^}]*justify-self: end;[^}]*margin: 50px 83px 50px 0;`));
  has(css, new RegExp(`@media \\(width >= 1025px\\) \\{[^@]*${B} \\.hero-card-overlay\\.light \\.hero-card-overlay-card :is\\(h1, h2\\) \\{[^}]*margin-top: 0;`));
});

test('row 21: Support & Contact\'s topic finder over its tabs (accordion-columns (faq, tabs, filter)) as www\'s: the finder a white card with a shadow, the field an underline, the results a list under it; the tabs a third of the row each, centred, the selected one 4 px navy; the base list hidden while empty', () => {
  const css = cargo();
  const F = 'body\\.brand-cargo \\.accordion-columns\\.tabs\\.filter';
  has(css, new RegExp(`${F} > \\.accordion-columns-filter \\{[^}]*max-width: none;[^}]*padding: 20px 16px;[^}]*box-shadow: 0 1px 4px 0 rgb\\(0 0 0 / 20%\\), 0 0 0 100vmax #f5f5f5;[^}]*background-color: #fff;`));
  has(css, new RegExp(`${F} \\.accordion-columns-filter input \\{[^}]*border: 0;[^}]*border-bottom: 2px solid #4d4d4d;[^}]*border-radius: 0;`));
  has(css, new RegExp(`${F} \\.accordion-columns-filter-results \\{[^}]*max-height: 360px;[^}]*overflow: auto;`));
  has(css, new RegExp(`@media \\(width >= 1025px\\) \\{[^@]*${F} \\.accordion-columns-tab \\{[^}]*flex: 1 1 0;[^}]*text-align: center;`));
  has(css, new RegExp(`@media \\(width >= 1025px\\) \\{[^@]*${F} \\.accordion-columns-tab\\[aria-selected="true"\\] \\{[^}]*border-bottom: 4px solid #05164d;`));
  const base = read('blocks/accordion-columns/accordion-columns.css');
  has(base, /\.accordion-columns \.accordion-columns-filter-results \{[^}]*padding: 0;[^}]*list-style: none;/);
  has(base, /\.accordion-columns \.accordion-columns-filter-results\[hidden\] \{[^}]*display: none;/);
});

test('row 21: Support & Contact\'s "Contact us" band (section contact: navy on a grey band, the button a white outline) and technical support beside the local sales contact (columns (support): a rule between them from 768 px)', () => {
  const css = cargo();
  has(css, /body\.brand-cargo main > \.section\.contact \{[^}]*margin-bottom: 0;[^}]*padding: 40px 0;[^}]*background-color: #f5f5f5;/);
  has(css, /body\.brand-cargo main > \.section\.contact > \.default-content-wrapper \{[^}]*max-width: calc\(min\(var\(--content-max-width\), 100%\) - 2 \* var\(--layout-margin\)\);[^}]*padding: 92px 24px;[^}]*background-color: #05164d;[^}]*color: #fff;/);
  has(css, /body\.brand-cargo main > \.section\.contact a\.button:any-link \{[^}]*border: 2px solid #fff;[^}]*background-color: transparent;[^}]*color: #fff;/);
  has(css, /@media \(width >= 768px\) \{[^@]*body\.brand-cargo \.columns\.support > div > div \+ div \{[^}]*border-left: 1px solid #ccc;/);
});

test('row 25 (row 44 after 523): eBooking\'s text beside its picture (columns-media (wide-media)) as www\'s CF7 of 2026-11-06: col-5 | col-7 (526 px of 1296), 24 px between', () => {
  has(cargo(), /@media \(width >= 768px\) \{[^@]*body\.brand-cargo \.columns-media\.wide-media \.columns-media-media-last \{[^}]*grid-template-columns: calc\(\(100% \+ 24px\) \* 5 \/ 12 - 24px\) minmax\(0, 1fr\);[^}]*column-gap: 24px;/);
});

test('row 22: the contact form as www\'s dialog (Support & Contact\'s links open /modals/contact-us): 900 px wide, the card across it without the page\'s grey band; its fields in three columns from 768 px, on the page too (the core form\'s one column was display: block, so the columns never applied)', () => {
  const css = cargo();
  has(css, /@media \(width >= 768px\) \{[^@]*body\.brand-cargo \.form\.core \.form-fields \{[^}]*display: grid;[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  has(css, /body\.brand-cargo \.fragment-dialog:has\(\.form\) \{[^}]*--fragment-dialog-width: 900px;/);
  has(css, /body\.brand-cargo \.fragment-dialog \.form \.form-form \{[^}]*padding-bottom: 0;[^}]*background: none;[^}]*box-shadow: none;/, 'no grey band (the page\'s band is a box-shadow)');
  has(css, /body\.brand-cargo \.form\.core \.form-fields \{[^}]*--form-field-max-width: none;/, 'the fields as wide as their column');
  has(css, /body\.brand-cargo \.fragment-dialog \.form \.form-step \{[^}]*display: block;[^}]*padding: 0;/);
  has(css, /body\.brand-cargo \.fragment-dialog \.form \.form-step-card \{[^}]*max-width: none;[^}]*margin: 0;[^}]*padding: 0;/);
});

test('row 18: www\'s image lists (section image-list: Meet the Executive Board, Compliance) — on phones the picture with the heading on its foot (rgb(6 29 72 / 60%)), the items below in navy with 2 px rules and a plus; from 768 px the heading and the items over the left half of the picture (white, 45 px and 30 px), the open item\'s text in a white panel over the right half', () => {
  const css = cargo();
  const S = 'body\\.brand-cargo main > \\.section\\.image-list';
  has(css, new RegExp(`${S} \\{[^}]*position: relative;[^}]*margin-bottom: 0;`));
  has(css, new RegExp(`${S} > div \\{[^}]*max-width: none;[^}]*padding: 0;`));
  has(css, new RegExp(`${S} \\.default-content-wrapper > p:has\\(> picture\\) \\{[^}]*margin: 0;`));
  has(css, new RegExp(`${S} \\.default-content-wrapper > h2 \\{[^}]*position: absolute;[^}]*bottom: 0;[^}]*background-color: rgb\\(6 29 72 / 60%\\);[^}]*color: #fff;`));
  has(css, new RegExp(`${S} \\.accordion-columns \\.accordion-columns-item \\{[^}]*border: 0;[^}]*border-bottom: 2px solid currentcolor;`));
  has(css, new RegExp(`${S} \\.accordion-columns \\.accordion-columns-title::before \\{[^}]*content: "\\+";`));
  has(css, new RegExp(`${S} \\.accordion-columns \\.accordion-columns-title::after \\{[^}]*display: none;`));
  has(css, new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${S} \\{[^}]*display: grid;[^}]*grid-template-rows: 1fr auto auto 1fr;`));
  has(css, new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${S} \\.default-content-wrapper \\{[^}]*display: contents;`));
  has(css, new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${S} \\.default-content-wrapper > p:has\\(> picture\\) \\{[^}]*grid-row: 1 / -1;`));
  has(css, new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${S} \\.default-content-wrapper > h2 \\{[^}]*position: static;[^}]*grid-row: 2;[^}]*font-size: 45px;`));
  has(css, new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${S} \\.accordion-columns-wrapper \\{[^}]*grid-row: 3;[^}]*width: calc\\(50% - 32px\\);`));
  has(css, new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${S} \\.accordion-columns \\.accordion-columns-title \\{[^}]*color: #fff;[^}]*font-size: 30px;`));
  has(css, new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${S} \\.accordion-columns-item\\[open\\] > \\.accordion-columns-panel \\{[^}]*position: absolute;[^}]*top: 20px;[^}]*right: 16px;[^}]*bottom: 20px;[^}]*width: calc\\(50% - 32px\\);[^}]*overflow: auto;[^}]*padding: 40px 20px;[^}]*background-color: #fff;`));
  has(css, new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${S} \\.accordion-columns-panel :is\\(p, ul, ol, h2, h3, h4, h5, h6\\) \\{[^}]*max-width: none;`), 'the panel\'s text across it (not the faq answers\' 66 %)');
});

test('row 18: the history timeline (carousel-cards (timeline)) as www\'s: white cards (the year 40 px, the title 18 px bold, the text 15/22.5 since the brief after 531), on phones down a navy line at the left with a dot per card, from 768 px a third of the row each, above and below a white line in turn with a dot under each; no dots row, the arrows round at the line\'s ends; a grey band behind it (www\'s photo is not in lh-cargo\'s DA)', () => {
  const css = cargo();
  const T = 'body\\.brand-cargo \\.carousel-cards\\.timeline';
  has(css, /body\.brand-cargo main \.section:has\(\.carousel-cards\.timeline\) \{[^}]*margin-bottom: 0;[^}]*padding: 80px 0;[^}]*background-color: #8a8a8a;/);
  has(css, new RegExp(`${T} \\.carousel-cards-slide(, [^{]*)? \\{[^}]*overflow: visible;[^}]*border: 0;[^}]*background: none;[^}]*box-shadow: none;`));
  has(css, new RegExp(`${T} \\.carousel-cards-body \\{[^}]*padding: 20px;[^}]*border-radius: 10px;[^}]*background-color: #fff;`));
  has(css, new RegExp(`${T} \\.carousel-cards-body > p:first-child \\{[^}]*font-size: 40px;`));
  has(css, new RegExp(`${T} \\.carousel-cards-dots \\{[^}]*display: none;`));
  has(css, new RegExp(`@media \\(width < 768px\\) \\{[^@]*${T} \\.carousel-cards-track \\{[^}]*flex-direction: column;[^}]*overflow: visible;`));
  has(css, new RegExp(`@media \\(width < 768px\\) \\{[^@]*${T} \\.carousel-cards-track::before \\{[^}]*width: 3px;[^}]*background-color: #05164d;`));
  has(css, new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${T} \\.carousel-cards-slide \\{[^}]*display: grid;[^}]*flex-basis: calc\\(100% / 3\\);[^}]*grid-template-rows: 1fr 80px 1fr;`));
  has(css, new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${T} \\.carousel-cards-slide:nth-child\\(even\\) \\.carousel-cards-body \\{[^}]*grid-row: 3;[^}]*align-self: start;`));
  has(css, new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${T} \\.carousel-cards-slide::before \\{[^}]*grid-row: 2;[^}]*background-color: #fff;`));
  has(css, new RegExp(`${T} \\.carousel-cards-slide::after \\{[^}]*border: 3px solid #05164d;[^}]*border-radius: 50%;`));
  has(css, new RegExp(`${T} :is\\(\\.carousel-cards-prev, \\.carousel-cards-next\\) \\{[^}]*border-radius: 50%;`));
});
