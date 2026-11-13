/* eslint-disable max-len */
/* Standing order 26, item 2: two Air Dolomiti cards as www draws them.
   - The help card (CardPromoCta, under the accordions): www always writes its paragraph, an empty one too, whose 40 px
     margin collapses with the headline's 10, so a card without text keeps 40 px from the headline to the button
     (/servizi/parcheggi-convenzionati: ours 10, the page 30 px short at both widths).
   - The quiz card (www's Quiz, an article's "Destinations" teaser; 86 local documents): a #f7f7f7 card of 90vw (95vw from
     930 px, 1440 px from 1450 px) with a 10 px radius, the picture 180 px high above the text, from 930 px 30 % wide on the
     right; the text 12 px in (40 from 930), its title 35 / 40 (60 / 72 from 930), an outlined button. Ours was a plain
     Columns Media at the picture's own height (street-food-in-munich 1440: 773 px, www 566). The importer writes the
     option quiz; the documents get it as DA delta rows (delta-so26-airdolomiti-quiz-cards.txt).
   Run: node --max-old-space-size=256 --test test/airdolomiti-promo-quiz-so26.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const importer = fs.readFileSync(new URL('../tools/importer/airdolomiti-import.mjs', import.meta.url), 'utf8');
const CARD = 'body.brand-airdolomiti main > .section:is(.accordion-columns-container, .flight-status-container).columns-media-container .columns-media-text';
const Q = 'body.brand-airdolomiti main .columns-media.quiz';
const rule = (sel, from = css) => {
  const at = from.indexOf(`${sel} {`);
  return at < 0 ? '' : from.slice(at, from.indexOf('}', at));
};
const wide = (q) => css.slice(css.indexOf(`@media ${q} { ${Q}`));

test('the help card: a headline right before the button keeps 40 px to it', () => {
  assert.match(rule(`${CARD} h3:has(+ .button-wrapper)`), /margin-bottom: 40px;/);
});

test('the quiz card below 930 px: a 90vw card, the picture 180 px high over the text', () => {
  assert.match(rule(Q), /width: 90vw;/);
  const row = rule(`${Q} .columns-media-row`);
  assert.match(row, /flex-direction: column;/);
  assert.match(row, /gap: 20px;/);
  assert.match(row, /border-radius: 10px;/);
  assert.match(row, /background-color: #f7f7f7;/);
  assert.match(rule(`${Q} .columns-media-media :is(picture, img)`), /height: 180px;/);
  assert.match(rule(`${Q} .columns-media-text`), /padding: 0 12px 24px;/);
  assert.match(rule(`${Q} .columns-media-text > h2`), /font-size: 35px; line-height: 40px;/);
  const btn = rule(`${Q} .columns-media-text a.button`);
  assert.match(btn, /border: 1px solid #1f1f1f;/);
  assert.match(btn, /padding: 20px 30px;/);
});

test('the quiz card from 930 px: 95vw, the picture 30 % on the right, the title 60 / 72', () => {
  const w = wide('(width >= 930px)');
  assert.match(rule(Q, w), /width: 95vw;/);
  assert.match(rule(`${Q} .columns-media-row`, w), /flex-direction: row-reverse;/);
  assert.match(rule(`${Q} .columns-media-media`, w), /width: 30%;/);
  assert.match(rule(`${Q} .columns-media-text`, w), /padding: 40px;/);
  assert.match(rule(`${Q} .columns-media-text > h2`, w), /font-size: 60px; line-height: 72px;/);
  assert.match(rule(Q, wide('(width >= 1450px)')), /max-width: 1440px;/);
});

test('the importer writes the quiz as Columns Media (quiz)', () => {
  assert.ok(importer.includes("[{ block: 'columns-media (quiz)', rows }]"));
});
