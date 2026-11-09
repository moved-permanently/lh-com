/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 532 (the answers): Brussels' 30 "{caption}" paragraphs under a paragraph of two photos (the-gambia,
   the-ultimate-itinerary-in-kenya, vibrant-senegal in en, fr and nl) were left for a person, and nobody is there to
   place them. The decision: such a caption becomes a paragraph in the theme's default text style, as the form note
   labels did (item 4 of the brief after 520). The marker goes, there is no italics and no figure caption, and it is
   counted as theme. A caption under one photo stays a figure caption (the carrier). A caption after no picture at all
   stays for a person, as before.
   Run: node --max-old-space-size=512 --test test/caption-gallery-532.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { lossProblems } from '../tools/importer/collapse-loss-check.mjs';

const pic = (n) => `<picture><img src="/media_${n}.jpg" alt=""></picture>`;
const run = (html) => collapseHtml(html, {
  path: '/be/en/articles/the-gambia', brand: 'brussels', parse: parseHTML, force: true,
});

test('a caption under two photos: a default paragraph, the theme', () => {
  const doc = `<div><div class="columns-media"><div><div><p>${pic(1)}${pic(2)}</p><p>Never a dull moment in The Gambia. {caption}</p></div></div></div></div>`;
  const r = run(doc);
  assert.ok(r.html.includes('<p>Never a dull moment in The Gambia.</p>'), r.html);
  assert.ok(!/<em>|\{caption\}/.test(r.html));
  assert.equal(r.stats.theme.caption, 1);
  assert.equal(r.stats.hand.caption, undefined);
  assert.deepEqual(r.hand, []);
  assert.deepEqual(lossProblems(doc, r.html), []);
  assert.equal(run(r.html).html, r.html, 'idempotent');
});

test('one photo: the figure caption as before; no picture: for a person as before', () => {
  const one = run(`<div><p>${pic(1)}</p><p>A view. {caption}</p></div>`);
  assert.ok(one.html.includes('<p><em>A view.</em></p>'), one.html);
  assert.equal(one.stats.carrier.caption, 1);
  const none = run('<div><p>Text</p><p>(© Getty Images) {caption}</p></div>');
  assert.equal(none.stats.hand.caption, 1);
});
