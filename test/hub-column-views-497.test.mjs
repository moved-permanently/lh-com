/* eslint-disable max-len */
/* Brief 497 item 1: the hub template marks www's column views of their own as the info template does
   (lufthansa-cleanup markColumnViews, COLUMN_MARK_TEMPLATES info and fleet), so a re-import keeps DA's
   "{column-start}" / "{column-end}" on /de/en and /de/de miles-and-more (ema-test, the brief after 488,
   section 3): three one-column views (a headline, a text, a link) in the first AEM section. Hub's own
   transformer (page-templates.json hub "transformers": hub-column-views) sets the cleanup's
   data-lh-column attribute in beforeTransform; the cleanup's placeColumnMarks (every template, in
   afterTransform) writes the markers. Without "Theme: flow-spacing", which DA's hub documents don't
   have. Not a column view a block other than columns-media takes, a grey one, one in an article.
   Run: node --max-old-space-size=256 --test test/hub-column-views-497.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { default: hubColumnViews } = await import('../tools/importer/transformers/hub-column-views.js');

const view = (title, extra = '') => `<div class="onecolumn column event section"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item">
  <div class="headline"><h2>${title}</h2></div><div class="richtext limited-width"><p>Text of ${title}</p></div>${extra}</div></div></div></div>`;

const PAGE = `<html><head></head><body><div class="container-content">
<div class="section"><div class="section-content container-fluid section-regular">
  <div class="headline section"><h1>Miles &amp; More</h1></div>
  <div class="text section"><div class="richtext limited-width"><p>Intro</p></div></div>
  ${view('Broaden your horizons')}
  ${view('Earn miles')}
  ${view('Discover the world', '<div class="link event"><a href="/x">Register now</a></div>')}
</div></div>
<div class="section"><div class="section-content container-fluid section-regular section-padding-y-regular">
  <div class="separator section"><div class="hr"></div></div>
  <div class="threecolumn column event section"><div class="column-view flex-column"><div class="row">
    <div class="col-lg column-view-item"><div class="teaser"><h4>Cash &amp; Miles</h4></div></div>
  </div></div></div>
</div></div>
<div class="section"><div class="section-content container-fluid"><div class="onecolumn column section"><div class="column-view container-gray"><div class="row"><div class="col-lg column-view-item"><p>Grey</p></div></div></div></div></div></div>
<div class="onecolumn column section"><div class="column-view"><div class="row"><div class="col-lg column-view-item"><div class="headline"><h2>Outside a section</h2></div></div></div></div></div>
</div></body></html>`;

const HUB = {
  name: 'hub',
  blocks: [{ name: 'carousel-cards', instances: ['.threecolumn.column'] }],
};

const run = (html, template = HUB) => {
  const { document } = parseHTML(html);
  hubColumnViews('beforeTransform', document.body, { document, template });
  return document;
};

test('miles-and-more: its three column views of their own in an AEM section are marked "sc"', () => {
  const document = run(PAGE);
  const marked = [...document.querySelectorAll('[data-lh-column]')];
  const kinds = marked.map((el) => `${el.querySelector('h2') ? el.querySelector('h2').textContent : '?'}=${el.getAttribute('data-lh-column')}`);
  assert.deepEqual(kinds, ['Broaden your horizons=sc', 'Earn miles=sc', 'Discover the world=sc', 'Outside a section=cc']);
});

test('not a column view a block takes (carousel-cards), nor a grey one, nor in an article', () => {
  const document = run(PAGE);
  assert.equal(document.querySelector('.threecolumn').hasAttribute('data-lh-column'), false);
  assert.equal(document.querySelector('.container-gray').closest('.onecolumn').hasAttribute('data-lh-column'), false);
  const article = run(`<html><body><div class="container-content"><div class="article-details-page"><div class="section"><div class="section-content">${view('In an article')}</div></div></div></div></body></html>`);
  assert.equal(article.querySelector('[data-lh-column]'), null);
});

test('only in beforeTransform; a template the cleanup marks itself (info) is left to it', () => {
  const { document } = parseHTML(PAGE);
  hubColumnViews('afterTransform', document.body, { document, template: HUB });
  assert.equal(document.querySelector('[data-lh-column]'), null);
  const info = run(PAGE, { name: 'info', blocks: [] });
  assert.equal(info.querySelector('[data-lh-column]'), null);
});

test('a column view that ends the page in a spaced AEM section (.mb-default) is "sc-spaced"', () => {
  const document = run(`<html><body><div class="container-content"><div class="section"><div class="mb-default"></div><div class="section-content">${view('Last')}</div></div></div></body></html>`);
  assert.equal(document.querySelector('[data-lh-column]').getAttribute('data-lh-column'), 'sc-spaced');
});
