/* eslint-disable max-len */
/* Brief 500 item 1, /de/en/baggage (hub since 2416546, www's AEM sections as ours):
   - the page title (H1) is a section of its own before the first campaign-section; our section gap (48 px)
     replaced the H1's own space under it: the intro 8 px lower at 1440, 16 at 390 than on www, where the
     title component's margin is all there is. That section has no gap now; the H1's margin collapses
     through it (a padded section next: the margin and the padding, as www).
   - jump links, then a separator (www: the link list ends at its last link, maui-divider's 1 px and the
     .hr's 40 px, the next column view's title): our wrapper gap after the block came on top (+24 px
     before "Types of baggage"). A wrapper opening with a separator right after the jump links has none.
   - a column view's title, then its cards (Types of baggage, Baggage services, Further information): www's
     view has its 32 px padding above the title, the first picture 40 px under the title's box; ours
     64 (the title's 32 px and the grid's 32 px column padding). From 768 px a grid right after a heading
     in a campaign-section, or in a grey band of such a page, starts 8 px down (phones: the 12 px of brief 467 stay).
   Brief 556: the full recordings (lh-parity-004a, /gb/en/baggage at 1440) put each first picture 8-9 px nearer
     the heading than the 8 px did (heading ink to picture: www 40 / 45, ours 49 / 54): no padding.
   Run: node --test test/hub-baggage-spacing-500.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a title section before a campaign-section: no section gap, the H1 keeps its margin', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section:not(.campaign-section):has(> .default-content-wrapper:last-child > h1:last-child):has(+ .section.campaign-section) { margin-bottom: 0; }'), css.slice(css.indexOf('campaign-section'), css.indexOf('campaign-section') + 200));
});

test('a separator right after jump links in a campaign-section: no wrapper gap above it', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section.campaign-section > .jump-links-wrapper + .default-content-wrapper:has(> p.spacer:first-child) { margin-top: 0; }'));
});

test('a grid right after a heading in a campaign-section from 768 px: no padding', () => {
  const at = css.indexOf('@media (width >= 768px) { body.brand-lufthansa main > .section.campaign-section > .default-content-wrapper:has(> :is(h2, h3, h4, h5, h6):last-child) + .cards-teaser-wrapper > .cards-teaser:not(.overlay, .spacious) > ul { padding-top: 0; } }'.replace(' { padding-top', ', body.brand-lufthansa main:has(> .section.campaign-section) > .section.column-band > .default-content-wrapper:has(> :is(h2, h3, h4, h5, h6):last-child) + .cards-teaser-wrapper > .cards-teaser:not(.overlay, .spacious) > ul { padding-top'));
  assert.ok(at > 0);
});
