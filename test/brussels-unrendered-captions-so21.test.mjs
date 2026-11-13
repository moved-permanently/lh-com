/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 21, item 2: the import helper ran today's importer on the Nov 1 Brussels snapshot of
   /be/fr/articles/vibrant-senegal and got no "{caption}" markers at all. A snapshot taken before www's script draws the
   moving images holds each image component as its server sends it: an empty .dcep-moving-image whose data-dcep JSON has
   imageUrl, alt and caption (entity-encoded once more: "&amp;agrave;"). The cleanup's restoreMovingImages put back the
   picture from that JSON but not its caption, so the columns-media parser (and the cleanup's convertCaptions for default
   content) found no figcaption. Now the caption comes back with the picture, as figure > img + figcaption > maui-caption,
   the markup www's script draws (39 of 39 config captions drawn, none drawn without one, in the 1440 recordings of
   migration-work/parity-588/drop).
   Fixtures (test/fixtures/brussels-unrendered-captions-so21): the article's first two galleries with a caption
   (brussels-parity-009, be-fr-articles-vibrant-senegal-1440.html, srcset dropped), as recorded and with each
   .dcep-moving-image emptied (the server's shape; the Nov 1 snapshot itself is not on this machine).
   Run: node --max-old-space-size=256 --test test/brussels-unrendered-captions-so21.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('div'),
    createBlock: (document, { name, variants = [], cells }) => {
      const table = document.createElement('table');
      table.setAttribute('data-name', name);
      const head = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = `${name}${variants.length ? ` (${variants.join(', ')})` : ''}`;
      head.append(th);
      table.append(head);
      cells.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((c) => {
          const td = document.createElement('td');
          (Array.isArray(c) ? c : [c]).forEach((n) => { if (n) td.append(typeof n === 'string' ? document.createTextNode(n) : n); });
          tr.append(td);
        });
        table.append(tr);
      });
      return table;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');

// linkedom's Range and compareDocumentPosition stand-ins by document order (as test/columns-media-partial-grid-557.test.mjs)
function order(document) {
  const pre = new Map();
  const post = new Map();
  let c = 0;
  const walk = (n) => {
    pre.set(n, c += 1);
    [...n.childNodes].forEach(walk);
    post.set(n, c += 1);
  };
  walk(document.documentElement);
  return { pre, post };
}
function standIns(document) {
  document.createRange = () => {
    const { pre, post } = order(document);
    let start = 0;
    let end = Infinity;
    const inside = (n) => pre.has(n) && pre.get(n) > start && post.get(n) < end;
    return {
      setStartAfter(node) { start = post.get(node); },
      setEndBefore(node) { end = pre.get(node); },
      cloneContents() {
        const frag = document.createElement('div');
        const add = (n) => {
          if (inside(n) && !inside(n.parentNode)) frag.append(n.cloneNode(true));
          else [...n.childNodes].forEach(add);
        };
        add(document.documentElement);
        return frag;
      },
    };
  };
  Object.getPrototypeOf(Object.getPrototypeOf(document.body)).compareDocumentPosition = function position(other) {
    const { pre } = order(document);
    return pre.get(other) > pre.get(this) ? 4 : 2;
  };
}

const URL_FR = 'https://www.brusselsairlines.com/be/fr/articles/vibrant-senegal';
const fixture = (name) => fs.readFileSync(new URL(`./fixtures/brussels-unrendered-captions-so21/vibrant-senegal-galleries-${name}.html`, import.meta.url), 'utf8');
const CAPTIONS = [
  'Commencez votre voyage à Dakar, une ville pleine de saveurs et de contrastes. {caption}',
  'Découvrez l\'histoire de Gorée et laissez-vous enchanter par les couleurs et l\'architecture de cette ville pleine de vie. {caption}',
];

// the galleries through the cleanup (before) and the insights mapping's columns-media parser, as the import runs them
const captionsOf = (body) => {
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content">${body}</div></main></body></html>`);
  standIns(document);
  const payload = { document, url: URL_FR, params: { originalURL: URL_FR }, template: { name: 'insights' } };
  transform('beforeTransform', document.body, payload);
  [...document.querySelectorAll('.article-details-page .article-content > div > .twocolumn')].forEach((el) => parse(el, payload));
  return {
    // per block row, the pictures of each cell (www's two galleries are adjacent: the parser merges them into one block)
    rows: [...document.querySelectorAll('table[data-name] tr')].slice(1).map((tr) => [...tr.children].map((td) => td.querySelectorAll('img').length).join(' ')),
    captions: [...document.querySelectorAll('table[data-name] p')].map((p) => p.textContent.trim()).filter((t) => t.endsWith('{caption}')),
  };
};

test('the galleries as recorded (www\'s script ran): both captions marked, as before', () => {
  const out = captionsOf(fixture('rendered'));
  assert.deepEqual(out.rows, ['1 2', '1 2']);
  assert.deepEqual(out.captions, CAPTIONS);
});

test('the galleries as the server sends them: the same pictures and both captions marked', () => {
  const out = captionsOf(fixture('unrendered'));
  assert.deepEqual(out.rows, ['1 2', '1 2'], 'every picture back from data-dcep, in the same cells');
  assert.deepEqual(out.captions, CAPTIONS);
});

test('an unrendered moving image in running text: its caption a "{caption}" paragraph after it; an empty one none', () => {
  const comp = (caption) => `<div class="image parbase section"><div class="image-wrapper "><div class="dcep-moving-image " data-dcep="{&quot;imageUrl&quot;: &quot;/content/dam/sn/images/blog/x.jpg.transform/lh-dcep-transform-width-1440/img.jpg&quot;, &quot;alt&quot;: &quot;&quot;, &quot;caption&quot;: &quot;${caption}&quot;}" role="presentation"></div></div></div>`;
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content"><div class="text"><p>Intro</p></div>${comp('Gor&amp;eacute;e &amp;amp; Dakar')}${comp('')}</div></main></body></html>`);
  const payload = { document, url: URL_FR, params: { originalURL: URL_FR }, template: { name: 'insights' } };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  assert.equal(document.querySelectorAll('img').length, 2);
  assert.deepEqual([...document.querySelectorAll('p')].map((p) => p.textContent.trim()).filter((t) => t.includes('{caption}')), ['Gorée & Dakar {caption}']);
});

test('every import bundle carries it (the Brussels articles import with import-insights.bundle.js)', () => {
  const dir = new URL('../tools/importer/', import.meta.url);
  const read = (f) => fs.readFileSync(new URL(f, dir), 'utf8');
  const bundles = fs.readdirSync(dir).filter((f) => f.startsWith('import-') && f.endsWith('.bundle.js') && read(f).includes('function restoreMovingImages('));
  assert.ok(bundles.includes('import-insights.bundle.js'));
  bundles.forEach((f) => assert.ok(read(f).includes('const inner = document.createElement("maui-caption");'), f));
});
