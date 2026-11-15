/* eslint-disable max-len, import/extensions -- dev tooling */
/* Group for Business (ema-lufthansa, standing order 23 of 2026-11-15, item 1): /de/en/about-us/help-alliance's video is
   www's iframe component, 315 px tall on phones (max-width 560, height 315; b2b-parity-013, a phone first load), where
   www's other YouTube videos (video-gallery, celebrating-shared-stories/sap) are its video component, 16:9 as ours; DA's
   copies author both the same. So a Columns Media variant, "iframe-player", that the page's delta row writes
   (delta-so23-b2b-help-alliance-player.txt), and below 768 px its YouTube player 315 px tall. 390 3206 -> 3326 (www
   3348, -4.24 -> -0.66 %); 1440 2340 unchanged (www 2347; www's 560 x 315 there would be further). No other page has
   the variant. Run: node --test test/b2b-iframe-player-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';

const PATH = '/de/en/about-us/help-alliance';
const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-b2b .columns-media.iframe-player .media-embed-youtube';
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so23-b2b-help-alliance-player.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so23-b2b-help-alliance-player.txt', import.meta.url), 'utf8');

test('below 768 px an iframe-player\'s YouTube player 315 px tall, only there', () => {
  const q = css.indexOf(`@media (width < 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'below 768 px');
  const i = css.indexOf(`${SEL} {`, q);
  const body = css.slice(i, css.indexOf('}', i));
  assert.match(body, /aspect-ratio: auto;/);
  assert.match(body, /height: 315px;/);
  assert.equal(css.split('.iframe-player').length - 1, 1, 'no other rule names the variant');
});

test('the delta: one place, the variant added to the block\'s class; a second run changes nothing', () => {
  const rows = data[PATH];
  assert.equal(rows.length, 1);
  assert.equal(rows[0].count, 1);
  assert.equal(rows[0].to, rows[0].from.replace('<div class="columns-media">', '<div class="columns-media iframe-player">'));
  const doc = `<main><div>${rows[0].from} where it matters.</strong></p></div><div><a href="https://www.youtube-nocookie.com/embed/x">x</a></div></div></div></div></main>`;
  const r = applyReplacements(doc, rows);
  assert.deepEqual(r.problems, []);
  assert.ok(r.html.includes('<div class="columns-media iframe-player">'));
  assert.ok(applyReplacements(r.html, rows).problems.length);
});

test('the list: READY, the header naming the tool, its data and www\'s heights', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /node tools\/importer\/ita-fragment-replace-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so23-b2b-help-alliance-player\.json/);
  assert.match(list.split('\n')[0], /Expected change only/);
  assert.match(list.split('\n')[2], /^READY\t.*2347 \/ 3348/);
});
