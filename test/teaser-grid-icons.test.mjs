/* eslint-disable max-len */
/* Brief 305 (styles/styles.css): SWISS's FAQ hub as www's fourcolumn column views (col-md-6
   col-lg): its topic teasers four to a row from 1025px, two from 768px, one below, each group's
   first teaser ({column-start}) on a new row, everything else across the row; every icon of those
   teasers (the SVGs and the lounge voucher's PNG) 48px; Austrian's teasers (digital-services,
   accessible-travel, legal: www's a.teaser.partner / a.teaser.usp > .teaser-heading > img.icon-svg)
   at DCEP's .icon-svg size, 48px, on Austrian's pages only; SWISS's 303 rule as before.
   Run: timeout 60 node --test test/teaser-grid-icons.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const topRules = (text) => [...text.matchAll(/(?<=^|[{}])\s*([^{}@]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }));
const media = (w) => [...css.matchAll(new RegExp(`@media \\(width >= ${w}px\\) \\{([\\s\\S]*?)\\n\\}`, 'g'))].map((m) => m[1]).join('\n');
const W = 'body.brand-swiss main .default-content-wrapper:has(> .column-start):has(> :is(h2, h3, h4) > a > picture:first-child)';
const T = ':is(h2, h3, h4):has(> a > picture:first-child)';

test('SWISS\'s FAQ hub: a grid, one column below 768px, two from 768px, four from 1025px', () => {
  const base = topRules(css).find((r) => r.sel === W);
  assert.equal(Boolean(base), true, 'the grid rule');
  assert.match(base.body, /display:\s*grid/);
  assert.match(base.body, /grid-template-columns:\s*minmax\(0, 1fr\)/);
  const tablet = topRules(media(768)).find((r) => r.sel === W);
  assert.equal(Boolean(tablet), true, 'the tablet rule');
  assert.match(tablet.body, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  const desktop = topRules(media(1025)).find((r) => r.sel === W);
  assert.equal(Boolean(desktop), true, 'the desktop rule');
  assert.match(desktop.body, /grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
});

test('every other element across the row, the teasers one cell each, a group\'s first teaser on a new row', () => {
  const rules = topRules(css);
  const all = rules.find((r) => r.sel === `${W} > *`);
  assert.match(all.body, /grid-column:\s*1 \/ -1/);
  const teaser = rules.find((r) => r.sel === `${W} > ${T}`);
  assert.match(teaser.body, /grid-column:\s*auto/);
  const first = rules.find((r) => r.sel === `${W} > ${T}.column-start`);
  assert.match(first.body, /grid-column-start:\s*1/);
});

test('the teasers\' icons in the hub 48px whatever their type (the lounge voucher\'s PNG); SWISS\'s SVG rule as in 303', () => {
  const rules = topRules(css);
  const img = rules.find((r) => r.sel === `${W} > :is(h2, h3, h4) > a > picture:first-child img`);
  assert.equal(Boolean(img), true);
  assert.match(img.body, /width:\s*48px/);
  assert.match(img.body, /height:\s*48px/);
  assert.ok(!/svg/.test(img.sel), 'any image type');
  assert.equal(rules.filter((r) => r.sel.startsWith('body.brand-swiss main .default-content-wrapper > :is(h2, h3, h4) > a > picture:first-child:has(img[src*=".svg"])')).length, 2, '303\'s rules kept');
});

test('Austrian\'s teaser icons 48px above the title, on Austrian\'s pages only', () => {
  const rules = topRules(css).filter((r) => r.sel.startsWith('body.brand-austrian main .default-content-wrapper > :is(h2, h3, h4) > a > picture:first-child:has(img[src*=".svg"])'));
  assert.equal(rules.length, 2);
  const pic = rules.find((r) => !/ img$/.test(r.sel));
  const img = rules.find((r) => / img$/.test(r.sel));
  assert.match(pic.body, /display:\s*block/);
  assert.match(img.body, /width:\s*48px/);
  assert.match(img.body, /height:\s*48px/);
});
