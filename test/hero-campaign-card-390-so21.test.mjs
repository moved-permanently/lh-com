/* Standing order 21 (2026-11-14), item 4: /de/en/premium-economy-class at 390. On www the card stage
   (.uplift-animation, our hero-campaign card) centres the card and its 2.4rem margin in the 810 px stage, with no
   padding above or below: the tall "A diverse culinary offering on board" card sits 13 px under the picture's top and
   37 px above its bottom, the stage stays 810 px. Ours kept the inner's 24 px padding: 24 / 48 and a stage 22 px taller.
   A card that fits is centred the same either way (economy-class 141 / 164, 100-years 132 / 156 on www and ours).
   Below 768px the lufthansa.com card stage now has no vertical padding. Gate at 390 (working-copy code): economy-class,
   100-years, 100-years/history unchanged; premium-economy-class 15.5 -> 16.5 alone, 13.4 with its padded end section (the
   row on the branch's list), 10.1 -> 8.0 at 1440 with the row.
   Run: node --test test/hero-campaign-card-390-so21.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/hero-campaign/hero-campaign.css', import.meta.url), 'utf8');

test('below 768px a lufthansa.com card stage has no vertical padding (the card and its margin centred in 810 px)', () => {
  const at = css.indexOf('body.brand-lufthansa .hero-campaign.card .hero-campaign-inner {');
  assert.ok(at > 0, 'the rule');
  const media = css.lastIndexOf('@media', at);
  assert.equal(css.slice(media, css.indexOf('{', media)).trim(), '@media (width < 768px)');
  assert.match(css.slice(at, css.indexOf('}', at)), /padding-block: 0;/);
});

test('the stage centres its content in 810 px, and the card keeps its 2.4rem margin below 768px', () => {
  assert.match(css, /\.hero-campaign \{[^}]*align-items: center;[^}]*min-height: 810px;/);
  assert.match(css, /\.hero-campaign\.card \.hero-campaign-content \{[^}]*margin-bottom: var\(--spacing-default\);/);
});
