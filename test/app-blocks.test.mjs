/* The app screen blocks (blocks/app-*): what the Lufthansa app shows for them
   (tools/workers/lh-edge/SDUI.md), from lh-edge's fixtures
   (tools/workers/lh-edge/test/fixtures/sdui) and the library's teaser slider: the offer box, the
   arrow links, an offer box per article of the category (lh-edge's order), the slider's title
   over its cards, the service slot; each item's tracking label as a caption.
   Run: node --max-old-space-size=512 --test test/app-blocks.test.mjs */
/* global globalThis */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseHTML } from 'linkedom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SDUI = path.join(root, 'tools/workers/lh-edge/test/fixtures/sdui');
const read = (f) => fs.readFileSync(f, 'utf8');

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/content/mobile/lh/en/articles/europe', search: '', hash: '', href: 'https://main--lh-com--moved-permanently.aem.page/content/mobile/lh/en/articles/europe', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
globalThis.window = window;
globalThis.document = document;
const INDEX = JSON.parse(read(path.join(SDUI, 'query-index-en.json')));
const fetched = [];
globalThis.fetch = async (url) => {
  fetched.push(String(url));
  return { ok: true, json: async () => INDEX };
};

const blockOf = (file, name) => {
  const d = parseHTML(`<html><body><main>${read(file)}</main></body></html>`).document;
  const b = d.querySelector(`div.${name}`);
  document.body.replaceChildren(b);
  return b;
};
const text = (el) => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');

describe('app-offer', () => {
  it('an offer box: the image, title, description, the link text as the button to the link; the tracking label as a caption', async () => {
    const { default: decorate } = await import('../blocks/app-offer/app-offer.js');
    const b = blockOf(path.join(SDUI, 'a-perfect-day-in-frankfurt.plain.html'), 'app-offer');
    const before = [...b.children].map((r) => [...r.children].map(text));
    const kv = Object.fromEntries(before.filter((r) => r.length === 2));
    await decorate(b);
    assert.equal(text(b.querySelector('.app-offer-title')), kv.Title);
    assert.equal(text(b.querySelector('.app-offer-description')), kv.Description);
    const btn = b.querySelector('a.app-offer-button');
    assert.equal(text(btn), kv['Link text']);
    assert.ok(btn.getAttribute('href').length > 1);
    assert.match(b.querySelector('img.app-offer-image').getAttribute('src'), /^https:\/\/www\.lufthansa\.com\/content\/dam\//);
    assert.equal(text(b.querySelector('.app-tracking')), `Tracking: ${kv.Tracking}`);
  });
});

describe('app-links', () => {
  it('one arrow link per row, its tracking label under it', async () => {
    const { default: decorate } = await import('../blocks/app-links/app-links.js');
    const b = blockOf(path.join(SDUI, 'a-perfect-day-in-frankfurt.plain.html'), 'app-links');
    const rows = [...b.children].map((r) => [r.querySelector('a').getAttribute('href'), text(r.querySelector('a')), text(r.children[1])]);
    decorate(b);
    const items = [...b.querySelectorAll('li')];
    assert.equal(items.length, rows.length);
    items.forEach((li, i) => {
      const a = li.querySelector('a.app-link');
      assert.equal(a.getAttribute('href'), rows[i][0]);
      assert.equal(text(a.querySelector('.app-link-text')), rows[i][1]);
      assert.ok(a.querySelector('.app-link-arrow'));
      assert.equal(text(li.querySelector('.app-tracking')), `Tracking: ${rows[i][2]}`);
    });
  });
});

describe('app-article-list', () => {
  it('an offer box per article of the category from the app screens\' index, newest Date first, then Order (as lh-edge)', async () => {
    const { default: decorate } = await import('../blocks/app-article-list/app-article-list.js');
    const { articlesOf } = await import(pathToFileURL(path.join(root, 'tools/workers/lh-edge/src/sdui.js')).href);
    const b = blockOf(path.join(SDUI, 'europe.plain.html'), 'app-article-list');
    await decorate(b);
    assert.ok(fetched.some((u) => u.includes('/content/mobile/lh/query-index.json')));
    const want = articlesOf({ index: INDEX.data }, '/content/mobile/lh/en/articles/europe');
    assert.ok(want.length > 1);
    const boxes = [...b.querySelectorAll('.app-offer-box')];
    assert.deepEqual(boxes.map((x) => x.querySelector('a.app-offer-button').getAttribute('href')), want.map((r) => r.path));
    assert.equal(text(boxes[0].querySelector('.app-offer-title')), want[0].headline || want[0].title);
    assert.equal(text(boxes[0].querySelector('a.app-offer-button')), 'Read article');
    assert.equal(text(b.querySelector('.app-tracking')), 'Tracking: article');
  });
});

describe('app-teaser-slider', () => {
  it('its title over a row of cards (picture, headline, text, linked), each card\'s tracking label', async () => {
    const { default: decorate } = await import('../blocks/app-teaser-slider/app-teaser-slider.js');
    const b = blockOf(path.join(root, 'content/library/blocks/app-teaser-slider.plain.html'), 'app-teaser-slider');
    const cardRows = [...b.children].filter((r) => r.children.length >= 4);
    const want = cardRows.map((r) => [text(r.children[0].querySelector('h1, h2, h3, h4, h5, h6')), r.children[2].querySelector('a').getAttribute('href'), text(r.children[3])]);
    decorate(b);
    assert.equal(text(b.querySelector('.app-teaser-slider-title')), 'Mehr entdecken');
    const cards = [...b.querySelectorAll('.app-teaser-slider-cards > li')];
    assert.equal(cards.length, want.length);
    cards.forEach((c, i) => {
      assert.equal(text(c.querySelector('.app-card-headline')), want[i][0]);
      assert.equal(c.querySelector('a').getAttribute('href'), want[i][1]);
      assert.ok(c.querySelector('img'));
      assert.equal(text(c.querySelector('.app-tracking')), `Tracking: ${want[i][2]}`);
    });
  });
});

describe('app-service', () => {
  it('a labelled slot naming Service, Tenant, Market and Language, filled by the app', async () => {
    const { default: decorate } = await import('../blocks/app-service/app-service.js');
    const b = blockOf(path.join(SDUI, 'homepage-zh.plain.html'), 'app-service');
    decorate(b);
    assert.match(text(b), /filled by the app/i);
    const dl = Object.fromEntries([...b.querySelectorAll('dt')].map((dt) => [text(dt), text(dt.nextElementSibling)]));
    assert.equal(dl.Service, '/content/dam/content-fragments/orchestrator_services/sdui-services/salesandmarketingteaserhub');
    assert.equal(dl.Tenant, 'app_lh');
    assert.equal(dl.Market, '–');
    assert.equal(dl.Language, 'zh');
  });
});
