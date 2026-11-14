/* eslint-disable max-len */
/* Standing order 23 (2026-11-14), item 4: premium-economy-class's German card stage at 390 (lh-snapshots-116). www keeps
   the card stage 810 px high on phones and lets a taller card overflow it (its title starts above the stage's picture);
   ours let the stage grow with the card (894 px on de/de, the page below 84 px low). Below 768 px a lufthansa.com card
   stage is 810 px high and shows what overflows. Census (order 21, the 73 published card stages at 390): only
   premium-economy-class's versions overflow; for a card that fits, 810 px is the minimum it had already.
   tools/parity/gate.mjs (injected trial): de/de, at/de 20.19 / 20.13 -> 12.94 / 12.91 at 390; gb/en, de/en,
   economy-class, 100-years and 100-years/history the same.
   Run: node --test test/hero-campaign-card-height-so23.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/hero-campaign/hero-campaign.css', import.meta.url), 'utf8');

test('below 768px a lufthansa.com card stage is 810px high and lets a taller card overflow it', () => {
  const at = css.indexOf('body.brand-lufthansa .hero-campaign.card {');
  assert.ok(at > 0, 'the rule');
  const media = css.slice(css.lastIndexOf('@media', at), css.indexOf('{', css.lastIndexOf('@media', at))).trim();
  assert.equal(media, '@media (width < 768px)');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /height: 810px;/);
  assert.match(rule, /min-height: 0;/);
  assert.match(rule, /overflow: visible;/);
});
