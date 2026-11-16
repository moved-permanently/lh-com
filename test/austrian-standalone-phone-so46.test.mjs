/* eslint-disable max-len */
/* Standing order 46, item 1 (places 38, 41, 42 and 46 of order 43's sweep): Austrian /at/en and /at/de
   discover/inspiration/fly-with-austrian, -2.44 to -3.14 %. Not the flight search's missing API answers (orders 26 and 31
   said so): with our host's recorded answers replayed the four page-widths are the same to the px. On www's first loads
   (austrian-parity-001) the standalone flight manager draws "Nonstop only" on its own line under the traveller line
   (80 px from it to FIND FLIGHTS; ours 57, side by side), in a picture band the card's tab bar is 19 px taller with 4 px
   more above and below its panel, and the card sits 36 px from the picture's top and bottom (the band 581 px at 390,
   ours 500); a divider right under the band starts 96 px below it (78 at 390; ours 24).
   Gate (gate-so46-austrian-standalone-flight-search.txt): fly-with-austrian en / de 1440 -2.66 / -3.14 -> -1.07 / -1.59 %,
   390 -2.66 / -2.44 -> -1.10 / -1.15 %; bangkok-airways and black-friday 390 closer; ski-campaign-2026 390 +0.43 ->
   +0.57 % with its closing band 63 px under the title (Round trip and FIND FLIGHTS at www's 1,826 / 2,165).
   Run: node --max-old-space-size=256 --test test/austrian-standalone-phone-so46.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const at = css.indexOf("/* standing order 46: www's standalone flight manager on phones.");
const block = at < 0 ? '' : css.slice(at, css.indexOf('/* ', at + 10));
const rules = at < 0 ? '' : css.slice(at, css.indexOf("/* the homepage's quick actions", at));
const BAND = 'body\\.brand-austrian main > \\.section > \\.flight-search-wrapper\\.flight-search-band:has\\(> \\.flight-search-background source\\)';

test('the comment names the cause and the figures', () => {
  assert.ok(at >= 0, 'the order 46 block is in the Austrian theme');
  assert.match(block, /"Nonstop only" on a line of its own, 80 px from the traveller line to FIND FLIGHTS/);
  assert.match(block, /the band 581 px as www's/);
});

test('below 768 px: "Nonstop only" on its own row under the traveller line, 80 px from it to FIND FLIGHTS', () => {
  const phone = rules.match(/^[^@]*\*\/ @media \(width < 768px\) \{(.*?)\} \} body/)?.[1] || '';
  assert.match(phone, /body\.brand-austrian \.flight-search\.standalone \.flight-search-form \{ grid-template-areas: "trip trip" "origin origin" "dest dest" "dates dates" "trav trav" "nonstop nonstop" "submit submit" "error error"; \}/);
  assert.match(phone, /body\.brand-austrian \.flight-search\.standalone \.flight-search-passengers \{ margin-top: 8px; \}/);
  assert.match(phone, /body\.brand-austrian \.flight-search\.standalone \.flight-search-nonstop \{ margin: 0 0 2px; \}/);
});

test('below 768 px, a picture band with its phone picture: the taller tab bar, the panel 24 px, the card 36 px from the picture', () => {
  assert.match(rules, new RegExp(`${BAND} > \\.flight-search\\.standalone \\.flight-search-tabs \\{ padding-top: 19px; \\}`));
  assert.match(rules, new RegExp(`${BAND} > \\.flight-search\\.standalone \\.flight-search-panel \\{ padding-block: 24px; \\}`));
  assert.match(rules, new RegExp(`${BAND} \\{ padding-top: 26px; padding-bottom: 36px; \\}`));
});

test('a divider right under a picture band: 78 px below it, 96 px from 768 px', () => {
  const SEL = 'body\\.brand-austrian main > \\.section > \\.flight-search-wrapper\\.flight-search-band \\+ \\.default-content-wrapper:has\\(> p\\.spacer\\.divider:first-child\\)';
  assert.match(rules, new RegExp(`\\} ${SEL} \\{ margin-top: 78px; \\} @media \\(width >= 768px\\) \\{ ${SEL} \\{ margin-top: 96px; \\} \\}`));
});

test('the closing band (no phone picture: www draws it on white) keeps its own top padding, 63 px', () => {
  assert.match(css, /body\.brand-austrian main > \.section\.stage:last-child > \.flight-search-wrapper\.flight-search-band:last-child \{ min-height: 0; padding-top: 63px; padding-bottom: 107px; \}/);
});
