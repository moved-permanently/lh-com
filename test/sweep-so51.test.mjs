/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 51 of 2026-11-19 (what order 50's sweep listed): ITA's closing separators drawn into the block above.
   - A divider-below section's closing separator after a padded column view (pre-check-in at/de, sea-destinations
     it/it: 6 px into the grey box) or an FAQ accordion (bid-upgrade it/en: through its last item) keeps its place:
     no 16 px take-back there. Other blocks keep the take-back (travel-briefing's jump links).
   Run: node --test test/sweep-so51.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = (f) => fs.readFileSync(new URL(`../styles/themes/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('ITA: a divider-below closing separator after a padded column view or an FAQ accordion keeps its place', () => {
  assert.ok(css('ita.css').includes('body.brand-ita main > .section.section.divider-below > :is(.columns-media-wrapper:has(> .columns-media.padded), .accordion-columns-wrapper) + .default-content-wrapper:last-child:not(:has(> :not(p.spacer))) { margin-top: 0; }'));
});

test('ITA: the rule nests no :has() inside :has() (a browser drops such a rule)', () => {
  const rule = css('ita.css').split('}').find((r) => r.includes('.section.section.divider-below > :is('));
  assert.ok(rule);
  // each :has( argument, to its matching parenthesis, holds no :has(
  for (let i = rule.indexOf(':has('); i !== -1; i = rule.indexOf(':has(', i + 1)) {
    let depth = 0;
    let end = i + 4;
    for (; end < rule.length; end += 1) {
      if (rule[end] === '(') depth += 1;
      if (rule[end] === ')') depth -= 1;
      if (depth === 0) break;
    }
    assert.ok(!rule.slice(i + 5, end).includes(':has('), `no :has( inside ${rule.slice(i, end + 1)}`);
  }
});
