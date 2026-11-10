/* eslint-disable max-len */
/* ITA's Miles & More status panels as www's (the brief after 556; ita-parity-004 /it/en/profile/miles-and-more at 1440
   and 390, the sweep's biggest row): each accordion item (Frequent Traveller, Senator, HON Circle Member) on www holds its
   points line, then a two-column view, the status card's picture | the benefits (heading, list, link); on phones the
   picture under the line and over the benefits. The import flattens the view into the panel (the heading, the line,
   the list, the link, the picture last): ours drew the picture full width under everything. A panel with a heading
   and a picture paragraph at its end is laid out as www's: the line first, the picture next, beside the benefits from
   768 px.
   Run: node --max-old-space-size=512 --test test/ita-status-panels-556.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const P = 'body.brand-ita .accordion-columns .accordion-columns-intro:has(> h3):has(> p:last-child > picture)';
const rule = (scope, selector) => {
  const i = scope.indexOf(`${selector} {`);
  assert.ok(i >= 0, selector);
  return Object.fromEntries(scope.slice(i + selector.length + 2, scope.indexOf('}', i)).split(';').map((d) => d.trim()).filter(Boolean).map((d) => d.split(/:\s*/)));
};

test('every width: the line first, the picture next, then the benefits', () => {
  assert.equal(rule(css, P).display, 'grid');
  assert.equal(rule(css, `${P} > p:first-of-type`)['grid-row'], '1');
  assert.equal(rule(css, `${P} > p:last-child`)['grid-row'], '2');
});

test('from 768 px: the picture beside the benefits', () => {
  const at = css.indexOf(`@media (width >= 768px) {\n  ${P} {`);
  assert.ok(at >= 0);
  const block = css.slice(at, css.indexOf('\n}\n', at));
  assert.equal(rule(block, P)['grid-template-columns'], 'minmax(0, 1fr) minmax(0, 1fr)');
  assert.equal(rule(block, `${P} > p:first-of-type`)['grid-column'], '1 / -1');
  assert.deepEqual([rule(block, `${P} > p:last-child`)['grid-column'], rule(block, `${P} > p:last-child`)['grid-row']], ['1', '2 / span 3']);
  assert.equal(rule(block, `${P} > :is(h3, ul, p:not(:first-of-type, :last-child))`)['grid-column'], '2');
});
