/* eslint-disable max-len */
/* Lufthansa Cargo's Support & Contact as www's (brief 482, row 21 of the sweep after 470;
   cargo-parity-001 at 1440 and 390): the finder a white card on a grey band (#f5f5f5, 40 px above and
   below it, 20 px on phones) headed "Need support on your topic?" (28 / 32 px, 24 / 28 px on
   phones), the field's label inside it, www's topic chips under it (34 px pills, #ccc ring, 14 / 18 px,
   10 px apart); the line "Select a topic ..." under the band; in each tab the topics a list (636 px:
   title 18 / 24 px, line 14 / 18 px, 10 px 10 px 10 px 24 px, a #ccc rule; the chosen one navy with
   white text) beside the chosen topic's links (a #f5f5f5 panel, 20 px 24 px, its title 28 / 32 px,
   the links 18 / 24 px bold #52627c with an arrow, 20 px apart); on phones the topics an accordion.
   Layout in blocks/accordion-columns/accordion-columns.css, the look in styles/themes/cargo.css.
   Run: node --max-old-space-size=256 --test test/cargo-support-topics-482.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const block = read('blocks/accordion-columns/accordion-columns.css');
const theme = read('styles/themes/cargo.css');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rule = (css, sel) => (css.match(new RegExp(`(?:^|[}{] ?)${esc(sel)} \\{[^}]*\\}`, 'g')) || []).join(' ');
const media = (css, q) => {
  const out = [];
  for (let i = css.indexOf(`@media ${q} {`); i >= 0; i = css.indexOf(`@media ${q} {`, i + 1)) {
    let depth = 0;
    let k = css.indexOf('{', i);
    const start = k;
    for (; k < css.length; k += 1) {
      if (css[k] === '{') depth += 1;
      else if (css[k] === '}') { depth -= 1; if (!depth) break; }
    }
    out.push(css.slice(start + 1, k));
  }
  return out.join(' ');
};

test('block: the topics an accordion on phones, from 1025 px the list in the first column and the chosen topic\'s panel beside it', () => {
  assert.match(rule(block, '.accordion-columns.tabs.filter .accordion-columns-topic'), /display: flex;[^}]*width: 100%;[^}]*text-align: left;/);
  assert.match(rule(block, '.accordion-columns.tabs.filter .accordion-columns-topic-panel[hidden]'), /display: none;/);
  assert.match(rule(block, '.accordion-columns.tabs.filter .accordion-columns-topic-panel-title'), /display: none;/);
  const wide = media(block, '(width >= 1025px)');
  assert.match(wide, /\.accordion-columns\.tabs\.filter \.accordion-columns-topics \{ display: grid; grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\); grid-template-rows: repeat\(var\(--topics\), auto\) 1fr; column-gap: 24px;/);
  assert.match(wide, /\.accordion-columns\.tabs\.filter \.accordion-columns-topic-heading \{ grid-column: 1; \}/);
  assert.match(wide, /\.accordion-columns\.tabs\.filter \.accordion-columns-topic-panel \{ grid-row: 1 \/ span var\(--topics\); grid-column: 2; \}/);
  assert.match(wide, /\.accordion-columns\.tabs\.filter \.accordion-columns-topic-panel-title \{ display: block; \}/);
});

const F = 'body.brand-cargo .accordion-columns.tabs.filter';

test('the finder: a white card on the grey band, 20 px 24 px inside (20 px 16 px on phones), headed 28 / 32 px (bold: www\'s head font at 400 is our 700)', () => {
  assert.match(rule(theme, `${F} > .accordion-columns-filter`), /display: grid;[^}]*gap: 0;[^}]*margin: 20px 0 40px;[^}]*padding: 20px 16px;[^}]*box-shadow: 0 1px 4px 0 rgb\(0 0 0 \/ 20%\), 0 0 0 100vmax #f5f5f5;[^}]*clip-path: inset\(-20px -100vmax\);/);
  assert.match(rule(theme, `${F} .accordion-columns-filter-heading`), /margin: 0 0 44px;[^}]*color: #05164d;[^}]*font-size: 24px;[^}]*font-weight: 700;[^}]*line-height: 28px;/);
  const wide = media(theme, '(width >= 1025px)');
  assert.match(wide, new RegExp(`${esc(F)} > \\.accordion-columns-filter \\{ margin: 40px 0 80px; padding: 20px 24px; clip-path: inset\\(-40px -100vmax\\); \\}`));
  assert.match(wide, new RegExp(`${esc(F)} \\.accordion-columns-filter-heading \\{ margin-bottom: 30px; font-size: 28px; line-height: 32px; \\}`));
});

test('the field: its label inside it (gone once something is typed), www\'s chevron at its end', () => {
  assert.match(rule(theme, `${F} .accordion-columns-filter label`), /grid-area: field;[^}]*align-self: start;[^}]*margin-top: 8px;[^}]*pointer-events: none;/);
  assert.match(rule(theme, `${F} .accordion-columns-filter-field`), /grid-area: field;/);
  assert.match(rule(theme, `${F} .accordion-columns-filter:has(.accordion-columns-filter-clear:not([hidden])) label`), /visibility: hidden;/);
  assert.match(rule(theme, `${F} .accordion-columns-filter input`), /background: url\("data:image\/svg\+xml,[^"]+"\) right 4px center \/ 16px no-repeat;/);
});

test('the chips: pills 38 px under the field, 10 px apart, #ccc ring, 14 / 18 px navy, 7 px 20 px', () => {
  assert.match(rule(theme, `${F} .accordion-columns-filter-chips`), /display: flex;[^}]*flex-wrap: wrap;[^}]*gap: 10px;[^}]*margin: 38px 0 6px;[^}]*padding: 0;[^}]*list-style: none;/);
  const a = rule(theme, `${F} .accordion-columns-filter-chips a:any-link`);
  assert.match(a, /display: inline-block;[^}]*border: 1px solid #ccc;[^}]*border-radius: 17px;[^}]*background-color: #fff;[^}]*padding: 7px 20px;[^}]*color: #05164d;[^}]*font-size: 14px;[^}]*font-weight: 400;[^}]*line-height: 18px;[^}]*text-decoration: none;/);
  assert.match(rule(theme, `${F} .accordion-columns-filter-chips a:is(:hover, :focus-visible)`), /background-color: #05164d;[^}]*color: #fff;/);
});

test('the line under the band, 20 px over the tabs; the panels 30 px under the tab bar', () => {
  assert.match(rule(theme, `${F} > .accordion-columns-filter-intro`), /margin: 0 0 20px;[^}]*font-size: 18px;[^}]*line-height: 24px;/);
  assert.match(media(theme, '(width >= 1025px)'), new RegExp(`${esc(F)}\\.is-tabbed > \\.accordion-columns-item > \\.accordion-columns-panel \\{ padding-top: 30px; \\}`));
});

test('the topics: www\'s list (the chosen one navy) and its panel from 1025 px; an accordion with a chevron on phones', () => {
  assert.match(rule(theme, `${F} .accordion-columns-panel .accordion-columns-topic-heading`), /max-width: none;[^}]*margin: 0;[^}]*font-weight: 400;/);
  assert.match(media(theme, '(width >= 1025px)'), new RegExp(`${esc(F)}\\.is-tabbed > \\.accordion-columns-item > \\.accordion-columns-panel:has\\(\\.accordion-columns-topics\\) \\{ padding-right: 0; padding-left: 0; \\}`));
  const t = rule(theme, `${F} .accordion-columns-topic`);
  assert.match(t, /padding: 13px 44px 13px 10px;[^}]*border-bottom: 1px solid #ccc;[^}]*color: #05164d;/);
  assert.match(rule(theme, `${F} .accordion-columns-topic-title`), /font-size: 18px;[^}]*font-weight: 300;[^}]*line-height: 24px;/);
  assert.match(rule(theme, `${F} .accordion-columns-topic-text`), /font-size: 14px;[^}]*line-height: 18px;/);
  assert.match(rule(theme, `${F} .accordion-columns-topic::after`), /mask: url\("data:image\/svg\+xml,[^"]+"\) center \/ contain no-repeat;/);
  assert.match(rule(theme, `${F} .accordion-columns-topic[aria-expanded="true"]::after`), /transform: rotate\(180deg\);/);
  assert.match(rule(theme, `${F} .accordion-columns-topic-panel`), /margin: 0 20px 20px 10px;[^}]*background-color: #f5f5f5;[^}]*padding: 30px 16px;/);
  const wide = media(theme, '(width >= 1025px)');
  assert.match(wide, new RegExp(`${esc(F)} \\.accordion-columns-topic \\{ padding: 10px 10px 10px 24px; \\}`));
  assert.match(wide, new RegExp(`${esc(F)} \\.accordion-columns-topic::after \\{ content: none; \\}`));
  assert.match(wide, new RegExp(`${esc(F)} \\.accordion-columns-topic-title \\{ font-weight: 400; \\}`));
  assert.match(wide, new RegExp(`${esc(F)} \\.accordion-columns-topic\\[aria-expanded="true"\\] \\{ border-bottom-color: transparent; background-color: #05164d; color: #fff; \\}`));
  assert.match(wide, new RegExp(`${esc(F)} \\.accordion-columns-topic-panel \\{ margin: 0; padding: 20px 24px; \\}`));
});

test('the chosen topic\'s panel: its title 28 / 32 px, the links bold #52627c with an arrow, 14 / 18 px 22 px apart on phones, 18 / 24 px 20 px apart from 1025 px', () => {
  assert.match(rule(theme, `${F} .accordion-columns-topic-panel-title`), /margin: 0 0 20px;[^}]*color: #05164d;[^}]*font-size: 28px;[^}]*line-height: 32px;/);
  assert.match(rule(theme, `${F} .accordion-columns-topic-panel ul`), /margin: 0;[^}]*padding: 0;[^}]*list-style: none;/);
  assert.match(rule(theme, `${F} .accordion-columns-topic-panel li + li`), /margin-top: 22px;[^}]*\} .*margin-top: 20px;/);
  const a = rule(theme, `${F} .accordion-columns-topic-panel a:any-link`);
  assert.match(a, /display: inline-flex;[^}]*gap: 13px;[^}]*color: #52627c;[^}]*font-size: 14px;[^}]*font-weight: 700;[^}]*line-height: 18px;[^}]*\} .*font-size: 18px; line-height: 24px;/);
  assert.match(rule(theme, `${F} .accordion-columns-topic-panel a:any-link::before`), /flex: 0 0 16px;[^}]*height: 18px;[^}]*mask: url\("data:image\/svg\+xml,[^"]+"\) center \/ 16px no-repeat;/);
});
