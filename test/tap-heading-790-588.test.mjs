/* eslint-disable max-len */
/* TAP's content headings at most 790 px wide (TAP parity row 149): www's heading sections sit in a max-w-[790px]
   container (64 of the 95 H2s of the tap-parity recordings, the others cards', pickers' and centred titles), so a long
   one wraps where ours ran on (Schengen visas' "Travel to Europe: pre-register before departure / arrival", hold
   baggage's "Baby and children baggage allowed in the aircraft' cabin": 39 px each at 1440). styles/themes/tap.css caps
   a content H2 at 790 px; centred titles (after an H1, a carousel's, a category set's, a tab panel's) keep their width.
   Run: node --test test/tap-heading-790-588.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');

test('a content H2 of brand tap at most 790 px wide; the centred titles excluded', () => {
  const m = css.match(/body\.brand-tap main > \.section:not\(([^)]*\)\)) > \.default-content-wrapper:not\(([^)]*\)\)) > h2:not\(h1 \+ h2\) \{\s*max-width: 790px;\s*\}/);
  assert.ok(m, 'the rule');
  assert.match(m[1], /\.section-tab-panel/);
  assert.match(m[1], /:has\(\+ \.section\.section-tabs/);
  assert.match(m[2], /carousel-cards-wrapper/);
});
