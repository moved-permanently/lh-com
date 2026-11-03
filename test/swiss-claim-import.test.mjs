/* eslint-disable import/extensions, max-len */
/* SWISS's claim pages (swiss-snapshots-claims-20 and kr/ko's capture): /<root>/fast-compensation
   carries <claim-form-entry> (0.11.16; ch/ru 0.11.9), /<root>/baggage-reimbursement
   <baggage-form-entry> (latest). The importers send them to the mfe template; the version the
   snapshot's script names is the block's Version row; the Fallback is www's first screen (headline,
   instruction, Continue to the page on www, where the app works), as on lufthansa.com's claim page,
   which stays as before. Trimmed fixtures, a createBlock stand-in, no network.
   Run: timeout 60 node --max-old-space-size=256 --test test/swiss-claim-import.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import parse from '../tools/importer/parsers/micro-frontend.js';
import { templateOf, withAppVersions, withLiveFallback } from '../tools/importer/swiss-import.mjs';

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { name, cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', name);
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) td.append(...c);
          else if (c) td.append(c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

const CLAIM_SCREEN = '<div id="root"><maui-headline type="h1" format="heading-xl">Добро пожаловать</maui-headline><maui-headline type="h2" format="h5">Введите данные бронирования.</maui-headline><maui-input type="text" label="Код бронирования"></maui-input><maui-button type="primary">Продолжить</maui-button><maui-headline type="h3">Бронирование не найдено</maui-headline><maui-button type="primary">Закрыть</maui-button></div>';
const BAG_SCREEN = '<main id="root"><maui-headline type="h1" format="heading-xl">Reimbursement for baggage problems</maui-headline><maui-copy mode="block">Use this form to claim reimbursement.</maui-copy><maui-copy mode="block">You will need your <strong>baggage report</strong> and <strong>expense receipts</strong>.</maui-copy><maui-headline type="h3" format="h5">Reason for your claim</maui-headline><maui-button type="primary" behavior="submit">Continue</maui-button><maui-link theme="lx">More information on problems with baggage</maui-link></main>';
const page = (canonical, app) => `<html><head><link rel="canonical" href="${canonical}"></head><body><div class="container-content"><div class="section"><div class="wrapper section">${app}</div></div></div></body></html>`;
const table = (document) => document.querySelector('table[data-name="micro-frontend"]');
const rowsOf = (document) => [...table(document).querySelectorAll('tr')].map((tr) => [...tr.children].map((td) => td.innerHTML));

test('templateOf: a page with <claim-form-entry> or <baggage-form-entry> is mfe (the micro-frontend block)', () => {
  assert.equal(templateOf('/ch/ru/fast-compensation', '<div class="wrapper section"><claim-form-entry data-public-endpoint="">'), 'mfe');
  assert.equal(templateOf('/kr/ko/baggage-reimbursement', '<div class="wrapper section"><baggage-form-entry data-public-endpoint="">'), 'mfe');
  assert.equal(templateOf('/ch/en/prepare/baggage', '<p>baggage-form-entry</p>'), 'info', 'the word in a text is no app');
});

test('withAppVersions: the version the snapshot\'s script names, on the app element (before the scripts go)', () => {
  const ru = withAppVersions('<claim-form-entry data-public-endpoint=""></claim-form-entry><script defer type="module" src="/digitalhangar/claim-automation/production/claim-form-entry/claim-form-entry-0.11.9.js"></script>');
  assert.equal(ru.includes('<claim-form-entry data-app-version="0.11.9" data-public-endpoint="">'), true, ru);
  const bag = withAppVersions('<baggage-form-entry data-public-endpoint=""></baggage-form-entry><script type="module" src="/digitalhangar/claim-automation/baggage-form-entry/baggage-form-entry-latest.js"></script>');
  assert.equal(bag.includes('<baggage-form-entry data-app-version="latest" data-public-endpoint="">'), true, bag);
  const none = '<claim-form-entry data-public-endpoint=""></claim-form-entry>';
  assert.equal(withAppVersions(none), none, 'no script: as it is');
});

test('claim-form-entry on SWISS: its name, the Version row, www\'s first screen as Fallback, Continue to the page on www.swiss.com', () => {
  const { document } = parseHTML(page('https://www.swiss.com/ch/ru/fast-compensation', `<claim-form-entry data-app-version="0.11.9" data-public-endpoint="">${CLAIM_SCREEN}</claim-form-entry>`));
  parse(document.querySelector('claim-form-entry'), { document, url: 'http://localhost:3001/ch/ru/fast-compensation.html' });
  const rows = rowsOf(document);
  assert.equal(JSON.stringify(rows.slice(0, 2)), JSON.stringify([['claim-form-entry'], ['Version', '0.11.9']]));
  assert.equal(rows[2][0], 'Fallback');
  assert.equal(rows[2][1], '<h1>Добро пожаловать</h1><p>Введите данные бронирования.</p><p><strong><a data-live-link="" href="https://www.swiss.com/ch/ru/fast-compensation">Продолжить</a></strong></p>');
  assert.equal(rows.length, 3);
});

test('claim-form-entry 0.11.9 (www\'s ch/ru): its instruction a copy, not a headline; the Fallback is the first screen only, never the error dialog', () => {
  const screen = '<div id="root"><maui-headline type="h2">Добро пожаловать в приложение</maui-headline><maui-copy>Введите данные бронировании соответствующего рейса.</maui-copy><maui-input type="text" label="Имя"></maui-input><maui-button type="primary">Продолжить</maui-button><maui-headline type="h3">Бронирование не найдено</maui-headline><maui-copy>Проверьте данные бронирования.</maui-copy><maui-button type="primary">Закрыть</maui-button></div>';
  const { document } = parseHTML(page('https://www.swiss.com/ch/ru/fast-compensation', `<claim-form-entry data-app-version="0.11.9" data-public-endpoint="">${screen}</claim-form-entry>`));
  parse(document.querySelector('claim-form-entry'), { document, url: 'http://localhost:3001/ch/ru/fast-compensation.html' });
  const rows = rowsOf(document);
  assert.equal(rows[2][1], '<h1>Добро пожаловать в приложение</h1><p>Введите данные бронировании соответствующего рейса.</p><p><strong><a data-live-link="" href="https://www.swiss.com/ch/ru/fast-compensation">Продолжить</a></strong></p>');
});

test('baggage-form-entry: Version latest; Fallback headline, the two texts (bold kept), Continue to the page on www.swiss.com; no link without an address', () => {
  const { document } = parseHTML(page('https://www.swiss.com/ch/en/baggage-reimbursement', `<baggage-form-entry data-app-version="latest" data-public-endpoint="">${BAG_SCREEN}</baggage-form-entry>`));
  parse(document.querySelector('baggage-form-entry'), { document, url: 'http://localhost:3001/ch/en/baggage-reimbursement.html' });
  const rows = rowsOf(document);
  assert.equal(JSON.stringify(rows.slice(0, 2)), JSON.stringify([['baggage-form-entry'], ['Version', 'latest']]));
  assert.equal(rows[2][1], '<h1>Reimbursement for baggage problems</h1><p>Use this form to claim reimbursement.</p><p>You will need your <strong>baggage report</strong> and <strong>expense receipts</strong>.</p><p><strong><a data-live-link="" href="https://www.swiss.com/ch/en/baggage-reimbursement">Continue</a></strong></p>');
});

test('lufthansa.com\'s claim page as before: no Version row, Continue to www.lufthansa.com', () => {
  const { document } = parseHTML(page('https://www.lufthansa.com/de/en/support/fast-compensation/compensation-flight-disruptions', `<claim-form-entry id="undefined" data-public-endpoint="">${CLAIM_SCREEN.replace('Продолжить', 'Continue')}</claim-form-entry>`));
  parse(document.querySelector('claim-form-entry'), { document, url: 'http://localhost:3001/de/en/support/fast-compensation/compensation-flight-disruptions.html' });
  const rows = rowsOf(document);
  assert.equal(rows.length, 2);
  assert.equal(rows[0][0], 'claim-form-entry');
  assert.equal(rows[1][1].includes('href="https://www.lufthansa.com/de/en/support/fast-compensation/compensation-flight-disruptions"'), true, rows[1][1]);
});

test('withLiveFallback: the Fallback\'s link to the page itself back on www.swiss.com (the link steps made it relative); other links as they are', () => {
  const doc = '<div><div class="micro-frontend"><div><div>claim-form-entry</div></div><div><div>Fallback</div><div><h1>x</h1><p><strong><a href="/kr/ko/fast-compensation">계속</a></strong></p><p><a href="/kr/ko/homepage">home</a></p></div></div></div><p><a href="/kr/ko/fast-compensation">self outside</a></p></div>';
  const out = withLiveFallback(doc, '/kr/ko/fast-compensation');
  assert.equal(out.includes('<a href="https://www.swiss.com/kr/ko/fast-compensation">계속</a>'), true, out);
  assert.equal(out.includes('<a href="/kr/ko/homepage">home</a>'), true);
  assert.equal(out.includes('<a href="/kr/ko/fast-compensation">self outside</a>'), true);
  assert.equal(withLiveFallback('<p>no block</p>', '/ch/en/x'), '<p>no block</p>');
});
