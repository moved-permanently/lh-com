/* Air Dolomiti's stage without a bar (brief 490's sweep: flights in Europe, its route map at
   the end; airdolomiti-parity-001): www's HeroSecond with neither a line nor a button under its
   picture draws no white bar (no hero_second_box), only the picture (90vh from 930 px) and its
   100 px margin under it. Ours drew the 135 px white bar empty under it (hero-card-overlay
   (destination) from 530 px).
   Run: node --max-old-space-size=256 --test test/airdolomiti-stage-490.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const S = 'body.brand-airdolomiti main > .section.hero-card-overlay-container .hero-card-overlay.destination:not(:has(.hero-card-overlay-card > p:not(.hero-card-overlay-eyebrow), .hero-card-overlay-cta))';

test('a stage with no line and no button: no bar (no room for it, no white strip), 100 px above what follows', () => {
  assert.match(css, new RegExp(`${esc(S)} \\{ margin-bottom: 100px; padding-bottom: 0; \\}`));
  assert.match(css, new RegExp(`${esc(S)}::after \\{ content: none; \\}`));
});
