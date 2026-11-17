/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 41 of 2026-11-17): be/fr my-bookings' and de/de lounges' card grids in a
   section of their own, with spacers giving www's gap to the footer (delta-so41-brussels-card-page-endings.txt).
   Run: node --test test/brussels-card-page-endings-so41.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so41-brussels-card-page-endings.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so41-brussels-card-page-endings.txt`, import.meta.url), 'utf8');
const SMB = '<div class="section-metadata"><div><div>Style</div><div>padded</div></div></div>';

test('my-bookings: a section break before the first card grid, a desktop spacer at the end', () => {
  const [split, end] = data['/be/fr/my-bookings'];
  assert.equal(split.to, split.from.replace('<div class="carousel-cards grid four-up">', '</div><div><div class="carousel-cards grid four-up">'));
  assert.equal(end.to, end.from.replace('</div></div>\n<div></div></main>', '</div><p>{spacer-64 from-768}</p></div>\n<div></div></main>'));
});

test('lounges: the title keeps its style, the cards get their own section and both spacers', () => {
  const [split, end] = data['/de/de/extra-services/lounges'];
  assert.equal(split.to, split.from.replace('<div class="carousel-cards grid four-up">', `${SMB}</div><div><div class="carousel-cards grid four-up">`));
  assert.equal(end.from, `</div>${SMB}</div>\n<div></div></main>`);
  assert.equal(end.to, '</div><p>{spacer-89 below-768}</p><p>{spacer-48 from-768}</p></div>\n<div></div></main>');
  Object.values(data).flat().forEach((r) => assert.equal(r.count, 1));
});

test('the list: both READY, the backup named, and the footer rule waiting on them', () => {
  assert.deepEqual(readyPaths(list).sort(), ['/be/fr/my-bookings', '/de/de/extra-services/lounges']);
  assert.match(list, /\.token-free-backup\/2026-11-brussels-so41-card-page-endings\//);
  assert.match(list, /interim gate/);
});
