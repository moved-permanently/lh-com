/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* A stage teaser of its own in an Insights page (brief 464, item 6; www's /de/en/articles/tags/munich
   "A Perfect Day / Munich in One Day / Discover now" over the Isar picture, in a grey band after a
   headline and a text; tags/allegris, all-it-takes-is-a-yes, winter-destinations: 17 documents). The
   import made it a linked picture, two headings and a link under the picture. The insights
   template now gives it the cards-teaser parser, which makes it one overlay card with the option
   wide: the picture | the headline (h3), the subheadline, the button label as an italic link
   (the block's secondary button). The band's headline and text stay default content before it.
   Run: node --max-old-space-size=256 --test test/stage-teaser-lone-464.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

let created;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, variants, cells }) => {
      created = { name, variants, cells };
      const t = document.createElement('table');
      t.dataset.name = name;
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/cards-teaser.js');
const html = fs.readFileSync(new URL('./fixtures/stage-teaser/de-en-tags-munich.html', import.meta.url), 'utf8');
const SELECTOR = '.onecolumn > .column-view > .row > .column-view-item > .stage:has(> .stage-teaser)';
const IN_SECTION = ':is(.section-content, .container-content) > .stage:has(> .stage-teaser)';

test('the lone stage teaser: one overlay card, option wide', () => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  const stage = document.querySelector(SELECTOR);
  assert.ok(stage, 'the insights selector matches');
  created = null;
  parse(stage, { document });
  assert.deepEqual(created.variants, ['overlay', 'wide']);
  assert.equal(created.cells.length, 1);
  const [image, body] = created.cells[0];
  assert.match(image.getAttribute('src'), /lh_blog_munich_isar/);
  assert.deepEqual(body.map((el) => [el.tagName, el.textContent.trim()]), [['H3', 'A Perfect Day'], ['P', 'Munich in One Day'], ['P', 'Discover now']]);
  const a = body[2].querySelector('em > a');
  assert.ok(a && /a-perfect-day-munich/.test(a.getAttribute('href')));
  // the band's headline and text are not taken
  assert.ok(document.body.textContent.includes('Insider Tips') || document.querySelector('.headline'), 'the headline stays');
});

test('the insights template maps it, after its other cards-teaser selectors', () => {
  const j = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
  const t = (j.templates || j).find((x) => x.name === 'insights');
  const b = t.blocks.find((x) => x.name === 'cards-teaser');
  assert.ok(b.instances.includes(SELECTOR) && b.instances.includes(IN_SECTION));
});

test('lufthansa.com option wide: the card across the row, www\'s horizontal gradient, the subheadline light, the button white outlined', () => {
  const css = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('.cards-teaser.overlay.wide > ul { grid-template-columns: minmax(0, 1fr); }'));
  assert.ok(css.includes('.cards-teaser.overlay.wide .cards-teaser-image::after { background-image: linear-gradient(to right, #282828cc, #28282800 70%); }'));
});
