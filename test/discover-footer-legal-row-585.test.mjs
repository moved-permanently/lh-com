/* eslint-disable max-len */
/* Discover's footer legal links on phones (the standing order of the night of 2026-11-10, item e; Discover row 47;
   discover-parity-001 at 390): www's legal links wrap as a row, short ones side by side ("Impressum" and "ABB" on one
   line, 24 px apart), the rest one a line, 24 px between the lines; ours one link a line (--footer-legal-direction:
   column), so one line more (62 px; our footer 1,132 px against www's 1,074 rendered here). Below 768 px the list is a
   wrapping row with 24 px between neighbours; from 768 px the footer is ema-adobe's rule (row 41) and stays as it is.
   Run: node --test test/discover-footer-legal-row-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('below 768 px the legal links a wrapping row, 24 px between neighbours and lines', () => {
  const re = /@media \(width < 768px\) \{[^@]*?body\.brand-discover \.footer \.footer-legal \{([^}]*)\}/g;
  const bodies = [...css.matchAll(re)].map((m) => m[1]).join('');
  assert.match(bodies, /flex-direction: row;/);
  assert.match(bodies, /(^|[^-])gap: 24px;/, '24 px between neighbours and between lines');
});
