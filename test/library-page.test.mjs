/* The block library's pages and the app screens (scripts/library-page.js): which paths they are,
   the heading ids the Edge Delivery pipeline gives (test/fixtures/heading-ids.json: 203 headings
   of 25 aem.page pages, the library's and five visitor pages, as aem.page wrote their ids), the
   library-metadata tables removed, the app screen's markers ({spacer: …}, {small}, {divider}).
   Run: node --max-old-space-size=512 --test test/library-page.test.mjs */
/* global globalThis */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><header></header><main></main><footer></footer></body></html>');
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = window.NodeFilter || { SHOW_TEXT: 4 };

const {
  isLibraryPath, isAppScreenPath, slug, addHeadingIds, removeLibraryMetadata, decorateAppScreen,
  hashTarget,
} = await import('../scripts/library-page.js');

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const IDS = JSON.parse(fs.readFileSync(path.join(dir, 'heading-ids.json'), 'utf8'));
const mainOf = (html) => {
  const d = parseHTML(`<html><body><main>${html}</main></body></html>`).document;
  return d.querySelector('main');
};

describe('library-page paths', () => {
  it('library pages: /library/**, also under the local server\'s /content', () => {
    ['/library/blocks/accordion-columns', '/library/blocks/app-offer', '/content/library/blocks/poi-map'].forEach((p) => assert.ok(isLibraryPath(p), p));
    ['/de/en/homepage', '/libraryx', '/de/en/library/blocks', '/content/mobile/lh/en/homepage'].forEach((p) => assert.ok(!isLibraryPath(p), p));
  });

  it('app screens: /content/mobile/**, also under the local server\'s /content', () => {
    ['/content/mobile/lh/en/articles/a-perfect-day-in-frankfurt', '/content/mobile/lh/de/homepage', '/content/content/mobile/lh/de/homepage'].forEach((p) => assert.ok(isAppScreenPath(p), p));
    ['/de/en/homepage', '/library/blocks/app-offer', '/content/lh/markets/de/en/homepage'].forEach((p) => assert.ok(!isAppScreenPath(p), p));
  });
});

describe('library-page heading ids', () => {
  it('slug as the pipeline\'s (github-slugger, leading digits removed by addHeadingIds)', () => {
    assert.equal(slug('Accordion columns (faq, spaced): text | list'), 'accordion-columns-faq-spaced-text--list');
    assert.equal(slug('Jusqu’à -50 % pour les enfants'), 'jusquà--50--pour-les-enfants');
    assert.equal(slug('Up to 4.000 miles with SIXT'), 'up-to-4000-miles-with-sixt');
  });

  Object.entries(IDS).forEach(([page, headings]) => {
    it(`the ids aem.page gives ${page}'s ${headings.length} headings`, () => {
      const main = mainOf(headings.map(([text]) => `<div><h2>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</h2></div>`).join(''));
      addHeadingIds(main);
      assert.deepEqual([...main.querySelectorAll('h2')].map((h) => h.id), headings.map(([, id]) => id));
    });
  });

  it('a page whose headings have ids (aem.page, aem.live) keeps them', () => {
    const main = mainOf('<div><h2 id="kept">Accordion columns</h2><h3>Without</h3></div>');
    addHeadingIds(main);
    assert.equal(main.querySelector('h2').id, 'kept');
    assert.equal(main.querySelector('h3').id, '');
  });

  it('the hash\'s element: the id, percent-decoded (ids with umlauts)', () => {
    const main = mainOf('<div><h2 id="zahlungsmöglichkeiten">Zahlungsmöglichkeiten</h2></div>');
    assert.equal(hashTarget(main.ownerDocument, '#zahlungsm%C3%B6glichkeiten'), main.querySelector('h2'));
    assert.equal(hashTarget(main.ownerDocument, '#nothing'), null);
    assert.equal(hashTarget(main.ownerDocument, ''), null);
  });
});

describe('library-page library-metadata', () => {
  it('the tables go before decoration, on every page; the block stays', () => {
    const main = mainOf('<div><div class="accordion-columns"><div><div>T</div><div>C</div></div></div><div class="library-metadata"><div><div>description</div><div>Expandable items</div></div></div></div>');
    removeLibraryMetadata(main);
    assert.ok(main.querySelector('.accordion-columns'));
    assert.ok(!main.querySelector('.library-metadata'));
    assert.ok(!main.textContent.includes('Expandable items'));
  });
});

describe('library-page app screen markers', () => {
  it('{spacer: …} (also "…, v2") as space, {small} paragraphs small, {divider} a rule', () => {
    const main = mainOf('<div><h1>A Perfect Day</h1><p><strong>9. October 2025 | 2 min read</strong> {small}</p><p>{spacer: medium, v2}</p><p>Text</p><p>{spacer: large}</p><p>{spacer: x-small}</p><p>{spacer: m-large}</p><p>{divider}</p></div>');
    decorateAppScreen(main);
    const ps = [...main.querySelectorAll('p')];
    assert.ok(ps[0].classList.contains('app-small'));
    assert.equal(ps[0].textContent.trim(), '9. October 2025 | 2 min read');
    assert.deepEqual(ps.slice(1).map((p) => p.className), ['app-spacer app-spacer-medium', '', 'app-spacer app-spacer-large', 'app-spacer app-spacer-x-small', 'app-spacer app-spacer-m-large', 'app-divider']);
    assert.equal(ps[1].textContent, '');
    assert.equal(ps[1].getAttribute('aria-hidden'), 'true');
    assert.equal(ps[2].textContent, 'Text');
  });
});

describe('library-page sample states', () => {
  it('destination-offer: a sample route on library pages only, the URL\'s route first', async () => {
    const { routeOf } = await import('../blocks/destination-offer/destination-offer.js');
    assert.deepEqual(routeOf('', '/library/blocks/destination-offer'), {
      origin: 'FRA', destination: 'NYC', cabin: 'E', tripType: 'RETURN', tripDuration: 14,
    });
    assert.equal(routeOf('', '/de/en/offers-and-destinations'), null);
    assert.equal(routeOf('?OriginCode=MUC&DestinationCode=CHI', '/library/blocks/destination-offer').destination, 'CHI');
  });
});
