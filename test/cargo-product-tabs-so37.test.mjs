/* eslint-disable max-len */
/* Standing order 37 of 2026-11-15, item 3 (finish-cargo.txt, delta-so37-cargo-product-tabs.txt): the product pages' tab
   sets (accordion-columns (faq, tabs)) as www's (cargo-parity-003's nav-tabs over tab-pane cards): from 1025 px the
   tabs share the row, 64 px tall, the selected one bold over a 4 px navy line; the panel 20 px under the bar, flush;
   the media row two columns 24 px apart with nothing above or below; list items 10 px apart. Support & Contact's
   finder (tabs, filter) keeps its own rules. Cargo's theme only.
   Run: node --max-old-space-size=512 --test test/cargo-product-tabs-so37.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const wide = (() => {
  const out = [];
  const re = /@media \(width >= 1025px\) \{/g;
  let m = re.exec(css);
  while (m) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (depth && i < css.length) {
      if (css[i] === '{') depth += 1;
      if (css[i] === '}') depth -= 1;
      i += 1;
    }
    out.push(css.slice(start, i - 1));
    m = re.exec(css);
  }
  return out.join(' ');
})();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rule = (sel) => {
  const m = wide.match(new RegExp(`(?:^|[;{}]) *${esc(sel)} \\{([^}]*)\\}`));
  assert.ok(m, `no rule from 1025 px for ${sel}`);
  return m[1];
};
const T = 'body.brand-cargo .accordion-columns.tabs:not(.filter)';

test('the tab bar: no gap, no space under it; each tab a share of the row, 64 px (20 + 24 + 16 + the 4 px line), #666, regular, centred', () => {
  assert.match(rule(`${T}.is-tabbed > .accordion-columns-tablist`), /gap: 0;[^}]*margin-bottom: 0;/);
  const tab = rule(`${T} .accordion-columns-tab`);
  assert.match(tab, /flex: 1 1 0;/);
  assert.match(tab, /padding: 20px 20px 16px;/);
  assert.match(tab, /border-bottom: 4px solid transparent;/);
  assert.match(tab, /color: #666;/);
  assert.match(tab, /font-family: var\(--body-font-family\);/);
  assert.match(tab, /font-weight: 400;/);
  assert.match(tab, /text-align: center;/);
  assert.match(rule(`${T} .accordion-columns-tab[aria-selected="true"]`), /border-bottom-color: #05164d;[^}]*color: #05164d;[^}]*font-weight: 700;/);
});

test('the panel 20 px under the bar and flush; its headings Light; the media row 24 px apart with no margin; list items 10 px apart', () => {
  assert.match(rule(`${T}.is-tabbed > .accordion-columns-item > .accordion-columns-panel`), /padding: 20px 0 0;/);
  assert.match(rule(`${T}.is-tabbed .accordion-columns-panel h3`), /font-weight: 300;/);
  assert.match(rule(`${T}.is-tabbed .accordion-columns-media-row`), /gap: 24px;[^}]*margin: 0;/);
  assert.match(rule(`${T}.is-tabbed .accordion-columns-panel li:not(:last-child)`), /margin-bottom: 10px;/);
});

test('scoped: every rule of the product tab sets is from 1025 px and excludes Support & Contact\'s finder (tabs, filter)', () => {
  const all = css.match(/[^{};]*\.accordion-columns\.tabs:not\(\.filter\)[^{]*\{/g) || [];
  assert.equal(all.length, 7);
  all.forEach((s) => assert.ok(wide.includes(s.trim()), `outside the 1025 px query: ${s}`));
  all.forEach((s) => assert.match(s, /^ ?body\.brand-cargo /));
});
