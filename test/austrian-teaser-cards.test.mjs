/* eslint-disable max-len, import/extensions -- dev tooling */
/* global globalThis */
/* Austrian's teaser cards (austrian-parity-002, brief 427 package): www.austrian.com shows a card's
   link line ("→ Zur Reisevorbereitung", .teaser-link-text, hidden on lufthansa.com) and puts the
   cards of a two-column view two to a row (/at/de/familien). The import marks Austrian's cards
   (withTeaserCta: data-import-cta), and the carousel-cards parser adds the marked card's link line
   as a link paragraph (lufthansa.com's unmarked cards as before); a two-column view of teasers
   becomes a three-column one (found at any depth) marked data-import-two-up, which the parser makes
   a two-up grid.
   Run: node --max-old-space-size=512 --test test/austrian-teaser-cards.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
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

const card = (attr = '') => `<div class="teaser event"><a href="https://www.austrian.com/at/de/reisevorbereitung-mit-der-familie" class="teaser card "${attr}><div class="image-wrapper"><img src="/content/dam/aua/x.jpg" alt=""></div><div class="card-content"><h4 class="heading-copytext-large teaser-heading">Vorbereitung für Familien</h4><div class="teaser-description "><div class="richtext ellipsis"><p class="desc-inline">Finden Sie Tipps.</p></div></div></div><div class="teaser-link-text"><span class="btn-link mb-0"><maui-icon class="icon-hyperlink"></maui-icon>Zur Reisevorbereitung</span></div></a></div>`;
const view = (cls, items) => `<div class="${cls} column event section"><div class="column-view flex-column"><div class="row">${items.map((i) => `<div class="col-md-6 col-lg column-view-item">${i}</div>`).join('')}</div></div></div>`;

test('the parser: a marked card\'s link line as a link paragraph after the description; an unmarked card as before', async () => {
  const { default: parse } = await import('../tools/importer/parsers/carousel-cards.js');
  const run = (attr) => {
    const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="container-content">${view('twocolumn', [card(attr), card(attr)])}</div></main></body></html>`);
    parse(document.querySelector('.twocolumn'), { document });
    return document.querySelector('table[data-name]');
  };
  const marked = run(' data-import-cta=""');
  assert.equal(marked.getAttribute('data-name'), 'carousel-cards grid two-up');
  const cell = marked.querySelector('tr td:last-child');
  const last = cell.lastElementChild;
  assert.equal(last.tagName, 'P');
  assert.equal(last.querySelector('a').getAttribute('href'), 'https://www.austrian.com/at/de/reisevorbereitung-mit-der-familie');
  assert.equal(last.textContent.trim(), 'Zur Reisevorbereitung');
  const plain = run('');
  assert.ok(![...plain.querySelectorAll('td p')].some((p) => /Zur Reisevorbereitung/.test(p.textContent)), 'lufthansa.com: no link line');
});

test('the parser: a three-column view marked data-import-two-up (a converted two-column one) is a two-up grid', async () => {
  const { default: parse } = await import('../tools/importer/parsers/carousel-cards.js');
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="container-content"><div class="onecolumn">${view('threecolumn', [card(), card()]).replace('section">', 'section" data-import-two-up="">')}</div></div></main></body></html>`);
  parse(document.querySelector('.threecolumn'), { document });
  assert.equal(document.querySelector('table[data-name]').getAttribute('data-name'), 'carousel-cards grid two-up');
});

test('austrian-import.mjs: its cards marked; a two-column view of teasers a three-column view marked two-up', async () => {
  const { withTeaserCta, withTeaserColumns } = await import('../tools/importer/austrian-import.mjs');
  assert.match(withTeaserCta(card()), /class="teaser card " data-import-cta=""/);
  assert.equal(withTeaserCta(withTeaserCta(card())).match(/data-import-cta/g).length, 1, 'once');
  // a two-column view of teasers: a three-column view (lh-com's info importer finds it at any depth)
  // marked for the parser's two-up grid (www's two cards a row)
  const pure = withTeaserColumns(view('twocolumn', [card(), card()]));
  assert.match(pure, /^<div class="threecolumn column event section" data-import-two-up="">/);
});

test('row 41: lh-com\'s parser makes Austrian\'s card row with www\'s .hidden-lg-up swiper copy a phone-slider grid (115ea542)', async () => {
  const { default: parse } = await import('../tools/importer/parsers/carousel-cards.js');
  const swiper = `<div class="carousel"><div class="hidden-md-down"><div class="row">${[card(), card(), card()].map((c) => `<div class="col-lg column-view-item">${c}</div>`).join('')}</div></div><div class="hidden-lg-up"><div><div class="swiper"><div class="swiper-wrapper">${[card(), card(), card()].map((c) => `<div class="swiper-slide">${c}</div>`).join('')}</div></div></div></div></div>`;
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="container-content"><div class="threecolumn column event section"><div class="column-view flex-column container-gray full-width-bg">${swiper}</div></div></div></main></body></html>`);
  parse(document.querySelector('.threecolumn'), { document });
  const table = document.querySelector('table[data-name]');
  assert.equal(table.getAttribute('data-name'), 'carousel-cards grid phone-slider');
  assert.equal(table.querySelectorAll('tr').length, 3, 'the desktop copy only');
});

test('row 41: the cleanup drops a mobile copy the same as the desktop one before the parser (removeMobileDuplicates), so the view marked data-import-phone-slider (Austrian: withPhoneSliders) is phone-slider without it', async () => {
  const { default: parse } = await import('../tools/importer/parsers/carousel-cards.js');
  const run = (attr) => {
    const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="container-content">${view('threecolumn', [card(), card(), card()]).replace('section">', `section"${attr}>`)}</div></main></body></html>`);
    parse(document.querySelector('.threecolumn'), { document });
    return document.querySelector('table[data-name]').getAttribute('data-name');
  };
  assert.equal(run(' data-import-phone-slider=""'), 'carousel-cards grid phone-slider');
  assert.equal(run(''), 'carousel-cards grid', 'unmarked as before');
  assert.equal(run(' data-import-two-up="" data-import-phone-slider=""'), 'carousel-cards grid two-up', 'two-up as main has it');
});

test('austrian-import.mjs withPhoneSliders: a column view of teaser cards with a .hidden-lg-up swiper copy marked; others as they were', async () => {
  const { withPhoneSliders } = await import('../tools/importer/austrian-import.mjs');
  const swiper = `<div class="carousel"><div class="hidden-md-down"><div class="row"><div class="col-lg column-view-item">${card()}</div></div></div><div class="hidden-lg-up"><div><div class="swiper"><div class="swiper-wrapper"><div class="swiper-slide">${card()}</div></div></div></div></div></div>`;
  const three = `<div class="threecolumn column event section"><div class="column-view flex-column container-gray">${swiper}</div></div>`;
  assert.match(withPhoneSliders(three), /^<div class="threecolumn column event section" data-import-phone-slider="">/);
  assert.equal(withPhoneSliders(withPhoneSliders(three)).match(/data-import-phone-slider/g).length, 1, 'once');
  const noSwiper = view('threecolumn', [card(), card()]);
  assert.equal(withPhoneSliders(noSwiper), noSwiper);
  const noCards = three.split(card()).join('<div class="image"></div>');
  assert.equal(withPhoneSliders(noCards), noCards);
});

test('the mapping chain marks the cards', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /export const mappedOf = \(html, p\) => withoutLoads\(withNestedOnecolumnUnwrapped\(withPanelWrappersUnwrapped\(withTabMarkers\(withTeaserCta\(withPhoneSliders\(withTeaserColumns\(/);
});
