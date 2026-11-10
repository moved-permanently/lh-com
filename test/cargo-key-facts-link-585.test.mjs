/* eslint-disable max-len */
/* Cargo's key facts band on phones (the standing order of the night of 2026-11-10, item b; Cargo row 50;
   cargo-parity-002 /en/ci/facts-figures at 390): www's band keeps its 556 : 864 shape (606 px at 390), the arrows and
   dots in one row, the "Facts & Figures" link 32 px under that row and 17 px over the band's foot. Ours had 51 / 30 px
   around the link, which with the tallest slide (five lines) made the band 631 px (25 px over its shape).
   Run: node --test test/cargo-key-facts-link-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('the link 32 px under the dots\' row, 17 px over the band\'s foot', () => {
  const sel = 'body.brand-cargo main > .section.key-facts .carousel-cards-wrapper ~ .default-content-wrapper';
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0);
  assert.match(css.slice(i, css.indexOf('}', i)), /padding: 32px 16px 17px;/);
});

test('the band keeps www\'s shape on phones', () => {
  assert.match(css, /body\.brand-cargo main > \.section\.key-facts:has\(\.carousel-cards\.facts\) \{\s*display: flex;\s*flex-direction: column;\s*aspect-ratio: 556 \/ 864;/);
});
