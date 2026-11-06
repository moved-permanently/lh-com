/* eslint-disable max-len, import/extensions -- dev tooling */
/* Austrian's deeper pages against austrian-parity-002 (brief 427 package, tools/reports/austrian/parity.md
   rows 29-): www.austrian.com's type that lh-com's import and theme lost:
   - p.copytext-large (the intro under the title, 200 times on at/en and at/de): Portada 18 / 27;
     lh-com's cleanup marks it only with a link (lufthansa.com's default copy is 18 px), so the
     Austrian import writes the marker itself (withCopytextLarge)
   - the default h3 and h4 (www's heading-copytext-large, lh-com's unmarked default): CoreSans 500,
     16 / 17.6 on phones, 18 / 19.8 from 1025 px; the cards keep their Portada titles
   - list items 5 px apart (www), the paragraph inside an item without its 24 px margin
   Run: node --max-old-space-size=512 --test test/austrian-parity-002.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const theme = () => fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('withCopytextLarge: www\'s intro paragraphs keep their style as a marker the cleanup leaves alone', async () => {
  const { withCopytextLarge } = await import('../tools/importer/austrian-import.mjs');
  assert.equal(withCopytextLarge('<p class="copytext-large">Fliegen stellt eine Belastung dar.</p>'), '<p class="copytext-large">Fliegen stellt eine Belastung dar. {copytext-large}</p>');
  assert.equal(withCopytextLarge('<p class="copytext-large">A {copytext-small}</p>'), '<p class="copytext-large">A {copytext-small}</p>', 'a marker already there');
  assert.equal(withCopytextLarge('<p class="copytext-large"> </p>'), '<p class="copytext-large"> </p>', 'empty');
  assert.equal(withCopytextLarge('<p class="text">B</p>'), '<p class="text">B</p>');
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /withTeaserCta\(withTeaserColumns\(withCheckinTabs\(withCopytextLarge\(withLinkOuts\(/);
});

test('the theme: the intro, the default h3 / h4, the lists as www\'s', () => {
  const css = theme();
  assert.match(css, /body\.brand-austrian main p\.copytext-large \{ font-family: var\(--heading-font-family\); font-size: 18px; font-weight: 400; line-height: 27px; \}/);
  assert.match(css, /body\.brand-austrian main :is\(\.default-content-wrapper, \.columns-media-text\) > :is\(h3, h4\):not\(\[class\*="heading-"\]\) \{ font-family: var\(--body-font-family\); font-size: 16px; font-weight: 500; line-height: 1\.1; \}/);
  assert.match(css, /@media \(width >= 1025px\) \{ body\.brand-austrian main :is\(\.default-content-wrapper, \.columns-media-text\) > :is\(h3, h4\):not\(\[class\*="heading-"\]\) \{ font-size: 18px; \} \}/);
  assert.match(css, /body\.brand-austrian main :is\(\.default-content-wrapper, \.columns-media-text, \.accordion-columns\) li \{ margin-bottom: 5px; \}/);
  assert.match(css, /body\.brand-austrian main :is\(\.default-content-wrapper, \.columns-media-text, \.accordion-columns\) li > p \{ margin-bottom: 0; \}/);
});
