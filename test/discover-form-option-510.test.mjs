/* eslint-disable max-len */
/* Discover, a form's long option label on phones (the brief after 509, item 2; Discover row 39): the
   firearm registration forms (de/de register-hunting-firearm, register-sporting-firearm) have a
   radio option whose label is one long word joined by slashes ("Einzellader/Repetierbüchse/..."); as
   a flex item it could not shrink below that word, so at 390 the page was 65 px wider than the
   screen (the self-check of the published pages; no recording of these pages). The label shrinks
   and breaks inside the word where it must: the form block's common rule (no theme sets wrapping,
   test/heading-wrap.test.mjs), a no-op for every word that fits.
   Run: node --max-old-space-size=512 --test test/discover-form-option-510.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/form/form.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 39: a form option\'s label shrinks with the line and breaks a long word', () => {
  assert.match(css, /\.form \.form-option-label \{[^}]*min-width: 0;[^}]*overflow-wrap: break-word;/);
});
