/* lh-edge's copies of www's help-center data for Lufthansa (brief 492, row 19 of
   tools/reports/lufthansa/parity.md): www answers lh-edge's /digitalhangar/cs-help-center/ requests
   with 403, so the help app on lufthansa.com fell back without its topics. As for SWISS (LX),
   Austrian (OS), Brussels (SN) and ITA (AZ), the site's origin carries our copy at
   /digitalhangar-copies/<the path below /digitalhangar/>
   (tools/workers/lh-edge/src/digitalhangar.js COPIES): LH's feature switches, its topics and
   texts in its 12 languages, as www served them on 2026-11-08 (lh-snapshots-085's digitalhangar/,
   all 200 and valid JSON).
   Run: node --max-old-space-size=512 --test test/digitalhangar-copies-lh-492.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const LANGS = ['en', 'de', 'fr', 'it', 'es', 'pt', 'ru', 'zh', 'ja', 'ko', 'el', 'pl'];
const FILES = [
  'cs-help-center/feature-manager/LH/features.json',
  ...LANGS.flatMap((l) => [`cs-help-center/topics/LH/topics_${l}.json`, `cs-help-center/translations/web/LH/${l}.json`]),
];
const root = new URL('../digitalhangar-copies/', import.meta.url);

test('the 25 LH help-center files are there, valid JSON, under the copies route', async () => {
  const src = new URL('../tools/workers/lh-edge/src/digitalhangar.js', import.meta.url);
  const { COPIES, copyPath } = await import(pathToFileURL(src.pathname).href);
  assert.equal(FILES.length, 25);
  FILES.forEach((f) => {
    const www = `/digitalhangar/${f}`;
    assert.ok(COPIES.test(www), `${www} takes the copies route`);
    assert.equal(copyPath(www), `/digitalhangar-copies/${f}`);
    const file = new URL(f, root);
    assert.ok(fs.existsSync(file), f);
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(file, 'utf8')), f);
  });
});

test('the topics carry www\'s data: each language\'s file over 150 kB, as www\'s', () => {
  LANGS.forEach((l) => {
    const file = new URL(`cs-help-center/topics/LH/topics_${l}.json`, root);
    assert.ok(fs.statSync(file).size > 150000, l);
  });
});
