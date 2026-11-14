/* eslint-disable max-len, import/extensions */
/* Standing order 20 (2026-11-13): the delta tools for DA's copies of this order's importer changes.
   - block-option-apply.mjs: Jump Links of www's ul.responsive lists get option stacked (test/jump-links-stacked-so20);
   - paragraph-spacer-apply.mjs: www's empty line ({spacer-56}) before the paragraph after it (test/empty-lines-so20).
   Each changes only what its row names, byte for byte otherwise; not found, twice or there already: no change.
   Run: node --max-old-space-size=256 --test test/delta-tools-so20.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyBlockOption } from '../tools/importer/block-option-apply.mjs';
import { applyParagraphSpacer } from '../tools/importer/paragraph-spacer-apply.mjs';

const jump = '<div class="jump-links"><div><div><a href="#rapid">Rapid help</a></div></div><div><div><a href="#faq">FAQs</a></div></div></div>';
const other = '<div class="jump-links"><div><div><a href="#a">Other</a></div></div></div>';

test('block option: the named block gets the class, nothing else changes', () => {
  const doc = `<main><div><p>Intro</p>${jump}${other}</div></main>`;
  const r = applyBlockOption(doc, [{ block: 'jump-links', text: 'Rapid help', add: 'stacked' }]);
  assert.equal(r.results[0].result, 'placed');
  assert.equal(r.html, doc.replace('<div class="jump-links"><div><div><a href="#rapid">', '<div class="jump-links stacked"><div><div><a href="#rapid">'));
  const again = applyBlockOption(r.html, [{ block: 'jump-links', text: 'Rapid help', add: 'stacked' }]);
  assert.equal(again.results[0].result, 'there already');
  assert.equal(applyBlockOption(doc, [{ block: 'jump-links', text: 'Nothing', add: 'stacked' }]).html, doc);
  assert.equal(applyBlockOption(`${doc}${doc}`, [{ block: 'jump-links', text: 'Rapid help', add: 'stacked' }]).results[0].result, 'found more than once');
});

test('paragraph spacer: before the named paragraph, nothing else changes', () => {
  const doc = '<div><ul><li>€600.00.</li></ul><p>The distance is calculated based on the last destination</p><p>Next</p></div>';
  const r = applyParagraphSpacer(doc, [{ text: 'The distance is calculated', n: 56 }]);
  assert.equal(r.results[0].result, 'placed');
  assert.equal(r.html, '<div><ul><li>€600.00.</li></ul><p>{spacer-56}</p><p>The distance is calculated based on the last destination</p><p>Next</p></div>');
  assert.equal(applyParagraphSpacer(r.html, [{ text: 'The distance is calculated', n: 56 }]).results[0].result, 'there already');
  assert.equal(applyParagraphSpacer(doc, [{ text: 'Nothing', n: 56 }]).html, doc);
  const pretty = '<div>\n  <ul>\n    <li>x</li>\n  </ul>\n  <p>The distance is calculated</p>\n</div>';
  assert.equal(applyParagraphSpacer(pretty, [{ text: 'The distance', n: 56 }]).html, '<div>\n  <ul>\n    <li>x</li>\n  </ul>\n  <p>{spacer-56}</p><p>The distance is calculated</p>\n</div>');
});

test('paragraph spacer, all: before each of identical paragraphs (wheelchair-batteries)', () => {
  const doc = '<ul><li>a</li></ul><p>Batteries designed to be removed</p><ul><li>b</li></ul><p>Batteries designed to be removed</p>';
  assert.equal(applyParagraphSpacer(doc, [{ text: 'Batteries designed', n: 56 }]).results[0].result, 'found more than once');
  const r = applyParagraphSpacer(doc, [{ text: 'Batteries designed', n: 56, all: true }]);
  assert.equal(r.results[0].result, 'placed 2');
  assert.equal(r.html, '<ul><li>a</li></ul><p>{spacer-56}</p><p>Batteries designed to be removed</p><ul><li>b</li></ul><p>{spacer-56}</p><p>Batteries designed to be removed</p>');
});
