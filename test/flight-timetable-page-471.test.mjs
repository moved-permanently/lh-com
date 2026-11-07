/* eslint-disable max-len */
/* flight-timetable (www.airdolomiti.it's timetable widget), the parity sweep after brief 470, row 60 of
   tools/reports/airdolomiti/parity.md: on www the widget sits in WidgetFullPage's container
   (airdolomiti-parity-001, /orario-voli, /en/flight-timetables, /de/flugplan): 150 px under the title
   (200 px from 930 px), at least the screen's height less 220 px tall, 20 px to the footer; the card's
   shadow 0 12px 25px at 10 %. Ours was 32 px under the title with the footer 48 px under the card (the
   page 520 px shorter at 1440).
   Run: node --max-old-space-size=512 --test test/flight-timetable-page-471.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/flight-timetable/flight-timetable.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('row 60: the widget\'s place as www\'s WidgetFullPage: 150 px under the title, 200 from 930 px, the screen less 220 px tall, 20 px to the footer', () => {
  has(/\.flight-timetable \{[^}]*min-height: calc\(100vh - 220px\);[^}]*margin: 150px 0 20px;/);
  has(/@media \(width >= 930px\) \{ \.flight-timetable \{ margin-top: 200px; \} \}/);
});

test('row 60: the card\'s shadow as www\'s (0 12px 25px, 10 %)', () => {
  has(/\.flight-timetable \.flight-timetable-form \{[^}]*box-shadow: 0 12px 25px rgb\(0 0 0 \/ 10%\);/);
});
