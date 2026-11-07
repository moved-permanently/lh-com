/* eslint-disable max-len */
/* Air Dolomiti's booking strip (the flight-search variant airdolomiti with the option strip), brief
   452, item 2, as www's DisplayBookingWidget under the header of the hubs, destinations, airports
   and promotions (airdolomiti-parity-001): no trip type tabs in the row (from 1025 px, where it is
   a row; the phone panel keeps them, as www's), and the departure field empty, with no market
   airport prefilled (an authored Default origin still fills it, a URL's prefill too). Without the
   option, and on every other brand, as before. The importer writes the option on those pages.
   Run: node --max-old-space-size=512 --test test/flight-search-airdolomiti-strip-452.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync(new URL('../blocks/flight-search/flight-search.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('flight-search.js: the option strip on the variant airdolomiti only leaves the departure empty', () => {
  assert.match(js, /const emptyOrigin = block\.classList\.contains\('airdolomiti'\) && block\.classList\.contains\('strip'\) && !settings\.origin;/);
  assert.match(js, /value: emptyOrigin \? null : allowed\(settings\.origin \|\| \{ code: settings\.fallbackOrigin, name: '' \}\),/);
  assert.match(js, /if \(!originTouched && !emptyOrigin\) \{\s*origin\.setValue\(allowed\(data\.origin\), \{ silent: true \}\);/);
});

test('airdolomiti.css: no trip type tabs in the strip\'s row from 1025 px', () => {
  assert.match(css, /@media \(width >= 1025px\) \{[^@]*body\.brand-airdolomiti \.flight-search\.airdolomiti\.strip \.flight-search-trip-tabs \{ display: none; \}/);
});
