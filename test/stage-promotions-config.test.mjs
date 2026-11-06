/* The homepage stage promotions (tools/importer/stage-promotions.json, stage-promotions.mjs): de/en
   and de/de take the imported stage alone (www's Black Friday stage of 2026-11-06). Their second
   promotion was built from the Kuala Lumpur teaser card, which www's homepage no longer has: the
   import stops when a promotion's card is missing (the de/en re-import of brief 435), and FLYZA
   ended on 2026-10-31. at/de and gb/en keep theirs.
   Run: node --test test/stage-promotions-config.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { locales } = JSON.parse(fs.readFileSync(new URL('../tools/importer/stage-promotions.json', import.meta.url), 'utf8'));

test('de/en and de/de: the imported stage alone', () => {
  ['de/en', 'de/de'].forEach((l) => {
    assert.equal(locales[l].length, 1, l);
    assert.equal(locales[l][0].source, 'homepage-stage', l);
    assert.equal(locales[l][0].end, undefined, l);
  });
});

test('at/de and gb/en as before', () => {
  assert.deepEqual(locales['at/de'].map((p) => p.name), ['Starlink Wi-Fi', 'Johannesburg via München']);
  assert.deepEqual(locales['gb/en'].map((p) => p.name), ['Ski campaign', "This month's deals"]);
});
