/* eslint-disable max-len */
/* Austrian parity rows 5, 18, 19, 24 and 25 (brief 406; measured in www.austrian.com's capture
   austrian-parity-001, at/en at 1440 and 390). Austrian's theme (styles/themes/austrian.css),
   rules scoped to body.brand-austrian:
   - 5: the burger as www's list-menu icon (three 1 px lines 10 of 16 units wide, 24 px at every
     width);
   - 18: the article cards (Good reasons to take off: carousel-cards grid) as www's a.teaser: copy
     Portada 18/27 black, titles heading-l (22 to 28 px), 6 px corners, 30 px inside;
   - 19: the divider #b0b0b0 (www's 1 px maui-divider);
   - 24: the legal links from the link columns' edge, wrapping (one per line on phones), no rule
     above them or above the badges;
   - 25: the badges 27 x 27 px, 17 px apart (www's; Klarna's wide logo inside its square).
   Run: node --max-old-space-size=256 --test test/austrian-parity-406.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
// assert.match prints the whole stylesheet on a miss: the pattern only
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('row 5: www\'s burger lines, 24 px at every width', () => {
  has(/body\.brand-austrian \.header \.nav-menu-button \.lh-icon \{ width: 24px; height: 24px; background-color: currentcolor; mask: url\("data:image\/svg\+xml,[^"]*M12\.5 4\.5h-9[^"]*"\) center \/ contain no-repeat; \}/);
  has(/body\.brand-austrian \.header \.nav-menu-button \.lh-icon > \* \{ display: none; \}/);
});

test('row 18: the article cards\' copy Portada 18/27 black, titles heading-l, 6 px corners, 30 px inside', () => {
  has(/body\.brand-austrian \.carousel-cards\.grid \.carousel-cards-slide \{ border-radius: 6px; \}/);
  has(/body\.brand-austrian \.carousel-cards\.grid \.carousel-cards-body \{ padding: 30px; \}/);
  has(/body\.brand-austrian \.carousel-cards\.grid \.carousel-cards-slide:not\(\.carousel-cards-wide\) \.carousel-cards-body > p:not\(\.carousel-cards-cta, \.carousel-cards-eyebrow\) \{ color: #000; font-family: var\(--heading-font-family\); font-size: 18px; line-height: 27px; \}/);
  has(/body\.brand-austrian \.carousel-cards\.grid \.carousel-cards-slide:not\(\.carousel-cards-wide\) \.carousel-cards-body > :is\(h1, h2, h3, h4, h5, h6\) \{ margin-bottom: 21px; font-size: var\(--heading-font-size-l\); \}/);
});

test('row 19: the divider www\'s 1 px #b0b0b0', () => {
  has(/body\.brand-austrian main \.default-content-wrapper > p\.spacer\.divider \{ border-top-color: #b0b0b0; \}/);
});

test('rows 24 and 25: the legal links from the columns\' edge, no rules; the badges 27 px, 17 px apart', () => {
  has(/--footer-divider-color: transparent;/);
  has(/--footer-legal-direction: column;/);
  has(/body\.brand-austrian \.footer \.footer-badges \{ border-top: 0; \}/);
  has(/@media \(width >= 768px\) \{ body\.brand-austrian \.footer \.footer-legal \{ padding-left: 0; \} \}/);
  has(/@media \(width >= 1025px\) \{ body\.brand-austrian \.footer \.footer-inner\.has-wordmark \{ grid-template-areas: 'wordmark columns' '\. badges' 'search locale' 'divider divider' '\. legal' 'note note'; \} \}/);
  has(/body\.brand-austrian \.footer \.footer-badges ul \{ gap: 12px 17px; \}/);
  has(/body\.brand-austrian \.footer \.footer-inner \.footer-badges img \{ width: 27px; height: 27px; object-fit: contain; \}/);
});
