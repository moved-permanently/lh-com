/* lufthansa.com's article tag chips as www's maui-chip (parity 2026-11-06; www's archived
   /de/en/articles/explore-the-world/on-the-scene-sports-miami at 390 and 1440, the chip's shadow
   DOM: 16px/24px LufthansaText 400, padding 0 14px, 1px #333 border, #52627c, 40px high): ours
   were 18px with 16px padding, 8 to 13px wider each ("Miami" 82 against 74). Scoped to
   body.brand-lufthansa: Air Dolomiti's and SWISS's article headers keep theirs.
   Run: node --max-old-space-size=256 --test test/lufthansa-parity-article-chips.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('blocks/article-header/article-header.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('lufthansa.com\'s chips 16px with 14px padding', () => {
  assert.ok(/body\.brand-lufthansa \.article-header \.article-header-tags a:any-link, body\.brand-lufthansa \.article-header \.article-header-tags span \{ padding: 0 14px; font-size: 16px; \}/.test(css));
});

test('the shared chip as before (the brand sites)', () => {
  assert.ok(/\.article-header \.article-header-tags a:any-link, \.article-header \.article-header-tags span \{ display: inline-flex; align-items: center; box-sizing: border-box; height: 40px; padding: 0 16px;/.test(css));
});
