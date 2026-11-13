/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 546, item 1 (lh-snapshots-089: /gb/en, /de/de and /at/de articles/tags/allegris). The grey band's
   Allegris stage teaser has a "Conditions" / "Konditionen" dialog button under the tile
   (.stage-teaser > maui-link-button.modal-trigger after the tile's link). Its dialog is empty on www. The import
   dropped it, so the band came out 66 px shorter. The user's decision: the label only, without a dialog. The parser
   writes it as a small-print paragraph after the block (the cleanup turns p.copytext-small into "{copytext-small}").
   Nothing else of the teaser changes.
   Run: node --max-old-space-size=256 --test test/cards-teaser-conditions-546.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let out;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { variants = [], cells }) => {
      out = { variants, cells };
      const t = document.createElement('table');
      t.innerHTML = '<tr><th>Cards Teaser</th></tr>';
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/cards-teaser.js');

const stage = (cond) => `<div class="stage event"><div class="stage-teaser"><a href="/gb/en/allegris" class="stage-teaser-link stage-teaser-link-light"><div class="moving-image"><figure><img src="https://www.lufthansa.com/a.jpg" alt="A man"></figure></div><div class="stage-teaser-overlay"><h2 class="stage-teaser-headline">Lufthansa Allegris</h2><h3 class="stage-teaser-subheadline">The New Long-Haul Experience </h3><div class="stage-teaser-overlay-bottom"><maui-button-mimic type="secondary"><span>Discover Now</span></maui-button-mimic></div></div></a>${cond}</div></div>`;
const COND = '<maui-link-button as="button" class="modal-trigger" data-target="#cond-modal-934858" aria-label="Conditions Lufthansa Allegris The New Long-Haul Experience "><maui-icon slot="icon" use="icon-dialog"></maui-icon><span class="">Conditions</span></maui-link-button><maui-modal class="richtext" id="cond-modal-934858"><p><br></p></maui-modal>';
const run = (cond) => {
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="onecolumn column event"><div class="column-view flex-column container-gray"><div class="row"><div class="col-lg column-view-item">${stage(cond)}</div></div></div></div></div></body></html>`);
  parse(document.querySelector('.onecolumn'), { document });
  return document.querySelector('.section-content');
};

test('the stage teaser\'s Conditions button: its label as small print after the block, no dialog', () => {
  const host = run(COND);
  const after = host.querySelector('table').nextElementSibling;
  assert.ok(after, 'a paragraph after the block');
  assert.equal(after.outerHTML, '<p class="copytext-small">Conditions</p>');
  assert.ok(!host.querySelector('maui-modal, maui-link-button'), 'neither the dialog nor the button left');
  assert.ok(!JSON.stringify(out.cells.map((r) => r.map((c) => (c.outerHTML || (Array.isArray(c) ? c.map((x) => x.outerHTML).join('') : c))))).includes('Conditions'), 'not in the card');
  assert.deepEqual(out.variants, ['overlay']);
});

test('a German one, and a teaser without the button as before', () => {
  assert.equal(run(COND.replace('>Conditions<', '>Konditionen<')).querySelector('table').nextElementSibling.textContent, 'Konditionen');
  const plain = run('');
  assert.equal(plain.querySelector('table').nextElementSibling, null);
});
