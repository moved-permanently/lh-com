/* eslint-disable max-len, import/extensions */
/* Tabs that hold blocks (scripts/section-tabs.js, brief 260): consecutive sections with the
   section metadata `Tab` (the label; `Tabs` names the set when two sets meet) are one tab set, as
   www.swiss.com's and www.austrian.com's maui-tab-control-responsive with column views,
   accordions and tables in its panels. From 768px a tab list (role tablist, its tabs
   aria-selected and aria-controls, roving tabindex, arrow keys, Home and End, the panels role
   tabpanel and aria-labelledby, the others hidden); below 768px an accordion (a toggle with
   aria-expanded over each panel, the first open). A page without such sections: untouched.
   Run: node --max-old-space-size=512 --test test/section-tabs.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
let desktop = true;
window.matchMedia = (q) => ({
  get matches() { return /min-width: 768px|width >= 768px/.test(q) ? desktop : false; }, addEventListener: () => {}, addListener: () => {}, removeEventListener: () => {},
});
window.location = {
  hostname: 'main--lh-swiss--moved-permanently.aem.page', pathname: '/ch/en/fly/on-board/swiss-economy', search: '', hash: '', href: 'https://main--lh-swiss--moved-permanently.aem.page/ch/en/fly/on-board/swiss-economy', origin: 'https://main--lh-swiss--moved-permanently.aem.page', toString() { return this.href; },
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-swiss--moved-permanently.aem.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.KeyboardEvent = window.KeyboardEvent || window.Event;

const { default: decorateSectionTabs } = await import('../scripts/section-tabs.js');

// a page as decorateSectionMetadata and decorateSections leave it (data-tab, .section, wrappers)
const page = (sections) => {
  const main = document.createElement('main');
  main.innerHTML = sections.map(([body, data = {}]) => `<div class="section" data-section-status="initialized" ${Object.entries(data).map(([k, v]) => `data-${k}="${v}"`).join(' ')}><div class="default-content-wrapper">${body}</div></div>`).join('');
  document.body.replaceChildren(main);
  return main;
};
const SWISS = () => page([
  ['<h1>SWISS Economy</h1><p>Intro</p>'],
  ['<h2>Europe – just the way you like it</h2><div class="columns-media block"></div>', { tab: 'Europe', tabs: '1' }],
  ['<h2>Out into the wide world in comfort</h2><div class="table-striped block"></div>', { tab: 'Intercontinental', tabs: '1' }],
  ['<p>After the tabs</p>'],
]);

beforeEach(() => { desktop = true; });

test('a page without Tab sections: untouched', () => {
  const main = page([['<h1>x</h1>'], ['<p>y</p>', { style: 'grey' }]]);
  const before = main.outerHTML;
  decorateSectionTabs(main);
  assert.equal(main.outerHTML, before);
});

test('consecutive Tab sections: one tab list before them, the labels, the panels', () => {
  const main = SWISS();
  decorateSectionTabs(main);
  const sections = [...main.querySelectorAll(':scope > .section')];
  assert.equal(sections.length, 5, 'one section more: the tab list');
  const nav = sections[1];
  assert.ok(nav.classList.contains('section-tabs'));
  const list = nav.querySelector('[role="tablist"]');
  assert.ok(list);
  assert.ok(list.parentElement.parentElement === nav && list.parentElement.tagName === 'DIV', 'in the section\'s content wrapper (its width)');
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  assert.deepEqual(tabs.map((t) => t.textContent), ['Europe', 'Intercontinental']);
  const panels = sections.slice(2, 4);
  panels.forEach((p, i) => {
    assert.equal(p.getAttribute('role'), 'tabpanel');
    assert.equal(p.getAttribute('aria-labelledby'), tabs[i].id);
    assert.equal(tabs[i].getAttribute('aria-controls'), p.id);
    assert.ok(p.classList.contains('section-tab-panel'));
  });
  assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
  assert.equal(tabs[1].getAttribute('aria-selected'), 'false');
  assert.equal(tabs[0].getAttribute('tabindex'), '0');
  assert.equal(tabs[1].getAttribute('tabindex'), '-1');
  assert.equal(panels[0].hidden, false);
  assert.equal(panels[1].hidden, true);
  assert.ok(panels[1].querySelector('.table-striped.block'), 'the panel keeps its blocks');
  assert.equal(sections[4].hasAttribute('role'), false, 'the section after the set as before');
});

test('the tab list: a click and the keys (arrows, Home, End) select and focus; the panel shows', () => {
  const main = SWISS();
  decorateSectionTabs(main);
  const tabs = [...main.querySelectorAll('[role="tab"]')];
  const panels = [...main.querySelectorAll('.section-tab-panel')];
  tabs[1].click();
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  assert.equal(panels[0].hidden, true);
  assert.equal(panels[1].hidden, false);
  let focused = null;
  tabs.forEach((t) => { t.focus = () => { focused = t; }; });
  const key = (el, k) => {
    const e = new window.Event('keydown', { bubbles: true, cancelable: true });
    Object.defineProperty(e, 'key', { value: k });
    el.dispatchEvent(e);
  };
  key(tabs[1], 'ArrowRight');
  assert.equal(tabs[0].getAttribute('aria-selected'), 'true', 'wraps to the first');
  assert.ok(focused === tabs[0], 'the selected tab has the focus');
  key(tabs[0], 'ArrowLeft');
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true', 'wraps to the last');
  key(tabs[1], 'Home');
  assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
  key(tabs[0], 'End');
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  assert.equal(tabs[1].getAttribute('tabindex'), '0');
  assert.equal(tabs[0].getAttribute('tabindex'), '-1');
});

test('below 768px: an accordion, a toggle over each panel, the first open; the tab list hidden by CSS', () => {
  desktop = false;
  const main = SWISS();
  decorateSectionTabs(main);
  const panels = [...main.querySelectorAll('.section-tab-panel')];
  const toggles = panels.map((p) => p.querySelector(':scope > .section-tab-toggle'));
  assert.deepEqual(toggles.map((t) => t.textContent), ['Europe', 'Intercontinental']);
  assert.deepEqual(toggles.map((t) => t.getAttribute('aria-expanded')), ['true', 'false']);
  toggles.forEach((t, i) => assert.equal(t.getAttribute('aria-controls'), panels[i].id));
  assert.equal(panels.every((p) => !p.hidden), true, 'every panel shows its toggle');
  const content = (p) => [...p.children].filter((c) => !c.classList.contains('section-tab-toggle'));
  assert.ok(content(panels[0]).every((c) => !c.hidden) && content(panels[1]).every((c) => c.hidden), 'the closed one\'s content hidden');
  toggles[1].click();
  assert.deepEqual(toggles.map((t) => t.getAttribute('aria-expanded')), ['false', 'true']);
  toggles[1].click();
  assert.deepEqual(toggles.map((t) => t.getAttribute('aria-expanded')), ['false', 'false'], 'a toggle closes its panel');
});

test('two sets one after the other (Tabs 1, Tabs 2) stay two; a lone Tab section is a set of one', () => {
  const main = page([
    ['<p>a</p>', { tab: 'A', tabs: '1' }], ['<p>b</p>', { tab: 'B', tabs: '1' }],
    ['<p>c</p>', { tab: 'C', tabs: '2' }], ['<p>d</p>', { tab: 'D', tabs: '2' }],
  ]);
  decorateSectionTabs(main);
  const lists = [...main.querySelectorAll('[role="tablist"]')];
  assert.equal(lists.length, 2);
  assert.deepEqual(lists.map((l) => [...l.querySelectorAll('[role="tab"]')].map((t) => t.textContent)), [['A', 'B'], ['C', 'D']]);
  const ids = [...main.querySelectorAll('[id]')].map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length, 'ids unique');
});

test('a deep link to a panel\'s content selects its tab', () => {
  window.location.hash = '#out-into-the-wide-world';
  const main = page([
    ['<h2>Europe</h2>', { tab: 'Europe' }],
    ['<h2 id="out-into-the-wide-world">Out</h2>', { tab: 'Intercontinental' }],
  ]);
  decorateSectionTabs(main);
  const tabs = [...main.querySelectorAll('[role="tab"]')];
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  window.location.hash = '';
});

test('scripts.js: decorateMain runs it after the sections; the styles exist', () => {
  const js = fs.readFileSync('scripts/scripts.js', 'utf8');
  assert.match(js, /decorateSections\(main\);\s*\n(?:.*\n)*?\s*decorateSectionTabs\(main\);/);
  const css = fs.readFileSync('styles/section-tabs.css', 'utf8');
  assert.match(css, /\.section-tabs \[role="tab"\]\[aria-selected="true"\]/);
  assert.match(css, /@media \(width >= 768px\)/);
  assert.match(css, /background: var\(--section-tabs-bar, var\(--lh-deepblue\)\);/, 'Lufthansa\'s bar by default');
  // below 768px the accordion's items touch (no section gap between them), the last keeps it
  assert.match(css, /@media \(width < 768px\) \{[^@]*main > \.section\.section-tabs \{\s*display: none;/);
  assert.match(css, /@media \(width < 768px\) \{[^@]*main > \.section\.section-tab-panel:has\(\+ \.section-tab-panel\) \{\s*margin-bottom: 0;/);
  assert.match(css, /\.section-tab-panel > \.section-tab-toggle \+ div \{\s*margin-top: var\(--spacing-default/);
  // the design system's selection colour (mausy-v1.40.1 swiss.css lx-red, austrian.css os-red)
  assert.match(fs.readFileSync('styles/themes/swiss.css', 'utf8'), /--section-tabs-bar: #c00;/);
  assert.match(fs.readFileSync('styles/themes/austrian.css', 'utf8'), /--section-tabs-bar: #d81e05;/);
});
