/* eslint-disable max-len */
/* Lufthansa Cargo's homepage as www's (brief 425, cargo rows 10-12; capture cargo-parity-001, /en and
   /de at 1440 and 390; www's own stylesheets in the capture). Cargo only (body.brand-cargo), in the
   blocks' own CSS: styles/themes/cargo.css is ema-lufthansa's.
   - the stage (hero-campaign (slider)): 617 px (749 below 768 px), the text 40 px from the top
     (20), 856 px wide, the subline 28/32; the dots under the text at the left (y 396 at 1440: 306
     into the stage; 322 at 390); the arrows 50 x 49 light grey squares 8 px in;
   - the widget (cards-icon (widget), then the Track form): a white card over the stage's foot, its
     top 446 px into the stage (438 at 390), 1296 px at 1440 (the column), 24 px in, the four tabs
     side by side under a 1 px rule (icons only below 768 px), the form its panel;
   - the bands (columns-media (band ...)): full width behind the column, 40 px above and below:
     gradient www's 90deg rgba(132,154,194,.6) to #f5f5f5 over the screen's width (infrastructure:
     the text 856 px wide, the counters 636 px beside the map, 419 px high; 1 px #52627c rules), dark
     #05164d with white text (products: 416 px for the text, the features 88 px wide 22 px apart;
     about: 640 px high, 856 px wide, five key facts with #52627c rules).
   Run: node --test test/cargo-home-design.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const rules = (css, sel) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...css.matchAll(new RegExp(`(?:^|[}\\s,])${esc} \\{([^}]*)\\}`, 'g'))].map((m) => m[1]).join(' ');
};
const after = (css, marker) => css.slice(css.indexOf(marker));

test('the stage: www\'s height, the text at the top, the dots under it, the square arrows', () => {
  const css = read('blocks/hero-campaign/hero-campaign.css');
  const S = 'body.brand-cargo .hero-campaign.slider';
  assert.match(rules(css, `${S} .hero-campaign-slide`), /min-height: 749px; align-items: flex-start;/);
  assert.match(rules(css, 'body.brand-cargo main > .section:first-of-type:has(> .hero-campaign-wrapper > .hero-campaign.slider)'), /margin-top: 0;/, 'right under the header, as www\'s (not lh-com\'s 25 px)');
  assert.match(rules(css, `${S} .hero-campaign-inner`), /padding-top: 20px;/);
  assert.match(rules(css, `${S} .hero-campaign-content`), /max-width: 856px;/);
  assert.match(rules(css, `${S} .hero-campaign-subtitle`), /font-size: 28px; line-height: 32px;/);
  assert.match(rules(css, `${S} .hero-campaign-dots`), /top: 316px; bottom: auto; left: 24px; gap: 18px; transform: none;/);
  const wide = after(css, `@media (width >= 768px) { ${S} .hero-campaign-slide`);
  assert.match(rules(wide, `${S} .hero-campaign-slide`), /min-height: 617px;/);
  assert.match(rules(wide, `${S} .hero-campaign-inner`), /padding-top: 40px;/);
  assert.match(rules(wide, `${S} .hero-campaign-dots`), /top: 300px; left: 79px;/);
  assert.match(rules(css, `${S} :is(.hero-campaign-prev, .hero-campaign-next)`), /width: 50px; height: 49px; margin-top: -25px; border-radius: 0; background: #dcdcdc;/);
});

test('the widget: a white card over the stage\'s foot, the tabs in a row, the form its panel', () => {
  const css = read('blocks/cards-icon/cards-icon.css');
  const W = 'body.brand-cargo main .cards-icon-wrapper:has(> .cards-icon.widget)';
  assert.match(rules(css, W), /position: relative; z-index: 2; margin-top: -311px;/);
  assert.match(rules(after(css, `@media (width >= 768px) { ${W}`), W), /margin-top: -171px;/);
  const card = rules(css, 'body.brand-cargo .cards-icon.widget');
  assert.match(card, /padding: 0 24px; border-radius: 4px 4px 0 0; background: #fff; box-shadow: 0 1px 4px 0 rgb\(0 0 0 \/ 20%\); clip-path: inset\(-8px -8px 0\);/);
  assert.match(rules(css, 'body.brand-cargo .cards-icon.widget > ul'), /display: grid; grid-template-columns: repeat\(4, minmax\(0, 1fr\)\); gap: 0; border-bottom: 1px solid #dcdcdc;/);
  assert.match(rules(css, 'body.brand-cargo .cards-icon.widget > ul > li'), /width: auto;/, 'the tabs share the card (not the 236 px tiles)');
  assert.match(rules(css, 'body.brand-cargo .cards-icon.widget .cards-icon-label'), /position: absolute; width: 1px; height: 1px;/, 'icons only below 768 px, the label for screen readers');
  const form = read('blocks/booking-lookup/booking-lookup.css');
  const F = 'body.brand-cargo main .cards-icon-wrapper:has(> .cards-icon.widget) + .booking-lookup-wrapper';
  assert.match(rules(form, F), /position: relative; z-index: 2; margin-top: 0;/);
  assert.match(rules(form, `${F} .booking-lookup-panel`), /padding-top: 0;/);
  assert.match(rules(after(form, `@media (width >= 768px) { ${F} .booking-lookup-actions`), `${F} .booking-lookup-actions`), /width: auto;/, 'the button beside the fields');
  assert.match(rules(form, `${F} > .booking-lookup`), /padding: 24px; border-radius: 0 0 4px 4px; background: #fff; box-shadow: 0 1px 4px 0 rgb\(0 0 0 \/ 20%\); clip-path: inset\(0 -8px -8px\);/);
});

test('the bands: full width behind the column, www\'s gradient over the screen, the dark ones white on #05164d', () => {
  const css = read('blocks/columns-media/columns-media.css');
  const B = 'body.brand-cargo .columns-media.band';
  assert.match(rules(css, B), /padding-block: 40px; gap: 20px;/);
  assert.match(rules(css, `${B}.gradient`), /border-image: linear-gradient\(90deg, rgb\(132 154 194 \/ 60%\) calc\(50% - 50vw\), #f5f5f5 calc\(50% \+ 50vw\)\) fill 0 \/\/ 0 100vw;/);
  assert.match(rules(css, `${B}.dark`), /border-image: linear-gradient\(#05164d, #05164d\) fill 0 \/\/ 0 100vw; color: #fff;/);
});

test('infrastructure: the text 856 px, the counters 636 px beside the 419 px map, the rules', () => {
  const css = read('blocks/columns-media/columns-media.css');
  const I = 'body.brand-cargo .columns-media.stats';
  assert.match(rules(css, `${I} .columns-media-row:first-child .columns-media-text`), /max-width: 856px;/);
  assert.match(rules(css, `${I} .columns-media-text > ul:first-of-type > li`), /display: flex; align-items: baseline; gap: 10px; padding: 10px 0; border-bottom: 1px solid #52627c;/);
  assert.match(rules(css, `${I} .columns-media-text > ul:nth-of-type(2)`), /grid-template-columns: minmax\(0, 1fr\);/);
  const wide = after(css, `@media (width >= 1025px) { ${I}`);
  assert.match(rules(wide, `${I} .columns-media-row + .columns-media-row`), /grid-template-columns: 636px minmax\(0, 1fr\); gap: 24px;/);
  assert.match(rules(wide, `${I} .columns-media-media img`), /height: 419px; object-fit: contain;/);
  assert.match(rules(wide, `${I} .columns-media-text > ul:nth-of-type(2)`), /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); column-gap: 0;/);
});

test('products: the rows under #52627c rules, 416 px of text, the features 88 px wide', () => {
  const css = read('blocks/columns-media/columns-media.css');
  const P = 'body.brand-cargo .columns-media.features';
  assert.match(rules(css, `${P} .columns-media-row + .columns-media-row`), /padding-block: 20px; border-top: 1px solid #52627c;/);
  assert.match(rules(css, `${P} .columns-media-text > ul`), /display: flex; flex-wrap: wrap; gap: 20px 22px; margin: 0; padding: 0; list-style: none;/);
  assert.match(rules(css, `${P} .columns-media-text > ul > li`), /width: 88px; margin: 0; text-align: center;/);
  assert.match(rules(after(css, '@media (width >= 1025px) { body.brand-cargo .columns-media.stats'), `${P} .columns-media-row + .columns-media-row`), /grid-template-columns: 416px minmax\(0, 1fr\); gap: 23px;/);
});

test('about: 640 px high, the text 856 px, five key facts', () => {
  const css = read('blocks/columns-media/columns-media.css');
  const A = 'body.brand-cargo .columns-media.facts';
  assert.match(rules(css, `${A} .columns-media-row`), /grid-template-columns: minmax\(0, 1fr\); max-width: 856px;/);
  assert.match(rules(css, `${A} .columns-media-text > ul > li`), /flex: 0 0 calc\(\(100% - 16px\) \/ 2\); padding-left: 10px; border-left: 1px solid #52627c;/);
  const wide = after(css, `@media (width >= 768px) { ${A}`);
  assert.match(rules(wide, A), /min-height: 640px;/);
  assert.match(rules(wide, `${A} .columns-media-text > ul > li`), /flex: 0 0 calc\(\(100% - 96px\) \/ 5\);/);
});

/* brief 426 (cargo.turnsthe.page/en/home at 1280 after the publish, against cargo-parity-001 at 1440):
   - www's slide button starts with the title (both x 72 at 1440): not lh-com's 64 px indent of the
     stage's links and buttons (from 1025 px, www.lufthansa.com's .campaign-information);
   - the bar fills the header's height (--nav-height, 90 px from 768 px): its tools are 40 px below
     1440 px, so the bar was 80 px and a 10 px white strip showed under it (www's bar: 90 px from
     1025 px, padding-block 31px, no strip). */
test('the slide\'s button under the title, not indented', () => {
  const css = read('blocks/hero-campaign/hero-campaign.css');
  assert.match(rules(css, 'body.brand-cargo .hero-campaign.slider .hero-campaign-content > .hero-campaign-cta'), /padding-left: 0;/);
});

test('Cargo\'s bar as high as the header it sits in', () => {
  const css = read('blocks/header/header.css');
  assert.match(rules(css, 'body.brand-cargo .header .nav-bar'), /min-height: var\(--nav-height\);/);
});
