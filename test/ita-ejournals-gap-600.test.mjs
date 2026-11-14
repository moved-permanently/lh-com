/* eslint-disable max-len */
/* ITA row 54 (standing order 16 of 2026-11-14, item 3): the eJournals form's section (/it/en/book-and-prepare/travel-
   information/at-the-airport/digital-newsstand, ita-parity-005; ITA row 42's form): from 768 px www's next heading
   ("Related") starts 32 px under the form's "To free download" button, ours 48 (the section gap); on phones www keeps 52,
   ours 48, as before. 1440 3209 -> 3193 (www 3138, +2.26 -> +1.75 %). Run: node --test test/ita-ejournals-gap-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-ita main > .section.ejournals-container:not(:last-child)';

test('from 768 px 32 px under the eJournals form', () => {
  const q = css.indexOf(`@media (width >= 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'the rule, from 768 px');
  const i = css.indexOf(`${SEL} {`, q);
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 32px;/);
  assert.equal(css.split(`${SEL} {`).length - 1, 1, 'only there');
});
