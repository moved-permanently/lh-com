/* eslint-disable max-len */
/* Air Dolomiti's destination carousels as www's (the sweep after 556; airdolomiti-parity-001 /de/reiseziele/bari-de at
   1440 and 390): www's CosaFareCarroussel ("Ausflüge & Tipps", "Sehenswürdigkeiten", "Essen") is a MiniCardSlider of
   CardNews cards: 470 px high, the picture 60 %, the title 20/26 regular, the whole card one link, 325 px wide 2.5vw apart
   (30vw from 930 px), no dots; the map icon after the title; "Zeige alles" and two 40 px arrows under the cards on phones,
   at the right end of the line's row from 930 px. The importer writes it as carousel-cards without an option in a
   heading-icon section, which the theme left as lh-com's carousel (square pictures, the title twice, dots): each section
   190 px taller than www's at 1440, 120 px shorter at 390.
   Run: node --test test/airdolomiti-cosa-fare-557.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const base = css.replace(/@media[^{]*\{[\s\S]*?\n\}\n/g, '');
const S = 'body.brand-airdolomiti main > .section.heading-icon:has(> .carousel-cards-wrapper > .carousel-cards:not(.promo, .destinations))';
const C = 'body.brand-airdolomiti main > .section.heading-icon .carousel-cards:not(.promo, .destinations)';
const L = 'body.brand-airdolomiti main > .section.heading-icon > .carousel-cards-wrapper:has(> .carousel-cards:not(.promo, .destinations)) + .default-content-wrapper';
// the declarations of the rules whose selector list holds sel (in scope), merged
const decls = (scope, sel) => Object.fromEntries([...scope.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter((m) => m[1].replace(/@media[^{]*$/, '').split(/,\s*\n/).map((s) => s.replace(/^[\s\S]*\{/, '').trim()).includes(sel))
  .flatMap((m) => m[2].split(';').map((d) => d.trim()).filter(Boolean))
  .map((d) => { const [k, ...v] = d.split(':'); return [k.trim(), v.join(':').trim()]; }));
const media = (q) => css.split(`@media (${q}) {`).slice(1).map((p) => p.slice(0, p.indexOf('\n}\n'))).join('\n}\n');

test('the cards as www\'s CardNews: 470 px, the picture 60 %, the title 20/26 regular, one link, no dots', () => {
  const slide = decls(base, `${C} .carousel-cards-slide`);
  assert.deepEqual([slide.flex, slide.height, slide['border-radius'], slide.border], ['0 0 325px', '470px', '10px', '0']);
  assert.equal(decls(base, `${C} .carousel-cards-image`).height, '60%');
  const title = decls(base, `${C} .carousel-cards-body > :is(h2, h3, h4)`);
  assert.deepEqual([title['font-size'], title['line-height'], title['font-weight'], title['line-clamp']], ['20px', '26px', '400', '3']);
  assert.deepEqual([decls(base, `${C} .carousel-cards-cta a:any-link`).position, decls(base, `${C} .carousel-cards-cta a:any-link`).inset], ['absolute', '0']);
  assert.equal(decls(base, `${C} .carousel-cards-dots`).display, 'none');
  assert.equal(decls(base, `${C} .carousel-cards-track`).gap, '2.5vw');
});

test('the icon after the title, out of its line; the line under it 19.44/32', () => {
  const icon = decls(base, `${S} > .default-content-wrapper:first-child > h2 .heading-icon-image`);
  assert.deepEqual([icon.position, icon.left, icon.margin], ['absolute', '100%', '0 0 0 10px']);
  assert.equal(decls(base, `${S} > .default-content-wrapper:first-child > h2 .heading-icon-image img`).height, '30px');
  const line = decls(base, `${S} > .default-content-wrapper:first-child > p`);
  assert.deepEqual([line['font-size'], line['line-height']], ['19.44px', '32px']);
});

test('phones: the link and the arrows in a row under the cards; from 930 px at the right of the line, 30vw cards', () => {
  assert.equal(decls(base, `${C} .carousel-cards-nav`).inset, 'auto 0 0 auto');
  assert.equal(decls(base, L)['margin-top'], '-40px');
  assert.equal(decls(base, S)['margin-bottom'], '101px');
  const wide = media('width >= 930px');
  assert.equal(decls(wide, `${C} .carousel-cards-slide`)['flex-basis'], '30vw');
  assert.equal(decls(wide, L).position, 'absolute');
  assert.match(decls(wide, `${C} .carousel-cards-nav`).inset, /^60px /);
  assert.equal(decls(wide, S)['margin-bottom'], '72px');
});
