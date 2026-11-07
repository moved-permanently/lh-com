/* eslint-disable max-len, import/extensions */
/* A sidebar whose content holds a tab set (brief 450, item 4: www.swiss.com's airportr, ch/en and
   ch/de: the content's intro and benefits, then "Departure and arrival services" with two tabs,
   the aside's "Travel lighter, stay informed" teaser beside all of it):
   - tools/importer/swiss-sidebar.mjs: when the aside follows the tab panels after the content's
     section, the content from its first text, the panels parts of it (their Tab rows and the style
     sidebar-part), then the aside (sidebar-aside) and what follows it;
   - scripts/section-aside.js: sidebar-part sections join the section before them also when they
     are tab panels, each part keeping its Tab and Tabs (data-tab, data-tabs);
   - scripts/section-tabs.js: a tab set's panels can be such parts; the tab list goes before the
     first, inside the section, the section's grid rows counted again.
   Tab sets of sections and tab panels in parts (a grey box in a panel) as before.
   Run: node --max-old-space-size=512 --test test/sidebar-tabs-450.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { withSwissSidebar } from '../tools/importer/swiss-sidebar.mjs';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.matchMedia = () => ({ matches: true, addEventListener: () => {} });
window.location = {
  hostname: 'main--lh-swiss--moved-permanently.aem.page', pathname: '/ch/en/various/airportr', search: '', hash: '', href: 'https://main--lh-swiss--moved-permanently.aem.page/ch/en/various/airportr', origin: 'https://main--lh-swiss--moved-permanently.aem.page', toString() { return this.href; },
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-swiss--moved-permanently.aem.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
const { default: joinAsideSections } = await import('../scripts/section-aside.js');
const { default: decorateSectionTabs } = await import('../scripts/section-tabs.js');

const SNAP = '<html><body><div class="contentpage"><div class="image"><img src="a.jpg"></div><h1>Airportr</h1>'
  + '<div class="airem-sidebar"><div class="sidebar-content">'
  + '<div class="text"><p>Don\'t want to carry your bags to and from the airport? Let Airportr take the hassle.</p></div>'
  + '<h2>Your benefits</h2><h2>Departure and arrival services</h2>'
  + '<maui-tab-control-responsive><maui-tab-control-panel-responsive><p>A smooth, fast and comfortable start of your journey from home.</p></maui-tab-control-panel-responsive>'
  + '<maui-tab-control-panel-responsive><p>Arrive and leave the airport without your bags, they come home later.</p></maui-tab-control-panel-responsive></maui-tab-control-responsive>'
  + '</div><div class="sidebar-aside"><h4>Travel lighter, stay informed</h4><p>Learn how to make the most of the service and unlock offers.</p></div></div>'
  + '<h2>More about Airportr</h2><p>Questions and answers.</p></div></body></html>';
const meta = (rows) => `<div class="section-metadata">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;
const DOC = '<body><header></header><main>'
  + '<div><p><picture><img src="a.jpg"></picture></p><h1>Airportr</h1><p>Don\'t want to carry your bags to and from the airport? Let Airportr take the hassle.</p><h2>Your benefits</h2><h2>Departure and arrival services</h2></div>'
  + `<div><p>A smooth, fast and comfortable start of your journey from home.</p>${meta([['Tab', 'Departure service'], ['Tabs', '1']])}</div>`
  + `<div><p>Arrive and leave the airport without your bags, they come home later.</p>${meta([['Tab', 'Arrival service'], ['Tabs', '1']])}</div>`
  + '<div><h4>Travel lighter, stay informed</h4><p>Learn how to make the most of the service and unlock offers.</p><h2>More about Airportr</h2><p>Questions and answers.</p></div>'
  + '</main><footer></footer></body>';

const outline = (doc) => {
  const { document: d } = parseHTML(`<main>${doc.match(/<main>([\s\S]*)<\/main>/)[1]}</main>`);
  return [...d.querySelector('main').children].map((s) => [...s.children].map((c) => (c.className === 'section-metadata' ? `meta:${[...c.children].map((r) => `${r.firstElementChild.textContent}=${r.lastElementChild.textContent}`).join(';')}` : `${c.tagName.toLowerCase()}:${c.textContent.slice(0, 12)}`)));
};

test('the importer: the content from its first text, the two panels sidebar-parts with their Tab rows, the aside after them, then the rest', () => {
  const r = withSwissSidebar(DOC, SNAP);
  assert.equal(r.made, 1, r.skipped.join('; '));
  assert.deepEqual(outline(r.doc), [
    ['p:', 'h1:Airportr'],
    ['p:Don\'t want t', 'h2:Your benefit', 'h2:Departure an'],
    ['p:A smooth, fa', 'meta:Tab=Departure service;Tabs=1;Style=sidebar-part'],
    ['p:Arrive and l', 'meta:Tab=Arrival service;Tabs=1;Style=sidebar-part'],
    ['h4:Travel light', 'p:Learn how to', 'meta:Style=sidebar-aside'],
    ['h2:More about A', 'p:Questions an'],
  ]);
});

// the page as decorateSections leaves it
const section = (body, data = {}, cls = '') => `<div class="section${cls ? ` ${cls}` : ''}" ${Object.entries(data).map(([k, v]) => `data-${k}="${v}"`).join(' ')}><div class="default-content-wrapper">${body}</div></div>`;

test('the page: the aside beside the content and both panels; the tab list inside that section, before the first panel; one panel shown', () => {
  const main = document.createElement('main');
  main.innerHTML = section('<h1>Airportr</h1>')
    + section('<p>Intro</p><h2>Departure and arrival services</h2>')
    + section('<p>Departure</p>', { tab: 'Departure service', tabs: '1' }, 'sidebar-part')
    + section('<p>Arrival</p>', { tab: 'Arrival service', tabs: '1' }, 'sidebar-part')
    + section('<h4>Travel lighter</h4>', {}, 'sidebar-aside')
    + section('<h2>More</h2>');
  document.body.replaceChildren(main);
  joinAsideSections(main);
  decorateSectionTabs(main);
  const host = main.querySelector('.with-aside');
  assert.ok(host);
  assert.equal(main.children.length, 3, 'title, the sidebar, what follows');
  const kids = [...host.children].map((c) => c.className.split(' ').filter((x) => x !== 'section-part')[0] || 'section-part');
  assert.deepEqual(kids, ['default-content-wrapper', 'section', 'section-tab-panel', 'section-tab-panel', 'section-aside'].map((k, i) => (i === 0 ? 'section-part' : k)));
  const tabs = [...host.querySelectorAll('[role="tab"]')].map((t) => `${t.textContent}:${t.getAttribute('aria-selected')}`);
  assert.deepEqual(tabs, ['Departure service:true', 'Arrival service:false']);
  const panels = [...host.querySelectorAll('[role="tabpanel"]')];
  assert.deepEqual(panels.map((p) => p.hidden), [false, true]);
  assert.equal(host.style.getPropertyValue('--section-aside-rows'), '4', 'the intro, the tab list, the two panels');
  assert.ok(!host.dataset.tab, 'the section itself no panel');
});

test('as before: a tab set of sections; a panel in parts (a grey box in a tab) one panel, the set going on after it', () => {
  const main = document.createElement('main');
  main.innerHTML = section('<p>One</p>', { tab: 'A' }) + section('<p>Box</p>', { tab: 'B' }, 'grey') + section('<p>Rest</p>', { tab: 'B' }) + section('<h4>Aside</h4>', {}, 'sidebar-aside') + section('<p>Third</p>', { tab: 'C' });
  document.body.replaceChildren(main);
  joinAsideSections(main);
  decorateSectionTabs(main);
  assert.equal(main.querySelectorAll('[role="tab"]').length, 3, 'one set: the parts of B end none');
  const panelB = [...main.querySelectorAll('[role="tabpanel"]')][1];
  assert.ok(panelB.classList.contains('with-aside'), 'panel B holds its parts and the aside');
  assert.equal(panelB.querySelectorAll('.section-part').length, 2);
  assert.equal(panelB.querySelectorAll('.section-part[data-tab]').length, 0, 'its parts no panels of their own');
});
