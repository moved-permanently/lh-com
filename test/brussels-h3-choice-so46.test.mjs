/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 46 of 2026-11-18, item 2 (token-free content): Brussels' terms-and-conditions marked its accordion's 70
   subheadings " {heading-small}" (www: headline heading-small, brussels-parity-007); the accordion's own H3 is
   heading-copytext-large, and no Brussels choice gave heading-small inside a block, so the collapse dropped the marks
   and the H3s fell to 18 / 16 px. Now THEMES.brussels draws "H3 large" in heading-small and keeps a heading-small H3
   marker as that choice: the collapse writes the block option title-large on the accordion, no marker, and the page
   draws its H3s at 28 / 22 px as before. The other recorded Brussels accordions' H3s (unmarked, www's
   heading-copytext-large) are untouched; no recorded Brussels page used title-large or h3-large before.
   Run: node --test test/brussels-h3-choice-so46.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor, headingChoice } from '../scripts/style-markers.js';

const run = (html) => collapseHtml(html, {
  path: '/be/en/legal-notices/terms-and-conditions-conditions-of-carriage', brand: 'brussels', parse: parseHTML, force: true,
}).html;
const doc = '<div class="sidebar-h1"><h1>Terms</h1><div class="accordion-columns faq"><div><div>Article 2</div><div><h3>General {heading-small}</h3><p>2.1 These Conditions …</p><h3>Charters {heading-small}</h3><p>2.2 If carriage …</p></div></div></div></div>';

test('Brussels: H3 large is heading-small, a heading-small H3 marker that choice', () => {
  const t = themeFor('brussels');
  assert.equal(t.headingChoices.h3.large, 'heading-small');
  assert.equal(t.nearChoices.h3['heading-small'], 'large');
  assert.equal(headingChoice(t, 3, 'large'), 'heading-small');
});

test('the collapse writes the accordion\'s title-large, no marker; the same on a second run', () => {
  const once = run(doc);
  assert.match(once, /class="accordion-columns faq title-large"/);
  assert.doesNotMatch(once, /\{heading-/);
  assert.equal(run(once), once);
});

test('the rows for the live copy: 70 markers out, the block option in, nothing else', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so46-brussels-token-free.json', import.meta.url), 'utf8'));
  const rows = data['/be/en/legal-notices/terms-and-conditions-conditions-of-carriage'];
  assert.equal(rows.filter((r) => r.from.includes(' {heading-small}</h3>')).length, 70);
  assert.equal(rows.filter((r) => r.to.includes(' title-large')).length, 1);
});
