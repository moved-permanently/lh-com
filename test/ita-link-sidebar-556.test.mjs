/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA's sidebar whose box is a heading over links (the brief after 556; ita-parity-004's /it/en/profile/miles-and-more,
   www's airem-sidebar: sidebar-content beside sidebar-aside, "More about Miles & More" and four links, no cards).
   The import writes the heading and its links at the end of the section, under the accordions; ita-quick-links.mjs
   takes card boxes only. The step (tools/importer/ita-link-sidebar.mjs, after it in ita-import.mjs) makes them a
   section of the style sidebar-aside beside the sidebar's content, which starts where www's sidebar-content starts
   (the snapshot's first text: the title and the stage picture above stay a section of their own). Again on its
   own output nothing changes; a snapshot without such a box: nothing changes.
   Fixtures: today's document of the page and the recording's airem-sidebar element (pictures and accordions taken out).
   Run: node --test test/ita-link-sidebar-556.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { withLinkListSidebar } = await import('../tools/importer/ita-link-sidebar.mjs');

const fixture = (name) => fs.readFileSync(new URL(`./fixtures/ita-link-sidebar/${name}`, import.meta.url), 'utf8');
const doc = fixture('miles-and-more-en.plain.html');
const snapshot = fixture('miles-and-more-en-snapshot.html');
const sections = (html) => [...parseHTML(`<!DOCTYPE html><html><body>${html}</body></html>`).document.body.children].filter((s) => s.tagName === 'DIV');
const text = (n) => (n ? n.textContent.replace(/\s+/g, ' ').trim() : '');

test('the title and stage picture, the sidebar\'s content, the link box beside it', () => {
  const out = withLinkListSidebar(doc, snapshot);
  const [top, content, aside] = sections(out);
  assert.equal(text(top.querySelector('h1')), 'Miles & More');
  assert.ok(top.querySelector('picture'), 'the stage picture above the sidebar');
  assert.ok(!top.querySelector('.accordion-columns'));
  assert.match(text(content.firstElementChild), /^ITA Airways passengers can enjoy/);
  assert.equal(content.querySelectorAll('.accordion-columns').length, 1);
  assert.equal(text(aside.querySelector('h2')), 'More about Miles & More');
  assert.deepEqual([...aside.querySelectorAll('p > a')].map(text), ['Earn miles', 'Redeem miles', 'Retroactive credit', 'Frequent flyer programme']);
  const meta = aside.querySelector('.section-metadata');
  assert.deepEqual([...meta.children].map((r) => [...r.children].map(text)), [['Style', 'sidebar-aside']]);
  assert.equal(withLinkListSidebar(out, snapshot), out, 'once');
});

test('nothing changes without such a box in the snapshot', () => {
  assert.equal(withLinkListSidebar(doc, '<html><body><main><p>no sidebar</p></main></body></html>'), doc);
  assert.equal(withLinkListSidebar(doc, ''), doc);
  const cards = snapshot.replace('<div class="sidebar-aside">', '<div class="sidebar-aside"><img src="x.jpg">');
  assert.equal(withLinkListSidebar(doc, cards), doc, 'a card box is ita-quick-links.mjs\'s');
});
