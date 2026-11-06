/* eslint-disable max-len -- dev tooling */
/* B2B's accessibility pass on the preview (offline package 2026-11-06, item 5): axe's only finding on the
   26 captured pages at 1440 and 390 was the outlined button on a grey band (route-network's "Discover
   now" / "Jetzt entdecken": www's #4d7b93 on #f5f5f5 is 4.21 : 1, 18 px bold needs 4.5). On grey bands the
   button's colour is #49748b (4.64 : 1; on white #4d7b93 stays, 4.6 : 1).
   Run: node --max-old-space-size=512 --test test/b2b-a11y-offline.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

test('the outlined button on a grey band at least 4.5 : 1', () => {
  const m = css.match(/body\.brand-b2b main > \.section\.grey \{ --button-secondary-color: (#[0-9a-f]{6}); --button-secondary-hover: (#[0-9a-f]{6}); \}/);
  assert.ok(m, 'the grey band\'s tokens');
  assert.ok(ratio(m[1], '#f5f5f5') >= 4.5, `${m[1]} on #f5f5f5`);
  assert.ok(ratio(m[2], '#f5f5f5') >= 4.5, `${m[2]} on #f5f5f5`);
  assert.ok(ratio('#4d7b93', '#ffffff') >= 4.5, 'www\'s colour on white as before');
});
