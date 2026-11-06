/* eslint-disable max-len, import/extensions */
/* Brussels' reunion pages (brief 414: /bf/en, /cm/en .../local-page/an-unforgettable-reunion, /bf/fr,
   /cm/fr .../retrouvailles-inoubliables) lost their three YouTube videos: the page holds www's
   destination finder, so brussels-import.mjs's templateOf gives it the hub template, and only the
   info template mapped www's video component (.video > .video-player > iframe) to the embed block.
   The hub template now has the info template's embed block (every brand's hub pages: a video there
   was dropped before), its import script and bundle regenerated.
   The snapshots as committed fixtures (test/fixtures/hub-embed/, brief 419).
   Run: node --test test/hub-embed.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { templateOf } from '../tools/importer/brussels-import.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const { templates } = JSON.parse(read('tools/importer/page-templates.json'));
const byName = Object.fromEntries(templates.map((t) => [t.name, t]));
// the two pages' snapshots trimmed to what this test reads (the snapshots are gitignored): test/fixtures/hub-embed/
const fixture = (p) => read(`test/fixtures/hub-embed/${p.split('/').slice(1, 3).join('-')}-${p.split('/').pop()}.html`);

test('the reunion pages import with the hub template and their snapshot has the three videos', () => {
  ['/bf/en/local-page/an-unforgettable-reunion', '/bf/fr/local-page/retrouvailles-inoubliables'].forEach((p) => {
    const html = fixture(p);
    assert.equal(templateOf(p, html), 'hub', p);
    assert.equal((html.match(/<div class="video-player"[^>]*>\s*<iframe[^>]*src="https:\/\/www\.youtube-nocookie\.com\/embed\//g) || []).length, 3, p);
  });
});

test('the hub template has the info template\'s embed block (www\'s video and iframe components)', () => {
  const embed = (t) => byName[t].blocks.find((b) => b.name === 'embed');
  assert.ok(embed('hub'), 'hub has embed');
  assert.deepEqual(embed('hub').instances, embed('info').instances);
  assert.ok(embed('hub').instances.includes('.video:has(> .video-player iframe)'));
});

test('import-hub.js and its bundle are regenerated with the embed parser', () => {
  const script = read('tools/importer/import-hub.js');
  assert.match(script, /import embedParser from '\.\/parsers\/embed\.js';/);
  assert.match(script, /\.video:has\(> \.video-player iframe\)/);
  const bundle = read('tools/importer/import-hub.bundle.js');
  // the embedded template's block (the old bundle had the selector only inside other blocks' :not())
  assert.match(bundle, /name: "embed"/);
});
