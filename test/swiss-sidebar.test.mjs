/* eslint-disable max-len, import/extensions -- dev tooling */
/* SWISS's info pages with www's sidebar component (brief 432, swiss-parity-002: www.swiss.com's
   airem-sidebar, sidebar-content beside sidebar-aside, 75 / 25 from 768 px on 25 of the 60 pages).
   lh-com's import writes it flattened at the full width; tools/importer/swiss-sidebar.mjs, guided by
   the page's snapshot, makes it www's: per sidebar the content a section of its own, then the aside
   a section with the section style sidebar-aside (beside it: scripts/section-aside.js; an empty
   aside keeps the content in the 3 / 4 column); the two-column views (heading, picture, text) the
   heading and a columns-media row. Fixtures: today's DA documents and the snapshots trimmed to their
   sidebars. Run: node --max-old-space-size=512 --test test/swiss-sidebar.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { withSwissSidebar, sidebarsOf } = await import('../tools/importer/swiss-sidebar.mjs');

const fixture = (name) => fs.readFileSync(new URL(`./fixtures/swiss-sidebar/${name}`, import.meta.url), 'utf8');
const sections = (doc) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${doc.match(/<main>([\s\S]*)<\/main>/)[1]}</body></html>`);
  return [...document.body.children];
};
// a heading's style marker ({heading-small}, DA's style token) is not its text
const text = (n) => (n ? n.textContent.replace(/\s*\{[a-z0-9 ,-]+\}\s*$/i, '').replace(/\s+/g, ' ').trim() : '');
const style = (s) => [...s.querySelectorAll(':scope > .section-metadata > div')].map((r) => [...r.children].map(text).join(': '));

test('Premium Economy: the intro above, the content beside the aside\'s teasers, eight picture | text rows', () => {
  const { doc, made, skipped } = withSwissSidebar(fixture('premium-economy-en.da.html'), fixture('premium-economy-en.snapshot.html'));
  assert.equal(made, 1);
  assert.deepEqual(skipped, []);
  const [intro, content, aside, rest] = sections(doc);
  assert.equal(text(intro.querySelector('h1')), 'SWISS Premium Economy');
  assert.ok(intro.querySelector('h2') === null, 'the H1 and its intro stay above the sidebar, as www');
  assert.equal(text(content.firstElementChild), 'New benchmarks on long-haul flights');
  const rows = [...content.querySelectorAll(':scope > .columns-media')];
  assert.equal(rows.length, 8);
  const [media, body] = rows[0].firstElementChild.children;
  assert.ok(media.querySelector('picture img') !== null && !text(media), 'the picture first, as www\'s image | text');
  assert.match(text(body), /^You will love the comfortable seat/);
  assert.equal(rows[0].previousElementSibling.tagName, 'H3');
  assert.equal(text(rows[0].previousElementSibling), 'Travel in comfort');
  assert.deepEqual(style(aside), ['Style: sidebar-aside']);
  assert.deepEqual([...aside.querySelectorAll(':scope > h4')].map(text), ['SWISS Premium Economy in detail', 'Explore SWISS Premium Economy', 'Upgrade to SWISS Premium Economy', 'More affordable lounge access', 'SWISS Business']);
  assert.ok(content.querySelector('h4') === null, 'no teaser left in the content');
  assert.ok(rest.querySelector('.metadata') !== null, 'the page metadata after the sidebar');
  assert.equal((doc.match(/<div class="metadata">/g) || []).length, 1);
});

test('online check-in: two sidebars, the first aside\'s text and teasers, the second aside empty (the content in the 3 / 4 column)', () => {
  const { doc, made } = withSwissSidebar(fixture('online-check-in-de.da.html'), fixture('online-check-in-de.snapshot.html'));
  assert.equal(made, 2);
  const all = sections(doc);
  const asides = all.filter((s) => style(s).includes('Style: sidebar-aside'));
  assert.equal(asides.length, 2);
  const [first, second] = asides;
  assert.equal(text(first.previousElementSibling.firstElementChild), 'So erhalten Sie Ihre Bordkarte');
  assert.match(text(first), /Optionen für das Self-Check-in/);
  assert.ok(first.previousElementSibling.querySelector('.booking-lookup') === null, 'the check-in form above the sidebar');
  assert.equal(second.children.length, 1, 'the second aside empty: its section metadata only');
  assert.equal(text(second.previousElementSibling.firstElementChild), 'Ihre Vorteile');
  assert.match(text(second.previousElementSibling), /Zusätzliche Fluggastdaten/);
  assert.match(text(second.nextElementSibling), /Geniessen Sie mit Travel ID/, 'what follows the sidebar after it');
});

test('again on its output, or a page without the sidebar: unchanged', () => {
  const once = withSwissSidebar(fixture('premium-economy-en.da.html'), fixture('premium-economy-en.snapshot.html')).doc;
  assert.equal(withSwissSidebar(once, fixture('premium-economy-en.snapshot.html')).doc, once);
  const plain = '<body><header></header><main><div><h1>Title</h1><p>x</p></div></main><footer></footer></body>';
  assert.equal(withSwissSidebar(plain, '<html><body><div class="contentpage"></div></body></html>').doc, plain);
});

test('a sidebar the document does not show in order is left as it is, and named', () => {
  const doc = '<body><header></header><main><div><h1>Title</h1><p>Some text here</p></div></main><footer></footer></body>';
  const html = '<html><body><div class="airem-sidebar d-md-flex"><div class="sidebar-content"><h2>Not in the document</h2><p>Some other text</p></div><div class="sidebar-aside"></div></div></body></html>';
  const r = withSwissSidebar(doc, html);
  assert.equal(r.made, 0);
  assert.equal(r.doc, doc);
  assert.match(r.skipped[0], /not found/);
  assert.equal(sidebarsOf(html)[0].first, 'not in the document');
});

test('swiss-import.mjs runs the step on every document with its snapshot', () => {
  const js = fs.readFileSync(new URL('../tools/importer/swiss-import.mjs', import.meta.url), 'utf8');
  assert.ok(js.includes("import { withSwissSidebar } from './swiss-sidebar.mjs';"));
  assert.ok(/withSwissSidebar\(/.test(js));
});

test('the import\'s .plain.html (the sections, no <main>): the same sections back', () => {
  const full = fixture('premium-economy-en.da.html');
  const plain = full.match(/<main>([\s\S]*)<\/main>/)[1];
  const r = withSwissSidebar(plain, fixture('premium-economy-en.snapshot.html'));
  assert.equal(r.made, 1);
  assert.ok(!r.doc.includes('<main>'));
  assert.equal(r.doc, withSwissSidebar(full, fixture('premium-economy-en.snapshot.html')).doc.match(/<main>([\s\S]*)<\/main>/)[1]);
});

/* a tab panel with a sidebar (swiss-business: Interkontinental and Europa, each a sidebar): the
   panel keeps its Tab metadata on the content section only, what comes before the sidebar stays in
   it, the aside follows (section-aside.js joins it into the panel before the tabs are built); with
   content after the sidebar in the same panel, the sidebar is left as it is */
test('a tab panel: its label on the content section only, the aside after it', () => {
  const doc = '<body><header></header><main><div><h1>T</h1></div><div><p>Intro text of the tab</p><h2>Comfort on board</h2><p>Long text about comfort on board</p><h4>Teaser title</h4><p>Teaser text here</p><div class="section-metadata"><div><div>Tab</div><div>One</div></div><div><div>Tabs</div><div>1</div></div></div></div><div><h2>Second tab heading</h2><p>Second tab text</p><div class="section-metadata"><div><div>Tab</div><div>Two</div></div><div><div>Tabs</div><div>1</div></div></div></div></main><footer></footer></body>';
  const html = '<html><body><div class="airem-sidebar"><div class="sidebar-content"><h2>Comfort on board</h2><p>Long text about comfort on board</p></div><div class="sidebar-aside"><h4>Teaser title</h4><p>Teaser text here</p></div></div></body></html>';
  const { doc: out, made } = withSwissSidebar(doc, html);
  assert.equal(made, 1);
  const all = sections(out);
  const tabs = all.map((s) => style(s).filter((r) => r.startsWith('Tab:')).join(''));
  assert.deepEqual(tabs, ['', 'Tab: One', '', 'Tab: Two'], 'one panel per tab, the aside between them without a label');
  assert.match(text(all[1]), /^Intro text of the tab/, 'what comes before the sidebar stays in the panel');
  assert.deepEqual(style(all[2]), ['Style: sidebar-aside']);
  const after = doc.replace('<p>Teaser text here</p>', '<p>Teaser text here</p><p>More text after the sidebar in this tab</p>');
  const r = withSwissSidebar(after, html);
  assert.equal(r.made, 0);
  assert.match(r.skipped[0], /tab/);
});

/* the image | text views outside the sidebar too (advance seat reservation: the seat types in the
   travel classes' tab panels, the heading inside the text item beside the picture, 23 views) */
test('advance seat reservation: the 23 seat views beside their pictures, the heading in the text', () => {
  const { doc, made, rows } = withSwissSidebar(fixture('advance-seat-reservation-en.da.html'), fixture('advance-seat-reservation-en.snapshot.html'));
  assert.equal(made, 1);
  assert.equal(rows, 23);
  const blocks = sections(doc).flatMap((s) => [...s.querySelectorAll(':scope > .columns-media')]);
  assert.equal(blocks.length, 23);
  const [media, body] = blocks[0].firstElementChild.children;
  assert.ok(media.querySelector('picture img') !== null && !text(media));
  assert.equal(text(body.firstElementChild), 'Classic seat');
  assert.match(text(body), /free of charge for HON Circle Members/);
  assert.ok(sections(doc).every((s) => [...s.children].every((el) => !(el.tagName === 'P' && el.querySelector('picture') && el.nextElementSibling && /^Classic seat/.test(text(el.nextElementSibling))))), 'no picture left above a seat\'s text');
});
