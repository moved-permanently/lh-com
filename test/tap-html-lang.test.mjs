/* eslint-disable max-len */
/* <html lang> on TAP's market roots (brief 353, parity row 52): www.flytap.com writes the
   language and the market of a market root (pt-ao, en-gb, de-ch), the language alone on its eight
   language versions (pt-pt, en-pt … and pt-br: pt, en …). scripts/site-languages.js
   htmlLangOfRoot gives a market root's (TAP_MARKETS, the roots answered from a language version),
   '' for every other path and site; scripts.js sets it before the page's language metadata.
   hreflang (lh-edge) and the sitemaps don't read it.
   Run: node --max-old-space-size=512 --test test/tap-html-lang.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SITE_LANGUAGES, htmlLangOfRoot } from '../scripts/site-languages.js';

test('a TAP market root: its language and market, as www writes them', () => {
  assert.equal(htmlLangOfRoot('/pt-ao', SITE_LANGUAGES.tap), 'pt-ao');
  assert.equal(htmlLangOfRoot('/en-gb/help', SITE_LANGUAGES.tap), 'en-gb');
  assert.equal(htmlLangOfRoot('/de-ch/an-bord/economy-prime', SITE_LANGUAGES.tap), 'de-ch');
  assert.equal(htmlLangOfRoot('/en-us/', SITE_LANGUAGES.tap), 'en-us');
});

test('TAP\'s language versions, other sites and other paths: none (the language as before)', () => {
  ['/pt-pt', '/en-pt/help', '/es-es', '/fr-fr/x', '/de-de', '/it-it', '/pl-pl', '/pt-br/ajuda', '/', '/zz-zz/x'].forEach((p) => {
    assert.equal(htmlLangOfRoot(p, SITE_LANGUAGES.tap), '', p);
  });
  assert.equal(htmlLangOfRoot('/en/home', SITE_LANGUAGES.cargo), '');
  assert.equal(htmlLangOfRoot('/de/', SITE_LANGUAGES.airdolomiti), '');
  assert.equal(htmlLangOfRoot('/de-ch/x', null), '');
});

test('scripts.js sets it first, then the language metadata, then the locale\'s language', () => {
  const src = fs.readFileSync('scripts/scripts.js', 'utf8');
  assert.match(src, /document\.documentElement\.lang = htmlLangOfRoot\(window\.location\.pathname, locale\.siteLanguages\)\s*\|\| getMetadata\('language'\) \|\| htmlLangOf\(locale\.lang\);/);
});
