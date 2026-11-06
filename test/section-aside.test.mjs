/* eslint-disable max-len, import/extensions -- dev tooling */
/* A section beside the one before it (every brand; brief 416, ITA row 15: www.ita-airways.com's
   info pages have their accordions with a "Quick Links" sidebar beside them, airem-sidebar's
   sidebar-content and sidebar-aside): a section with the section style sidebar-aside joins the
   section before it, its wrappers in a div.section-aside at that section's end, the section marked
   with-aside, its other children in the first column; from 768 px the aside is the second column
   (a quarter of the width, 20 px apart) beside all of them, below it the aside follows them 40 px
   lower; a taller aside grows the last row only. Without a section before it the aside stays a section of its own. Run:
   node --test test/section-aside.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { default: joinAsideSections } = await import('../scripts/section-aside.js');

const page = (html) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${html}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const SECTIONS = '<div class="section"><div class="default-content-wrapper"><h1>Hand Luggage</h1></div></div>'
  + '<div class="section accordion-columns-container"><div class="default-content-wrapper"><h2>Additional Information</h2></div><div class="accordion-columns-wrapper"><div class="accordion-columns block"></div></div><div class="default-content-wrapper"><h2>Restrictions</h2></div><div class="accordion-columns-wrapper"><div class="accordion-columns block"></div></div></div>'
  + '<div class="section sidebar-aside cards-teaser-container"><div class="default-content-wrapper"><h4>Quick Links</h4></div><div class="cards-teaser-wrapper"><div class="cards-teaser block"></div></div></div>';

test('the aside joins the section before it: its wrappers in div.section-aside at the end, beside every other child', () => {
  const main = page(SECTIONS);
  joinAsideSections(main);
  const sections = [...main.children];
  assert.equal(sections.length, 2, 'the aside section is gone');
  const host = sections[1];
  assert.ok(host.classList.contains('with-aside'));
  const aside = host.lastElementChild;
  assert.ok(aside.classList.contains('section-aside'));
  assert.deepEqual([...aside.children].map((c) => c.className), ['default-content-wrapper', 'cards-teaser-wrapper']);
  assert.ok(aside.querySelector('.cards-teaser.block'), 'the block still in its section, for loadSection');
  assert.equal(host.children.length, 5, 'four in the first column, the aside');
  assert.equal(host.style.getPropertyValue('--section-aside-rows'), '4', 'the content\'s rows, on the grid');
  assert.ok(host.classList.contains('cards-teaser-container'), 'the aside\'s block containers on the section that holds them now');
  assert.ok(host.classList.contains('accordion-columns-container'));
});

test('without a section before it, or twice: nothing joined, nothing broken', () => {
  const lone = page('<div class="section sidebar-aside"><div class="default-content-wrapper"><h4>Quick Links</h4></div></div>');
  joinAsideSections(lone);
  assert.equal(lone.children.length, 1);
  assert.ok(lone.firstElementChild.querySelector('h4'));
  const main = page(SECTIONS);
  joinAsideSections(main);
  joinAsideSections(main);
  assert.equal(main.children.length, 2);
  assert.equal(main.querySelectorAll('.section-aside').length, 1);
});

test('CSS: two columns from 768 px, the aside a quarter wide beside every row; below, 40 px under the content', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /main > \.section\.with-aside > \.section-aside \{ margin-top: 40px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{ main > \.section\.with-aside \{ display: grid; grid-template-columns: minmax\(0, 3fr\) minmax\(0, 1fr\);[^}]*grid-template-rows: repeat\(var\(--section-aside-rows, 1\), auto\) 1fr; column-gap: 20px; align-items: start;/);
  assert.match(css, /main > \.section\.with-aside > \* \{ grid-column: 1;/);
  assert.match(css, /main > \.section\.with-aside > \.section-aside \{ grid-column: 2; grid-row: 1 \/ -1; margin-top: 0; \}/);
});

/* brief 425 (ITA online check-in it/it, ita-parity-002): a page without a hero gets the breadcrumb at
   the start of its first section, the content's; www's breadcrumb spans the page above the sidebar
   component and the box starts level with the H1 (it y 218): the breadcrumb across both columns,
   the aside from the second row */
test('CSS: a breadcrumb that opens the section spans both columns, the aside starts beside what follows it', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /main > \.section\.with-aside > \.breadcrumb-wrapper:first-child \{ grid-column: 1 \/ -1; \}/);
  assert.match(css, /main > \.section\.with-aside:has\(> \.breadcrumb-wrapper:first-child\) > \.section-aside \{ grid-row: 2 \/ -1; margin-top: var\(--spacing-default\); \}/, 'level with the next wrapper (main > .section > div + div)');
});

test('decorateMain joins them after the blocks are marked', () => {
  const js = fs.readFileSync(new URL('../scripts/scripts.js', import.meta.url), 'utf8');
  assert.ok(js.includes("import joinAsideSections from './section-aside.js';"));
  assert.ok(/decorateBlocks\(main\);[\s\S]{0,400}joinAsideSections\(main\);/.test(js));
});

/* brief 432 (SWISS's tab panels with a sidebar, swiss-business): the asides are joined before the
   tab sets are built, so an aside section between two Tab sections joins its panel instead of
   splitting the set */
test('decorateMain joins the asides before it builds the tab sets', () => {
  const js = fs.readFileSync(new URL('../scripts/scripts.js', import.meta.url), 'utf8');
  assert.ok(/joinAsideSections\(main\);[\s\S]{0,400}decorateSectionTabs\(main\);/.test(js));
});

/* brief 437 (SWISS row 32): a tab panel in parts (sections with the same Tab label and set, as
   section-tabs.js shows them: a grey box inside www's panel, then the panel's other content), the
   aside after the last part: the parts join the panel's first section, each in a div.section-part
   with its own section styles (grey), so the aside stands beside all of them; a panel of one
   section as before */
test('a tab panel in parts: the parts in the first section, each a section-part with its styles, the aside beside them', () => {
  const part = (cls, h, tab = 'General') => `<div class="section${cls}" data-tab="${tab}" data-tabs="1"><div class="default-content-wrapper"><h2>${h}</h2></div></div>`;
  const main = page(`<div class="section"><div class="default-content-wrapper"><h1>Animals</h1></div></div>${part(' flush grey accordion-columns-container', 'New entry regulations')}${part(' flush', 'Travel documents')}<div class="section sidebar-aside"><div class="default-content-wrapper"><h4>Quick Links</h4></div></div>${part('', 'Second tab', 'Extended')}`);
  joinAsideSections(main);
  const sections = [...main.children];
  assert.equal(sections.length, 3, 'the intro, the panel, the next tab');
  const panel = sections[1];
  assert.ok(panel.classList.contains('with-aside'));
  assert.equal(panel.dataset.tab, 'General');
  assert.equal(panel.classList.contains('grey'), false, 'the panel itself not grey');
  assert.ok(panel.classList.contains('accordion-columns-container'), 'the parts\' block containers on the panel');
  const parts = [...panel.querySelectorAll(':scope > .section-part')];
  assert.deepEqual(parts.map((p) => p.className), ['section-part flush grey', 'section-part flush']);
  assert.deepEqual(parts.map((p) => p.querySelector('h2').textContent), ['New entry regulations', 'Travel documents']);
  assert.equal(panel.style.getPropertyValue('--section-aside-rows'), '2');
  assert.ok(panel.lastElementChild.classList.contains('section-aside'));
  assert.equal(sections[2].dataset.tab, 'Extended', 'the next tab as it was');
});

/* brief 440 (SWISS row 37): outside a tab, the sections with the style sidebar-part are parts of the
   section before them (the content of a sidebar with www's grey box inside it): they join it as tab
   parts do, each a section-part with its styles, the aside beside all of them */
test('sidebar-part sections join the section before them, the aside beside all', () => {
  const main = page('<div class="section"><div class="default-content-wrapper"><h1>Accessible travel</h1></div></div>'
    + '<div class="section"><div class="default-content-wrapper"><p>Consult your doctor</p></div></div>'
    + '<div class="section grey sidebar-part"><div class="default-content-wrapper"><p>Please note</p></div></div>'
    + '<div class="section sidebar-part accordion-columns-container"><div class="default-content-wrapper"><h2>Assistance</h2></div></div>'
    + '<div class="section sidebar-aside"><div class="default-content-wrapper"><h4>For bookings</h4></div></div>');
  joinAsideSections(main);
  const sections = [...main.children];
  assert.equal(sections.length, 2);
  const host = sections[1];
  assert.ok(host.classList.contains('with-aside'));
  assert.ok(host.classList.contains('accordion-columns-container'));
  assert.deepEqual([...host.querySelectorAll(':scope > .section-part')].map((p) => p.className), ['section-part', 'section-part grey', 'section-part']);
  assert.equal(host.style.getPropertyValue('--section-aside-rows'), '3');
});
