/* eslint-disable max-len */
/* the common theme, brief 536 item 1 (tools/reports/token-free/spacer-cost-536.md; the brief after 532, item 1b): on
   flow pages with the theme live a heading after other content gets the brand's heading gap (32 px), but not right
   after a Spacer block: the Spacer is the gap (ITA's terms-and-conditions-of-use, 13 Spacers before H2s, +676 px, +260
   with this). Dividers keep their own rules.
   Run: node --max-old-space-size=256 --test test/spacer-heading-gap-536.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.theme-live.flow-spacing main .default-content-wrapper > :not(h1, h2, h3, h4, h5, h6, p.spacer:not(.divider)) + :is(h2, h3)';

test('the heading gap skips a heading right after a Spacer, the live theme on flow pages only', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-top: var\(--theme-heading-gap, 32px\);/);
  assert.ok(SEL.includes('.theme-live') && SEL.includes('.flow-spacing'));
});

test('no other rule gives the heading after every separator the gap again', () => {
  assert.ok(!css.includes('body.theme-live.flow-spacing main .default-content-wrapper > :not(h1, h2, h3, h4, h5, h6) + :is(h2, h3) {'), 'the old selector is gone');
});
