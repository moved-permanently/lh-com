/* eslint-disable max-len */
/* Standing order 15, the Austrian ranking (Austrian rows 52 and 53): the "This may also interest you" part (a divider
   section: its heading, then a card carousel; it ends entryregulations, sustainable-flying, online-check-in, doctor-on-
   board). 52: www's heading is heading-small (the recordings' h2s: 28 / 30.8 px with 36 under it at 1440, 22 / 24.2 with
   24 on phones); ours heading-medium. The homepages' "Discover Austrian" over a carousel stays heading-medium (51
   recordings). 53: on phones the carousel's dots 67 px under the cards and 82 px over what follows (www's screenshots,
   austrian-parity-015 entryregulations at 390); ours 23 and 56, in blocks/carousel-cards/carousel-cards.css (a theme
   sets dot tokens only). The drawn dot (ema-adobe's tokens) unchanged. Reads the CSS as written.
   Run: node --max-old-space-size=256 --test test/austrian-interest-carousel-so15.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
// the dots in the carousel's own file (a theme sets dot tokens only: test/carousel-dots-374.test.mjs)
const car = fs.readFileSync(new URL('../blocks/carousel-cards/carousel-cards.css', import.meta.url), 'utf8');
const rule = (sel, from = 0) => {
  const at = css.indexOf(`${sel} {`, from);
  return at < 0 ? { at, body: '' } : { at, body: css.slice(at, css.indexOf('}', at)) };
};
const H = 'body.brand-austrian main > .section.divider > .default-content-wrapper:has(+ .carousel-cards-wrapper) > h2:last-child';
const DOTS = 'body.brand-austrian main .carousel-cards.phone-slider .carousel-cards-dots';

test('row 52: the heading over a divider section\'s carousel heading-small, 22 / 24.2 with 24 on phones', () => {
  const r = rule(H);
  assert.ok(r.at >= 0);
  assert.match(r.body, /font-size: 22px;/);
  assert.match(r.body, /line-height: 1\.1;/);
  assert.match(r.body, /margin-bottom: 24px;/);
});

test('row 52: from 1025 px 28 with 36 under it', () => {
  const r = rule(`  ${H}`);
  assert.ok(r.at > 0);
  assert.match(css.slice(css.lastIndexOf('@media', r.at), r.at), /@media \(width >= 1025px\)/);
  assert.match(r.body, /font-size: 28px;/);
  assert.match(r.body, /margin-bottom: 36px;/);
});

test('row 53: a phone slider\'s dots 51 px under the cards (the 24 px target\'s 8 above its dot: 67 to the dot), 26 px more below', () => {
  const at = car.indexOf(`${DOTS} {`);
  assert.ok(at >= 0, 'in carousel-cards.css');
  const r = { at, body: car.slice(at, car.indexOf('}', at)) };
  assert.ok(!css.includes('carousel-cards-dots'), 'not in the theme');
  assert.match(r.body, /margin-top: 51px;/);
  assert.match(r.body, /margin-bottom: 26px;/);
});

test('before the online-check-in parts (whose tests read their own slices)', () => {
  const end = css.indexOf('/* the end of online-check-in');
  assert.ok(rule(H).at < end);
});
