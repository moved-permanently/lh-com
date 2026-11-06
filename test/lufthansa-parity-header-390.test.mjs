/* lufthansa.com's header on phones as www's (parity 2026-11-06: capture.json of all 293 www pages
   gives the header 144 px below 768 px, 122 px from 768 px; the quick links' text at y=95 on
   /de/en/homepage, measurements of 2026-11-05): 144 px (was 140) with the quick links 4 px lower
   (16 px above them, was 12), so everything below the header sat 4 px too high at 390. Scoped to
   body.brand-lufthansa below 768 px: the brand themes' own --nav-height and quick-link padding
   unchanged, 768 px and up as before (122 px).
   Run: node --max-old-space-size=256 --test test/lufthansa-parity-header-390.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('phones: lufthansa.com\'s header 144 px, its quick links 16 px under the bar', () => {
  has(/@media \(width < 768px\) \{ body\.brand-lufthansa \{ --nav-height: 144px; --nav-quick-list-padding: 16px 0 6px 6px; \} \}/);
});

test('the shared tokens as before', () => {
  has(/--nav-height: 140px;/);
  has(/--nav-height: 122px;/);
  assert.equal(fs.readFileSync('blocks/header/header.css', 'utf8').includes('padding: var(--nav-quick-list-padding, 12px 0 6px 6px);'), true);
});
