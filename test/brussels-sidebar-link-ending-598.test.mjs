/* eslint-disable max-len */
/* Brussels P56, sidebar-h1 pages that end with a link line (standing order 14 of 2026-11-13/14, item 1, a code cause): on www
   the footer starts 60 to 82 px under such a page's last link at 1440 (70 to 116 px on phones: refund-for-cancelled-
   flights, service-charges, cancel-and-refund-requests in brussels-parity-004 / -006 / -007, their recordings rendered
   here), ours 48 (the section gap). Such a last section keeps 60 px from 768 px, 70 below. Pages whose sidebar section
   ends with an accordion or a spacer stay as they are: with them the rule took five legal pages further (www's gap there
   is ours). One :has() level. Run: node --test test/brussels-sidebar-link-ending-598.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-brussels main > .section.sidebar-h1:last-child:has(> .default-content-wrapper:last-child > p:last-child > a:only-child)';

test('a sidebar-h1 page ending with a link line: 70 px to the footer, 60 px from 768 px', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 70px;/);
  const q = css.indexOf(`@media (width >= 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'the 768 px value');
  const j = css.indexOf(`${SEL} {`, q);
  assert.match(css.slice(j, css.indexOf('}', j)), /margin-bottom: 60px;/);
});

test('not every sidebar-h1 ending, and no :has() inside another', () => {
  assert.ok(!css.includes('body.brand-brussels main > .section.sidebar-h1:last-child {'));
  assert.doesNotMatch(SEL, /:has\([^)]*:has\(/);
});
