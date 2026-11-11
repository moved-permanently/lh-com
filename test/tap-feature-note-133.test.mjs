/* eslint-disable import/no-extraneous-dependencies, import/extensions, max-len -- tests */
/* TAP row 133: a feature card's footnote (ComponentFeatureCardModel's complementaryNote). www shows it as small print
   under the card's two columns (text-body-s, 14 / 24 px, the body's colour; on phones under the text); the importer put
   it in the text cell at 16 px. Now the card's second row, one text cell, which tap.css draws full width as small print
   8 px under the card's first row (/en-pt/on-board/fly-business against tap-parity-002: 1008 px at 1440 as www's).
   Run: node --max-old-space-size=256 --test test/tap-feature-note-133.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { convertPage } from '../tools/importer/tap-import.mjs';

const NOTE = '*Exceptionally, and for operational reasons, the middle seat may also be occupied on flights operated by other aircraft in the TAP fleet.';
const card = (extra) => ({
  __typename: 'ComponentFeatureCardModel', size: 'large', featureCardDescription: { plaintext: 'Middle seat blocked for greater comfort.' }, ...extra,
});
const page = (cards) => ({ props: { pageProps: { page: { title: 'Fly Business', sections: [{ __typename: 'ComponentHeadingModel', title: 'Fly Business' }, ...cards] } } } });
const site = {
  url: 'https://www.flytap.com/en-pt/on-board/fly-business', lang: 'en', locale: 'en-pt', scope: new Set(['/en-pt/on-board/fly-business']), media: () => null, anchors: new Map(),
};
// the cards' rows: each row's cells' text
const rows = (html) => [...parseHTML(`<html><body><main>${html}</main></body></html>`).document.querySelectorAll('.columns-media')]
  .map((b) => [...b.children].map((r) => [...r.children].map((c) => c.textContent.replace(/\s+/g, ' ').trim())));

test('a card with a footnote: the note as its second row of one cell, not in the text cell', () => {
  const [cardRows] = rows(convertPage(page([card({ complementaryNote: { plaintext: NOTE } })]), site).html);
  assert.equal(cardRows.length, 2);
  assert.ok(!cardRows[0].some((c) => c.includes('Exceptionally')));
  assert.deepEqual(cardRows[1], [NOTE]);
});

test('a card without one, or with an empty note (auctions: "\\n"): one row as before', () => {
  rows(convertPage(page([card({}), card({ complementaryNote: { plaintext: null } }), card({ complementaryNote: { plaintext: '\n' } })]), site).html)
    .forEach((r) => assert.equal(r.length, 1));
});

test('tap.css draws the note row: full width, 14 / 24 px, 8 px under the first row; no nested :has', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  const part = css.slice(css.indexOf('/* TAP row 133'));
  assert.ok(part.length > 0);
  const body = part.slice(part.indexOf('*/') + 2);
  assert.match(body, /\.columns-media:is\(\.feature, \.feature-small\):has\(> \.columns-media-row > \.columns-media-text:only-child\) \{\s*row-gap: 8px;/);
  assert.match(body, /\.columns-media-row:has\(> \.columns-media-text:only-child\) \{\s*grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(body, /\.columns-media-row:has\(> \.columns-media-text:only-child\) > \.columns-media-text > p \{\s*margin: 0;\s*font-size: 14px;\s*line-height: 24px;/);
  assert.doesNotMatch(body.slice(0, body.indexOf('line-height: 24px')), /:has\([^)]*:has\(/);
});
