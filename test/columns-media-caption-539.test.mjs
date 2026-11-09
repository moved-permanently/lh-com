/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 534, item 1 (the brands helper's job 2): since 762510ab the cabin-pets tab of Austrian's
   travelling-with-animals pages comes in as a columns-media (the text left, the carrier picture right, as www), and the
   columns-media parser dropped the picture's caption ("Maximum 8 kg (pet incl. soft travel carrier)", www's
   figure > figcaption > maui-caption): it kept captions on insights articles only. Out of the parser's table the
   cleanup turns every figcaption into a "{caption}" paragraph, so the same page imported the caption before. Now a
   picture's caption follows it in its cell as "<p>… {caption}</p>" in every template (the block pairs such a paragraph
   with its picture, blocks/columns-media); an empty caption is dropped, as before.
   lufthansa.com's own pages outside insights articles keep today's output: their only such captions are on the
   100-years campaign pages (8 snapshots; ema-adobe's rows, their owner's call; www shows them). Markup: the recording of www.austrian.com/at/en/plan/special-requirements/travelling-with-animals (brief 497,
   austrian-parity-002a), trimmed; a three-column view of captioned pictures for the other cells.
   Run: node --max-old-space-size=256 --test test/columns-media-caption-539.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let cellsOut;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { cells }) => {
      cellsOut = cells;
      return document.createElement('table');
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');

const NB = String.fromCharCode(0xa0);
const picture = (name, caption) => `<div class="image parbase section"><div class="image-wrapper "><div class="dcep-moving-image " role="presentation"><div class="moving-image" data-testid="moving-image"><div class="w-100 h-100 object-cover"></div><figure><img src="/content/dam/lh/images/illustrations/${name}.transform/lh-dcep-transform-width-1440/img.jpg" alt="${name} illustration" class="w-100 h-100 object-cover">${caption === null ? '' : `<figcaption id="moving-image-caption" class="caption"><maui-caption theme="os">${caption}</maui-caption></figcaption>`}</figure></div></div></div></div>`;
const textItem = '<div class="col-md-6 col-lg column-view-item"><div class="text section"><div class="richtext"><p>You can take a dog or cat weighing up to 8 kg with you into the cabin.</p></div></div></div>';
const imageItem = (name, caption) => `<div class="col-md-6 col-lg column-view-item">${picture(name, caption)}</div>`;
const view = (cls, items, page = '') => `<div class="${page}"><div class="${cls} column event"><div class="column-view flex-column " data-identifier="${cls}"><div class="row">${items.join('')}</div></div></div></div>`;
const html = (cell) => (Array.isArray(cell) ? cell : [cell]).map((n) => (n && n.outerHTML) || (n && n.textContent) || String(n || '')).join('');
const cellsOf = (cls, items, page, url = 'https://www.austrian.com/at/en/plan/special-requirements/travelling-with-animals') => {
  const { document } = parseHTML(`<html><body><div class="section-content">${view(cls, items, page)}</div></body></html>`);
  cellsOut = null;
  parse(document.querySelector(`.${cls}`), { document, url, params: { originalURL: url } });
  return (cellsOut || []).flat().map(html);
};

test('the cabin-pets tab: text | the carrier picture with its caption under it, in the picture\'s cell', () => {
  const cells = cellsOf('twocolumn', [textItem, imageItem('LH-PETC-bag-illustration', `Maximum 8${NB}kg (pet incl. soft travel carrier)`)]);
  const media = cells.find((c) => c.includes('LH-PETC-bag-illustration'));
  assert.ok(media, 'the picture cell');
  assert.match(media, /<img [^>]*LH-PETC-bag-illustration[^>]*>.*<p>Maximum 8.kg \(pet incl\. soft travel carrier\) \{caption\}<\/p>$/s, 'the caption right after the picture, in the same cell');
  assert.ok(cells.some((c) => c.includes('You can take a dog or cat')), 'the text cell as before');
});

test('any other columns-media cell with a caption under its picture keeps it; a picture without one, or an empty one, as before', () => {
  const cells = cellsOf('threecolumn', [imageItem('a', 'First caption'), imageItem('b', null), imageItem('c', '   ')]);
  assert.match(cells.find((c) => c.includes('/a.transform')), /<p>First caption \{caption\}<\/p>$/);
  assert.ok(!cells.find((c) => c.includes('/b.transform')).includes('{caption}'), 'no caption, no paragraph');
  assert.ok(!cells.find((c) => c.includes('/c.transform')).includes('{caption}'), 'an empty caption is dropped');
});

test('insights articles keep their captions as before', () => {
  const cells = cellsOf('twocolumn', [textItem, imageItem('article', 'Article caption')], 'article-details-page');
  assert.match(cells.find((c) => c.includes('/article.transform')), /<p>Article caption \{caption\}<\/p>$/);
});

test('lufthansa.com\'s own pages (their only such captions: the 100-years campaign, ema-adobe\'s rows) keep today\'s output', () => {
  const cells = cellsOf('twocolumn', [textItem, imageItem('crane', 'The Lufthansa crane on the Junkers Ju 52.')], '', 'https://www.lufthansa.com/de/en/100-years/crane');
  assert.ok(!cells.find((c) => c.includes('/crane.transform')).includes('{caption}'));
});
