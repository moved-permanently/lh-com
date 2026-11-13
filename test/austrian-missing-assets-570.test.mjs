/* eslint-disable max-len, import/extensions */
/* The brief after 570c: Austrian /medical-travel-companions' second related card ("Electronic devices") points at
   /content/dam/aua/images/plan/baggage/electronic-devices-and-batteries/baggage-electronic-devices-flugmodus-2x1.jpg
   (its 1440 rendition, a srcset of the others). www's AEM publish answers 404 for the file and all its renditions
   (checked 2026-11-10 08:11 CET: original, 2560, 1440, 720; cached 404s), and www's own render shows an empty card area
   there (austrian-parity-003). The importer wrote it as the 2560 rendition, which the media step cannot fetch: about:error
   in the preview on all 19 copies of the page. The snapshot step now drops a picture whose www file is listed in
   tools/importer/austrian-missing-assets.json (this one), so the card keeps its text and an empty picture slot as DA has
   it. Other pictures as before.
   Run: node --max-old-space-size=256 --test test/austrian-missing-assets-570.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withoutMissingAssets, mappedOf } from '../tools/importer/austrian-import.mjs';

const MISSING = '/content/dam/aua/images/plan/baggage/electronic-devices-and-batteries/baggage-electronic-devices-flugmodus-2x1.jpg';
const OK = '/content/dam/austrian/global/images/plan/special-requirements/animals/pets-2x1.jpg';
const rend = (p, w) => `${p}.transform/lh-dcep-transform-width-${w}/img.jpg`;
const card = (p, title) => `<div class="teaser event section"><a href="https://www.austrian.com/at/en/x" class="teaser card"><div class="image-wrapper"><img src="${rend(p, 1440)}" alt="" srcset="${rend(p, 1440)} 1440w,${rend(p, 720)} 720w,${rend(p, 2560)} 2560w"></div><div class="card-content"><h4 class="heading-copytext-large teaser-heading">${title}</h4><p class="desc-inline">Text of ${title}.</p></div></a></div>`;
const PAGE = `<html><body><main>${card(MISSING, 'Electronic devices')}${card(OK, 'Travelling with pets')}<picture><source srcset="${rend(MISSING, 720)}" media="(max-width: 600px)"><img src="${rend(OK, 720)}"></picture></main></body></html>`;

test('the list names the file www answers 404 for', () => {
  const list = JSON.parse(fs.readFileSync(new URL('../tools/importer/austrian-missing-assets.json', import.meta.url), 'utf8'));
  assert.ok(list.assets.some((a) => a.path === MISSING && /404/.test(a.answer)));
});

test('a picture of a listed file goes (its img and any source), the card\'s text stays; other pictures stay', () => {
  const out = withoutMissingAssets(PAGE);
  assert.ok(!out.includes('flugmodus'));
  assert.ok(out.includes('Electronic devices') && out.includes('Text of Electronic devices.'));
  assert.ok(out.includes(rend(OK, 1440)) && out.includes(`<img src="${rend(OK, 720)}">`));
  assert.equal(withoutMissingAssets(out), out);
});

test('the import applies it before the snapshot steps', () => {
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /const mapped = mappedOf\(withoutMissingAssets\(html\), p\);/);
  assert.ok(!mappedOf(withoutMissingAssets(PAGE), '/at/en/plan/special-requirements/medical-travel-companions').includes('flugmodus'));
});
