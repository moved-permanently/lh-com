/* eslint-disable max-len */
/* Air Dolomiti's booking pages (it prenotazioni, en booking, de buchung; brief 490's sweep, 12.6 to
   12.9 % shorter than www at 1440 and 390): www draws their booking widget as its full-block variant
   (airdolomiti-parity-001: _bookingWidget--full-block): a white card with 10 px corners, 20 px inside
   and a soft shadow (0 12px 25px, 10 %), the trip type stacked (30 px apart), then the fields; from
   1025 px in one row, the flexible dates 22 px under them and the 207 px Search button 20 px under
   those (the card 1368 x 352 at 1440); on phones 30 px in from the screen's sides, each field under
   the other 30 px apart, the Search button 50 px under the flexible dates (331 x 851 at 390); the
   footer 100 px under the card. Ours is the widget without the strip or overlay options, drawn as
   the homepage's box without its box.
   Run: node --max-old-space-size=256 --test test/airdolomiti-booking-490.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rule = (sel) => (css.match(new RegExp(`(?:^|[}{] ?)${esc(sel)} \\{[^}]*\\}`, 'g')) || []).join(' ');
const media = (q) => {
  const out = [];
  for (let i = css.indexOf(`@media ${q} {`); i >= 0; i = css.indexOf(`@media ${q} {`, i + 1)) {
    let depth = 0;
    let k = css.indexOf('{', i);
    const start = k;
    for (; k < css.length; k += 1) {
      if (css[k] === '{') depth += 1;
      else if (css[k] === '}') { depth -= 1; if (!depth) break; }
    }
    out.push(css.slice(start + 1, k));
  }
  return out.join(' ');
};
const FB = 'body.brand-airdolomiti main .flight-search.airdolomiti:not(.strip, .flight-search-overlay, .standalone)';

test('the full-block card at every width: white, 10 px corners, 20 px inside, www\'s shadow, 100 px above the footer; 10 px further in on phones', () => {
  assert.match(rule(FB), /margin: 0 10px 100px;[^}]*border-radius: 10px;[^}]*background-color: #fff;[^}]*padding: 20px;[^}]*box-shadow: 0 12px 25px rgb\(0 0 0 \/ 10%\);/);
  assert.match(media('(width >= 1025px)'), new RegExp(`${esc(FB)} \\{ margin-right: 0; margin-left: 0; \\}`));
});

test('phones: the fields 30 px apart, Search 50 px under the flexible dates', () => {
  const m = media('(width < 768px)');
  assert.match(m, new RegExp(`${esc(FB)} \\.flight-search-form \\{ row-gap: 30px; \\}`));
  assert.match(m, new RegExp(`${esc(FB)} \\.flight-search-dates \\{ row-gap: 30px; \\}`));
  assert.match(m, new RegExp(`${esc(FB)} \\.flight-search-flexible \\{ margin-bottom: 20px; \\}`));
});

test('from 1025 px: the trip type stacked, the fields in a row, the flexible dates and then the 207 px button; no box under a tab', () => {
  const m = media('(width >= 1025px)');
  assert.match(m, new RegExp(`${esc(FB)} \\.flight-search-form \\{ grid-template: "trip trip trip trip trip" auto "origin dest dep ret trav" auto "flex flex flex flex flex" auto "submit submit . . ." auto "error error error error error" auto / ${'minmax\\(0, 1fr\\) '.repeat(5).trim()}; row-gap: 0; \\}`));
  assert.match(m, new RegExp(`${esc(FB)} \\.flight-search-form::before \\{ content: none; \\}`));
  assert.match(m, new RegExp(`${esc(FB)} \\.flight-search-trip-tabs \\{ flex-direction: column; gap: 30px; margin: 0 0 30px; \\}`));
  assert.match(m, new RegExp(`${esc(FB)} \\.flight-search-trip-tab \\{ width: auto; height: auto; padding-left: 0; background-color: transparent; \\}`));
  assert.match(m, new RegExp(`${esc(FB)} \\.flight-search-flexible \\{ margin-top: 22px; \\}`));
  assert.match(m, new RegExp(`${esc(FB)} \\.flight-search-submit \\{ width: 207px; margin-top: 20px; \\}`));
});
