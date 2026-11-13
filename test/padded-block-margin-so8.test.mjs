/* eslint-disable max-len */
/* Standing order 8 (2026-11-12), item 3: the ranking below 14 %. /de/en/32n and /de/en/320 (the fleet split of 1455833)
   and premium-economy-class (the stage intro of 7d58bb1) end a padded section with a padded Columns Media before an
   unpadded section. www keeps the block's component margin (24 px) inside the padded AEM section, and ours zeroes the
   last block's margin: "The quietest cabin" 24 px higher than www's on 32n at 1440. From 768 px the block keeps 24 px
   there. Injected on our live host, % off www at 1440: 32n 10.0 -> 6.4, 320 9.1 -> 6.4, premium-economy-class
   11.2 -> 10.1. At 390, premium-economy-class measured worse (15.5 -> 17.5), so phones stay as before. Of the 25
   recorded pages with a padded section ending in a padded Columns Media, only these three change; the same margin on
   every such section made 23 page-widths worse.
   Run: node --max-old-space-size=256 --test test/padded-block-margin-so8.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const raw = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const css = raw.replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section.padded:is(.spaced, .flush):not(.grey, .campaign-section):has(+ .section:not(.padded, .grey, .stage, .campaign-section)) > .columns-media-wrapper:last-child:has(> .columns-media.padded)';

test('from 768 px a padded section\'s last padded Columns Media before an unpadded section keeps 24 px', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-bottom: var\(--spacing-default\);/);
  const media = css.lastIndexOf('@media', i);
  assert.ok(media >= 0 && css.slice(media, i).startsWith('@media (width >= 768px) {'), 'inside the 768 px query');
});

test('not on every padded section, not on campaign sections or grey bands', () => {
  assert.ok(!css.includes('body.brand-lufthansa main > .section.padded:not(.grey) > .columns-media-wrapper:last-child:has(> .columns-media.padded)'));
  assert.ok(SEL.includes(':not(.grey, .campaign-section)'));
});
