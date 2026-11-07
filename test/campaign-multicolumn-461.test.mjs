/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 461 (from ema-adobe's 457): the campaign template had no columns-media selector for a
   top-level three- or four-column view (.section-content > .threecolumn / .fourcolumn), so their
   items came out stacked in one column: frankfurt-fair (headline + text + link x 3, ours 815 px
   taller), 100-years/fleet (three images), 100-years/chronicle (three texts),
   discover-lufthansa/new-onboard-experience (four links). The campaign entry now has info's
   selector; a row of teaser cards stays carousel-cards'. Fixtures shaped like the xx snapshots.
   Run: node --test test/campaign-multicolumn-461.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const block = (template, name) => templates.find((t) => t.name === template).blocks.find((b) => b.name === name);
const INFO_SELECTOR = block('info', 'columns-media').instances.find((s) => s.startsWith(':is(.section-content, .container-content) > :is(.threecolumn, .fourcolumn):not('));

const item = (inner) => `<div class="col-lg column-view-item">${inner}</div>`;
const view = (kind, items) => `<div class="section"><div><div class="section-content"><div class="${kind} column event"><div class="column-view"><div class="row">${items.join('')}</div></div></div></div></div></div>`;
const FAIR = view('threecolumn', [1, 2, 3].map((n) => item(`<div class="headline"><h3>Hall ${n}</h3></div><div class="text"><p>Text</p></div><div class="link"><a href="/x">More</a></div>`)));
const FLEET = view('threecolumn', [1, 2, 3].map(() => item('<div class="image"><img src="a.jpg" alt=""></div>')));
const LINKS = view('fourcolumn', [1, 2, 3, 4].map(() => item('<div class="link"><a href="/x">Link</a></div>')));
const CARDS = view('threecolumn', [1, 2, 3].map(() => item('<div class="teaser"><a class="teaser card" href="/x"><h3>Card</h3></a></div>')));

const matches = (html, sel) => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  return document.querySelectorAll(sel).length;
};

test('the campaign template has info\'s selector for top-level three- and four-column views', () => {
  assert.ok(INFO_SELECTOR, 'info has it');
  assert.ok(block('campaign', 'columns-media').instances.includes(INFO_SELECTOR));
});

test('it takes frankfurt-fair\'s, the fleet\'s and new-onboard-experience\'s rows, not a row of teaser cards', () => {
  assert.equal(matches(FAIR, INFO_SELECTOR), 1);
  assert.equal(matches(FLEET, INFO_SELECTOR), 1);
  assert.equal(matches(LINKS, INFO_SELECTOR), 1);
  assert.equal(matches(CARDS, INFO_SELECTOR), 0, 'carousel-cards keeps it');
  assert.ok(block('campaign', 'carousel-cards').instances.includes('.threecolumn:has(a.teaser.card)'));
});

test('import-campaign.js and its bundle carry the selector', () => {
  const quoted = JSON.stringify(INFO_SELECTOR);
  assert.ok(fs.readFileSync(new URL('../tools/importer/import-campaign.js', import.meta.url), 'utf8').includes(quoted), 'import-campaign.js');
  // the bundler writes it in single quotes (the selector holds double ones)
  const bundle = fs.readFileSync(new URL('../tools/importer/import-campaign.bundle.js', import.meta.url), 'utf8');
  assert.ok(bundle.includes(quoted) || bundle.includes(`'${INFO_SELECTOR}'`), 'the bundle');
});
