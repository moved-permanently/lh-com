/* eslint-disable max-len */
/* The standing order of 2026-11-10, item 2 (lh-b2b ranking): a card carousel right under a link. www's link
   component has no margin below (43b88b05), so its card view sits its padding under the link: 40 px from 768 px,
   20 on phones (program/experts/news' "News archive", b2b-parity-001). Ours had row 35's space for a carousel under
   text (64 / 44 px: a paragraph's 24 and the view's 40 / 20): every card of the list 22 px lower at 390, 24 at 1440.
   Run: node --test test/b2b-link-before-cards.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-b2b main > .section:not(.grey) .default-content-wrapper:has(> p.link-wrapper:last-child) + .carousel-cards-wrapper';

test('B2B: a card carousel under a link sits the view\'s padding under it, 20 px on phones, 40 from 768 px', () => {
  const phone = css.indexOf(`${SEL} {`);
  assert.ok(phone >= 0, 'the rule');
  assert.match(css.slice(phone, css.indexOf('}', phone)), /margin-top: 20px;/);
  const wide = css.indexOf(`@media (width >= 768px) { ${SEL} {`);
  assert.ok(wide >= 0, 'the rule from 768 px');
  assert.match(css.slice(wide, css.indexOf('}', wide + 30)), /margin-top: 40px;/);
  assert.ok(phone > css.indexOf('body.brand-b2b main > .section:not(.grey) .default-content-wrapper + .carousel-cards-wrapper {'), 'after row 35\'s rule');
});
