/* eslint-disable max-len */
/* Austrian, brief 394: www's FAQs card on /at/en and /at/de contact (the help center's info card:
   a grey band, the picture left, a white text panel right, stacked on phones) as the brand-scoped
   option panel of columns-media in Austrian's theme. Values from the capture austrian-parity-001:
   1440 the picture and the panel side by side without a gap, the panel padded 24 px (36 px on
   phones), 24 px between title, text and link; title CoreSans 24/26 medium (20/22), text 18/20 (16/18).
   Run: node --max-old-space-size=256 --test test/austrian-394.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('the panel option: picture and white panel without a gap, the panel 36 px padded (24 px from 768 px), 24 px between its parts', () => {
  has(/body\.brand-austrian \.columns-media\.panel \.columns-media-row \{ gap: 0; \}/);
  has(/body\.brand-austrian \.columns-media\.panel \.columns-media-text \{[^}]*display: flex; flex-direction: column; gap: 24px;[^}]*padding: 36px;[^}]*background-color: #fff;/);
  has(/@media \(width >= 768px\) \{[^@]*body\.brand-austrian \.columns-media\.panel \.columns-media-text \{ padding: 24px; \}/);
  has(/body\.brand-austrian \.columns-media\.panel \.columns-media-media img \{[^}]*height: auto;[^}]*object-fit: cover;/);
  has(/@media \(width >= 768px\) \{[^@]*body\.brand-austrian \.columns-media\.panel \.columns-media-media img \{ height: 100%; \}/, 'beside the panel as high as the row');
});

test('the panel as high as the picture; the picture www\'s 636:280 on phones; the grey band 48 px above and below', () => {
  has(/body\.brand-austrian \.columns-media\.panel \.columns-media-text \{[^}]*align-self: stretch;/);
  has(/body\.brand-austrian \.columns-media\.panel \.columns-media-media img \{[^}]*aspect-ratio: 159 \/ 70;/);
  has(/body\.brand-austrian main \.section\.grey:has\(\.columns-media\.panel\) \{ padding-top: 48px; padding-bottom: 48px; \}/);
});

test('the panel\'s type: title CoreSans 20/22 medium #1a1a1a (24/26 from 768 px), text 16/18 (18/20), parts without their own margins', () => {
  has(/body\.brand-austrian \.columns-media\.panel \.columns-media-text > :is\(h2, h3, h4\) \{[^}]*margin: 0;[^}]*color: #1a1a1a;[^}]*font-family: var\(--body-font-family\);[^}]*font-size: 20px;[^}]*font-weight: 500;[^}]*line-height: 22px;/);
  has(/body\.brand-austrian \.columns-media\.panel \.columns-media-text > p \{ margin: 0; \}/);
  has(/body\.brand-austrian \.columns-media\.panel \.columns-media-text > p:not\(\.link-wrapper, \.button-wrapper\) \{ font-size: 16px; line-height: 18px; \}/);
  has(/@media \(width >= 768px\) \{[^@]*\.columns-media\.panel \.columns-media-text > :is\(h2, h3, h4\) \{ font-size: 24px; line-height: 26px; \}/);
});
