/* eslint-disable import/extensions */
/* www.swiss.com's A350 stages (brief 503; SWISS parity row 43): a stage's button whose label is
   the stage's own heading (SWISS Wanderlust in every language; in el and it, also the facts and
   behind the scenes stages) is still written. withTeaserTexts added a button only when the block
   lacked its text, and the heading counted as that text: 15 of www's buttons were missing.
   Fixtures: test/fixtures/swiss-a350-stages-046: www's stages (swiss-snapshots-046, 2026-11-07;
   pictures, scripts and picture configs left out) and our 11 documents' stage blocks (preview).
   Run: node --test test/swiss-stage-buttons-503.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withTeaserTexts } from '../tools/importer/swiss-import.mjs';

const FIX = new URL('./fixtures/swiss-a350-stages-046/', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, FIX), 'utf8');
const ROOTS = ['ch-de', 'ch-en', 'ch-fr', 'ch-it', 'ch-es', 'ch-pt', 'ch-el', 'ch-ja', 'ch-ru', 'ch-zh', 'kr-ko'];
const STAGES = ['facts', 'cabin', 'special-livery', 'production'];
// links into a stage page, per stage: its count in a document
const links = (doc, stage) => (doc.match(new RegExp(`<a href="[^"]*/discover/a350/${stage}"`, 'g')) || []).length;
// www's button label per stage, in a root
const label = (root, stage) => {
  const m = read(`${root}.html`).match(new RegExp(`<maui-button-link[^>]*href="[^"]*/a350/${stage}"[^>]*>([\\s\\S]*?)</maui-button-link>`));
  return m[1].replace(/\u200B/g, '').replace(/\s+/g, ' ').trim();
};

test('withTeaserTexts: every stage gets www\'s button, also one whose label is the stage\'s heading (11 languages)', () => {
  let added = 0;
  ROOTS.forEach((root) => {
    const ours = read(`ours-${root}.html`);
    const r = withTeaserTexts(ours, read(`${root}.html`));
    STAGES.forEach((stage) => {
      assert.equal(links(r.doc, stage), 1, `${root} ${stage}: one button`);
      assert.ok(r.doc.includes(`>${label(root, stage)}</a></p>`), `${root} ${stage}: www's label`);
      added += links(r.doc, stage) - links(ours, stage);
    });
    assert.equal(withTeaserTexts(r.doc, read(`${root}.html`)).made, 0, `${root}: once`);
  });
  // Wanderlust's in all 11; facts' and behind the scenes' in el and it
  assert.equal(added, 15);
});

test('withTeaserTexts: a button whose label is the heading goes after the stage\'s text, the text as it was', () => {
  const ours = read('ours-ch-it.html');
  const r = withTeaserTexts(ours, read('ch-it.html'));
  const block = r.doc.split('\n').find((b) => b.includes('<h2 id="fatti-e-cifre">'));
  assert.match(block, /<h2 id="fatti-e-cifre">Fatti e cifre<\/h2><p>A partire dal 2025[^<]*<\/p><p><a href="[^"]*\/ch\/it\/discover\/a350\/facts">Fatti e cifre<\/a><\/p><\/div>/);
  // no paragraph of www's written twice
  assert.equal(r.doc.split('<p>').length - ours.split('<p>').length, 2 + 1);
});
