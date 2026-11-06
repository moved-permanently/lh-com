/* eslint-disable import/extensions */
/* Where lh-edge serves a /content/dam file from, by its x-lh-edge-route answer
   (tools/importer/dam-route.mjs, used by switch-dam-media.mjs before it switches a document's
   video or subtitle link to the site's copy): dam (the DA copies), dam-media (R2, gone since the
   copies moved), dam-aem (the AEM publish tier: the videos over 36 MB and the subtitles, lh-edge's
   src/dam-aem.js). Before, dam-aem counted as missing, so a re-import kept www's links where DA
   already had the site's own (brief 435: /de/en/100-years/crane, destinations, history,
   new-onboard-experience).
   Run: node --test test/dam-route.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const { placeOf, served } = await import('../tools/importer/dam-route.mjs');

test('the routes lh-edge serves from', () => {
  assert.equal(placeOf(true, 'dam'), 'da');
  assert.equal(placeOf(true, 'dam-media'), 'r2');
  assert.equal(placeOf(true, 'dam-aem'), 'aem');
  ['da', 'r2', 'aem'].forEach((p) => assert.equal(served(p), true, p));
});

test('anything else is missing', () => {
  assert.equal(placeOf(false, 'dam-aem', 404), 'missing (404)');
  assert.equal(placeOf(true, 'dam-aem-unavailable', 503), 'missing (503)');
  assert.equal(placeOf(true, null, 200), 'missing (200)');
  assert.equal(served('missing (404)'), false);
  assert.equal(served(undefined), false);
});
