/* eslint-disable max-len */
/* An accordion's title breaks a word longer than its line (the brief after 509, item 2; Air
   Dolomiti row 73): the title is a flex row, its text an anonymous flex item that cannot shrink
   below its longest word, so Air Dolomiti's 34 px FAQ titles on German pages ("Handgepäckbestimmungen
   für Flüssigkeiten", "Lawinenrettungsrucksäcke") made seven pages up to 105 px wider than a 390
   screen (the self-check of the published pages). overflow-wrap: anywhere lets that item shrink and
   break only a word that does not fit: the block's common rule (no theme sets wrapping,
   test/heading-wrap.test.mjs), a no-op for every word that fits.
   Run: node --max-old-space-size=512 --test test/accordion-title-wrap-510.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 73: an accordion title breaks a word longer than its line', () => {
  assert.match(css, /\.accordion-columns \.accordion-columns-title \{[^}]*overflow-wrap: anywhere;[^}]*\}/);
});
