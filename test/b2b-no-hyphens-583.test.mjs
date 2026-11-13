/* eslint-disable max-len -- dev tooling */
/* The standing order of 2026-11-10 evening, decision 3 (the B2B ranking): www's B2B headings keep their words whole on phones
   (de/de partner-plus-benefit's title "PUNKTE SAMMELN UND AUF GESCHÄFTSREISEN PROFITIEREN" in four lines, ours three with
   "GESCHÄFTS-REISEN"); styles.css hyphenates headings below 768 px for every brand. styles/styles.css (brand themes set no wrapping: heading-wrap, text-wrap-510): manual on B2B.
   Measured with the rule injected on b2b.turnsthe.page against b2b-parity-001 (34 rows at 390): de/de experts/news 35.3 ->
   22.7 %, partner-plus-benefit 22.9 -> 21.0, homepage 19.1 -> 19.0, none worse.
   Run: node --test test/b2b-no-hyphens-583.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('B2B headings on phones: hyphens manual; the shared rule stays', () => {
  const css = fs.readFileSync('styles/styles.css', 'utf8');
  assert.match(css, /@media \(width < 768px\) \{\s*body\.brand-b2b :is\(h1, h2, h3, h4, h5, h6\) \{\s*hyphens: manual;/);
  assert.match(css, /hyphens: auto;/);
  assert.doesNotMatch(fs.readFileSync('styles/themes/b2b.css', 'utf8'), /hyphens/);
});
