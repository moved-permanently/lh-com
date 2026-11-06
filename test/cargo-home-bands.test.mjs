/* eslint-disable max-len */
/* Lufthansa Cargo's homepage bands, brief 430 (cargo row 12; cargo-parity-001 rendered with its own
   stylesheets, 1440 and 390):
   - the about band's artwork: www's About-BG-Desktop-Updated.svg and About_BG-Mobile-Updated.svg
     (292 KB each: the preview refused them, 409) in a smaller form, the same picture: their vector
     part as SVGs of their own (2 KB, the grain pattern out) and the embedded grain PNG on its own
     (217 KB, www's bytes), multiplied over the vector as the SVG does (background-blend-mode).
     Desktop: both bottom right / cover (pixel-identical to www's SVG at 1280 and 1440); below
     768 px the mobile vector with the grain over the band (www's mobile SVG stretches it so);
   - the products band as www's .ourProducts: the heading row's h2 20 px over "Explore all", the
     links LufthansaText bold 14/18; the rows under their rules back to back, 20 px in (the last
     one none below), the first 20 px under the heading row; the items 88 x 124 (the icon right
     over its 14/18 label); 20 px above and below below 1025 px (www's whiteBgBox).
   Cargo only, in the block's CSS. Run: node --test test/cargo-home-bands.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const rules = (sel, src = css) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...src.matchAll(new RegExp(`(?:^|[}\\s,])${esc} \\{([^}]*)\\}`, 'g'))].map((m) => m[1]).join(' ');
};
const after = (marker) => css.slice(css.indexOf(marker));
const A = 'body.brand-cargo .columns-media.band.dark.facts';
const GRAIN = '/documents/about-bg-grain-bedb93.png';

test('about: the artwork as www\'s, the grain multiplied over the vector', () => {
  assert.match(rules(A), /position: relative; isolation: isolate;/);
  const layer = rules(`${A}::before`);
  assert.match(layer, /content: ""; position: absolute; z-index: -1; inset-block: 0; left: calc\(50% - var\(--columns-media-viewport, 100%\) \/ 2\); width: var\(--columns-media-viewport, 100%\);/);
  assert.ok(layer.includes(`background: url("${GRAIN}") 0 0 / 100% 100% no-repeat, url("/documents/about-bg-mobile-vector-cfeaac.svg") bottom right / cover no-repeat, #05164d;`), layer);
  assert.match(layer, /background-blend-mode: multiply, normal;/);
  const wide = rules(`${A}::before`, after(`@media (width >= 768px) { ${A}::before`));
  assert.ok(wide.includes(`background-image: url("${GRAIN}"), url("/documents/about-bg-desktop-vector-da7231.svg");`), wide);
  assert.match(wide, /background-position: bottom right; background-size: cover;/);
});

test('products: www\'s heading row, links and rows', () => {
  const P = 'body.brand-cargo .columns-media.band.features';
  assert.match(rules(P), /gap: 0;/, 'the rows back to back');
  assert.match(rules(`${P} .columns-media-row:first-child`), /margin-bottom: 20px;/);
  assert.match(rules(`${P} .columns-media-row:first-child h2`), /margin-bottom: 20px;/);
  assert.match(rules(`body.appear.brand-cargo main ${P.replace('body.brand-cargo ', '')} .columns-media-text p.link-wrapper a:any-link`), /font-family: var\(--body-font-family\); font-size: 14px; font-weight: 700; line-height: 18px;/);
  assert.match(rules(`${P} .columns-media-row:last-child`), /padding-bottom: 0;/);
  assert.match(rules(`${P} .columns-media-text > p`), /margin: 0 0 20px;/, 'the row\'s text 20 px over its link');
  assert.match(rules('body.appear.brand-cargo main .columns-media.features.icons .columns-media-text > ul > li > a:any-link::before'), /margin: 0 auto;/, 'the icon right over the label (124 px items)');
  assert.match(rules(`${P}`, after('@media (width < 1025px) { body.brand-cargo .columns-media.band.features')), /padding-block: 20px;/);
});

/* the about band as www's .contentAbout (cargo-parity-001 with its own stylesheets): the h2 and the
   lead 20 px over what follows, the lead 18/24 regular, "Key Facts" bold 18/24 20 px over the
   facts, the facts' 10 px inside their fifth (half below 768 px) of the row, 32 px under them (20
   on phones); on phones 20 px above, the figures 24/28, the artwork's 166 px under the content */
test('about: www\'s type and spacing, five facts to a row', () => {
  const F = 'body.brand-cargo .columns-media.band.facts';
  assert.match(rules(`${F} .columns-media-text`), /margin-bottom: 0;/, 'not the 36 px of a text cell before another');
  assert.match(rules(`${F} .columns-media-text > h2`), /margin: 0 0 20px;/);
  assert.match(rules(`${F} .columns-media-text > p:not(.link-wrapper)`), /margin: 0 0 20px; font-size: 18px; font-weight: 400; line-height: 24px;/);
  assert.match(rules(`${F} .columns-media-text > h3`), /margin: 0 0 20px; font-weight: 700;/);
  assert.match(rules(`${F} .columns-media-text > ul > li`), /box-sizing: border-box;/);
  assert.match(rules(`${F} .columns-media-text > ul > li > strong`), /font-size: 24px; line-height: 28px;/);
  assert.match(rules(F), /padding: 20px 0 186px;/, 'phones: 20 px above, the artwork\'s 166 px under the content');
  const wide = after(`@media (width >= 768px) { ${F} {`);
  assert.match(rules(F, wide), /padding: 40px 0;/);
  assert.match(rules(`${F} .columns-media-text > ul > li > strong`, wide), /font-size: 28px; line-height: 32px;/);
});

/* the links' paragraphs as www's bare links (no paragraph margin, products' 18 px line), the facts
   without the list items' margin (www's rows 10 px apart), and on phones the products row's text 24 px
   over its features (www's .features { margin-top: 24px } below 1025 px) */
test('links, fact rows and the products rows on phones as www\'s', () => {
  assert.match(rules('body.brand-cargo .columns-media.band.features .columns-media-text > p.link-wrapper'), /display: flex; margin: 0; line-height: 18px;/, 'the paragraph as high as its link');
  assert.match(rules('body.appear.brand-cargo main .columns-media.band.features .columns-media-text p.link-wrapper a:any-link::before'), /width: 16px; height: 16px; margin-top: 1px;/, 'the arrow inside the 18 px line, as www\'s');
  assert.match(rules('body.brand-cargo .columns-media.band.facts .columns-media-text > p.link-wrapper'), /margin: 0;/);
  assert.match(rules('body.brand-cargo .columns-media.band.facts .columns-media-text > ul > li'), /box-sizing: border-box; margin: 0;/);
  const narrow = after('@media (width < 1025px) { body.brand-cargo .columns-media.band.features {');
  assert.match(rules('body.brand-cargo .columns-media.band.features .columns-media-row > .columns-media-text:not(:last-child)', narrow), /margin-bottom: 24px;/);
});
