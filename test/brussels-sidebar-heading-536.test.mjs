/* eslint-disable max-len */
/* The brief after 530, item 3 (Brussels, the next open cause in the ranking): in a sidebar's text (columns-media sidebar,
   withSidebarContent) a heading straight after a paragraph is www's headline component: 49 to 51 px under the text at 1440
   for an h2 and 44 to 45 on phones (invoices, upgrades en and fr: the recordings of brief 497), 32 / 28 px for an h3 (the
   imprint); ours had the paragraph's 20 / 16 px, -30 / -29 px at every such h2 (-7.4 % on invoices). 107 Brussels
   documents have such a pair (171 h2, 115 h3). Outside the sidebar the gap is www's already (126 h2 at 1440, median -1).
   Run: node --max-old-space-size=256 --test test/brussels-sidebar-heading-536.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-brussels main .columns-media.sidebar .columns-media-text > p:not(.column-mark) + ';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('on phones a sidebar\'s heading after text 45 px (h2) / 28 px (h3) under it, the margins collapsing with the paragraph\'s', () => {
  assert.match(css, new RegExp(`(?:^|\\} )${esc(`${SEL}h2`)} \\{ margin-top: 45px; \\}`));
  assert.match(css, new RegExp(`(?:^|\\} )${esc(`${SEL}h3`)} \\{ margin-top: 28px; \\}`));
});

test('from 768 px 50 px (h2) / 32 px (h3)', () => {
  const wide = css.match(new RegExp(`@media \\(width >= 768px\\) \\{ ${esc(`${SEL}h2`)} \\{[^}]*\\} ${esc(`${SEL}h3`)} \\{[^}]*\\} \\}`))?.[0] || '';
  assert.match(wide, new RegExp(`${esc(`${SEL}h2`)} \\{ margin-top: 50px; \\}`));
  assert.match(wide, new RegExp(`${esc(`${SEL}h3`)} \\{ margin-top: 32px; \\}`));
});

test('only the sidebar\'s text: no rule for default content\'s headings', () => {
  assert.ok(!/\.default-content-wrapper > p[^{]*\+ h2 \{ margin-top/.test(css));
});
