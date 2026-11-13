/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 596, item 1: www's Russian footer disclaimers carry zero-width spaces (U+200B; Austrian by/ru and ru/ru,
   SWISS ch/ru and ru/ru: twelve in front of "Указанные"). tools/importer/footer-disclaimer.js (general-conditions-dialogs.mjs's
   module) copied them into the dialog documents; it drops U+200B, U+200C, U+200D and U+FEFF from the label, the note and the
   dialog's text. Fixture: the by/ru homepage snapshot's .footer-disclaimer, verbatim (10 zero-width characters).
   Run: node --max-old-space-size=256 --test test/footer-disclaimer-zero-width-596.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { dialogDocument, readFooterDisclaimer, dialogPath } from '../tools/importer/footer-disclaimer.js';

const ZW = /[\u200B-\u200D\uFEFF]/;
const box = fs.readFileSync(new URL('./fixtures/footer-disclaimer-596/by-ru-homepage-box.html', import.meta.url), 'utf8');
const page = (inner) => parseHTML(`<html><body>${inner}</body></html>`).document;

test('the fixture has www\'s zero-width characters', () => {
  assert.ok(ZW.test(box));
});

test('the dialog document of the by/ru snapshot has none; its text and path as before', () => {
  const doc = dialogDocument(page(box));
  assert.ok(doc && doc.startsWith('<div><h2>'));
  assert.ok(!ZW.test(doc));
  assert.ok(doc.includes('Указанные'));
  assert.equal(dialogPath(readFooterDisclaimer(page(box)), '/by/ru/homepage'), '/by/ru/fragments/modals/ru');
});

test('label and note without them; every kind (U+200B, U+200C, U+200D, U+FEFF)', () => {
  const html = '<div class="footer-disclaimer"><p class="disclaimer-text">\u200B*Prices\uFEFF</p><maui-modal label="General\u200C Conditions"><p>\u200DThe prices\u200B displayed.</p></maui-modal></div>';
  const d = readFooterDisclaimer(page(html));
  assert.equal(d.note, '*Prices');
  assert.equal(d.label, 'General Conditions');
  assert.equal(dialogDocument(page(html)), '<div><h2>General Conditions</h2><p>The prices displayed.</p></div>\n');
});
