/* eslint-disable max-len */
/* Standing order 20 (2026-11-14), item 2: Icon Text Cards' option partner (www's .teaser.partner tiles) when a card has no
   title (/de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system's "What data is collected?":
   an icon and a description each). www keeps the heading line with the icon and puts the description under it, 5.1rem
   in; ours put the description beside the icon, each card one line short. An untitled partner card stacks its icon and
   body now, the body 51px in (lufthansa.com; the brands' untitled tiles unmeasured). Live + the rule, % off www at
   1440 / 390: 13.0 / 18.5 -> 9.7 / 15.3. The only recorded page with untitled partner cards.
   Run: node --test test/cards-partner-untitled-so20.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-icon-text/cards-icon-text.css', import.meta.url), 'utf8');

test('an untitled partner card: the icon, then its body 51px in', () => {
  const card = css.match(/body\.brand-lufthansa \.cards-icon-text\.partner \.cards-icon-text-card:not\(:has\(\.cards-icon-text-title\)\) \{([^}]*)\}/);
  assert.ok(card, 'the card rule');
  assert.match(card[1], /flex-direction: column;/);
  const body = css.match(/body\.brand-lufthansa \.cards-icon-text\.partner \.cards-icon-text-card:not\(:has\(\.cards-icon-text-title\)\) > \.cards-icon-text-body \{([^}]*)\}/);
  assert.ok(body, 'the body rule');
  assert.match(body[1], /margin-left: 51px;/);
});
