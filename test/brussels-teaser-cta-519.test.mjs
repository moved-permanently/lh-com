/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 517, item 3 (Brussels against the recordings, brussels.turnsthe.page): www.brusselsairlines.com shows a card
   teaser's link line (a.teaser.card > .teaser-link-text: "Fasten up for perks", "En savoir plus", red with an arrow; hidden
   on lufthansa.com, so lh-com's carousel-cards parser leaves it out). On the recorded pages /be/en/jobs (3 cards),
   connecting-africa en and fr (4 of 8) and /be/fr/our-company (12) ours has the cards without it: jobs -73 px per card
   row at 390, connecting-africa -221 px before "Autres sujets" at 1440. brussels-import.mjs marks the cards as
   austrian-import.mjs does (withTeaserCta: data-import-cta), and the parser adds the marked card's line as a link.
   Markup: the recording of www.brusselsairlines.com/be/en/jobs (brief 497), a card trimmed.
   Run: node --max-old-space-size=256 --test test/brussels-teaser-cta-519.test.mjs */
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

const card = (title, line) => `<div class="teaser event section"><a href="https://www.brusselsairlines.com/be/en/jobs/benefits" class="teaser card "><div class="image-wrapper"><img src="/content/dam/bel/images/x.png.transform/lh-dcep-transform-width-1440/img.jpg" alt="A Brussels airplane"></div><div class="card-content"><h2 class="heading-copytext-large teaser-heading">${title}</h2><div class="teaser-description "><div class="richtext ellipsis"><span class="line-wrap-n-1"><p class="desc-inline">Whether it's about flexibility, working at Brussels Airlines really pays off.</p></span></div></div><div class="teaser-link-text"><span class="btn-link mb-0"><maui-icon class="icon-hyperlink icon" use="icon-hyperlink"></maui-icon><span>${line}</span></span></div></div></a></div>`;
const view = (items) => `<div class="threecolumn column event section"><div class="column-view flex-column "><div class="row">${items.map((i) => `<div class="col-md-6 col-lg column-view-item">${i}</div>`).join('')}</div></div></div>`;

test('brussels-import.mjs marks its cards (data-import-cta), once', async () => {
  const { withTeaserCta } = await import('../tools/importer/brussels-import.mjs');
  const html = view([card('Also in terms of benefits, the sky’s the limit', 'Fasten up for perks')]);
  assert.match(withTeaserCta(html), /class="teaser card " data-import-cta=""/);
  assert.equal(withTeaserCta(withTeaserCta(html)).match(/data-import-cta/g).length, 1);
});

test('the marked cards through the parser: each card\'s line a link after its description', async () => {
  const { withTeaserCta } = await import('../tools/importer/brussels-import.mjs');
  const { default: parse } = await import('../tools/importer/parsers/carousel-cards.js');
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="container-content">${withTeaserCta(view([card('Benefits', 'Fasten up for perks'), card('Values', 'What we stand for'), card('Highlights', 'Check all highlights')]))}</div></main></body></html>`);
  parse(document.querySelector('.threecolumn'), { document });
  const lines = [...document.querySelectorAll('table[data-name] tr td:last-child')].map((td) => td.lastElementChild);
  assert.deepEqual(lines.map((p) => p.textContent.trim()), ['Fasten up for perks', 'What we stand for', 'Check all highlights']);
  assert.ok(lines.every((p) => p.querySelector('a[href="https://www.brusselsairlines.com/be/en/jobs/benefits"]')));
});

test('the import marks the snapshot before the bulk import (the mapped copy\'s chain)', () => {
  const src = fs.readFileSync(new URL('../tools/importer/brussels-import.mjs', import.meta.url), 'utf8');
  const chain = src.match(/const mapped = (.*)/)[1];
  assert.match(chain, /withTeaserCta\(/);
});
