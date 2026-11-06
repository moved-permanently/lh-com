/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA's info pages with www's "Quick Links" sidebar (brief 416, ITA row 15; www's airem-sidebar:
   sidebar-content and sidebar-aside, capture ita-parity-001, the carry-on baggage page at 1440 and
   390, en and it). lh-com's import writes the box flattened at the page's end (an H4, then per card
   a linked picture, a linked H3, a linked text, a link: the fixtures are today's DA documents). The
   import's step (tools/importer/ita-quick-links.mjs, after the others in ita-import.mjs) makes it
   www's: the sidebar's content (from the first H2 of that section) a section of its own, then the
   box a section with the section style sidebar-aside (beside it: scripts/section-aside.js), its
   heading and a cards-teaser of the cards (picture | title, text, the link). Again on its own
   output: nothing changes; a page without the box: nothing changes. Run:
   node --test test/ita-quick-links.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { withQuickLinksSidebar } = await import('../tools/importer/ita-quick-links.mjs');

const fixture = (name) => fs.readFileSync(new URL(`./fixtures/ita-quick-links/${name}.html`, import.meta.url), 'utf8');
const sections = (doc) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${doc.match(/<main>([\s\S]*)<\/main>/)[1]}</body></html>`);
  return [...document.body.children];
};
const text = (n) => (n ? n.textContent.replace(/\s+/g, ' ').trim() : '');

test('en: the intro, the sidebar\'s content, the Quick Links box beside it', () => {
  const out = withQuickLinksSidebar(fixture('carry-on-baggage-en'));
  const [intro, content, aside, ...rest] = sections(out);
  assert.ok(rest.every((r) => !text(r)), "only the document's empty last section after it");
  assert.equal(text(intro.querySelector('h1')), 'Hand Luggage');
  assert.equal(intro.querySelector('h2'), null);
  assert.deepEqual([...content.querySelectorAll('h2')].map(text), ['Additional Information', 'Restrictions and Prohibited Items in the Cabin']);
  assert.equal(content.querySelectorAll('.accordion-columns').length, 2);
  assert.equal(text(aside.querySelector('h4')), 'Quick Links');
  const meta = aside.querySelector('.section-metadata');
  assert.deepEqual([...meta.children].map((r) => [...r.children].map(text)), [['Style', 'sidebar-aside']]);
  const cards = aside.querySelector('.cards-teaser');
  const rows = [...cards.children];
  assert.equal(rows.length, 2);
  const [media, body] = rows[0].children;
  assert.ok(media.querySelector('picture img'));
  assert.equal(media.querySelector('a'), null, 'the picture unlinked');
  assert.equal(text(body.querySelector('h3')), 'Baggage Assistance');
  assert.equal(body.querySelector('h3 a'), null, 'the title unlinked (the card links once, its last line)');
  const ps = [...body.querySelectorAll('p')];
  assert.equal(text(ps[0]), 'ITA Airways\' assistance service in Italy can provide you with all the information you need in the event of lost, damaged, or tampered baggage.');
  assert.equal(ps[0].querySelector('a'), null);
  assert.equal(ps[ps.length - 1].querySelector('a').getAttribute('href'), '/it/en/book-and-prepare/travel-information/baggage/baggage-assistance');
  assert.equal(text(ps[ps.length - 1]), 'Go to Baggage Assistance');
  assert.equal(text(rows[1].querySelector('h3')), 'Prohibited and Regulated Items');
  assert.ok(out.includes('<div class="metadata">'), 'the metadata kept');
  assert.equal((out.match(/<div class="metadata">/g) || []).length, 1);
});

test('it: "Collegamenti rapidi", the two cards', () => {
  const [, content, aside] = sections(withQuickLinksSidebar(fixture('carry-on-baggage-it')));
  assert.equal(text(content.querySelector('h2')), 'Informazioni aggiuntive');
  assert.equal(text(aside.querySelector('h4')), 'Collegamenti rapidi');
  assert.deepEqual([...aside.querySelectorAll('.cards-teaser h3')].map(text), ['Assistenza bagagli', 'Oggetti vietati e regolamentati']);
});

test('again on its output, or a page without the box: unchanged', () => {
  const once = withQuickLinksSidebar(fixture('carry-on-baggage-en'));
  assert.equal(withQuickLinksSidebar(once), once);
  const plain = '<body><header></header><main><div><h1>Title</h1><h2>A</h2><p>x</p><h4>Note</h4><p>y</p></div></main><footer></footer></body>';
  assert.equal(withQuickLinksSidebar(plain), plain);
});

test('ita-import.mjs runs the step on every document', () => {
  const js = fs.readFileSync(new URL('../tools/importer/ita-import.mjs', import.meta.url), 'utf8');
  assert.ok(js.includes("import { withQuickLinksSidebar } from './ita-quick-links.mjs';"));
  assert.ok(/withQuickLinksSidebar\(withItaMetadata\(/.test(js));
});

test('the section\'s own section metadata (online check-in: flush, grey) stays with its content, not the box', () => {
  const [, , content, aside] = sections(withQuickLinksSidebar(fixture('online-check-in-en')));
  const style = (s) => [...s.querySelectorAll(':scope > .section-metadata > div')].map((r) => [...r.children].map(text).join(': '));
  assert.deepEqual(style(content), ['style: flush, grey']);
  assert.deepEqual(style(aside), ['Style: sidebar-aside']);
  assert.equal(aside.querySelectorAll('.cards-teaser > div').length, 1);
});
