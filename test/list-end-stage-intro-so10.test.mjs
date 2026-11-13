/* eslint-disable max-len */
/* Standing order 10 (2026-11-12), item 2: the two HOLD rules of ranking-so9-lh-com.txt, released as written there.
   - list-end (blocks/columns-media): on phones a stacked Columns Media text cell that ends with a list keeps 24px to
     the next cell, not the 36px a cell ending with a link has (www zeroes the list's margin, the column-view item keeps
     its own). 390, % off www injected: hearing-impairment 7.9 -> 6.0, visual-impairment 6.3 -> 4.3,
     cognitive-impairment 6.8 -> 5.9, passengers-with-sensory-impairment 6.7 -> 5.4; schengen, sports-baggage and
     payment-options worse on the whole page (earlier drifts of their own), their blocks better.
   - stage-intro-padded (styles.css): a stage (not a flush one), then a section of default content only, then a padded
     or grey section: 64px under the intro (www's .mb-default and its section padding; ours was 16-17px short).
     1440: my-bookings 7.4 -> 4.6, seat-maps 7.8 -> 4.9; air-baltic 4.8 -> 5.4 (a later drift of its own).
   Run: node --max-old-space-size=256 --test test/list-end-stage-intro-so10.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const LIST = 'body.brand-lufthansa .columns-media:not(.slider, .sidebar) .columns-media-row > .columns-media-text:not(:last-child):has(> :is(ul, ol):last-child)';
const STAGE = 'body.brand-lufthansa main > .section.stage:not(.flush) + .section:not(.padded, .grey, .stage, .spaced, .flush, .column-view):has(> .default-content-wrapper:only-child):has(+ .section:is(.padded, .grey))';
const body = (css, sel) => {
  const i = css.indexOf(`${sel} {`);
  return i < 0 ? null : { i, rule: css.slice(i + sel.length, css.indexOf('}', i)) };
};

test('list-end: below 768px, 24px under a stacked text cell that ends with a list', () => {
  const css = read('../blocks/columns-media/columns-media.css');
  const r = body(css, LIST);
  assert.ok(r, 'the rule');
  assert.match(r.rule, /margin-bottom: 24px;/);
  const media = css.lastIndexOf('@media', r.i);
  assert.ok(css.slice(media, r.i).startsWith('@media (width < 768px) {'), 'phones only');
});

test('stage-intro-padded: 64px under the intro between a stage and a padded or grey section, every width', () => {
  const css = read('../styles/styles.css');
  const r = body(css, STAGE);
  assert.ok(r, 'the rule');
  assert.match(r.rule, /margin-bottom: 64px;/);
  assert.ok(!/@media[^{]*\{ $/.test(css.slice(0, r.i)), 'not the first rule of a media query (measured at 1440 and 390)');
});

test('both lufthansa.com only, flush stages left out, one :has() level', () => {
  assert.ok(LIST.startsWith('body.brand-lufthansa ') && STAGE.startsWith('body.brand-lufthansa '));
  assert.ok(STAGE.includes('.stage:not(.flush)'));
  [LIST, STAGE].forEach((s) => assert.ok(!/:has\([^)]*:has\(/.test(s), s));
});
