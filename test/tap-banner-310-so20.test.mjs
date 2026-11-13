/* eslint-disable max-len */
/* Standing order 20, item 2: TAP's banner slider on phones. www's build sJsYPUBdTcbw1x_UTnNBp (tap-parity-010, 2026-11-13:
   /en-pt/miles-and-go, /pt-pt/destinos/inspire-se, /en-pt/destinations/get-inspired, /en-pt) caps a slide at 259 px
   below 376 px and at 310 px from 376 px (max-h-[259px] min-[376px]:max-h-[310px]): 358 x 310 at 390 on all four. Ours
   was 259 on every phone. A TAP slide is 310 px high from 376 to 767 px; below 376 it stays 259. First the narrow
   slider (e21a2ef7); then the home stage too (/en-pt 358 x 310 at 390 on www: -0.83 -> +0.18 %, the other 24
   recorded pages unchanged). Reads the theme CSS as written.
   Run: node --max-old-space-size=256 --test test/tap-banner-310-so20.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('a TAP slide (the narrow slider and the home stage) 310 px high from 376 to 767 px', () => {
  const at = css.indexOf('@media (width >= 376px) and (width < 768px) { body.brand-tap .hero-campaign-tap .hero-campaign-slide {');
  assert.ok(at >= 0, 'no 376-767 px rule for every TAP slide');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /height: 310px;/);
});

test('the slide still 259 px high below 1024 px otherwise (below 376 px, 768 to 1023 px)', () => {
  assert.match(css, /@media \(width < 1024px\) \{ body\.brand-tap \.hero-campaign-tap \.hero-campaign-slide \{ height: 259px; \}/);
});
