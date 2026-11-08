/* eslint-disable max-len */
/* Air Dolomiti's page stages (brief 503, Air Dolomiti row 69; the sweep after 501: the fleet -5.5 %
   at 1440, its title 85 px lower and "The Fleet" 86 px higher than www's): www's HeroFirst is the
   window's height with the bar over its top (.HeroFirst_hero_second { min-height: 100vh;
   margin-bottom: 150px }), its content centred in that height above a 70 px gap (the links row), so
   the title's middle 35 px above the window's; ours ended at the window's foot too but centred the
   title under the bar, and the next section followed 64 px lower. A stage that carries the page's
   h1 (hero-campaign narrow) keeps the bar's height and the 70 px under its content, and its section
   150 px. The destination band (narrow, with an h2: Bari) as before. Air Dolomiti's theme only.
   Run: node --max-old-space-size=512 --test test/airdolomiti-page-stage-503.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 69: the page stage\'s title centred as www\'s (the bar\'s height and the links row\'s 70 px under the content)', () => {
  assert.ok(css.includes('body.brand-airdolomiti .hero-campaign.narrow:has(.hero-campaign-content h1) { padding-bottom: calc(var(--nav-height) + 70px); }'));
});

test('row 69: the next section 150 px under the page stage (HeroFirst\'s margin-bottom)', () => {
  assert.ok(css.includes('body.brand-airdolomiti main > .section:has(> .hero-campaign-wrapper > .hero-campaign.narrow .hero-campaign-content h1) { margin-bottom: 150px; }'));
});
