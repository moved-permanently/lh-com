/* eslint-disable max-len */
/* Lufthansa Cargo, the parity sweep after brief 470 (cargo.turnsthe.page against cargo-parity-001
   at 1440 and 390; tools/reports/parity-2026-11-08/sweep-brands.md, rows in
   tools/reports/cargo/parity.md). Cargo's theme only (styles/themes/cargo.css, rules under
   body.brand-cargo). Run: node --max-old-space-size=512 --test test/cargo-sweep-471.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const cargo = () => read('styles/themes/cargo.css');
const has = (css, re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));
const B = 'body\\.brand-cargo \\.cards-teaser\\.boxed';

test('row 30: boxed cards as www\'s lcagCard (Industries in focus): rows 20 px apart and columns 24, the picture straight on the text (no 40 px), the card headline (h4, www\'s cardHeadline) navy 18/24 bold 20 px over the text, its link navy, the text three lines at most', () => {
  const css = cargo();
  has(css, new RegExp(`${B} > ul \\{[^}]*gap: 20px 24px;`), 'www\'s card margin-top 20 px, its columns 24 px apart');
  has(css, new RegExp(`${B} > ul > li:nth-child\\(n\\) \\{[^}]*margin-top: 0;`), 'no stacked margins on phones (the gap instead)');
  has(css, new RegExp(`${B} \\.cards-teaser-image \\{[^}]*margin-bottom: 0;`));
  has(css, new RegExp(`${B} \\.cards-teaser-body h4 \\{[^}]*margin: 0 0 20px;[^}]*font-size: 18px;[^}]*font-weight: 700;[^}]*line-height: 24px;`));
  has(css, new RegExp(`${B} \\.cards-teaser-body h4 a:any-link \\{[^}]*color: #05164d;`), 'www\'s .lcagCard h4 a { color: #05164d }, not the link grey');
  has(css, new RegExp(`${B} \\.cards-teaser-body p \\{[^}]*display: -webkit-box;[^}]*overflow: hidden;[^}]*-webkit-line-clamp: 3;[^}]*-webkit-box-orient: vertical;`), 'www\'s clipTeaserboxText: three lines');
});

test('row 30: on phones the boxed card\'s picture across the screen (www: 390 px wide over the 358 px card)', () => {
  const css = cargo();
  const phone = css.split('@media (width < 768px)').slice(1).join(' ');
  has(phone, new RegExp(`${B} > ul > li \\{[^}]*overflow: visible;`));
  has(phone, new RegExp(`${B} \\.cards-teaser-image \\{[^}]*margin-inline: -17px;`), 'the 16 px page margin and the card\'s 1 px border');
});

test('row 32: eBooking\'s Add-on Services band (section navy) as www\'s blue-background: navy across the screen, 30 px above and 40 below, white text; the video 746 and the text 526 of the grid, 24 px apart, the heading 28/32 (24/28 on phones); on phones the video across the screen, the text 20 px under it', () => {
  const css = cargo();
  const S = 'body\\.brand-cargo main > \\.section\\.navy';
  has(css, new RegExp(`${S} \\{[^}]*padding: 30px 0 40px;[^}]*background-color: #05164d;[^}]*color: #fff;`));
  has(css, new RegExp(`${S} :is\\(h2, h3, p, li, a:any-link\\) \\{[^}]*color: #fff;`));
  has(css, new RegExp(`${S} \\.columns-media\\.wide-media \\.columns-media-media-first \\{[^}]*grid-template-columns: minmax\\(0, 746fr\\) minmax\\(0, 526fr\\);[^}]*column-gap: 24px;`));
  has(css, new RegExp(`${S} :is\\(h2, h3\\) \\{[^}]*font-size: 28px;[^}]*line-height: 32px;`));
  has(css, /body\.brand-cargo \.columns-media\.wide-media \.columns-media-media-first \{[^}]*grid-template-columns: minmax\(0, 1fr\) calc\(\(100% - 48px\) \/ 3\);[^}]*column-gap: 24px;/, 'CF8 off the band (the eServices app): www\'s col-8 | col-4');
  const phone = css.split('@media (width < 768px)').slice(1).join(' ');
  has(phone, new RegExp(`${S} \\{[^}]*padding: 0 0 20px;`), 'no space above the video on phones');
  has(phone, new RegExp(`${S} \\.columns-media\\.wide-media \\.columns-media-media \\{[^}]*margin: 0 calc\\(-1 \\* var\\(--layout-margin\\)\\) 20px;`));
  has(phone, new RegExp(`${S} :is\\(h2, h3\\) \\{[^}]*font-size: 24px;[^}]*line-height: 28px;`));
});
