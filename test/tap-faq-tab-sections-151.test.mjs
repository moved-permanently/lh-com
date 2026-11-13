/* eslint-disable max-len, import/extensions */
/* TAP row 151: a FAQ page whose categories are a tab set. main's importer writes a CategoryAccordion's categories as
   row 134's "categories" tab sections, the FAQ page's too (/en-br/help/frequently-asked-questions and
   /pt-us/ajuda/perguntas-frequentes are published so): section-tabs.js built its tab list and the FAQ picker its pills,
   two rows of the same categories (en-br 2,248 px at 1440 against en-pt's 2,008), and the tab set hid every category
   but its first, so the picker's other pills showed nothing. The picker takes the categories: buildFaqPicker removes
   the tab sets its categories are in first (scripts/section-tabs-sets.js removeSectionTabs: their list, toggles, hidden panels; a
   page's other tab sets stay), and a removed set stays removed (a later media change). Assertions compare strings and booleans only (no DOM node in a diff).
   Run: node --max-old-space-size=512 --test test/tap-faq-tab-sections-151.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const sec = (cat, sub) => `<div class="section" data-section-status="initialized" data-tab="${cat}" data-tabs="categories"><div class="default-content-wrapper"><h2>${cat}</h2><h3>${sub}</h3></div><div class="accordion-columns-wrapper"><div class="accordion-columns faq block"><details><summary>${sub}?</summary></details></div></div></div>`;
const PAGE = `<!DOCTYPE html><html lang="en"><head><meta name="brand" content="tap"></head><body><main>
<div class="section"><div class="default-content-wrapper"><h1>Frequently asked questions</h1></div></div>
${sec('Before the flight', 'Economy Prime')}${sec('During the flight', 'Meals')}${sec('After the flight', 'Refunds')}
<div class="section" data-tab="Bags" data-tabs="other"><div class="default-content-wrapper"><p>Bags</p></div></div>
<div class="section" data-tab="Seats" data-tabs="other"><div class="default-content-wrapper"><p>Seats</p></div></div>
</main></body></html>`;

const { window, document } = parseHTML(PAGE);
window.location = {
  hostname: 'tap.turnsthe.page', hash: '', pathname: '/en-br/help/frequently-asked-questions', search: '', href: 'https://tap.turnsthe.page/en-br/help/frequently-asked-questions', origin: 'https://tap.turnsthe.page', toString() { return this.href; },
};
Object.defineProperty(window, 'origin', { value: 'https://tap.turnsthe.page', configurable: true });
window.hlx = { codeBasePath: '' };
const listeners = [];
window.matchMedia = () => ({
  matches: true, addEventListener: (e, f) => listeners.push(f), addListener: () => {}, removeEventListener: () => {},
});
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.KeyboardEvent = window.KeyboardEvent || window.Event;

const { default: decorateSectionTabs } = await import('../scripts/section-tabs.js');
const { buildFaqPicker } = await import('../blocks/accordion-columns/accordion-columns-tap.js');

const main = document.querySelector('main');
const sections = () => [...main.querySelectorAll(':scope > .section')];
const catSections = () => sections().filter((s) => s.dataset.tabs === 'categories');

test('the FAQ picker takes a tab set\'s categories: one row of pills, every category reachable', () => {
  decorateSectionTabs(main);
  assert.equal(main.querySelectorAll('.section-tabs').length, 2, 'both tab sets built');
  assert.deepEqual(catSections().map((s) => s.hidden), [false, true, true], 'the tab set shows its first category only');
  buildFaqPicker(main);
  assert.equal(main.querySelectorAll('.section-tabs').length, 1, 'the categories\' tab list gone, the other set\'s kept');
  assert.deepEqual([...main.querySelectorAll('.section-tabs-tab')].map((t) => t.textContent), ['Bags', 'Seats']);
  assert.equal(catSections().filter((s) => s.querySelector('.section-tab-toggle')).length, 0, 'no toggles');
  assert.equal(catSections().filter((s) => /section-tab-/.test(s.className) || s.hasAttribute('role') || s.hasAttribute('aria-labelledby')).length, 0, 'no tab classes, roles, labels');
  assert.deepEqual(sections().map((s) => s.hidden), [false, false, false, false, false, false, true], 'no category hidden by a tab set; the other set: its tab list, its second panel hidden');
  const pills = [...main.querySelectorAll('.faq-picker-pill')];
  assert.deepEqual(pills.map((p) => p.textContent), ['Before the flight', 'During the flight', 'After the flight']);
  pills[2].dispatchEvent(new window.Event('click'));
  const cats = [...main.querySelectorAll('.faq-picker-category')];
  assert.deepEqual(cats.map((c) => c.hidden), [true, true, false]);
  assert.equal(cats[2].closest('.section').hidden, false, 'its section shown');
});

test('a removed tab set stays removed: a later media change hides no section', () => {
  listeners.forEach((f) => f());
  assert.deepEqual(sections().map((s) => s.hidden), [false, false, false, false, false, false, true]);
  assert.deepEqual([...main.querySelectorAll('.faq-picker-category')].map((c) => c.hidden), [true, true, false], 'the picked category kept');
});

test('the title\'s 32 px over the categories (tap.css) is the title\'s only, not a category\'s section before the next one', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  const rule = css.match(/([^{}]*):has\(\+ \.section\.faq-picker-section\)\s*\{\s*margin-bottom: 32px;/);
  assert.ok(rule, 'the rule is there');
  assert.match(rule[1].trim(), /main > \.section:not\(\.faq-picker-section\)$/);
});
