/* eslint-disable max-len */
/* The brief after 475, item 1: from 768 px flight-search.css drops the bottom margin of every section that holds a standalone
   flight search ("the homepage stage spacing does not apply to the card"), also when blocks follow the search in the section:
   Austrian fly-with-austrian's last cards touched the footer (www 72 px). The user chose Austrian only (lufthansa.com, ITA,
   Brussels, SWISS and TAP unchanged): the Austrian theme gives such a section its 40 px back when something follows the
   search other than a lone separator; flight-search.css stays as it is. No :has() nested in :has() (browsers drop the rule).
   Run: node --max-old-space-size=256 --test test/flight-search-section-gap.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('Austrian: a section whose blocks go on after the standalone search keeps its 40 px from 768 px', () => {
  const css = read('styles/themes/austrian.css');
  const m = css.match(/@media \(width >= 768px\) \{ body\.brand-austrian main > \.section\.flight-search-container:has\(> \.flight-search-wrapper > \.flight-search\.standalone\):has\(> \.flight-search-wrapper \+ \*\):not\(:has\(> \.flight-search-wrapper \+ \.default-content-wrapper:last-child > p\.spacer:only-child\)\) \{ margin-bottom: 40px; \} \}/);
  assert.ok(m, 'the Austrian rule');
  assert.ok(!/:has\([^()]*:has\(/.test(m[0]), 'no :has() inside :has()');
});

test('flight-search.css keeps its rule for every other brand', () => {
  assert.match(read('blocks/flight-search/flight-search.css'), /body\.appear main > \.section\.flight-search-container:has\(\.flight-search\.standalone\) \{ margin-bottom: 0; \}/);
});
