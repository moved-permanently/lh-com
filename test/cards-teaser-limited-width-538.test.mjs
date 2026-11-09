/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* A teaser card's text in a .richtext.limited-width (brief 538 item 2, lh-parity-004a's /de/de/meetings-and-events:
   the steps "01 Anfrage absenden" … "03"). www draws that text at two thirds of its column from 1025 px (256 px of the
   card's 410 at 1440, three lines); ours ran over the whole card (two lines), and the steps' button sat 27 px higher. The
   cards-teaser parser keeps the class, as the columns-media parser does, so the cleanup writes "{limited-width}"; the
   block draws such text at 66 % of the card from 1025 px.
   Run: node --max-old-space-size=256 --test test/cards-teaser-limited-width-538.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

let created;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      created = { name, cells };
      const t = document.createElement('table');
      t.dataset.name = name;
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/cards-teaser.js');

const item = (n, limited) => `<div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><div class="image-wrapper"><img src="https://www.lufthansa.com/content/dam/lh/images/n${n}.png" alt=""></div></div><div class="headline section"><h3 class="headline">Step ${n}</h3></div><div class="text section"><div class="richtext ${limited ? ' limited-width' : ''}"><p>Text ${n}</p><ul><li>Item ${n}</li></ul></div></div></div>`;
const page = (items) => parseHTML(`<html><body><div class="threecolumn column event section"><div class="column-view flex-column"><div class="row">${items}</div></div></div></body></html>`).document;
const body = (cells, i) => cells[i][1];

test('a card\'s text in a .richtext.limited-width keeps the class (the cleanup\'s "{limited-width}")', () => {
  const document = page(`${item(1, true)}${item(2, false)}`);
  created = null;
  parse(document.querySelector('.threecolumn'), { document });
  assert.equal(created.name, 'cards-teaser');
  const limited = body(created.cells, 0).filter((el) => /^(P|UL)$/.test(el.tagName));
  assert.ok(limited.length >= 2, limited.map((e) => e.tagName).join(' '));
  limited.forEach((el) => assert.ok(el.classList.contains('limited-width'), `${el.tagName} limited`));
  body(created.cells, 1).filter((el) => /^(P|UL)$/.test(el.tagName)).forEach((el) => assert.ok(!el.classList.contains('limited-width'), `${el.tagName} not limited`));
});

test('the block draws {limited-width} text at 66 % of the card from 1025 px', () => {
  const css = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const at = css.indexOf('.cards-teaser .cards-teaser-body > :is(p, ul, ol).limited-width {');
  assert.ok(at >= 0, 'the rule');
  assert.match(css.slice(at, css.indexOf('}', at)), /max-width: 66%;/);
  const before = css.slice(0, at);
  assert.ok(/@media \(width >= 1025px\) \{[^{}]*$/.test(before), 'from 1025 px');
});
