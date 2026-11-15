/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 31, item 2: insights articles keep their captions, but allegris-new-york lost its video's in every
   version ("Action, première prise ! Une équipe de tournage accompagne Antonio Colomboni ..."). www's video viewer
   (.videoViewer > .dcep-video-viewer, video.js) draws the caption of its config under the player as
   p.caption[data-testid="video-caption"] > maui-caption; columns-media's viewerNodes wrote the poster and the video link
   only. On insights articles it now writes the caption after them as "<p>... {caption}</p>", the marker of image
   captions; from the drawn caption, or from the config when the snapshot caught the viewer before its player loaded
   (xx/es). Outside articles as before (lufthansa.com's own pages and the brand sites have no captioned viewer in the
   snapshots). The order 30 census's other misses were no gap: the six other fr/fr Allegris and art-of-flying articles
   hold their captions in DA (not published), and stop-over-tokyo's is a parallax image's, which www draws without one.
   Fixtures (test/fixtures/article-video-caption-so31): the viewer of the xx/fr snapshot (drawn) and of the xx/es one
   (still loading), srcset dropped.
   Run: node --max-old-space-size=256 --test test/article-video-caption-so31.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      const table = document.createElement('table');
      table.setAttribute('data-name', name);
      cells.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((c) => {
          const td = document.createElement('td');
          (Array.isArray(c) ? c : [c]).forEach((n) => { if (n) td.append(typeof n === 'string' ? document.createTextNode(n) : n); });
          tr.append(td);
        });
        table.append(tr);
      });
      return table;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');

const fixture = (f) => fs.readFileSync(new URL(`./fixtures/article-video-caption-so31/${f}`, import.meta.url), 'utf8');
const run = (viewer, { article = true, host = 'www.lufthansa.com' } = {}) => {
  const { document } = parseHTML(`<html><body><main>${article ? '<div class="article-details-page">' : '<div>'}<div class="text-event"><p>x</p></div>${viewer}</div></main></body></html>`);
  const element = document.querySelector('.videoViewer');
  parse(element, { document, url: `https://${host}/xx/fr/articles/highlights/allegris-new-york`, params: { originalURL: `https://${host}/xx/fr/articles/highlights/allegris-new-york` } });
  const table = document.querySelector('table');
  return [...table.querySelectorAll('td > p')].map((p) => p.textContent.trim());
};

test('a drawn viewer on an article: the video, then its caption', () => {
  const paras = run(fixture('xx-fr-drawn.html'));
  const at = paras.findIndex((t) => t.includes('{controls round-play-button'));
  assert.ok(at >= 0, 'the video paragraph');
  assert.equal(paras[at + 1], 'Action, première prise ! Une équipe de tournage accompagne Antonio Colomboni lors de son vol vers New York City. {caption}');
  assert.equal(paras.filter((t) => t.endsWith('{caption}')).length, 1);
});

test('a viewer still loading (the server\'s shape): the caption from its config', () => {
  const paras = run(fixture('xx-es-loading.html'));
  const at = paras.findIndex((t) => t.includes('{controls round-play-button'));
  assert.ok(at >= 0, 'the video paragraph');
  assert.equal(paras[at + 1], '¡Cámara, acción! Un miembro de la tripulación acompaña a Antonio Colomboni a su vuelo a Nueva York {caption}');
});

test('the block draws it as an image caption: 10px under the player, not under its 40px margin', () => {
  const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.brand-lufthansa .columns-media .columns-media-row .media-video:has(+ p.caption) { margin-bottom: 0; }'));
  assert.ok(css.includes('.columns-media .columns-media-row p.caption { margin: 10px 0 0;'));
});

test('outside an article: as before, no caption', () => {
  const paras = run(fixture('xx-fr-drawn.html'), { article: false });
  assert.ok(paras.some((t) => t.includes('{controls round-play-button')));
  assert.equal(paras.filter((t) => t.endsWith('{caption}')).length, 0);
});
