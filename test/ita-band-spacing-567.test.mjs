/* eslint-disable max-len */
/* ITA's flight search band between two text components (the standing order of 2026-11-10, item 6; ITA row 30,
   ita-parity-004: /it/en/local-page/verona -3.6 % at 1440). www puts an invisible separator (.separator > .hr.hr-no-layout,
   1 px and 24 px under it) on each side of the redesigned flight manager: 50 px from the text above to the band, 46 px
   from the band to the text under it (its declarative shadow DOM rendered offline: 284 -> 334, 834 -> 880 at 1440;
   497 -> 547, 1055 -> 1101 at 390). The import drops separators under 50 px that do not sit in running text, so the band
   had the sections' 24 px on both sides.
   Run: node --test test/ita-band-spacing-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `no rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('50 px from the text above to the band', () => {
  assert.match(rule('body.brand-ita main > .section > .default-content-wrapper + .flight-search-wrapper.flight-search-band'), /margin-top: 50px;/);
});

test('46 px from the band to the text under it', () => {
  assert.match(rule('body.brand-ita main > .section > .flight-search-wrapper.flight-search-band + .default-content-wrapper'), /margin-top: 46px;/);
});

test('at every width (not inside a media query)', () => {
  const i = css.indexOf('body.brand-ita main > .section > .default-content-wrapper + .flight-search-wrapper.flight-search-band {');
  const before = css.slice(0, i);
  const opened = (before.match(/@media[^{]*\{/g) || []).length;
  const depth = [...before].reduce((d, c) => d + (c === '{' ? 1 : c === '}' ? -1 : 0), 0);
  assert.equal(depth, 0, `inside a block (${opened} media queries before it)`);
});
