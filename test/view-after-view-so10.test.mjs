/* eslint-disable max-len */
/* Standing order 10 (2026-11-12), item 1: /de/en/imprint got worse (4.2 -> 8.8 % off www at 1440, 7.6 -> 9.9 at 390).
   www holds its chapters as twocolumn column views one after another in one AEM section: each view's 3.2rem padding,
   64px between two views, no .mb-default between them. Ours has each view as a section of its own with a padded
   Columns Media: 8px under its last row, our 48px section gap (which stands for www's 32px and an AEM section's
   .mb-default), then the next view's 32px: 88px, so every chapter sat 24px lower than www's. A section of only a padded
   Columns Media followed by a view that opens with its title (a heading with the column-start mark) keeps 24px under
   it: imprint 8.8 -> 7.2 at 1440, 9.9 -> 9.2 at 390, the other recorded legal pages as before. Standing order 11: the
   same before a padded Columns Media (rule A; imprint 5.2 / 8.3) ships with lufthansa-insights-imprint's cell-end
   spacers (delta-so11-insights-imprint-cell-spacers-lh-com.txt: its import dropped www's empty paragraphs at the end
   of two views); with both, insights-imprint 3.4 / 6.8 against 3.2 / 6.5 today. Not before other blocks, text or
   heroes: those are AEM sections of their own on www.
   Run: node --max-old-space-size=256 --test test/view-after-view-so10.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const N = '.section:not(.padded, .grey, .stage, .spaced, .flush, .column-view, .campaign-section)';
const VIEW = `body.brand-lufthansa main > ${N}:has(> .columns-media-wrapper:only-child > .columns-media.padded:not(.sidebar))`;
const A = `${VIEW}:has(+ ${N} > .columns-media-wrapper:first-child > .columns-media.padded:not(.sidebar))`;
const B = `${VIEW}:has(+ ${N} > .default-content-wrapper:first-child > :is(h2, h3).column-start:first-child)`;

test('a view section before another view (a padded Columns Media, or a titled view): 24px under it (www: 64px between two views, ours had 88)', () => {
  const i = css.indexOf(`${B}, ${A} {`);
  assert.ok(i >= 0, 'the rule, both cases');
  const rule = css.slice(i, css.indexOf('}', i));
  assert.match(rule, /margin-bottom: 24px;/);
});

test('lufthansa.com only, not before a hero, text or another block, one :has() level', () => {
  [A, B].forEach((s) => {
    assert.ok(s.startsWith('body.brand-lufthansa '));
    assert.ok(!/:has\([^)]*:has\(/.test(s));
  });
  assert.ok(!css.includes(`${VIEW}:has(+ ${N}) {`), 'not before any section');
});
