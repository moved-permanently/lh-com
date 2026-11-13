/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 566 (the ranking against austrian-parity-003): Austrian /online-check-in's "Austrian App" link list
   (.imagelinklist ul.horizontal: "To Apple App Store", "To Google Play Store") has a third item holding only a
   maui-tooltip without a trigger, its box "This link leads to an external website whose security and accessibility
   cannot be influenced by Austrian Airlines." www never shows it (nothing to hover or focus). The cleanup dropped a
   tooltip's box only when a link is its trigger, so the box text came in as a third list item; 9 of the 10 published
   documents carry it (at/en, cn/zh, es/es, fr/fr, gr/el, it/it, jp/ja, pl/pl, ru/ru; at/de has no such list). A tooltip
   without a trigger now goes whole, and a list item it leaves empty with it. A link's "external website" tooltip and an
   info tooltip (an icon button its trigger) as before. Of the lufthansa.com, SWISS and Brussels snapshots and both
   recording sets, only Austrian online-check-in (its two recordings) has a tooltip without a trigger.
   Run: node --max-old-space-size=256 --test test/cleanup-orphan-tooltip-566.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { name }) => {
      const table = document.createElement('table');
      table.textContent = name;
      return table;
    },
  },
};
const { default: transform } = await import('../tools/importer/transformers/lufthansa-cleanup.js');

const URL_AT = 'https://www.austrian.com/at/en/online-check-in';
const NOTE = 'This link leads to an external website whose security and accessibility cannot be influenced by Austrian Airlines.';
const store = (href, label) => `<li class="imagelinklistitem link event"><div class="maui-link"><maui-button-link href="${href}" type="secondary" target="_blank"><span class="raw-text">${label}</span><span class="sr-only"> The link will be opened in a new browser tab </span></maui-button-link></div></li>`;
const LIST = `<div class="imagelinklist event section"><div class="link-list"><ul class="horizontal" id="communication-data">${store('https://apps.apple.com/at/app/austrian-airlines/id400224803', 'To Apple App Store')}${store('https://play.google.com/store/apps/details?id=com.austrian.connector.android', 'To Google Play Store')}<li class="imagelinklistitem link event"><maui-tooltip strategy="fixed" placement="bottom" type="small"><div slot="box" class="popover-box-tooltip"> ${NOTE} </div></maui-tooltip></li></ul></div></div>`;
const page = (body) => `<html><head><title>Online check-in | Austrian Airlines</title></head><body><main><div class="container-content"><div class="section"><div class="section-content container-fluid section-regular"><div class="headline section"><h2>Austrian App</h2></div>${body}</div></div></div></main></body></html>`;

const run = (html) => {
  const { document } = parseHTML(page(html));
  transform('beforeTransform', document.body, { document, url: URL_AT, params: { originalURL: URL_AT } });
  return document;
};

test('online-check-in\'s app list: the trigger-less tooltip and its item go, the two store links stay', () => {
  const document = run(LIST);
  assert.ok(!document.body.textContent.includes('This link leads to an external website'));
  const items = [...document.querySelectorAll('ul#communication-data > li')];
  assert.equal(items.length, 2);
  assert.deepEqual(items.map((li) => li.querySelector('maui-button-link').getAttribute('href').split('/')[2]), ['apps.apple.com', 'play.google.com']);
});

test('a link\'s external-website tooltip loses its box, an info tooltip keeps it (as before)', () => {
  const linkTip = `<div class="text section"><p><maui-tooltip><a slot="trigger" href="https://example.com/x">Partner site</a><div slot="box">${NOTE}</div></maui-tooltip></p></div>`;
  const infoTip = '<div class="text section"><p>Fees apply <maui-tooltip><button slot="trigger" aria-label="More information"><maui-icon></maui-icon></button><div slot="box">Children under 2 fly free.</div></maui-tooltip></p></div>';
  const document = run(linkTip + infoTip);
  assert.ok(document.body.textContent.includes('Partner site'));
  assert.ok(!document.body.textContent.includes('external website'));
  assert.ok(document.body.textContent.includes('Children under 2 fly free.'));
});

test('a list item with other content beside a trigger-less tooltip stays', () => {
  const document = run('<div class="text section"><ul><li>Keep me<maui-tooltip><div slot="box">Hidden box</div></maui-tooltip></li></ul></div>');
  const li = document.querySelector('ul > li');
  assert.ok(li && li.textContent.includes('Keep me'));
  assert.ok(!document.body.textContent.includes('Hidden box'));
});
