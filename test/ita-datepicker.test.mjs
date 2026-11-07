/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA's import (item 2 of the brief after 464): www's forms append jQuery UI's date picker to the body (#ui-datepicker-div,
   hidden on www: "<PrecSucc>", "Ottobre 2026", the day links). Imported, its calendar table became a block named lu
   (its first cell, lunedì) that nothing renders: the page asked for a block script that does not exist and showed a
   loose grid (/it/it/.../voglia-di-volare-registration-form, /xx/it/.../emergency-contact, imported before the
   importer dropped it). ita-import.mjs's mappedOf, what the import reads, has no picker; the rest of the page as before.
   A fixture with www's markup; the two snapshots too where they are (tools/importer/bd-snapshots is not in git).
   Run: node --max-old-space-size=512 --test test/ita-datepicker.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mappedOf } from '../tools/importer/ita-import.mjs';

const PICKER = '<div id="ui-datepicker-div" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"><div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all"><button class="ui-datepicker-prev" title="&lt;Prec"><span>&lt;Prec</span></button><button class="ui-datepicker-next" title="Succ&gt;"><span>Succ&gt;</span></button><div class="ui-datepicker-title"><span class="ui-datepicker-month">Ottobre</span>&nbsp;<span class="ui-datepicker-year">2026</span></div></div><table class="ui-datepicker-calendar"><thead><tr><th><span title="lunedì">lu</span></th><th><span>ma</span></th></tr></thead><tbody><tr><td><a href="#">1</a></td><td><a href="#">2</a></td></tr></tbody></table></div>';
const PAGE = `<html><head></head><body><main><div class="container-content"><form class="cmp-form" action="/x"><div class="cmp-form-text"><maui-input label="Nome" name="name"></maui-input></div></form></div></main><script src="/app.js"></script><div> </div>${PICKER}</body></html>`;

const check = (mapped, label) => {
  assert.doesNotMatch(mapped, /ui-datepicker-(div|calendar|header)/, label);
  assert.doesNotMatch(mapped, /Ottobre/, label);
  assert.match(mapped, /<form\b[^>]*class="[^"]*cmp-form/, `${label}: the form`);
  assert.doesNotMatch(mapped, /<script\b/, `${label}: no scripts`);
};

test('the mapped page has no date picker; the form stays (www\'s markup)', () => {
  check(mappedOf(PAGE, '/xx/it/book-and-prepare/travel-information/check-in-information/emergency-contact'), 'fixture');
});

test('the two snapshots, where they are', () => {
  const SNAP = 'tools/importer/bd-snapshots/www.ita-airways.com';
  ['/xx/it/book-and-prepare/travel-information/check-in-information/emergency-contact',
    '/it/it/world-of-ita-airways/discover-ita-airways/voglia-di-volare/voglia-di-volare-registration-form'].forEach((p) => {
    const f = `${SNAP}${p}.html`;
    if (!fs.existsSync(f)) return;
    const html = fs.readFileSync(f, 'utf8');
    assert.match(html, /id="ui-datepicker-div"/, `${p}: the snapshot has the picker`);
    check(mappedOf(html, p), p);
  });
});

test('the import loop maps with mappedOf', () => {
  const src = fs.readFileSync('tools/importer/ita-import.mjs', 'utf8');
  assert.match(src, /const mapped = mappedOf\(html, p\);/);
});
