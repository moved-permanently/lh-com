/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 14 (2026-11-13), item 1: the children's-menus documents (de/en, gb/en childrens-menus-on-board, de/de and
   at/de kindermenues-an-bord). www ends the AEM section above "Kids Box on European flights" with a 40px separator whose
   inline margin stays, then starts a new section with the view; DA's copies have the view right under the text (or the
   "Order now" button): the view 40px higher than www's. The importer keeps that separator now
   (test/end-separator-so14); for DA's copies tools/importer/view-spacer-apply.mjs puts "{spacer-40}" right before the
   block whose first heading starts with the given text, unless a separator is there already. Nothing else changes.
   Input: DA's copies of 2026-11-13 (test/fixtures/spacer-before-so14).
   Run: node --max-old-space-size=256 --test test/view-spacer-so14.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { applyViewSpacer } from '../tools/importer/view-spacer-apply.mjs';

const read = (n) => fs.readFileSync(new URL(`./fixtures/spacer-before-so14/${n}`, import.meta.url), 'utf8');
const prevOf = (html, start) => {
  const { document } = parseHTML(`<html>${html}</html>`);
  const block = [...document.querySelectorAll('div.columns-media')].find((b) => {
    const h = b.querySelector('h1, h2, h3, h4');
    return h && h.textContent.trim().startsWith(start);
  });
  return block.previousElementSibling;
};

test('de/en: {spacer-40} between the "Order now" button and the Kids Box view; nothing else changes', () => {
  const da = read('childrens-menus.da.html');
  const r = applyViewSpacer(da, [{ heading: 'Kids Box on European flights', n: 40 }]);
  assert.deepEqual(r.results.map((x) => x.result), ['placed']);
  assert.equal(prevOf(r.html, 'Kids Box').textContent.trim(), '{spacer-40}');
  // the copy has two {spacer-40} of its own: only the one before the Kids Box view is new
  assert.equal(r.html.replace('<p>{spacer-40}</p><div class="columns-media padded"><div><div><h2 id="kids-box', '<div class="columns-media padded"><div><div><h2 id="kids-box'), da);
});

test('de/de: the same under the text; a second run and an unknown heading change nothing', () => {
  const da = read('kindermenues.da.html');
  const r = applyViewSpacer(da, [{ heading: 'Kids Box auf Europaflügen', n: 40 }]);
  assert.equal(prevOf(r.html, 'Kids Box').textContent.trim(), '{spacer-40}');
  assert.equal(applyViewSpacer(r.html, [{ heading: 'Kids Box auf Europaflügen', n: 40 }]).html, r.html);
  const none = applyViewSpacer(da, [{ heading: 'No such heading', n: 40 }]);
  assert.equal(none.html, da);
  assert.deepEqual(none.results.map((x) => x.result), ['not found']);
});
