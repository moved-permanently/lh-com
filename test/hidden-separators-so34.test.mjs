/* eslint-disable max-len */
/* Standing order 34 of 2026-11-15, item 2: a separator hidden at a width ("{spacer-N from-768}" on phones, "{spacer-N below-768}"
   from 768px) no longer moves the page at that width:
   - a section's last wrapper of separators that are all hidden at this width keeps margin-top 0 (not the -16px a
     separators-only last wrapper takes back; order 31's entry-exit-system lost 16px on desktop);
   - on theme pages a heading after content keeps the brand's heading gap when a separator hidden at this width stands in
     between (ITA group-boarding's phones lost 8px).
   Run: node --max-old-space-size=256 --test test/hidden-separators-so34.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a last wrapper of hidden separators takes nothing back', () => {
  assert.ok(css.includes('@media (width < 768px) { main > .section > .default-content-wrapper:last-child:not(:has(> :not(p.spacer.from-768))) { margin-top: 0; } }'));
  assert.ok(css.includes('@media (width >= 768px) { main > .section > .default-content-wrapper:last-child:not(:has(> :not(p.spacer.below-768))) { margin-top: 0; } }'));
  const base = css.indexOf('main > .section > .default-content-wrapper:last-child:not(:has(> :not(p.spacer))) { margin-top: -16px; }');
  assert.ok(base >= 0 && css.indexOf('p.spacer.from-768))) { margin-top: 0; }') > base, 'after the -16px rule');
});

test('a heading keeps its gap across a hidden separator', () => {
  const sel = 'body.theme-live.flow-spacing main .default-content-wrapper > :not(h1, h2, h3, h4, h5, h6, p.spacer:not(.divider))';
  assert.ok(css.includes(`@media (width < 768px) { ${sel} + p.spacer.from-768 + :is(h2, h3) { margin-top: var(--theme-heading-gap, 32px); } }`));
  assert.ok(css.includes(`@media (width >= 768px) { ${sel} + p.spacer.below-768 + :is(h2, h3) { margin-top: var(--theme-heading-gap, 32px); } }`));
});
