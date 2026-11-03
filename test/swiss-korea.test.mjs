/* eslint-disable max-len */
/* SWISS's Korean root kr/ko (www's only Korean root; the capture's swiss-snapshots-028 and -029):
   all its pages are its own documents (ko is no SWISS language version), behind a switch
   (scripts/brands.js SWISS_OWN_ROOTS, SWISS_OWN_ROOTS_LIVE, withSwissOwnRoots). Off (as shipped): a
   pilot, as the languages behind SWISS_LANGUAGES_LIVE: its pages render with its own row
   (scripts/locale.js), while the rows, the country dialog and lh-edge stay as before; on: a root
   with its own documents next to kr/en, www's label, the flight search's origin.
   Run: node --max-old-space-size=512 --test test/swiss-korea.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND_SITES, SWISS_OWN_ROOTS, SWISS_OWN_ROOTS_LIVE, withSwissOwnRoots,
} from '../scripts/brands.js';

test('kr/ko: off as shipped; a pilot with its own row, www\'s label and Seoul as its origin; the table as before', () => {
  assert.deepEqual(SWISS_OWN_ROOTS_LIVE, []);
  assert.deepEqual(Object.keys(SWISS_OWN_ROOTS), ['kr/ko']);
  const site = BRAND_SITES.swiss;
  assert.equal(Boolean(site.rows['kr/ko']), false);
  assert.equal(site.pilots.rows['kr/ko'].status, 'pilot');
  assert.equal(site.pilots.rows['kr/ko'].documents, 'own');
  assert.equal(site.pilots.names['kr/ko'], '대한민국 | 한국어');
  assert.equal(site.pilots.airports['kr/ko'], 'SEL');
  // the other pilots (languages behind SWISS_LANGUAGES_LIVE) stay
  assert.equal(Object.keys(site.pilots.rows).length > 1, true);
  assert.equal(site.rows['kr/en'].documents, 'language');
});

test('kr/ko on: a root with its own documents (hreflang ko-KR), its label and airport; versions, kr/en and the pilots without it', () => {
  const base = BRAND_SITES.swiss;
  const on = withSwissOwnRoots(base, ['kr/ko']);
  assert.deepEqual(on.rows['kr/ko'], {
    country: 'kr', lang: 'ko', hreflang: 'ko-KR', status: 'live', documents: 'own',
  });
  assert.equal(on.names['kr/ko'], '대한민국 | 한국어');
  assert.equal(on.airports['kr/ko'], 'SEL');
  assert.deepEqual(on.versions, base.versions, 'ko is no language version');
  assert.equal(on.pilots.rows['kr/ko'], undefined);
  assert.deepEqual(on.rows['kr/en'], base.rows['kr/en']);
});
