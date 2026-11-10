/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The standing order of 2026-11-10 evening, decision 1 (lh-b2b): an H1 that opens a column view. www draws the view's
   padding above the H1 (40 px, 20 on phones) and below its last item (lhg-history: the H1 and the intro one view,
   the card grid another; b2b-parity-003 de/en). DA marks it ({column-start-outer} on the H1, {column-end-outer} on the
   view's last paragraph); the collapse left the marks to the theme, which draws views around blocks only, so the H1
   sat 42 px high and the cards 56 px. On B2B (THEMES.b2b columnViews.h1View) the collapse makes the H1's view a
   section of its own, which an outer group over its whole section already turns into the section style padded
   (section padding 20 / 40 px), and flush when more follows; the rest of the section after it as before.
   Run: node --max-old-space-size=512 --test test/b2b-h1-view-583.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor } from '../scripts/style-markers.js';

const PIC = '<picture><img src="./media_1.jpg" alt=""></picture>';
const run = (html, path = '/de/en/about-us/lhg-history') => collapseHtml(html, { path, parse: parseHTML, brand: 'b2b' }).html;
const styles = (html) => {
  const { document } = parseHTML(`<main>${html}</main>`);
  return [...document.querySelectorAll('main > div')].map((s) => {
    const row = [...s.querySelectorAll(':scope > .section-metadata > div')].find((r) => /^style$/i.test(r.children[0]?.textContent.trim()));
    const first = [...s.children].find((c) => !c.classList.contains('section-metadata'));
    let name = '-';
    if (first) name = first.tagName === 'DIV' ? first.className.split(' ')[0] : first.tagName.toLowerCase();
    return `${name}:${row ? row.children[1].textContent.trim() : ''}`;
  });
};

test('B2B: the theme asks for it', () => {
  assert.equal(themeFor('b2b', 'flow').columnViews.h1View, true);
  assert.ok(!themeFor('discover', 'flow').columnViews.h1View);
});

test('lhg-history: the H1 and its intro one padded section, flush; the spacer and the cards the next section', () => {
  const html = run(`<div><h1>From the route network to corporate benefits {column-start-outer}</h1><p>From the first flight over the Alps to NDC Smart Offers. {full-width column-end-outer}</p><p>{spacer-60}</p><div class="carousel-cards grid four-up"><div><div>${PIC}</div><div><p>Card</p></div></div></div></div>`);
  const s = styles(html);
  assert.equal(s.length, 2, s.join(' | '));
  assert.match(s[0], /^h1:.*\bpadded\b/);
  assert.match(s[0], /\bflush\b/);
  assert.match(s[1], /^(p|carousel-cards):/);
  assert.ok(!/\{column-/.test(html), 'no marks left');
});

test('an airlines-at-a-glance page: the H1\'s view after the stage\'s views is a padded section to its end', () => {
  const html = run(`<div><p>{column-start-outer}</p><div class="columns-media"><div><div>${PIC}</div><div><p>Stage</p></div></div></div><p>{column-end-outer}</p><h1>Air Dolomiti {column-start-outer}</h1>${PIC.replace('media_1', 'media_2')}<h4>Fleet</h4><p>Text {column-end-outer}</p></div>`, '/de/de/program/experts/airlines-at-a-glance/airdolomiti');
  const s = styles(html);
  assert.equal(s.length, 2, s.join(' | '));
  assert.match(s[1], /^h1:.*\bpadded\b/);
  assert.doesNotMatch(s[1], /\bflush\b/, 'nothing follows it');
});

test('an H1 without a column mark, and another brand, as before', () => {
  assert.equal(styles(run('<div><h1>Title</h1><p>Intro</p><p>{spacer-60}</p><p>More</p></div>')).length, 1);
  const lh = collapseHtml('<div><h1>Title {column-start-outer}</h1><p>Intro {column-end-outer}</p><p>{spacer-60}</p><p>More</p></div>', { path: '/de/en/x', parse: parseHTML, brand: 'discover' }).html;
  assert.equal(styles(lh).length, 1, 'Discover: one section');
});
