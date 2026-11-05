/* eslint-disable max-len */
/* Lufthansa, brief 404 (the user's decisions on tools/reports/lufthansa/parity.md, capture
   lufthansa-parity-001):
   - lh-com's body is marked body.brand-lufthansa (lh-com has no brand key; brand pages keep only
     their own class), so lh-com-only rules can be scoped where another brand's www differs;
   - A1: lh-com's carousel dots as the six brands' (87f5d985): 24 px targets with the 8 px dot drawn
     inside (test/carousel-dots-374.test.mjs), and columns-media's slider dots the same for lh-com.
   Run: node --max-old-space-size=256 --test test/lufthansa-404.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { loadBrandTheme } from '../scripts/brand.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const meta = (values) => (name) => values[name] || '';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('lh-com\'s body is brand-lufthansa, loads no theme; a brand page keeps only its own class', async () => {
  const { document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
  const saved = { document: globalThis.document, window: globalThis.window };
  globalThis.document = document;
  globalThis.window = { hlx: { codeBasePath: '' } };
  try {
    const loaded = [];
    assert.equal(await loadBrandTheme(meta({}), async (href) => { loaded.push(href); }), '');
    assert.equal(document.body.classList.contains('brand-lufthansa'), true);
    assert.deepEqual(loaded, []);
    document.body.className = '';
    assert.equal(await loadBrandTheme(meta({ brand: 'discover' }), async (href) => { loaded.push(href); }), 'discover');
    assert.equal(document.body.className, 'brand-discover');
  } finally {
    globalThis.document = saved.document;
    globalThis.window = saved.window;
  }
});

test('A1: columns-media slider dots on lh-com: 24 px targets touching, the 8 px dot drawn inside', () => {
  const css = read('blocks/columns-media/columns-media.css');
  const sel = (rest) => esc(`body.brand-lufthansa .columns-media .columns-media-dots${rest}`);
  assert.match(css, new RegExp(`${sel('')} \\{ gap: 0; \\}`));
  assert.match(css, new RegExp(`${sel(' button')} \\{[^}]*display: flex;[^}]*width: 24px; height: 24px;[^}]*border: 0;[^}]*background: none;`));
  assert.match(css, new RegExp(`${sel(' button')}::before \\{[^}]*width: 8px; height: 8px; border: 1px solid var\\(--lh-grey-7\\); border-radius: 50%; background-color: var\\(--lh-white\\);`));
  assert.match(css, new RegExp(`${sel(' button')}\\[aria-current="true"\\]::before \\{ border-color: var\\(--lh-deepblue\\); background-color: var\\(--lh-deepblue\\); \\}`));
});

test('row 4: lh-com\'s article list as www\'s (titles, date line, descriptions, item padding, count); not the grid variant', () => {
  const css = read('blocks/blog-overview/blog-overview.css');
  const L = 'body.brand-lufthansa .blog-overview:not(.grid)';
  const rule = (sel) => { const m = css.match(new RegExp(`${esc(sel)} \\{([^}]*)\\}`)); return m ? m[1] : ''; };
  assert.match(rule(`${L} .blog-overview-list`), /gap: 0;/, 'the items touch, their padding apart');
  assert.match(rule(`${L} .blog-overview-card`), /padding: 20px 0;/, 'phones: 20px above and below');
  assert.match(css, new RegExp(`@media \\(width >= 1025px\\) \\{[^@]*${esc(L)} \\{ padding-inline: 0; \\}[^@]*${esc(L)} .blog-overview-card \\{ padding: 40px; \\}`), 'from 1025px 40px around each item, the block without its side padding');
  const title = rule(`${L} .blog-overview-title`);
  assert.ok(/margin: 0 0 30px;/.test(title) && /font-size: var\(--heading-font-size-xl\);/.test(title) && /font-weight: 300;/.test(title) && /line-height: 1\.1;/.test(title), 'title LufthansaHead 36/39.6 (28.1 on phones) light, 30px below');
  assert.match(rule(`${L} .blog-overview-title a:any-link`), /font-weight: inherit;/, 'the title link not bold');
  const info = rule(`${L} .blog-overview-info`);
  assert.ok(/margin: 0 0 10px;/.test(info) && /font-family: var\(--heading-font-family\);/.test(info) && /font-size: var\(--heading-font-size-m\);/.test(info) && /font-weight: 700;/.test(info) && /line-height: 1\.1;/.test(info), 'date line LufthansaHead 24/26.4 (20.1 on phones) bold');
  const desc = rule(`${L} .blog-overview-description`);
  assert.ok(/margin: 0 0 10px;/.test(desc) && /font-size: 18px;/.test(desc) && /line-height: 27px;/.test(desc), 'descriptions 18/27');
  const count = rule(`${L} .blog-overview-count`);
  assert.ok(/font-family: var\(--heading-font-family\);/.test(count) && /font-size: var\(--heading-font-size-xl\);/.test(count) && /font-weight: 300;/.test(count) && /line-height: 1\.1;/.test(count), 'count line LufthansaHead light, the number bold');
  assert.match(rule(`${L} .blog-overview-count strong`), /font-weight: 700;/);
  assert.doesNotMatch(css, /brand-swiss|brand-brussels|sub-site-/, 'SWISS (magazine) and Brussels keep the block\'s look');
});

test('row 21: lh-com\'s teaser CTAs keep the plain arrow when they open a new tab (www\'s maui-navigation-link variant hyper)', () => {
  const css = read('blocks/cards-teaser/cards-teaser.css');
  const arrow = "M13.3 4.3 12 5.6l5.4 5.5H3v1.8h14.4L12 18.4l1.3 1.3L21 12z";
  // as specific as the external rule (its :not() parts), so it wins after it
  const m = css.match(/body\.brand-lufthansa \.cards-teaser \.cards-teaser-cta-link\[target="_blank"\]:not\(\[href\*="\/\/www\.lufthansa\.com"\]\):not\(\.cards-teaser-cta-own\)::before \{([^}]*)\}/);
  assert.ok(m, 'an lh-com rule after the external one');
  assert.ok(m[1].includes(arrow), 'the right arrow');
  assert.ok(css.indexOf(m[0]) > css.indexOf('variant external (off-site links)'), 'after the external arrow');
});

test('item 8: an icon in a default-content heading is www\'s .nav-link-list heading image (26px, 12px before the text, 2px up), every brand', () => {
  const css = read('styles/styles.css');
  const H = 'main .default-content-wrapper :is(h2, h3, h4, h5, h6)';
  assert.match(css, new RegExp(`${esc(`${H}:has(> picture)`)} \\{ display: flex; align-items: center; \\}`));
  assert.match(css, new RegExp(`${esc(`${H} > picture`)} \\{ position: relative; bottom: 2px; flex: 0 0 auto; margin-right: 12px; \\}`));
  assert.match(css, new RegExp(`${esc(`${H} > picture img`)} \\{ display: block; width: 26px; height: 26px; \\}`));
});

test('item 8: a partner list of one card spans the row (www\'s one-column view of a.teaser.partner)', () => {
  const css = read('blocks/cards-icon-text/cards-icon-text.css');
  assert.match(css, /\.cards-icon-text\.partner > ul:has\(> li:only-child\) \{ grid-template-columns: minmax\(0, 1fr\); \}/);
});

test('item 8: columns-media option link-list (www\'s .link-list.nav-link-list icon headings): the 26px icon before the text, no indent; two columns from 768px, the row\'s cells from 1025px', () => {
  const css = read('blocks/columns-media/columns-media.css');
  const T = '.columns-media.link-list .columns-media-row > .columns-media-text';
  const rule = (sel) => { const m = css.match(new RegExp(`${esc(sel)} \\{([^}]*)\\}`)); return m ? m[1] : ''; };
  const h = rule(`${T} :is(h3, h4):has(> picture)`);
  assert.ok(/display: flex;/.test(h) && /align-items: center;/.test(h) && /margin: 0;/.test(h) && /padding: 0 0 18px;/.test(h) && /font-size: 18px;/.test(h), 'heading-copytext-large, 18px below');
  const pic = rule(`${T} :is(h3, h4) > picture`);
  assert.ok(/position: relative;/.test(pic) && /bottom: 2px;/.test(pic) && /margin-right: 12px;/.test(pic), 'the icon 12px before the text, 2px up');
  assert.match(rule(`${T} :is(h3, h4) > picture img`), /width: 26px; height: 26px;/);
  assert.match(rule(`${T} :is(h3, h4):has(> picture) ~ p:not(.link-wrapper, .button-wrapper)`), /margin-left: 0;/);
  assert.match(css, /@media \(width >= 768px\) and \(width < 1025px\) \{[^@]*\.columns-media\.link-list \.columns-media-row \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
});

test('rows 22: in a teaser card a {heading-small} title keeps the class\'s margin (32px at 1440, www\'s h3.heading-small), as styles.css promises the markers', () => {
  const css = read('blocks/cards-teaser/cards-teaser.css');
  assert.match(css, /\.cards-teaser \.cards-teaser-body > :is\(h1, h2, h3, h4, h5, h6\)\.heading-small \{ margin-bottom: var\(--heading-margin-l\); \}/);
});

test('row 16: the slider\'s text cell keeps its 68px only stacked (below 768px), not beside the pictures (online-check-in\'s app band 68px too tall)', () => {
  const css = read('blocks/columns-media/columns-media.css');
  const sel = '.columns-media.slider .columns-media-row > .columns-media-text:not(:last-child) { margin-bottom: 68px; }';
  const at = css.indexOf(sel);
  assert.ok(at > 0, 'the rule');
  const before = css.slice(0, at);
  const open = before.lastIndexOf('@media');
  assert.ok(open > 0 && /^@media \(width < 768px\) \{/.test(before.slice(open)) && !before.slice(open).includes('}'), 'inside @media (width < 768px)');
});
