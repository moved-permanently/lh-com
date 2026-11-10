/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 582, rule 6 (/de/en/economy-class 34.2 % at 390, the ranking's top info rows): www starts some pages' content
   right under the sub-navigation bar (.contentpage.pt-0: economy-class, premium-economy-class, business-class,
   internet-overview, lhg-wifi, flynet in de/en and de/de), others 20 px under it (first-class). Ours had the profile
   nav's 20 px (25 from 1024 px) everywhere. The profile-nav parser writes Section Metadata Style flush into its section
   for pt-0 pages; styles.css gives such a section no gap.
   Run: node --max-old-space-size=256 --test test/profile-nav-flush-582.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      const table = document.createElement('table');
      table.setAttribute('data-name', name);
      table.textContent = Array.isArray(cells) ? '' : Object.entries(cells).map(([k, v]) => `${k}=${v}`).join(';');
      if (Array.isArray(cells)) cells.forEach((row) => row.forEach((c) => table.append(c)));
      return table;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/profile-nav.js');

const NAV = '<div class="subnav-wrapper"><maui-sub-navigation><maui-sub-navigation-tab name="Lufthansa Travel Classes" href="/de/en/lufthansa-travel-classes"></maui-sub-navigation-tab><maui-sub-navigation-tab name="Economy Class" href="/de/en/economy-class"></maui-sub-navigation-tab></maui-sub-navigation></div>';
const run = (contentClass) => {
  const { document } = parseHTML(`<html><body>${NAV}<div class="${contentClass}"><div class="container-content"><p>x</p></div></div></body></html>`);
  parse(document.querySelector('.subnav-wrapper'), { document });
  return document;
};

test('www content right under the bar (.contentpage.pt-0): the profile nav and Section Metadata Style flush', () => {
  const tables = [...run('contentpage pt-0').querySelectorAll('table')];
  assert.deepEqual(tables.map((t) => t.getAttribute('data-name')), ['profile-nav', 'Section Metadata']);
  assert.equal(tables[1].textContent, 'style=flush');
});

test('www content 20 px under the bar (.contentpage): the profile nav alone, as before', () => {
  const tables = [...run('contentpage').querySelectorAll('table')];
  assert.deepEqual(tables.map((t) => t.getAttribute('data-name')), ['profile-nav']);
});

test('styles.css: a flush profile-nav section has no gap', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.brand-lufthansa main > .section.profile-nav-container.flush { margin-bottom: 0; }'));
});
