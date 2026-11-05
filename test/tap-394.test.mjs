/* eslint-disable max-len */
/* Brief 394, TAP (tools/reports/tap/parity.md R4-4 to R4-6), the theme's part:
   - R4-4, the entertainment pages: www's default feature card (the importer's option
     feature-small: www's size default, the films', series', music's and games' cards): its
     picture 260 x 180 beside the text from 728 px (24 px apart, the text 560 px at most), 358 x
     180 above it on phones (24 px), 16 px corners, filled; its paragraphs 8 px apart; www's large
     card keeps round 3's frame (option feature);
   - R4-4, a card list www slides on desktop (the importer's option slider: the news): from 1024 px
     one row of four (the grid's 24 px between them), scrolled sideways inside the list (scroll
     snap), a grid on phones as www;
   - R4-5, text cards www lays two to a row (the importer's option two-up, itemsPerRow 2: the
     Schengen steps): one a row on phones, two from 728 px (548 px at 1440), as the three-up cards
     otherwise (round 3's and row 15's: the card at the column, its title 24 px, its button row);
   - R4-6, www's large feature card from 728 px 24 px under the row (picture or text: www's box
     299 px for a 275 px picture), not under the text alone; a YouTube banner (economy-prime,
     for-life) www's 380 px frame with 32 px corners at every width;
   - the feature cards' text as www's at 390 and 1440: paragraphs 8 px apart in the large card too
     (24 px from a paragraph or 40 from a list to the button, 24 px from a paragraph to a list);
     the small card with a title 24 px under the title and 48 px under its text, without a title
     24 px under its text on phones;
   Run: node --max-old-space-size=512 --test test/tap-394.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const small = 'body\\.brand-tap \\.columns-media\\.feature-small';

test('R4-4: www\'s default feature card, 260 x 180 beside the text from 728 px, 358 x 180 above it on phones', () => {
  const rule = (sel, body) => assert.match(css, new RegExp(`${small} ${sel} \\{${body}`), sel);
  rule('\\.columns-media-media', '\\s*order: -1;\\s*height: 180px;\\s*margin: 0 0 24px;');
  rule(':is\\(\\.columns-media-media picture, \\.columns-media-media img\\)', '\\s*display: block;\\s*width: 100%;\\s*height: 100%;');
  rule('\\.columns-media-media img', '\\s*border-radius: 16px;\\s*object-fit: cover;');
  rule('\\.columns-media-text > p', '\\s*margin-bottom: 8px;');
  rule('\\.columns-media-text', '\\s*margin-bottom: 0;');
  const md = css.slice(css.indexOf('/* www\'s default feature card from 728 px'));
  assert.ok(md.length < css.length, 'the 728 px part');
  assert.match(md, new RegExp(`${small} \\.columns-media-row \\{\\s*grid-template-columns: 260px minmax\\(0, 560px\\);\\s*gap: 0 24px;\\s*justify-content: start;`));
  assert.match(md, new RegExp(`${small} \\.columns-media-media-last \\{\\s*grid-template-columns: minmax\\(0, 560px\\) 260px;`));
  assert.match(md, new RegExp(`${small} \\.columns-media-media \\{\\s*order: 0;\\s*margin: 0;`));
});

test('R4-4: a card list www slides on desktop, one row of four from 1024 px scrolled inside the list', () => {
  const wide = css.slice(css.indexOf('/* a card list www slides on desktop'));
  assert.ok(wide.length < css.length, 'the slider part');
  assert.match(wide, /@media \(width >= 1024px\) \{\s*body\.brand-tap \.cards-teaser\.slider > ul \{\s*grid-auto-columns: calc\(\(100% - 3 \* 24px\) \/ 4\);\s*grid-auto-flow: column;\s*grid-template-columns: none;\s*overflow-x: auto;\s*scroll-snap-type: x mandatory;\s*\}\s*body\.brand-tap \.cards-teaser\.slider > ul > li \{\s*scroll-snap-align: start;\s*\}\s*\}/);
});

test('R4-5: two-up text cards, one a row on phones and two from 728 px, as the three-up cards otherwise', () => {
  assert.match(css, /body\.brand-tap \.cards\.two-up > ul \{\s*grid-template-columns: minmax\(0, 1fr\);\s*\}/);
  assert.match(css, /@media \(width >= 728px\) \{\s*body\.brand-tap \.cards\.two-up > ul \{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);\s*\}\s*\}/);
  [' > ul > li {', ' .cards-card-body {', ' .cards-card-body > :is(h2, h3, h4):first-child {', ' .cards-card-body:not(:has(> .button-wrapper)) {'].forEach((tail) => {
    assert.ok(css.includes(`body.brand-tap .cards:is(.three-up, .two-up)${tail}`), tail);
  });
});

test('R4-6: the large feature card 24 px under its row from 728 px; the YouTube banner 380 px with 32 px corners', () => {
  const md = css.slice(css.indexOf('/* www\'s large feature card from 728 px'));
  assert.ok(md.length < css.length);
  assert.match(md, /@media \(width >= 728px\) \{\s*body\.brand-tap \.columns-media\.feature \.columns-media-row \{\s*padding-bottom: 24px;\s*\}\s*body\.brand-tap \.columns-media\.feature \.columns-media-text \{\s*padding-bottom: 0;\s*\}\s*\}/);
  assert.match(css, /body\.brand-tap \.embed \.media-embed-youtube \{\s*height: 380px;\s*overflow: hidden;\s*border-radius: 32px;\s*aspect-ratio: auto;\s*\}/);
});

test('the feature cards\' text as www\'s: large 8 px between paragraphs; small with a title 24 / 48, without one 24 px under on phones', () => {
  const big = 'body\\.brand-tap \\.columns-media\\.feature \\.columns-media-text';
  assert.match(css, new RegExp(`${big} > p:not\\(\\.button-wrapper\\) \\{\\s*margin-bottom: 8px;\\s*\\}`));
  assert.match(css, new RegExp(`${big} > ul \\{\\s*margin-top: 24px;\\s*\\}`));
  assert.match(css, new RegExp(`${big} > \\.button-wrapper \\{\\s*padding-top: 16px;\\s*\\}`));
  const titled = 'body\\.brand-tap \\.columns-media\\.feature-small:has\\(\\.columns-media-text > h3:first-child\\) \\.columns-media-text';
  assert.match(css, new RegExp(`${titled} > h3:first-child \\{\\s*margin-bottom: 24px;\\s*\\}`));
  assert.match(css, new RegExp(`${titled} \\{\\s*padding-bottom: 48px;\\s*\\}`));
  assert.match(css, /@media \(width < 728px\) \{\s*body\.brand-tap \.columns-media\.feature-small:not\(:has\(\.columns-media-text > h3:first-child\)\) \.columns-media-text \{\s*padding-bottom: 24px;\s*\}\s*\}/);
});
