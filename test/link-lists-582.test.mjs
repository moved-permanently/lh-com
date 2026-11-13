/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 582, item a: lufthansa.com's link lists to pages. www's .imagelinklist > .link-list > ul.horizontal, .responsive
   or .vertical of maui-navigation-link variant="hyper" or "external" draws the standalone arrow links (side by side and
   wrapping, stacked below 768px, or stacked and 12px in from 768px); the import wrote them as bulleted running-text
   lists (/de/en/lufthansa-business-class-on-long-haul-routes' two aircraft links: +66 to +112 px there, 31 / 28.6 %).
   The cleanup (markLinkLists) ends the list's last item with "{links-horizontal}", "{links-responsive}" or
   "{links-vertical}" and the columns-media parser keeps it when it rebuilds a column's list; scripts.js makes it the
   list's class (LIST_STYLE), styles.css draws it. Jump links (anchor-down: the Jump Links block), lists in accordions
   (the Insights tag lists), icon tiles (variant custom), button links and other brands' pages stay as they were.
   Inputs: the snapshots' elements (test/fixtures/link-lists-582).
   Run: node --max-old-space-size=256 --test test/link-lists-582.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { LIST_STYLE } from '../scripts/style-markers.js';

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { name, variants = [], cells }) => {
      const table = document.createElement('table');
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
const { default: transform } = await import('../tools/importer/transformers/lufthansa-cleanup.js');
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');

const fixture = (name) => fs.readFileSync(new URL(`./fixtures/link-lists-582/${name}.html`, import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const page = (body) => `<html><head><title>T | Lufthansa</title></head><body><main><div class="container-content"><div class="section"><div class="section-content container-fluid section-regular">${body}</div></div></div></main></body></html>`;
const run = (body, url = 'https://www.lufthansa.com/de/en/security-check-time-slot') => {
  const { document } = parseHTML(page(body));
  transform('beforeTransform', document.body, { document, url, params: { originalURL: url }, template: { name: 'info' } });
  return document;
};
const lastItem = (ul) => [...ul.children].filter((li) => li.tagName === 'LI').pop();
const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();

test('security-check-time-slot\'s app downloads (horizontal, external): the last item ends with {links-horizontal}', () => {
  const document = run(fixture('security-check-apps'));
  const ul = document.querySelector('ul[data-lh-links]');
  assert.ok(ul);
  assert.equal(ul.getAttribute('data-lh-links'), 'horizontal');
  assert.match(text(lastItem(ul)), /^To iOS download \{links-horizontal\}$/);
  assert.equal(document.body.textContent.match(/\{links-/g).length, 1);
});

test('data-collection-canada\'s links (vertical, each in an external-website tooltip): the marker at the item\'s end, outside the tooltip', () => {
  const document = run(fixture('data-collection-links'), 'https://www.lufthansa.com/de/en/data-collection-canada');
  const ul = document.querySelector('ul[data-lh-links="vertical"]');
  assert.ok(ul);
  const li = lastItem(ul);
  assert.match(text(li), /API data collection \{links-vertical\}$/);
  assert.equal(li.lastChild.nodeType, 3, 'a text node of the item itself');
  assert.match(li.lastChild.textContent, /\{links-vertical\}$/);
});

test('business-class-on-long-haul-routes (responsive, in a column view): the columns-media parser keeps the marker', () => {
  const url = 'https://www.lufthansa.com/de/en/lufthansa-business-class-on-long-haul-routes';
  const document = run(fixture('business-class-view'), url);
  parse(document.querySelector('.twocolumn'), { document, url, params: { originalURL: url } });
  const lists = [...document.querySelectorAll('table ul')];
  assert.equal(lists.length, 1);
  assert.deepEqual([...lists[0].querySelectorAll('a')].map(text), ['To the Lufthansa Boeing 787', 'To the Lufthansa Airbus A350']);
  assert.match(text(lastItem(lists[0])), /^To the Lufthansa Airbus A350 \{links-responsive\}$/);
});

test('jump links, tag lists in accordions, icon tiles and other brands: no marker', () => {
  assert.ok(!run(fixture('baggage-jump-links'), 'https://www.lufthansa.com/de/en/baggage').body.textContent.includes('{links-'));
  assert.ok(!run(fixture('tags-accordion'), 'https://www.lufthansa.com/de/en/articles/tags').body.textContent.includes('{links-'));
  const custom = fixture('security-check-apps').replace(/variant="external"/g, 'variant="custom"');
  assert.ok(!run(custom).body.textContent.includes('{links-'));
  const buttons = '<div class="imagelinklist event section"><div class="link-list"><ul class="horizontal"><li><div class="maui-link"><maui-button-link href="https://apps.apple.com/x" type="secondary"><span class="raw-text">To Apple App Store</span></maui-button-link></div></li></ul></div></div>';
  assert.ok(!run(buttons).body.textContent.includes('{links-'));
  assert.ok(!run(fixture('security-check-apps'), 'https://www.austrian.com/at/en/online-check-in').body.textContent.includes('{links-'));
});

test('the marker is a list style (with a column mark too) and styles.css draws the three layouts, brand-scoped', () => {
  assert.equal(' {links-horizontal column-end}'.match(LIST_STYLE)[1], 'links-horizontal column-end');
  ['links-responsive', 'links-vertical'].forEach((t) => assert.equal(` {${t}}`.match(LIST_STYLE)[1], t));
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.brand-lufthansa main ul:is(.links-horizontal, .links-responsive, .links-vertical) { display: flex; flex-flow: column; gap: 6px 20px; padding: 0; list-style: none; }'));
  assert.ok(css.includes('body.brand-lufthansa main ul.links-horizontal { flex-flow: row wrap; }'));
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-lufthansa main ul\.links-responsive \{ flex-flow: row wrap; \} body\.brand-lufthansa main ul\.links-vertical \{ padding-left: 12px; \} \}/);
  assert.ok(css.includes('body.appear.brand-lufthansa main ul:is(.links-horizontal, .links-responsive, .links-vertical) > li > a:any-link:not(.button)::before { content: ""; flex: 0 0 auto; align-self: center; width: 19px; height: 19px;'));
});
