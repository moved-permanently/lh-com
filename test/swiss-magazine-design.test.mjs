/* eslint-disable max-len */
/* SWISS's magazine in www's own design (SWISS parity rows 20 and 21, brief 400; swiss-parity-001's
   magazine home and the a350 article at 1440 and 390). A brand's sub-site (scripts/site-languages.js
   SUB_SITES) marks the body (sub-site-<name>) and may name a stylesheet of its own: the magazine's
   styles/themes/swiss-magazine.css, loaded on /magazine/ pages only, after the brand's theme. Its
   rules stay under body.brand-swiss.sub-site-magazine. The article pages need no document change;
   the home's documents get www's sections (the Top Stories band) and the More Stories links.
   Run: node --max-old-space-size=512 --test test/swiss-magazine-design.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { loadSubSiteTheme } from '../scripts/brand.js';
import { SUB_SITES, subSiteOf } from '../scripts/site-languages.js';

const MAG = 'body.brand-swiss.sub-site-magazine';

/** The selectors of a selector list, split on the commas outside parentheses. */
function selectorList(list) {
  const out = [];
  let depth = 0;
  let cur = '';
  [...list].forEach((c) => {
    if (c === '(') depth += 1;
    if (c === ')') depth -= 1;
    if (c === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += c;
  });
  if (cur.trim()) out.push(cur.trim());
  return out;
}
const css = fs.readFileSync('styles/themes/swiss-magazine.css', 'utf8');
const flat = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('the magazine names its stylesheet; the corporate site and medical services none', () => {
  assert.equal(subSiteOf('swiss', '/magazine/en/inside-swiss/behind-the-scenes/a350-special-livery').theme, 'swiss-magazine');
  assert.equal(subSiteOf('swiss', '/magazine/de').theme, 'swiss-magazine');
  SUB_SITES.swiss.filter((s) => s.name !== 'magazine').forEach((s) => assert.equal(s.theme, undefined, s.name));
});

test('loadSubSiteTheme: the body class, the sub-site\'s stylesheet; none for a page outside a sub-site', async () => {
  const { document } = parseHTML('<!DOCTYPE html><html><head></head><body class="brand-swiss"></body></html>');
  const saved = { document: globalThis.document, window: globalThis.window };
  globalThis.document = document;
  globalThis.window = { hlx: { codeBasePath: '' } };
  try {
    const loaded = [];
    const loader = async (href) => { loaded.push(href); };
    assert.equal(await loadSubSiteTheme(subSiteOf('swiss', '/magazine/en'), loader), 'magazine');
    assert.ok(document.body.classList.contains('sub-site-magazine'));
    assert.deepEqual(loaded, ['/styles/themes/swiss-magazine.css']);
    assert.equal(await loadSubSiteTheme(subSiteOf('swiss', '/corporate/en/homepage'), loader), 'corporate');
    assert.ok(document.body.classList.contains('sub-site-corporate'));
    assert.equal(loaded.length, 1, 'no stylesheet for the corporate site');
    assert.equal(await loadSubSiteTheme(null, loader), '');
    // a stylesheet that does not load leaves the page as it is
    assert.equal(await loadSubSiteTheme(subSiteOf('swiss', '/magazine/de'), async () => { throw new Error('404'); }), 'magazine');
  } finally {
    Object.assign(globalThis, saved);
  }
});

test('scripts.js loads it with the brand\'s theme', () => {
  const js = fs.readFileSync('scripts/scripts.js', 'utf8');
  assert.ok(js.includes('loadSubSiteTheme(locale.subSite)'), 'loadEager');
  assert.ok(fs.readFileSync('scripts/locale.js', 'utf8').includes('...(sub.theme ? { theme: sub.theme } : {}),'), 'getLocale().subSite carries it');
});

test('swiss-magazine.css: every rule under the magazine\'s body classes', () => {
  const rules = flat.replace(/@font-face \{[^}]*\}/g, '').replace(/@media[^{]*\{/g, '');
  const selectors = rules.split('}').map((r) => r.split('{')[0].trim()).filter(Boolean)
    .flatMap(selectorList);
  assert.ok(selectors.length > 20);
  selectors.forEach((s) => assert.ok(s.startsWith(MAG), s));
});

test('www\'s look: the header over the hero, the band, the cards, the article', () => {
  const has = (s) => assert.ok(flat.includes(s), s);
  // the header lies over the page's first picture (home and article), white, www's 72 px bar
  has(`${MAG}:has(main .hero-card-overlay, main .article-header) header`);
  has('--magazine-header-height: 72px;');
  // the Top Stories band and the lists' 790 px column
  has(`${MAG} main > .section.grey`);
  has('--magazine-column: 790px;');
  // chips: white on the band, grey #f2f2f2 elsewhere; the article's # tags
  has('#f2f2f2');
  has("content: '#'");
  // the article's body in the serif (Pensum Pro, www's), 18 px
  has('--magazine-serif: "Pensum Pro", georgia, serif;');
  has('font-family: var(--magazine-serif);');
  // the breadcrumb under the hero
  has('order:');
});
