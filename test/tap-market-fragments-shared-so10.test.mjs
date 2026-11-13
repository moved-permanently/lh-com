/* eslint-disable max-len, import/extensions -- tests */
/* tap-markets.mjs, standing order 10 (2026-11-11): a page over the limits whose market sections share content (en-pt
   partners: br, ca, us and mx show the same "Rent a Car") gets one fragment for the shared content (marketFragments),
   linked from each of those sections. variantFragments rewrote the links by position, so after the first shared one
   every link pointed at another fragment (ao's "Rent a Car" tab at a Hotels fragment: 538 of www's en-ao texts gone).
   Each link must lead to its own section's content. Run: node --max-old-space-size=256 --test test/tap-market-fragments-shared-so10.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { marketFragments, variantFragments } from '../tools/importer/tap-markets.mjs';

const md = (m, tab) => `<div class="section-metadata"><div><div>Markets</div><div>${m}</div></div><div><div>Tab</div><div>${tab}</div></div></div>`;
const sec = (m, tab, body) => `<div><h2>${tab}</h2>${body}${md(m, tab)}</div>`;
const html = [
  '<div><h1>Partners</h1></div>',
  sec('pt', 'Rent a Car', '<p>Avis (home)</p>'),
  sec('ao', 'Rent a Car', '<p>Avis Angola</p>'),
  sec('ao', 'Hotels', '<p>Accor Angola</p>'),
  sec('br', 'Rent a Car', '<p>Avis Americas</p>'),
  sec('ca', 'Rent a Car', '<p>Avis Americas</p>'),
  sec('ca', 'Hotels', '<p>Accor Americas</p>'),
  sec('us', 'Rent a Car', '<p>Avis Americas</p>'),
  sec('us', 'Hotels', '<p>Accor Americas</p>'),
].join('\n');

test('every market section links the fragment with its own content, shared contents one fragment', () => {
  const mf = marketFragments(html, { home: 'pt', base: '/en-pt/fragments/partners' });
  const vf = variantFragments(mf.html, mf.fragments);
  const byDoc = new Map(vf.fragments.map((f) => [f.doc, f.html]));
  const links = [...vf.html.matchAll(/<a href="([^"]+)">/g)].map((m) => m[1]);
  const expected = ['Avis Angola', 'Accor Angola', 'Avis Americas', 'Avis Americas', 'Accor Americas', 'Avis Americas', 'Accor Americas'];
  assert.equal(links.length, expected.length);
  links.forEach((l, i) => {
    assert.ok(byDoc.has(l), l);
    assert.ok(byDoc.get(l).includes(expected[i]), `${l} should hold ${expected[i]}`);
  });
  // the shared contents: one fragment each
  assert.equal(new Set(links).size, 4);
  // the home market's section stays inline
  assert.ok(vf.html.includes('Avis (home)'));
});
