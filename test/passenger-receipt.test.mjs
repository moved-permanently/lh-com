/* eslint-disable max-len */
/* The passenger receipt form (blocks/passenger-receipt) as www's passenger-receipt-portal
   (capture lh-parity-003, 2026-11-06): www's field rules, the empty-submit errors (a box with the
   count, headline and a link to each field, focused; a message under each field), the accented
   letters of the page language converted on leaving a name field with www's note, the valid
   submit handed to the hand-off, and the own-host hand-off as www's script: runtime-config.json
   from the page's origin, POST <service>/download with X-API-KEY, X-Tenant-id LH and
   Accept-Language, {ticketNumber, firstName, lastName}, the answer's PDF saved as <ticket>.pdf;
   an error answer's codes as www's label keys. Every request goes to a stand-in here; nothing to
   www or its API. The texts: every key in every language, en and de as www writes them.
   Run: node --max-old-space-size=256 --test test/passenger-receipt.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/en/book-and-manage/pax-receipt', search: '', hash: '', origin: 'https://lufthansa.turnsthe.page', href: 'https://lufthansa.turnsthe.page/de/en/book-and-manage/pax-receipt',
};
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
const PR = await import('../blocks/passenger-receipt/passenger-receipt.js');
const { TEXTS, LIVE_KEYS } = await import('../blocks/passenger-receipt/passenger-receipt-texts.js');
const { convertAccents } = await import('../blocks/passenger-receipt/accents.js');

const text = (n) => (n ? n.textContent.replace(/\s+/g, ' ').trim() : '');
const fire = (node, type) => node.dispatchEvent(new window.Event(type, { bubbles: true }));
const type = (input, value) => {
  input.value = value;
  fire(input, 'input');
};

test('www\'s rules: the ticket number (220, 13 digits, a dash after 220 allowed, at most 14), the names (www\'s letters, 56 and 57)', () => {
  const t = (v) => PR.fieldError('ticketNumber', v);
  assert.equal(t(''), 'ticket required');
  assert.equal(t('2201234567890'), '');
  assert.equal(t('220-1234567890'), '');
  assert.equal(t(' 2201234567890 '), '');
  assert.equal(t('2211234567890'), 'ticket invalid', 'another airline');
  assert.equal(t('220123456789'), 'ticket invalid', '12 digits');
  assert.equal(t('22012345678901'), 'ticket invalid', '14 digits');
  assert.equal(t('ABC2DE'), 'ticket invalid', 'no booking code on lufthansa.com');
  assert.equal(PR.ticketValue('220-1234567890'), '2201234567890');
  assert.equal(PR.fieldError('firstName', ''), 'first name required');
  assert.equal(PR.fieldError('firstName', 'Anna-Lena'), '');
  assert.equal(PR.fieldError('firstName', 'Ł.'), '');
  assert.equal(PR.fieldError('firstName', 'A'.repeat(57)), 'first name too long');
  assert.equal(PR.fieldError('firstName', 'Anna1'), 'first name invalid');
  assert.equal(PR.fieldError('lastName', 'Müller-Lüdenscheidt'), '');
  assert.equal(PR.fieldError('lastName', 'A'.repeat(58)), 'last name too long');
  assert.equal(PR.fieldError('lastName', 'O.Brien'), 'last name invalid', 'no dot in a last name');
});

test('the empty submit: a box with "3 errors have occurred." and links to the fields, focused; a message under each field', () => {
  const block = document.createElement('div');
  document.body.replaceChildren(block);
  const sent = [];
  const f = PR.buildForm(block, TEXTS.en, { lang: 'en', submit: (v) => sent.push(v) });
  let focused = 0;
  f.box.focus = () => { focused += 1; };
  assert.equal(text(block.querySelector('h2')), 'Please enter your booking information');
  assert.deepEqual([...block.querySelectorAll('label')].map(text), ['Ticket number', 'First name', 'Last name', 'This receipt is for business purposes']);
  assert.equal(text(f.fields[0].message), 'Enter your 13-digit ticket number');
  assert.equal(text(f.button), 'Download Passenger Receipt');
  fire(f.form, 'submit');
  assert.equal(f.box.hidden, false);
  assert.equal(focused, 1);
  assert.equal(text(f.box.querySelector('.passenger-receipt-errors-headline')), '3 errors have occurred. Please resolve the following issue before you continue:');
  assert.deepEqual([...f.box.querySelectorAll('a')].map((a) => [text(a), a.getAttribute('href')]), [
    ['Ticket number is required', `#${f.fields[0].input.id}`],
    ['First Name is required', `#${f.fields[1].input.id}`],
    ['Last Name is required', `#${f.fields[2].input.id}`],
  ]);
  assert.deepEqual(f.fields.map((x) => [text(x.message), x.input.getAttribute('aria-invalid'), x.input.getAttribute('aria-describedby') === x.message.id]), [
    ['Ticket number is required', 'true', true], ['First Name is required', 'true', true], ['Last Name is required', 'true', true],
  ]);
  assert.equal(sent.length, 0);
  // one fixed: the box counts the rest
  type(f.fields[0].input, '220-1234567890');
  assert.equal(text(f.box.querySelector('.passenger-receipt-errors-headline')), '2 errors have occurred. Please resolve the following issue before you continue:');
  assert.equal(f.fields[0].input.getAttribute('aria-invalid'), 'false');
  assert.equal(text(f.fields[0].message), 'Enter your 13-digit ticket number');
});

test('a field is checked once left after typing; the valid submit hands the values over', async () => {
  const block = document.createElement('div');
  document.body.replaceChildren(block);
  const sent = [];
  const f = PR.buildForm(block, TEXTS.en, { lang: 'en', submit: async (v) => { sent.push(v); } });
  fire(f.fields[1].input, 'blur');
  assert.equal(f.fields[1].input.getAttribute('aria-invalid'), 'false', 'not typed: not checked');
  type(f.fields[1].input, 'Anna1');
  fire(f.fields[1].input, 'blur');
  assert.equal(text(f.fields[1].message), 'Please enter a valid first name');
  type(f.fields[1].input, 'Anna');
  assert.equal(f.fields[1].input.getAttribute('aria-invalid'), 'false', 'checked again on change');
  type(f.fields[0].input, '2201234567890');
  type(f.fields[2].input, 'Muster');
  fire(f.form, 'submit');
  await new Promise((r) => { setTimeout(r, 0); });
  assert.deepEqual(sent, [{ ticketNumber: '2201234567890', firstName: 'Anna', lastName: 'Muster' }]);
  assert.equal(f.box.hidden, true);
});

test('accented letters by www\'s table of the page language, with www\'s note', () => {
  assert.equal(convertAccents('Jörg', 'de'), 'Joerg');
  assert.equal(convertAccents('Jörg', 'en'), 'Jorg');
  assert.equal(convertAccents('Łukasz', 'pl'), convertAccents('Łukasz', 'default'));
  const block = document.createElement('div');
  document.body.replaceChildren(block);
  const f = PR.buildForm(block, TEXTS.de, { lang: 'de' });
  type(f.fields[1].input, 'Jörg');
  fire(f.fields[1].input, 'blur');
  assert.equal(f.fields[1].input.value, 'Joerg');
  assert.equal(text(f.fields[1].message), 'Wir haben Buchstaben mit Akzent in lateinische Buchstaben umgewandelt');
});

test('www\'s request: <service>/download, the key and tenant headers, the ticket without its dash; none without the config', () => {
  const values = { ticketNumber: '220-1234567890', firstName: ' Anna ', lastName: 'Muster' };
  assert.equal(PR.receiptRequest(values, 'de', null), null);
  assert.equal(PR.receiptRequest(values, 'de', { PASSENGER_RECEIPT_BFF_BASE_URL: 'https://stand-in.example/v1' }), null, 'no key: nothing sent');
  const [url, init] = PR.receiptRequest(values, 'de', { PASSENGER_RECEIPT_BFF_BASE_URL: 'https://stand-in.example/v1/', PASSENGER_RECEIPT_BFF_API_KEY: 'test-key' });
  assert.equal(url, 'https://stand-in.example/v1/download');
  assert.equal(init.method, 'POST');
  assert.deepEqual(init.headers, {
    'X-API-KEY': 'test-key', 'X-Tenant-id': 'LH', 'Accept-Language': 'de', 'Content-Type': 'application/json',
  });
  assert.deepEqual(JSON.parse(init.body), { ticketNumber: '2201234567890', firstName: 'Anna', lastName: 'Muster' });
});

test('the own-host hand-off with a stand-in service: the config from the page origin, the PDF saved as <ticket>.pdf; error codes as label keys', async () => {
  const calls = [];
  const stand = (answers) => async (url, init) => {
    calls.push([url, init && init.method]);
    const a = answers.shift();
    return { ok: a.ok, json: async () => a.body };
  };
  const config = { ok: true, body: { PASSENGER_RECEIPT_BFF_BASE_URL: 'https://stand-in.example/v1', PASSENGER_RECEIPT_BFF_API_KEY: 'test-key' } };
  const saved = [];
  const r = await PR.sendReceipt({ ticketNumber: '220-1234567890', firstName: 'Anna', lastName: 'Muster' }, 'en', {
    fetchImpl: stand([config, { ok: true, body: { documentContent: '%PDF-1.4 x' } }]), save: (b, n) => saved.push([b.type, b.size, n]),
  });
  assert.deepEqual(calls, [[PR.RUNTIME_CONFIG, undefined], ['https://stand-in.example/v1/download', 'POST']]);
  assert.deepEqual(saved, [['application/pdf', 10, '2201234567890.pdf']]);
  assert.equal(r.name, '2201234567890.pdf');
  await assert.rejects(PR.sendReceipt({ ticketNumber: '2201234567890', firstName: 'A', lastName: 'B' }, 'en', {
    fetchImpl: stand([config, { ok: false, body: { errors: ['bookingDataNotFound'], validationErrors: [{ code: 'ticketPrefixMismatch' }] } }]),
  }), (e) => JSON.stringify(e.keys) === JSON.stringify(['passengerreceipt.errors.bff.bookingDataNotFound', 'passengerreceipt.errors.bff.ticketPrefixMismatch']));
  await assert.rejects(PR.sendReceipt({ ticketNumber: '2201234567890', firstName: 'A', lastName: 'B' }, 'en', {
    fetchImpl: stand([{ ok: false, body: null }]),
  }), (e) => Array.isArray(e.keys) && !e.keys.length, 'no config: nothing sent, the general error');
});

test('off the own host the hand-off is the same page on www', () => {
  assert.equal(PR.wwwPage({ pathname: '/de/en/book-and-manage/pax-receipt' }), 'https://www.lufthansa.com/de/en/book-and-manage/pax-receipt');
});

test('the texts: every key in the 13 languages of lufthansa.com; en and de as www\'s label files', () => {
  const keys = Object.keys(LIVE_KEYS).sort();
  ['en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'hk', 'zh', 'el', 'ja', 'ko', 'pl'].forEach((l) => {
    assert.deepEqual(Object.keys(TEXTS[l]).sort(), keys, l);
    assert.ok(TEXTS[l]['errors many'].includes('{COUNT}'), `${l}: the count`);
  });
  assert.equal(TEXTS.de['submit label'], 'Passagierbeleg herunterladen');
  assert.equal(TEXTS.de['ticket required'], 'Ticketnummer ist erforderlich');
  assert.equal(TEXTS.en['general error'], 'We couldn’t retrieve your passenger receipt right now. Please try again in a moment.');
});

test('the importer: www\'s passenger-receipt-portal (info pages) becomes an empty passenger-receipt block', async () => {
  const fs = await import('node:fs');
  const { templates } = JSON.parse(fs.readFileSync('tools/importer/page-templates.json', 'utf8'));
  const block = templates.find((t) => t.name === 'info').blocks.find((b) => b.name === 'passenger-receipt');
  assert.deepEqual(block.instances, ['.wrapper:has(> passenger-receipt-portal)']);
  assert.ok(fs.readFileSync('tools/importer/import-info.js', 'utf8').includes("'passenger-receipt': passengerReceiptParser"));
  globalThis.WebImporter = { Blocks: { createBlock: (doc, { name, cells }) => { const t = doc.createElement('table'); t.setAttribute('data-name', name); t.setAttribute('data-cells', String(cells.length)); return t; } } };
  const { default: parse } = await import('../tools/importer/parsers/passenger-receipt.js');
  const host = document.createElement('div');
  host.innerHTML = '<div class="wrapper section"><passenger-receipt-portal class="limited-width"><div id="root"><form class="pax-receipt-form">Loading</form></div></passenger-receipt-portal></div>';
  parse(host.firstElementChild, { document });
  assert.equal(host.children.length, 1);
  assert.equal(host.firstElementChild.tagName, 'TABLE');
  assert.equal(host.firstElementChild.getAttribute('data-name'), 'passenger-receipt');
  assert.equal(host.textContent.includes('Loading'), false);
});
