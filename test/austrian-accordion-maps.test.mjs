/* eslint-disable max-len, import/extensions -- dev tooling */
/* Austrian's new destinations (/<market>/<lang>/book/flights/new-destinations, 10 documents; parity row 42, brief
   444): www's accordion has a points-of-interest map (.poimapping) at the top of some items. lh-com's info import
   made the map a poi-map table inside the accordion item's cell, and the nested table lost both blocks. DA's
   documents (an earlier import) have each map as its own block before an accordion that starts with the map's
   item. withAccordionMapsHoisted: an accordion with maps in its items is split before each such item, the item's
   map before its part. String-based, the rest of the snapshot as it was.
   Run: node --max-old-space-size=512 --test test/austrian-accordion-maps.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const map = (n) => `<div class="poimapping"><div class="dcep-poi-mapping">map ${n}</div></div>`;
const item = (t, inner) => `<div class="accordionitem commonevent"><maui-collapsible-item headline="${t}"><div>${inner}</div></maui-collapsible-item></div>`;
const acc = (items) => `<div class="accordion commonevent section">\n<maui-collapsible id="a1" class="accordion-maui">${items.join('\n')}</maui-collapsible></div>`;

test('an accordion with maps in its items: split before each such item, the map before its part', async () => {
  const { withAccordionMapsHoisted } = await import('../tools/importer/austrian-import.mjs');
  const html = `<div class="section-content">${acc([item('Summer', `${map(1)}<p>A</p>`), item('Winter', `${map(2)}<p>B</p>`), item('Later', '<p>C</p>')])}</div>`;
  const want = `<div class="section-content">${map(1)}${acc([item('Summer', '<p>A</p>')])}${map(2)}${acc([item('Winter', '<p>B</p>'), item('Later', '<p>C</p>')])}</div>`;
  assert.equal(withAccordionMapsHoisted(html).replace(/\n/g, ''), want.replace(/\n/g, ''));
});

test('items before the first map stay one accordion; an accordion without maps as it was', async () => {
  const { withAccordionMapsHoisted } = await import('../tools/importer/austrian-import.mjs');
  const first = acc([item('Intro', '<p>I</p>'), item('Summer', `${map(1)}<p>A</p>`)]);
  assert.equal(withAccordionMapsHoisted(first).replace(/\n/g, ''), `${acc([item('Intro', '<p>I</p>')])}${map(1)}${acc([item('Summer', '<p>A</p>')])}`.replace(/\n/g, ''));
  const plain = acc([item('Q', '<p>A</p>')]);
  assert.equal(withAccordionMapsHoisted(plain), plain);
});

test('the snapshot of /at/en/book/flights/new-destinations: two maps out of the accordion, none left inside', async (t) => {
  const f = new URL('../tools/importer/bd-snapshots/www.austrian.com/at/en/book/flights/new-destinations.html', import.meta.url);
  if (!fs.existsSync(f)) { t.skip('no snapshot'); return; }
  const { withAccordionMapsHoisted, divEnd } = await import('../tools/importer/austrian-import.mjs');
  const out = withAccordionMapsHoisted(fs.readFileSync(f, 'utf8'));
  assert.equal((out.match(/<div class="poimapping"/g) || []).length, 2);
  let inside = 0;
  for (let i = out.indexOf('<div class="accordion commonevent'); i >= 0; i = out.indexOf('<div class="accordion commonevent', i + 1)) {
    if (out.slice(i, divEnd(out, i)).includes('class="poimapping')) inside += 1;
  }
  assert.equal(inside, 0);
});

test('the import reads the snapshot with it', () => {
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /withPanelWrappersUnwrapped\(withAccordionMapsHoisted\(withTabMarkers\(/);
});

/* The maps' points: lh-com's poi-map parser writes points only for maps recorded for lufthansa.com
   (poi-data.js); an Austrian map got "Source | <www's JCR path>" and the block would ask www for its points
   (from aem.page: no answer). Austrian's points, as DA's documents have them from the first import, are in
   tools/importer/austrian-poi-points.json by that path (21 maps); withPoiPoints writes them in place of the
   Source row. */
const source = (p) => `<div class="poi-map"><div><div>Source</div><div>${p}</div></div></div>`;

test('withPoiPoints: a recorded map\'s Source row becomes its points and labels; an unknown one stays', async () => {
  const { withPoiPoints } = await import('../tools/importer/austrian-import.mjs');
  const pts = { '/content/aua/x/poimapping': [['Dubai', '25.2580852, 55.3641586'], ['Zoom in label', 'Zoom in']] };
  assert.equal(withPoiPoints(`<div>${source('/content/aua/x/poimapping')}</div>`, pts), '<div><div class="poi-map"><div><div>Dubai</div><div>25.2580852, 55.3641586</div></div><div><div>Zoom in label</div><div>Zoom in</div></div></div></div>');
  assert.equal(withPoiPoints(source('/content/aua/y'), pts), source('/content/aua/y'));
});

test('the recorded points: 21 maps of the 10 new-destinations documents, each with points', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../tools/importer/austrian-poi-points.json', import.meta.url), 'utf8'));
  assert.equal(Object.keys(data).length, 21);
  Object.entries(data).forEach(([k, rows]) => {
    assert.match(k, /^\/content\/aua\/markets\/[a-z]{2}\/[a-z]{2}\/book\/flights\/new-destinations\/jcr:content\/.*poimapping/);
    assert.ok(rows.some(([, v]) => /^-?\d+\.\d+, -?\d+\.\d+$/.test(v)), k);
  });
});

test('the import writes them after the tab steps', () => {
  const s = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(s, /withPoiPoints\(withPartnerLogoAlts\(/);
});

/* brief 444 item 5: www opens new-destinations' destination items (expanded: New in Summer 2026, New for winter
   2025/2026, 2024/2025; -68 % at 1440 with them closed). An accordion whose first item is open on www gets
   accordion-columns' option open-first (as SWISS's import does); the parts after a map start with such an item. */
const accDoc = (t, cls = '') => `<div class="accordion-columns${cls}"><div><div>${t}</div><div><p>A</p></div></div><div><div>Later</div><div><p>B</p></div></div></div>`;
const snapItems = '<maui-collapsible-item id="a" headline="New in Summer 2026" expanded="" theme="os"></maui-collapsible-item><maui-collapsible-item headline="Later" theme="os"></maui-collapsible-item>';

test('withOpenFirst: an accordion whose first item is open on www gets open-first; others as they were', async () => {
  const { withOpenFirst } = await import('../tools/importer/austrian-import.mjs');
  assert.equal(withOpenFirst(accDoc('New in Summer 2026'), snapItems), accDoc('New in Summer 2026', ' open-first'));
  assert.equal(withOpenFirst(accDoc('Later'), snapItems), accDoc('Later'), 'closed on www');
  assert.equal(withOpenFirst(accDoc('New in Summer 2026', ' faq'), snapItems), accDoc('New in Summer 2026', ' faq open-first'));
  assert.equal(withOpenFirst(accDoc('New in Summer 2026', ' open-first'), snapItems), accDoc('New in Summer 2026', ' open-first'), 'once');
  const s = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(s, /const next = withChatButton\(withOpenFirst\(withPoiPoints\(/);
});

test('withOpenFirst: an accordion whose first N items are open on www gets open-N (new-destinations: the second accordion\'s two of three)', async () => {
  const { withOpenFirst } = await import('../tools/importer/austrian-import.mjs');
  const three = (cls = '') => `<div class="accordion-columns${cls}"><div><div>Winter 25</div><div><p>A</p></div></div><div><div>Winter 24</div><div><p>B</p></div></div><div><div>Summer 25</div><div><p>C</p></div></div></div>`;
  const snap = '<maui-collapsible-item headline="Winter 25" expanded=""></maui-collapsible-item><maui-collapsible-item headline="Winter 24" expanded=""></maui-collapsible-item><maui-collapsible-item headline="Summer 25"></maui-collapsible-item>';
  assert.equal(withOpenFirst(three(' faq'), snap), three(' faq open-2'));
  assert.equal(withOpenFirst(three(' faq open-first'), snap), three(' faq open-2'), 'open-first widened');
  const gap = '<maui-collapsible-item headline="Winter 25" expanded=""></maui-collapsible-item><maui-collapsible-item headline="Winter 24"></maui-collapsible-item><maui-collapsible-item headline="Summer 25" expanded=""></maui-collapsible-item>';
  assert.equal(withOpenFirst(three(' faq'), gap), three(' faq open-first'), 'the leading open items only');
  const nbsp = snap.replace('headline="Winter 25"', 'headline="Winter&nbsp;25"');
  assert.equal(withOpenFirst(three(' faq'), nbsp), three(' faq open-2'), 'www\'s &nbsp; in the headline');
});
