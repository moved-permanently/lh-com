/* eslint-disable max-len, import/extensions, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 484, item D: a page without a Description in its Metadata block gets the first paragraph as description,
   style marker included ("…within Europe now {full-width}" on /at/en/oneway-fares; a video path and "{autoplay muted loop}" on
   an lh-b2b page). tools/importer/description-fix.mjs (HTML in, HTML out) adds the row: www's own meta description from the
   page's capture when there is one (description, else og: / twitter:description), else the first real text paragraph with
   the markers removed (not a paragraph that is only a link or a video path). A Description already there stays (its markers
   removed); placeholders stay. The importer (lufthansa-cleanup beforeTransform) writes www's description into the head
   before the metadata is read, from og: / twitter: when name=description is missing, else from the first text paragraph.
   Run: node --max-old-space-size=256 --test test/description-fix.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { fixDescription, firstTextParagraph, wwwDescription } from '../tools/importer/description-fix.mjs';

const doc = (main, meta = '<div><div><p>Title</p></div><div><p>Oneway Fares | Lufthansa</p></div></div><div><div><p>og:title</p></div><div><p>Oneway Fares</p></div></div>') => `<body><header></header><main><div><h1>Oneway Fares</h1>${main}</div><div><div class="metadata">${meta}</div></div></main><footer></footer></body>`;
const rows = (html) => {
  const { document } = parseHTML(`<html>${html}</html>`);
  return [...document.querySelectorAll('div.metadata > div')].map((r) => [...r.children].map((c) => c.textContent.trim()));
};
const desc = (html) => (rows(html).find(([k]) => k.toLowerCase() === 'description') || [])[1];

test('no Description, no capture: the first text paragraph without its marker, after Title', () => {
  const out = fixDescription(doc('<p>Book even more affordable flights with our Economy one way fare within Europe now {full-width}</p><p>More</p>'));
  assert.equal(desc(out.html), 'Book even more affordable flights with our Economy one way fare within Europe now');
  assert.equal(out.source, 'paragraph');
  assert.deepEqual(rows(out.html).map(([k]) => k), ['Title', 'Description', 'og:title']);
});

test('the capture\'s meta description first; og:description when name=description is missing', () => {
  const capture = '<html><head><meta name="description" content="Fly one way within Europe from EUR 49."></head><body><p>x</p></body></html>';
  const out = fixDescription(doc('<p>Text {full-width}</p>'), { capture });
  assert.equal(desc(out.html), 'Fly one way within Europe from EUR 49.');
  assert.equal(out.source, 'capture');
  assert.equal(wwwDescription('<head><meta property="og:description" content="From the og tag"></head>'), 'From the og tag');
  assert.equal(wwwDescription('<head><meta name="description" content="  "></head>'), '');
});

test('skipped: separators, marker-only paragraphs, a link alone, a video path, a picture', () => {
  const main = '<p>(10. März 2026)</p><p>(1 September 2026)</p><p>{spacer: medium}</p><p>{spacer-25}</p><p>{column-end-outer}</p><p><a href="/x">Book now</a></p><p><a href="https://business.lufthansagroup.com/content/dam/b2b/video.mp4">https://business.lufthansagroup.com/content/dam/b2b/video.mp4</a> {autoplay muted loop}</p><p>/content/dam/lh/video/teaser.mp4 {autoplay muted loop}</p><p><picture><img src="./media_1.jpg"></picture> {parallax}</p><p>Corporate travel made simple {copytext-medium}</p>';
  assert.equal(firstTextParagraph(main), 'Corporate travel made simple');
  assert.equal(desc(fixDescription(doc(main)).html), 'Corporate travel made simple');
});

test('a Description already there stays (its markers removed); placeholders stay; nothing to take: unchanged', () => {
  const meta = '<div><div><p>Title</p></div><div><p>T</p></div></div><div><div><p>Description</p></div><div><p>Flights from {origin} {copytext-small}</p></div></div>';
  const out = fixDescription(doc('<p>Other text</p>', meta));
  assert.equal(desc(out.html), 'Flights from {origin}');
  const none = doc('<p>{spacer-25}</p>');
  const r = fixDescription(none);
  assert.equal(r.html, none);
  assert.equal(r.source, null);
});

test('a page without a Metadata block gets one in its last section; a plain.html (no body) works too', () => {
  const html = '<div><h1>Page</h1><p>First text of the page {full-width}</p></div>';
  const out = fixDescription(html);
  assert.match(out.html, /<div class="metadata"><div><div><p>Description<\/p><\/div><div><p>First text of the page<\/p><\/div><\/div><\/div>/);
});

test('HTML in the text is escaped', () => {
  const out = fixDescription(doc('<p>Fares &amp; more &lt;now&gt;</p>'));
  assert.match(out.html, /<p>Fares &amp; more &lt;now&gt;<\/p>/);
});

test('the importer: lufthansa-cleanup writes www\'s description into the head before the metadata is read', async () => {
  globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (d) => d.createElement('table'), createBlock: (d) => d.createElement('table') } };
  const { default: transform } = await import('../tools/importer/transformers/lufthansa-cleanup.js');
  const run = (head, body) => {
    const { document } = parseHTML(`<html><head>${head}</head><body><main><div class="container-content"><div class="section"><div class="section-content"><div class="text section"><div class="richtext">${body}</div></div></div></div></div></main></body></html>`);
    const url = 'https://www.lufthansa.com/at/en/oneway-fares';
    transform('beforeTransform', document.body, {
      document, url, params: { originalURL: url }, template: { name: 'info' },
    });
    const m = document.head.querySelector('meta[name="description"]');
    return m ? m.getAttribute('content') : null;
  };
  assert.equal(run('<meta name="description" content="www says">', '<p>Text</p>'), 'www says');
  assert.equal(run('<meta property="og:description" content="og says">', '<p>Text</p>'), 'og says');
  assert.equal(run('', '<p><a href="/x">Link only</a></p><p>The first text paragraph</p>'), 'The first text paragraph');
  assert.equal(run('<meta name="description" content="">', '<p>Fallback</p>'), 'Fallback');
});
