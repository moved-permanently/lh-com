/* eslint-disable max-len, import/extensions, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 494: one set of rules for a page's description when www has none. tools/importer/description-rules.js holds
   them (no linkedom: the import bundles take them); description-fix.mjs and the importer's cleanup
   (lufthansa-cleanup.js ensureDescription, every import bundle and so the brand importers) use them, so a re-import writes
   the description description-fix.mjs would. New weak kinds from the brand sites' 289 pages: a letter's salutation (SWISS's
   form success pages: "Dear Customer,", "Sehr geehrte Kundin Sehr geehrter Kunde", "お客様へ"), a dateline or last-update
   line ("チューリッヒ／ジュネーブ、2026年3月1日", "Date de la dernière mise à jour : 15 septembre 2026"), a breadcrumb
   ("Lufthansa Allegris › Inside Sessions"), a Korean text of one or two words ("감사합니다!").
   Run: node --max-old-space-size=256 --test test/description-rules-494.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { isWeak, firstTextParagraph as rulesFirst } from '../tools/importer/description-rules.js';
import { firstTextParagraph } from '../tools/importer/description-fix.mjs';

test('weak: salutations, datelines and last-update lines, a breadcrumb, a Korean word or two', () => {
  ['Dear Customer,', 'Dear customer', 'Sehr geehrte Kundin Sehr geehrter Kunde', 'Sehr geehrte Damen und Herren', 'Gentile Signora Egregio Signore', 'Chère Madame, Cher Monsieur', 'Estimado/a cliente', 'Prezado/a cliente', 'Αγαπητοί κυρίες και κύριοι', 'お客様へ', '친애하는 고객님께',
    'Date de la dernière mise à jour : 15 septembre 2026', '最終更新：2025年1月21日', 'チューリッヒ／ジュネーブ、2026年3月1日', '苏黎世/日内瓦，2026 年 3 月 1 日', 'Zurich, 1 March 2026',
    'Lufthansa Allegris › Inside Sessions', 'Home > Offers > Europe deals',
    '감사합니다!', '최저 특가'].forEach((t) => assert.equal(isWeak(t), true, t));
  ['Thank you for your request.', 'Dear customers can now book seats online up to 48 hours before departure.', 'Lufthansa flies to Ivalo every Saturday from 4 November 2026', 'Switzerland - Israel match on 13 October 2026 in Sion', '스위스 항공 (SWISS)과 함께하는 프리미엄 유럽 여행', 'ご連絡ありがとうございます。'].forEach((t) => assert.equal(isWeak(t), false, t));
});

test('the rules module and description-fix.mjs agree (description-fix.mjs takes its fallback from it)', () => {
  const main = '<div><h1>Group travel</h1><p>Dear Customer,</p><p>Thank you for writing to us. You will be receiving an e-mail reply from us as soon as possible.</p></div>';
  const { document } = parseHTML(`<html><body><main>${main}</main></body></html>`);
  assert.equal(rulesFirst(document.querySelector('main')), 'Thank you for writing to us. You will be receiving an e-mail reply from us as soon as possible.');
  assert.equal(firstTextParagraph(main), rulesFirst(document.querySelector('main')));
});

const cleanup = async () => {
  globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (d) => d.createElement('table'), createBlock: (d) => d.createElement('table') } };
  return (await import('../tools/importer/transformers/lufthansa-cleanup.js')).default;
};
const run = (transform, head, body, outside = '') => {
  const { document } = parseHTML(`<html><head>${head}</head><body>${outside}<main><div class="container-content"><div class="section"><div class="section-content"><div class="text section"><div class="richtext">${body}</div></div></div></div></div></main></body></html>`);
  const url = 'https://www.swiss.com/ch/en/customer-support/contact-us/general-request/general-request-success';
  transform('beforeTransform', document.body, {
    document, url, params: { originalURL: url }, template: { name: 'info' },
  });
  const m = document.head.querySelector('meta[name="description"]');
  return m ? m.getAttribute('content') : null;
};

test('the importer\'s cleanup takes the same description as description-fix.mjs (weak paragraphs skipped, else a heading)', async () => {
  const transform = await cleanup();
  assert.equal(run(transform, '', '<p>Dear Customer,</p><p>Thank you for writing to us. You will be receiving an e-mail reply from us as soon as possible.</p>'), 'Thank you for writing to us. You will be receiving an e-mail reply from us as soon as possible.');
  assert.equal(run(transform, '', '<p>* Minimum two adults need to be booked</p><p>Niemcy</p><p>Buchungszeitraum: 30.09.2019 - 04.11.2019</p><p>All hotlines are part of the local landline networks.</p>'), 'All hotlines are part of the local landline networks.');
  assert.equal(run(transform, '', '<h1>Save up to 40% in Business Class</h1><p>* Minimum two adults need to be booked</p>'), 'Save up to 40% in Business Class');
  assert.equal(run(transform, '', '<p>Niemcy</p>'), null);
  // www's header, footer and a lightbox stay out, as before
  assert.equal(run(transform, '', '<p>The page\'s own first text paragraph is this one.</p>', '<header><p>Book your next flight with us today and save.</p></header>'), 'The page\'s own first text paragraph is this one.');
  // www's own description still first
  assert.equal(run(transform, '<meta name="description" content="www says">', '<p>Dear Customer,</p>'), 'www says');
});

test('every import bundle with the cleanup\'s description carries the shared rules (rebuilt)', () => {
  const dir = new URL('../tools/importer/', import.meta.url);
  const bundles = fs.readdirSync(dir).filter((f) => f.endsWith('.bundle.js'));
  const withCleanup = bundles.filter((f) => fs.readFileSync(new URL(f, dir), 'utf8').includes('function ensureDescription('));
  assert.ok(withCleanup.length > 0);
  withCleanup.forEach((f) => assert.match(fs.readFileSync(new URL(f, dir), 'utf8'), /function isWeak\(/, f));
});
