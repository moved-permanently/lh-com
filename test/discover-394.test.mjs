/* eslint-disable max-len */
/* Discover, brief 394 (the open rows of brief 387, www.discover-airlines.com's capture discover-parity-001):
   the footer's legal links as www's a.link-large (18/18 bold, one per line on phones), links in running
   text 18 px regular, table row headers regular, and the brand-scoped columns-media option side-picture
   (www's nested two-column view: Customer service's WhatsApp text beside its QR code).
   Run: node --max-old-space-size=256 --test test/discover-394.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('footer: the legal links 18 px as the column links, one per line on phones', () => {
  has(/--footer-legal-direction: column;/);
  has(/body\.brand-discover \.footer \.footer-legal \.footer-link \{ font-size: 18px; \}/);
});

test('links in running text 18 px (www\'s .richtext a, the copy 16 px); table row headers regular as www\'s cells', () => {
  has(/body\.brand-discover main :is\(\.default-content-wrapper, \.columns-media-text\) :is\(p:not\(\.link-wrapper, \.button-wrapper\), li\) a:any-link:not\(\.button\) \{ font-size: 18px; font-weight: 400; \}/);
  has(/body\.brand-discover \.table-striped tbody th \{ font-weight: 400; \}/);
});

test('side-picture: a text cell ending in a picture shows it beside the text under the cell\'s heading from 768 px, below it on phones', () => {
  has(/body\.brand-discover \.columns-media\.side-picture \.columns-media-text:has\(> p > picture\) \{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\);[^}]*column-gap: 20px;/);
  has(/@media \(width >= 768px\) \{[^@]*body\.brand-discover \.columns-media\.side-picture \.columns-media-text:has\(> p > picture\) \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
  has(/body\.brand-discover \.columns-media\.side-picture \.columns-media-text:has\(> p > picture\) > \* \{ grid-column: 1; \}/);
  has(/body\.brand-discover \.columns-media\.side-picture \.columns-media-text:has\(> p > picture\) > :is\(h2, h3, h4\):first-child \{ grid-column: 1 \/ -1; \}/);
  has(/@media \(width >= 768px\) \{[^@]*body\.brand-discover \.columns-media\.side-picture \.columns-media-text > p:has\(> picture\) \{ grid-column: 2; grid-row: 2 \/ span 20; \}/);
});

test('text-only teaser cards (Santorini\'s flight info and weather) as www\'s a.teaser.card: 20 px padding, 1 px 30 % dark sky blue border, 6 px corners, the soft shadow, 10 px under the title', () => {
  has(/body\.brand-discover \.carousel-cards\.grid \.carousel-cards-slide\.carousel-cards-text-only, body\.brand-discover \.carousel-cards\.grid \.carousel-cards-slide\.carousel-cards-text-only:hover \{[^}]*border: 1px solid rgb\(0 62 123 \/ 30%\);[^}]*border-radius: 6px;[^}]*box-shadow: 0 4px 12px rgb\(0 37 84 \/ 10%\);/);
  has(/body\.brand-discover \.carousel-cards\.grid \.carousel-cards-slide\.carousel-cards-text-only \.carousel-cards-body \{ padding: 20px; \}/);
  has(/body\.brand-discover \.carousel-cards\.grid \.carousel-cards-slide\.carousel-cards-text-only \.carousel-cards-body > :is\(h1, h2, h3, h4, h5, h6\) \{ margin-bottom: 10px; \}/);
  has(/body\.brand-discover \.carousel-cards\.grid \.carousel-cards-slide\.carousel-cards-text-only \.carousel-cards-body > :last-child \{ margin-bottom: 0; \}/, 'www\'s card ends at its text: 20 + 17.6 + 10 + 24 + 20 = 92 px');
});
