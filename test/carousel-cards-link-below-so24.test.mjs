/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 24 (2026-11-14), item 2: /de/en/book-and-manage/flights/giftvoucher's de cards. The harness read
   lh-snapshots-083: each column-view item holds (1) a.teaser.card with a hidden .teaser-link-text, (2) a
   div.separator.section (hr-no-layout, margin-bottom 10px), (3) div.link.event.section > maui-navigation-link with the
   line www draws under the card ("Visit the FAQs" anchor-down, "Redeem on Lufthansa.com" hyper, "Buy Gift Card now"
   external, target _blank; that card's own hidden text is "Continue"). The parser takes only the teasers, so the lines
   were lost. A card followed in its item by that separator and link pair now gets the link as a cell of its own after
   the text cell; the block draws it under the card box (blocks/carousel-cards). Cards without the pair, and the card's
   own hidden text, as before. Census of the local www snapshots: the shape is in none of them (083's giftvoucher only).
   Run: node --max-old-space-size=256 --test test/carousel-cards-link-below-so24.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { name, variants = [], cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', [name, ...variants].join(' '));
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) c.forEach((n) => td.append(n)); else if (c) td.append(c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

const card = (href, title, hidden) => `<div class="teaser event section"><a href="${href}" class="teaser card "><div class="image-wrapper"><img src="/content/dam/lh/images/local_images/local-pages/de/image.jpg.transform/lh-dcep-transform-width-1440/img.jpg" alt=""></div><div class="card-content"><h3 class="heading-copytext-large teaser-heading">${title}</h3><div class="teaser-description "><div class="richtext ellipsis"><p class="desc-inline">${title} text</p></div></div><div class="fading-dots"></div><div class="teaser-link-text"><span class="btn-link mb-0"><maui-icon class="icon-hyperlink icon" use="icon-hyperlink"></maui-icon><span>${hidden}</span></span></div></div></a></div>`;
const sep = '<div class="separator section"><div aria-hidden="true" style="margin-bottom: 10px;" class="hr hr-no-layout "><maui-divider role="separator" theme="lh"></maui-divider></div></div>';
const link = (href, text, variant, blank) => `<div class="link event section"><div class="maui-link"><maui-navigation-link size="large" href="${href}" variant="${variant}" theme="lh"${blank ? ' target="_blank"' : ''}>${text}<span class="sr-only"> The link will be opened in a new browser tab </span></maui-navigation-link></div></div>`;
const view = (items) => `<div class="threecolumn column event section"><div class="column-view flex-column "><div class="row">${items.map((i) => `<div class="col-md-6 col-lg column-view-item">${i}</div>`).join('')}</div></div></div>`;

const run = (html) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="container-content">${html}</div></main></body></html>`);
  return import('../tools/importer/parsers/carousel-cards.js').then(({ default: parse }) => {
    parse(document.querySelector('.threecolumn'), { document });
    return [...document.querySelectorAll('table[data-name] tr')];
  });
};

test('a card followed by the separator and link pair: the link as a cell of its own after the text', async () => {
  const rows = await run(view([
    card('https://www.lufthansa.com/de/en/book-and-manage/flights/giftvoucher#faqs', 'Frequently asked questions', 'Visit the FAQs') + sep + link('/de/en/book-and-manage/flights/giftvoucher#faqs', 'Visit the FAQs', 'anchor-down'),
    card('https://www.lufthansa.com/de/en/homepage', 'Do you already have a Gift Card?', 'Redeem on Lufthansa.com') + sep + link('/de/en/homepage', 'Redeem on Lufthansa.com', 'hyper'),
    card('https://voucher.lufthansa.com/lh/sales/new?locale=en', 'Arrives in your inbox', 'Continue') + sep + link('https://voucher.lufthansa.com/lh/sales/new?locale=en', 'Buy Gift Card now', 'external', true),
  ]));
  assert.equal(rows.length, 3);
  const below = rows.map((tr) => tr.querySelectorAll('td')[2]);
  assert.deepEqual(below.map((td) => td && td.textContent.trim()), ['Visit the FAQs', 'Redeem on Lufthansa.com', 'Buy Gift Card now']);
  assert.deepEqual(below.map((td) => td.querySelector('p > a').getAttribute('href')), ['/de/en/book-and-manage/flights/giftvoucher#faqs', '/de/en/homepage', 'https://voucher.lufthansa.com/lh/sales/new?locale=en']);
  assert.ok(!rows.some((tr) => /Continue|new browser tab/.test(tr.textContent)), "the card's hidden text and the screen-reader note stay out");
});

test('as before: a card without the pair, a link component without the separator before it', async () => {
  const rows = await run(view([
    card('https://www.lufthansa.com/de/en/homepage', 'Alone', 'Discover'),
    card('https://www.lufthansa.com/de/en/homepage', 'No separator', 'Discover') + link('/de/en/homepage', 'Terms and conditions of use', 'hyper'),
  ]));
  assert.deepEqual(rows.map((tr) => tr.querySelectorAll('td').length), [2, 2]);
  assert.ok(!rows.some((tr) => /Discover|Terms and conditions/.test(tr.textContent)));
});

test('blocks/carousel-cards: a cell of only link paragraphs after the text cell is the line under the card', () => {
  const js = fs.readFileSync(new URL('../blocks/carousel-cards/carousel-cards.js', import.meta.url), 'utf8');
  assert.match(js, /carousel-cards-below/);
  const css = fs.readFileSync(new URL('../blocks/carousel-cards/carousel-cards.css', import.meta.url), 'utf8');
  assert.match(css, /\.carousel-cards-below/);
});

/* standing order 32: on lufthansa.com phones the line 42px under the card (www at 390; 10px from 768px), the next card
   as far under the line as before: giftvoucher 19.8 -> 14.4 % at 390 */
test('blocks/carousel-cards: on lufthansa.com phones the line 42px under the card', () => {
  const css = fs.readFileSync(new URL('../blocks/carousel-cards/carousel-cards.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .carousel-cards .carousel-cards-slide.carousel-cards-has-below { margin-bottom: 66px; } body.brand-lufthansa .carousel-cards .carousel-cards-below { top: calc(100% + 42px); } }'));
  assert.ok(css.includes('.carousel-cards .carousel-cards-below { position: absolute; top: calc(100% + 10px);'), 'from 768px as before');
});
