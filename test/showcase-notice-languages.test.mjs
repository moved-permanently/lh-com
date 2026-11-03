/* The showcase notice in TAP's languages (brief 320): on a brand whose entry asks for the page's
   language (scripts/brands.js showcaseNotice 'page': TAP), the notice speaks the page's language
   where it has texts for it (pt, en, es, fr, de, it, pl), English otherwise; Lufthansa and every
   other brand keep the English notice on every page.
   Run: node --max-old-space-size=512 --test test/showcase-notice-languages.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { noticeTexts, NOTICE_TEXTS } from '../scripts/showcase-notice.js';
import { BRANDS } from '../scripts/brands.js';

const TAP_LANGUAGES = ['pt', 'en', 'es', 'fr', 'de', 'it', 'pl'];

test('TAP asks for the page\'s language; no other brand does', () => {
  assert.equal(BRANDS.tap.showcaseNotice, 'page');
  Object.entries(BRANDS).filter(([k]) => k !== 'tap').forEach(([k, b]) => assert.equal(b.showcaseNotice, undefined, k));
});

test('the texts: each TAP language, title, text with the brand\'s name, button; English as before', () => {
  assert.deepEqual(Object.keys(NOTICE_TEXTS).sort(), [...TAP_LANGUAGES].sort());
  assert.deepEqual(noticeTexts(null, 'de'), {
    lang: 'en', title: 'Technical showcase', text: 'This page is a technical showcase, not an official Lufthansa website. It is for demonstration purposes only.', button: 'I understand',
  });
  TAP_LANGUAGES.forEach((l) => {
    const t = noticeTexts(BRANDS.tap, l);
    assert.equal(t.lang, l);
    assert.ok(t.title && t.button, l);
    assert.ok(t.text.includes('TAP Air Portugal'), `${l}: ${t.text}`);
    if (l !== 'en') {
      assert.notEqual(t.title, NOTICE_TEXTS.en.title, `${l} title`);
      assert.notEqual(t.button, NOTICE_TEXTS.en.button, `${l} button`);
    }
  });
  assert.equal(noticeTexts(BRANDS.tap, 'es').text, 'Esta página es una demostración técnica, no un sitio web oficial de TAP Air Portugal. Solo tiene fines demostrativos.');
  assert.equal(noticeTexts(BRANDS.tap, 'pt').button, 'Compreendo');
  // a page language the notice has no text for, a region tag: English, the language part
  assert.equal(noticeTexts(BRANDS.tap, 'ja').lang, 'en');
  assert.equal(noticeTexts(BRANDS.tap, 'es-ES').lang, 'es');
  assert.equal(noticeTexts(BRANDS.tap, '').lang, 'en');
});

test('Lufthansa and the other brands: the English notice on every page language', () => {
  ['de', 'fr', 'es', 'it', 'pt', 'zh-HK'].forEach((l) => assert.equal(noticeTexts(null, l).lang, 'en', `lh-com ${l}`));
  ['austrian', 'swiss', 'airdolomiti', 'brussels', 'ita', 'discover'].forEach((k) => {
    const t = noticeTexts(BRANDS[k], 'de');
    assert.equal(t.lang, 'en', k);
    assert.equal(t.text, `This page is a technical showcase, not an official ${BRANDS[k].name} website. It is for demonstration purposes only.`);
  });
});
