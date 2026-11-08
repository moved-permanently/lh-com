/* eslint-disable max-len */
/* Discover Airlines, the parity sweep after brief 470 (discover.turnsthe.page against
   discover-parity-001 at 1440 and 390; tools/reports/parity-2026-11-08/sweep-brands.md, rows in
   tools/reports/discover/parity.md). Row 31 (the phone tab sets closed) is in
   test/section-tabs.test.mjs.
   Run: node --max-old-space-size=512 --test test/discover-sweep-471.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const theme = () => fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 30: two-up teaser cards as www\'s rows of .twocolumn (Additional services): from 768 px each row 80 px under the one above (the column view\'s 40 px above and below), the columns 20 px apart', () => {
  const css = theme();
  const wide = css.split('@media (width >= 768px)').slice(1).join(' ');
  assert.ok(/body\.brand-discover \.carousel-cards\.grid\.two-up \.carousel-cards-track \{[^}]*row-gap: 80px;/.test(wide), 'row-gap 80px from 768px');
});

test('row 30, brief 482: a re-import writes each of www\'s rows as its own two-up block (Additional services: Tec4Med and Uptrip alone in theirs); the blocks as far apart as the rows, 40 px on phones, 80 px from 768 px', () => {
  const css = theme();
  const sel = 'body.brand-discover main .carousel-cards-wrapper:has(> .carousel-cards.grid.two-up) + .carousel-cards-wrapper > .carousel-cards.grid.two-up';
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.ok(new RegExp(`\\} ${esc} \\{ margin-top: 40px; \\}`).test(css), '40px on phones');
  assert.ok(new RegExp(`@media \\(width >= 768px\\) \\{ ${esc} \\{ margin-top: 80px; \\} \\}`).test(css), '80px from 768px');
});

test('brief 490: text as www\'s .richtext (paragraphs and lists 36 px apart, margin-bottom 3.6rem) in default content, column text and accordion panels; consecutive column rows 40 px apart on phones, 80 px from 768 px (www\'s .column-view: 20 / 40 px above and below each row)', () => {
  const css = theme();
  const p = 'body.brand-discover main :is(.default-content-wrapper, .columns-media-text, .accordion-columns-panel) > :is(p, ul, ol):not(:last-child)';
  const rows = 'body.brand-discover main .columns-media-wrapper + .columns-media-wrapper';
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.ok(new RegExp(`${esc(p)} \\{ margin-bottom: 36px; \\}`).test(css), 'paragraphs 36px');
  assert.ok(new RegExp(`\\} ${esc(rows)} \\{ margin-top: 40px; \\}`).test(css), 'rows 40px on phones');
  assert.ok(new RegExp(`@media \\(width >= 768px\\) \\{ ${esc(rows)} \\{ margin-top: 80px; \\} \\}`).test(css), 'rows 80px from 768px');
});
