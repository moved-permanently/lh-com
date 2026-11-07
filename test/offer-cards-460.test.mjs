/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* www's "Exclusive Offers & Benefits" on the de/en homepage (brief 460, your answer: render www's
   four cards). It is a Monetate experiment (section.vt-comm551-offers after the destination finder,
   injected in the browser); the 11-06 import made it a list with title and text run together. The
   cleanup now makes it a grey band (.container-gray: lufthansa-sections makes it a grey section)
   with the headline and a Cards Icon Text (mini) block, one row per card: the round image | title,
   text, link. The option mini draws www's cards: white, 8px radius, a soft shadow, 20px padding,
   a 56px round image 12px before the text, LufthansaHead 18px bold title, 14px/1.5 #333 text;
   4 a row from 1200px, 2 from 768px, 1 below, 20px apart (rows 10px below 768px), 24px under each
   card as www's list items; the band 32px padded below 768px.
   Run: node --max-old-space-size=256 --test test/offer-cards-460.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

let created;
globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { name, cells }) => {
      created = { name, cells };
      const t = document.createElement('table');
      t.dataset.name = name;
      cells.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((c) => {
          const td = document.createElement('td');
          if (c && c.nodeType) td.append(c); else td.textContent = c || '';
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

const URL_DE_EN = 'https://www.lufthansa.com/de/en/homepage';
const fixture = fs.readFileSync(new URL('./fixtures/offer-cards/de-en-homepage.html', import.meta.url), 'utf8');

const run = () => {
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="container-content">${fixture}</div></main></body></html>`);
  const payload = { document, url: URL_DE_EN, params: { originalURL: URL_DE_EN } };
  created = null;
  transform('beforeTransform', document.body, payload);
  return document;
};

test('the experiment becomes a grey band with the headline and a Cards Icon Text (mini) block', () => {
  const document = run();
  assert.ok(!document.querySelector('section.vt-comm551-offers'));
  const band = document.querySelector('.section-content > .container-gray');
  assert.ok(band, 'a grey band in a section-content');
  assert.equal(band.querySelector('h2').textContent, 'Exclusive Offers & Benefits');
  assert.equal(created.name, 'Cards Icon Text (mini)');
  assert.equal(created.cells.length, 4);
  assert.ok(band.querySelector('table[data-name="Cards Icon Text (mini)"]'));
});

test('each row: the round image | the title, the text and the link', () => {
  run();
  const [image, body] = created.cells[0];
  assert.equal(image.tagName, 'IMG');
  assert.equal(image.getAttribute('src'), 'https://sb.monetate.net/img/1/1476/6183407.jpg');
  assert.equal(image.getAttribute('alt'), '');
  assert.equal(body.querySelector('h3').textContent, 'Lufthansa Surprise');
  assert.equal(body.querySelector('p').textContent, "Choose your favourite type of travel and be surprised where you'll fly to!");
  const a = body.querySelector('p > a');
  assert.ok(a.getAttribute('href') === 'https://www.lufthansa-surprise.com/travel-theme?lang=en' && a.textContent === 'Lufthansa Surprise');
  assert.deepEqual(created.cells.map(([, b]) => b.querySelector('h3').textContent), ['Lufthansa Surprise', 'Gift Cards', 'Student Fares', 'Miles & More Credit Cards']);
});

test('the option mini as www\'s cards', () => {
  const css = fs.readFileSync(new URL('../blocks/cards-icon-text/cards-icon-text.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const M = '.cards-icon-text.mini';
  assert.ok(css.includes(`${M} > ul { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px 20px; }`));
  assert.ok(css.includes(`@media (width < 768px) { main > .section.grey:has(> .cards-icon-text-wrapper > ${M}) { padding: 32px 0; } }`));
  assert.ok(css.includes(`${M} > ul > li { margin: 0 0 24px; }`));
  assert.ok(css.includes(`${M} .cards-icon-text-card { align-items: stretch; gap: 12px; padding: 20px; border: 1px solid transparent; border-radius: 8px; background: #fff; box-shadow: 0 2px 4px rgb(5 22 77 / 10%); color: #333; font-size: 14px; font-weight: 400; line-height: 1.5; transition: box-shadow 0.2s ease, border-color 0.2s ease; }`));
  assert.ok(css.includes(`${M} .cards-icon-text-icon :is(picture, img) { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }`));
  assert.ok(css.includes(`${M} .cards-icon-text-title { margin: 0 0 5px; color: #05164d; font-family: var(--heading-font-family); font-size: 18px; font-weight: 700; line-height: 1.1; }`));
  assert.ok(css.includes(`@media (width >= 768px) { ${M} > ul { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 20px; } ${M} > ul > li { margin-right: 0; } }`));
  assert.ok(css.includes(`@media (width >= 1200px) { ${M} > ul { grid-template-columns: repeat(4, minmax(0, 1fr)); } }`));
});
