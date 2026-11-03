/* eslint-disable max-len */
/* The eight languages after Portuguese (tools/markets/rollout.mjs LANGUAGE_BATCHES, brief 300), one
   batch each in this order: ru, hk (www's zh-HK), zh (zh-CN), it, el, ja, ko, pl, batches 14 to 21.
   Their version by Portuguese's rule: www's sitemaps list xx/<ll> URLs for each of them, but only
   as hreflang alternates (no sitemap of its own: as xx/pt, and xx/fr before its pages existed), so
   the sitemaps do not settle it: xx/<ll>, to confirm by the local capture's pilot, else the root
   with the most URLs (`confirm`). Their market roots: www's roots of the language with own sitemaps.
   Run: node --max-old-space-size=512 --test test/markets-languages.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
// eslint-disable-next-line import/extensions
import { batches, LANGUAGE_BATCHES } from '../tools/markets/rollout.mjs';

const EXPECTED = [
  ['ru', 14, 'ru/ru', ['by/ru', 'kz/ru', 'ru/ru']],
  ['hk', 15, 'hk/hk', ['cn/hk', 'hk/hk', 'tw/hk']],
  ['zh', 16, 'cn/zh', ['cn/zh', 'hk/zh', 'tw/zh']],
  ['it', 17, 'it/it', ['ch/it', 'it/it']],
  ['el', 18, 'gr/el', ['cy/el', 'gr/el']],
  ['ja', 19, 'jp/ja', ['jp/ja']],
  ['ko', 20, 'kr/ko', ['kr/ko']],
  ['pl', 21, 'pl/pl', ['pl/pl']],
];

test('rollout: the eight languages after Portuguese as batches 14 to 21, version xx/<ll> to confirm, else the root with the most URLs', () => {
  const all = batches();
  EXPECTED.forEach(([lang, n, fallback, roots]) => {
    assert.deepEqual(LANGUAGE_BATCHES.find((l) => l.lang === lang), { lang, version: `xx/${lang}`, confirm: fallback }, lang);
    const b = all.find((x) => x.lang === lang);
    assert.equal(b.n, n, lang);
    assert.equal(b.version, `xx/${lang}`, lang);
    assert.deepEqual(b.roots, roots, lang);
  });
  // the languages before them as they were
  assert.deepEqual(LANGUAGE_BATCHES.slice(0, 3), [{ lang: 'fr', version: 'xx/fr' }, { lang: 'es', version: 'xx/es' }, { lang: 'pt', version: 'xx/pt' }]);
  assert.deepEqual(['fr', 'es', 'pt'].map((l) => all.find((x) => x.lang === l).n), [11, 12, 13]);
});
