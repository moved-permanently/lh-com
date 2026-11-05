/* eslint-disable max-len */
/* Discover, brief 396 (row 23 of tools/reports/discover/parity.md, www.discover-airlines.com's capture
   discover-parity-001): www colours only its column-view titles night sky blue (#002554, "Your benefits on
   board" over Business Class's column view), its other headings dark sky blue (#003e7b). The documents mark
   such a section with the section style column-titles; its heading right before a block is the title.
   Run: node --max-old-space-size=256 --test test/discover-396.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('headings stay dark sky blue, copy night sky blue', () => {
  has(/--heading-color: #003e7b;/);
  has(/--lh-midnight: #002554;/);
});

test('column-titles: the heading right before a block in such a section night sky blue, only there', () => {
  has(/body\.brand-discover main \.section\.column-titles > \.default-content-wrapper:has\(\+ div:not\(\.default-content-wrapper\)\) > :is\(h2, h3\):last-child \{ color: var\(--lh-midnight\); \}/);
  assert.equal(/\.column-titles[^{]*\{[^}]*color/.test(css.replace(/body\.brand-discover main \.section\.column-titles > \.default-content-wrapper:has\(\+ div:not\(\.default-content-wrapper\)\) > :is\(h2, h3\):last-child \{ color: var\(--lh-midnight\); \}/, '')), false, 'no other column-titles colour rule');
});
