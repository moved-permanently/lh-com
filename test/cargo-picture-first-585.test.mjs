/* eslint-disable max-len */
/* Cargo's text-and-picture rows on phones (the standing order of the night of 2026-11-10, item e; Cargo row 51;
   cargo-parity-001 /de/fleet-ulds/fleet at 390): www's Text-Image-horizontal-CF5 puts its picture first below 768 px
   (the image section's order-first order-md-last), ours kept the document's order (the text, then the picture). Below
   768 px a Columns Media row whose picture comes last shows it first; not in a transport story's sections (their own
   phone layout, row 41).
   Run: node --test test/cargo-picture-first-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const SEL = 'body.brand-cargo main > .section:not(:has(.hero-card-overlay.light)) .columns-media .columns-media-row.columns-media-media-last > .columns-media-media';

test('below 768 px the picture first', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /order: -1;/);
  const media = css.slice(0, i).match(/@media[^{]*\{(?![\s\S]*@media)/);
  assert.ok(media && /width < 768px/.test(media[0]));
});
