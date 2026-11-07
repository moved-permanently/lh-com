/* eslint-disable max-len */
/* Brussels' theme, brief 443 (brussels-parity-003, P38): www's inspiration teasers (hero-campaign) now
   "tall" on the travel class pages and our-company (inspiration-teaser-tall: no option of ours, the
   narrow stage of brussels-parity-002 is gone there). In all three Brussels parity captures every
   inspiration teaser's title, h1, h2 or h3, is white, in capitals, 36 / 39.6 px below 768 px and
   48 / 52.8 px from 768 px; ours was 42 px (the class pages' business title red: the page-title rule).
   The rule for every stage but the white-card one (card); the class tabs close up to any stage.
   Run: node --test test/brussels-443.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));
const T = 'body\\.brand-brussels main \\.hero-campaign:not\\(\\.card\\) :is\\(h1, h2, h3\\)';

test('a stage\'s title as www\'s inspiration teaser\'s: white, in capitals, 36 / 39.6 px, 48 / 52.8 px from 768 px', () => {
  has(new RegExp(`${T} \\{[^}]*color: #fff;[^}]*font-size: 36px;[^}]*line-height: 39\\.6px;[^}]*text-transform: uppercase;`));
  has(new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${T} \\{[^}]*font-size: 48px;[^}]*line-height: 52\\.8px;`));
});

test('the class tabs close up to whatever stage follows them', () => {
  has(/body\.brand-brussels main > \.section\.profile-nav-container:has\(\+ \.section \.hero-campaign\) \{[^}]*margin-bottom: 0;/);
});
