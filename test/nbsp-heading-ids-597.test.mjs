/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Brief 597: since the no-break space guard (6a61397, 2026-11-09) www's no-break spaces reach the documents, headings
   too. Edge Delivery makes a heading's id from its text with github-slugger (only a plain space becomes '-', a no-break
   space is dropped): the fleet heading "Sitzpläne&nbsp;Airbus A320-200" got the id sitzpläneairbus-a320-200, while the
   page's own jump link (www's /de/de/320#seatmaps, rewritten by lufthansa-cleanup's rewriteAnchors) points to
   #sitzpläne-airbus-a320-200. tools/importer/nbsp-guard.mjs now writes a heading's no-break spaces as one plain space
   (guardNbsp in www's headings, restoreNbsp in every heading of a written document); everywhere else they stay.
   Input: slices of /de/de/320's snapshot (test/fixtures/nbsp-heading-ids-597, from tools/importer/bd-snapshots).
   Run: node --max-old-space-size=256 --test test/nbsp-heading-ids-597.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import {
  NBSP_STAND_IN as STAND_IN, guardNbsp, restoreNbsp, headingSpaces, headingText,
} from '../tools/importer/nbsp-guard.mjs';

const NB = '\u00a0';
const HI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules/@adobe/helix-importer/src/utils/';
// the slugger Edge Delivery's pipeline uses (helix-html-pipeline's IDSlugger), where aem-cli is installed
const SLUGGER = '/usr/local/lib/node_modules/@adobe/aem-cli/node_modules/github-slugger/index.js';
const slugger = fs.existsSync(SLUGGER) ? (await import(SLUGGER)).slug : null;
// IDSlugger: the slug, leading numbers off, -1, -2 for repeats (document order)
const pipelineIds = (headings) => {
  const seen = {};
  return headings.map((h) => {
    let id = slugger(h.textContent.trim()).replace(/^\d+-+/, '');
    const base = id;
    while (id in seen) { seen[base] += 1; id = `${base}-${seen[base]}`; }
    seen[id] = 0;
    return id;
  });
};

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { name, cells = [] }) => {
      const t = document.createElement('table');
      t.innerHTML = `<tr><th>${name}</th></tr>`;
      cells.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((c) => { const td = document.createElement('td'); td.append(c); tr.append(td); });
        t.append(tr);
      });
      return t;
    },
  },
};
const { default: transform } = await import('../tools/importer/transformers/lufthansa-cleanup.js');

const slices = fs.readFileSync(new URL('./fixtures/nbsp-heading-ids-597/320-seatmaps.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const URL_320 = 'https://www.lufthansa.com/de/de/320';
const page = (body) => `<html><head><title>Airbus A320-200 | Lufthansa</title><link rel="canonical" href="${URL_320}"></head><body><main><div class="contentpage"><div class="content-wrapper"><div class="container-content">${body}</div></div></div></main></body></html>`;

/** The import script's order (import-fleet.js): the transformers' onLoad, the guard, beforeTransform, afterTransform;
 * then the framework's steps where the plugin is on disk; the written document restored (restoreNbsp). */
const importSlices = async (html = slices) => {
  const { document } = parseHTML(page(html));
  const payload = { document, url: URL_320, params: { originalURL: URL_320 }, template: { name: 'fleet' } };
  transform('onLoad', document.body, payload);
  guardNbsp(document.body);
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  if (fs.existsSync(`${HI}DOMUtils.js`)) {
    const { default: DOMUtils } = await import(`${HI}DOMUtils.js`);
    DOMUtils.reviewParagraphs(document);
    ['a', 'strong', 'em'].forEach((tag) => DOMUtils.reviewInlineElement(document, tag));
  }
  const written = restoreNbsp(document.querySelector('main').innerHTML);
  return parseHTML(`<html><body><main>${written}</main></body></html>`).document;
};

test('/de/de/320: the seat-map headings with plain spaces, the jump link to the id the heading gets', async () => {
  assert.ok(slices.includes('Sitzpläne&nbsp;Airbus A320-200') && slices.includes('href="/de/de/320#seatmaps"'), 'the snapshot has the no-break space and www\'s anchor');
  const doc = await importSlices();
  const h2 = [...doc.querySelectorAll('h2')].map((h) => h.textContent.trim());
  assert.deepEqual(h2, ['Sitzpläne Airbus A320-200', 'Sitzpläne des Airbus A320-200 zum Download']);
  assert.ok(![...doc.querySelectorAll('h1, h2, h3, h4, h5, h6')].some((h) => /[\u00a0\u2007]/.test(h.textContent)), 'no no-break space or stand-in in a heading');
  const links = [...doc.querySelectorAll('a[href^="#"]')].map((a) => decodeURIComponent(a.getAttribute('href').slice(1)));
  assert.deepEqual(links, ['sitzpläne-airbus-a320-200'], 'the jump link as the cleanup writes it (www\'s #seatmaps rewritten)');
  if (slugger) {
    const ids = pipelineIds([...doc.querySelectorAll('h1, h2, h3, h4, h5, h6')]);
    assert.deepEqual(ids, ['sitzpläne-airbus-a320-200', 'darstellung-a320-200-168-sitze', 'sitzpläne-des-airbus-a320-200-zum-download']);
    links.forEach((l) => assert.ok(ids.includes(l), `#${l} resolves`));
    // the bug: the heading as the guard wrote it before (a no-break space) gets the id without the hyphen
    assert.equal(slugger(`Sitzpläne${NB}Airbus A320-200`), 'sitzpläneairbus-a320-200');
  }
});

test('running text keeps its no-break spaces: a paragraph and a link text next to the headings', async () => {
  const doc = await importSlices(`${slices}<div class="text section"><div class="richtext"><p>Airbus&nbsp;A320 mit 168&nbsp;Sitzen, <a href="/de/de/320#seatmaps">die Sitzpläne&nbsp;ansehen</a></p></div></div>`);
  const p = [...doc.querySelectorAll('p')].find((x) => x.textContent.includes('168'));
  assert.ok(p, 'the paragraph is there');
  assert.ok(p.textContent.includes(`Airbus${NB}A320 mit 168${NB}Sitzen`), 'the paragraph keeps them');
  const a = p.querySelector('a');
  assert.equal(a.textContent, `die Sitzpläne${NB}ansehen`);
  assert.equal(decodeURIComponent(a.getAttribute('href')), '#sitzpläne-airbus-a320-200');
  assert.ok(!doc.body.innerHTML.includes(STAND_IN));
});

test('headingSpaces / headingText: a run of spaces with a no-break space (character, entity or stand-in) as one plain space; only heading text', () => {
  assert.equal(headingText(`A${NB}B &nbsp;C${STAND_IN}D&#160;E&#xa0;F  G`), 'A B C D E F  G', 'a run without a no-break space as it is');
  assert.equal(
    headingSpaces(`<h2 class="x" title="a&nbsp;b">Sitzpläne&nbsp;<strong>Airbus${NB} A320</strong></h2><p>6${NB}773&nbsp;km</p><h4><a href="/de/de/x">Boeing&#160;747-8</a></h4>`),
    `<h2 class="x" title="a&nbsp;b">Sitzpläne <strong>Airbus A320</strong></h2><p>6${NB}773&nbsp;km</p><h4><a href="/de/de/x">Boeing 747-8</a></h4>`,
  );
  const plain = `<h2>Nothing here</h2><p>Distance${NB}: 6${NB}773</p>`;
  assert.equal(headingSpaces(plain), plain, 'a document without a no-break space in a heading byte for byte');
  const once = restoreNbsp(`<h3 id="k">Kilimandjaro,${STAND_IN}Tanzanie</h3><p>9${STAND_IN}h</p>`);
  assert.equal(once, `<h3 id="k">Kilimandjaro, Tanzanie</h3><p>9${NB}h</p>`);
  assert.equal(restoreNbsp(once), once, 'idempotent');
});

test('headingSpaces: a file\'s heading id the framework made from the old text follows the new one; any other id stays', () => {
  assert.equal(
    headingSpaces('<h2 id="sitzpläneairbus-a320-200">Sitzpläne&#160;Airbus A320-200</h2><h2 id="sitzpläneairbus-a320-200-1">Sitzpläne&#160;Airbus A320-200</h2>'),
    '<h2 id="sitzpläne-airbus-a320-200">Sitzpläne Airbus A320-200</h2><h2 id="sitzpläne-airbus-a320-200-1">Sitzpläne Airbus A320-200</h2>',
  );
  assert.equal(headingSpaces('<h2 id="faq-heading-small">FAQs about Cash&nbsp;&amp;&nbsp;Miles {heading-small}</h2>'), '<h2 id="faq-heading-small">FAQs about Cash &amp; Miles {heading-small}</h2>', 'a hand-made id as it is');
  assert.equal(headingSpaces('<h2 id="faqs-about-cashmiles-heading-small">FAQs about Cash&nbsp;&amp;&nbsp;Miles {heading-small}</h2>'), '<h2 id="faqs-about-cash--miles-heading-small">FAQs about Cash &amp; Miles {heading-small}</h2>');
  assert.equal(headingSpaces('<h3 id="2lufthansa-group-trips">2.&nbsp;Lufthansa Group Trips</h3>'), '<h3 id="lufthansa-group-trips">2. Lufthansa Group Trips</h3>', 'a leading number off, as the pipeline\'s slugger');
  if (slugger) assert.equal(slugger('FAQs about Cash & Miles {heading-small}'), 'faqs-about-cash--miles-heading-small');
});

test('the guard: in a heading (and its inline children) a plain space, outside the stand-in; an all-blank heading left to the framework', () => {
  const { document } = parseHTML(`<html><body><h2>Sitzpläne${NB}<em>Airbus${NB}${NB}A320</em></h2><h3>${NB}</h3><p>168${NB}Sitze</p></body></html>`);
  guardNbsp(document.body);
  assert.equal(document.querySelector('h2').textContent, 'Sitzpläne Airbus A320');
  assert.equal(document.querySelector('h3').textContent, NB);
  assert.equal(document.querySelector('p').textContent, `168${STAND_IN}Sitze`);
});
