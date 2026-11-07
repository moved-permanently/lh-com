/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA's import (item 2 of the brief after 464): www's forms append jQuery UI's date picker to the body (#ui-datepicker-div,
   hidden on www: "<PrecSucc>", "Ottobre 2026", the day links). Imported, its calendar table became a block named lu
   (its first cell, lunedì) that nothing renders: the page asked for a block script that does not exist and showed a
   loose grid (/it/it/.../voglia-di-volare-registration-form, /xx/it/.../emergency-contact, imported before the
   importer dropped it). ita-import.mjs's mappedOf, what the import reads, has no picker; the rest of the page as before.
   Run: node --max-old-space-size=512 --test test/ita-datepicker.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mappedOf } from '../tools/importer/ita-import.mjs';

const SNAP = 'tools/importer/bd-snapshots/www.ita-airways.com';
const pages = [
  '/xx/it/book-and-prepare/travel-information/check-in-information/emergency-contact',
  '/it/it/world-of-ita-airways/discover-ita-airways/voglia-di-volare/voglia-di-volare-registration-form',
];

test('the mapped page has no date picker; the form and its fields stay', () => {
  pages.forEach((p) => {
    const html = fs.readFileSync(`${SNAP}${p}.html`, 'utf8');
    assert.match(html, /id="ui-datepicker-div"/, `${p}: the snapshot has the picker`);
    const mapped = mappedOf(html, p);
    assert.doesNotMatch(mapped, /ui-datepicker-(div|calendar|header)/, p);
    assert.doesNotMatch(mapped, /Ottobre 2026/, p);
    assert.match(mapped, /<form\b[^>]*class="[^"]*cmp-form/, `${p}: the form`);
    assert.doesNotMatch(mapped, /<script\b/, `${p}: no scripts`);
  });
});

test('the import loop maps with mappedOf', () => {
  const src = fs.readFileSync('tools/importer/ita-import.mjs', 'utf8');
  assert.match(src, /const mapped = mappedOf\(html, p\);/);
});
