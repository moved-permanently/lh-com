/* eslint-disable max-len */
/* Brussels' theme against brussels-parity-002 (offline package 2026-11-06; rows in
   tools/reports/brussels/parity.md): the travel class pages' stage (www's full-width inspiration
   teaser: right under the class tabs, 810 px high at 1440 (16:9), 804 px on phones, the title in
   capitals 48 / 52.8 px, 36 / 39.6 px on phones) and their class tabs (www's maui-sub-navigation:
   the labels sn-blue-3 #0a1f62, the chosen one bold over a 3 px Brussels red line).
   Run: node --test test/brussels-parity-002.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));
const S = 'body\\.brand-brussels main > \\.section\\.profile-nav-container \\+ \\.section \\.hero-campaign\\.narrow';

test('the class pages\' stage: 804 px on phones, 16:9 from 768 px, right under the class tabs; the title in capitals 36/39.6, 48/52.8 from 768 px', () => {
  has(new RegExp(`${S} \\{[^}]*min-height: 804px;`));
  has(new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${S} \\{[^}]*min-height: 0;[^}]*aspect-ratio: 16 / 9;`));
  // the title and the tabs' margin: every stage's since brief 443 (test/brussels-443.test.mjs)
  has(/body\.brand-brussels main > \.section\.profile-nav-container:has\(\+ \.section \.hero-campaign\) \{[^}]*margin-bottom: 0;/);
});

test('page titles red only at www\'s large style: an h1 its author gave a smaller style ({heading-medium}, Beobank) as other headings', () => {
  has(/body\.brand-brussels main h1:not\(\.heading-medium, \.heading-small, \.heading-copytext-large, \.heading-copytext-medium\), body\.brand-brussels main \.heading-large, body\.brand-brussels \.article-header \.article-header-title \{ color: var\(--brand-color\); \}/);
  assert.ok(!/body\.brand-brussels main h1,/.test(css), 'no rule makes every h1 red');
});

test('the class tabs: every label #0a1f62, the chosen one bold over a 3 px red line', () => {
  has(/@media \(width >= 1024px\) \{[^@]*body\.brand-brussels \.profile-nav li a:any-link \{[^}]*color: #0a1f62;[^}]*font-weight: 400;/);
  has(/@media \(width >= 1024px\) \{[^@]*body\.brand-brussels \.profile-nav li a\[aria-current="page"\] \{[^}]*color: #0a1f62;[^}]*font-weight: 700;/);
  has(/@media \(width >= 1024px\) \{[^@]*body\.brand-brussels \.profile-nav li a\[aria-current="page"\]::after \{[^}]*height: 3px;[^}]*background: #e5002b;/);
});
