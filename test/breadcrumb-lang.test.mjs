/* The breadcrumb's label in the page's language (brief 355): since de7fabe a TAP market root says
   lang="de-ch" (pt-ao, en-gb …); the label reads the language part of <html lang> with
   scripts/locale.js pathLanguageOf (as the cookie banner and the accordion do), so de-ch is German
   as de is; every other language the English label, as before; zh-HK stays hk.
   Run: node --max-old-space-size=512 --test test/breadcrumb-lang.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathLanguageOf } from '../scripts/locale.js';

test('pathLanguageOf: the language part, any region (zh-HK as hk)', () => {
  assert.equal(pathLanguageOf('de'), 'de');
  assert.equal(pathLanguageOf('de-ch'), 'de');
  assert.equal(pathLanguageOf('de-AT'), 'de');
  assert.equal(pathLanguageOf('en-gb'), 'en');
  assert.equal(pathLanguageOf('pt-ao'), 'pt');
  assert.equal(pathLanguageOf('zh-HK'), 'hk');
});

test('the breadcrumb names its nav by the language part of <html lang>', () => {
  const src = fs.readFileSync('blocks/breadcrumb/breadcrumb.js', 'utf8');
  assert.match(src, /nav\.setAttribute\('aria-label', pathLanguageOf\(document\.documentElement\.lang\) === 'de' \? 'Brotkrümelnavigation' : 'Breadcrumb'\);/);
  assert.doesNotMatch(src, /document\.documentElement\.lang === /);
});
