/* eslint-disable max-len */
/* The brief after 521, item 2 (Brussels against the recordings): below an accordion, the heading that follows it in its section.
   The recordings' boxes (the last question's box to the heading's box): 41 px at 1440 and 21 at 390 on every clean case
   (special-meals' "How do I request a special meal?", children-travelling-alone's "Comment se déroulera …" and "Bon à
   savoir"), 61 / 51 before a related-topics heading (our-payment-methods' "Autres sujets", special-meals' "Related topics":
   www opens a section there); ours the default content's 20 px (16 on phones). 304 accordions are followed by an h2 and 62
   by an h3 in their section on Brussels' published documents (222 and 38 documents). A spaced accordion keeps its own
   40 px below (lh-com's rule) and is left out.
   Run: node --max-old-space-size=256 --test test/brussels-accordion-heading-522.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const sel = 'body\\.brand-brussels main \\.accordion-columns-wrapper:not\\(:has\\(> \\.spaced\\)\\) \\+ \\.default-content-wrapper:has\\(> :is\\(h2, h3\\):first-child\\)';

test('the heading after an accordion: 21 px on phones, 41 px from 768 px', () => {
  assert.match(css, new RegExp(`${sel} \\{ margin-top: 21px; \\}`));
  assert.match(css, new RegExp(`@media \\(width >= 768px\\) \\{ ${sel} \\{ margin-top: 41px; \\} \\}`));
});
