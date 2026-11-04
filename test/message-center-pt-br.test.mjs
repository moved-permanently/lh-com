/* eslint-disable max-len */
/* pt-br's own message documents (brief 362): www.flytap.com/pt-br shows TAP's Brazilian wording
   of an alert (/master/pt-br/alerts/...), so the sync will write /message-center/<type>/<id>/pt-br
   next to .../pt. scripts/message-center.js parseRow takes a language of two letters with an
   optional region (pt, pt-br); selectMessages keeps per message the page's <lang>-<country>
   document (pt-br on /pt-br: lang pt, country br), else its <lang> document, else English. A
   message without a pt-br document shows pt on /pt-br as today; every other page and brand keeps
   its documents (none has a <lang>-<country> one).
   Run: node --max-old-space-size=512 --test test/message-center-pt-br.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/pt-br', search: '', hash: '', href: 'https://tap.turnsthe.page/pt-br', origin: 'https://tap.turnsthe.page',
};
globalThis.window = window;
globalThis.document = document;
const { parseRow, selectMessages } = await import('../scripts/message-center.js');

const NOW = Date.parse('2026-11-06T09:00:00.000Z');
const row = (path, fields = {}) => ({
  path, headline: `Headline ${path}`, criticality: 'low', tenants: '["tap"]', markets: '[]', touchpoints: '["web"]', link: '', details: path.replace('/irreg/', '/details/'), from: '', to: '', push: 'false', 'internal-title': '', lastModified: 1792900000, weight: '', ...fields,
});
const ROWS = [
  row('/message-center/irreg/surto-de-ebola/pt'),
  row('/message-center/irreg/surto-de-ebola/pt-br'),
  row('/message-center/irreg/surto-de-ebola/en'),
  row('/message-center/irreg/power-banks/pt'),
  row('/message-center/irreg/power-banks/en'),
  row('/message-center/irreg/only-english/en'),
  row('/message-center/irreg/only-brazil/pt-br'),
];
const pick = (lang, market, rows = ROWS) => selectMessages(rows, {
  lang, market, now: NOW, tenant: 'tap',
}).map((m) => `${m.id}/${m.lang}`).sort();

test('parseRow: a two-letter language with an optional region; anything else as before (dropped)', () => {
  assert.equal(parseRow(row('/message-center/irreg/surto-de-ebola/pt-br')).lang, 'pt-br');
  assert.equal(parseRow(row('/message-center/irreg/surto-de-ebola/pt-br')).id, 'surto-de-ebola');
  assert.equal(parseRow(row('/message-center/irreg/surto-de-ebola/pt')).lang, 'pt');
  assert.equal(parseRow(row('/message-center/irreg/x/portuguese')), null);
  assert.equal(parseRow(row('/message-center/irreg/x/pt-')), null);
  assert.equal(parseRow(row('/message-center/irreg/x/pt-bra')), null);
});

test('/pt-br (lang pt, country br): the pt-br document, else pt, else English', () => {
  assert.deepEqual(pick('pt', 'br'), ['only-brazil/pt-br', 'only-english/en', 'power-banks/pt', 'surto-de-ebola/pt-br']);
  const ebola = selectMessages(ROWS, {
    lang: 'pt', market: 'br', now: NOW, tenant: 'tap',
  }).find((m) => m.id === 'surto-de-ebola');
  assert.equal(ebola.details, '/message-center/details/surto-de-ebola/pt-br', 'its own details page');
});

test('every other page as before: pt-pt and its roots pt, en pages en, no other market\'s document', () => {
  assert.deepEqual(pick('pt', 'pt'), ['only-english/en', 'power-banks/pt', 'surto-de-ebola/pt']);
  assert.deepEqual(pick('pt', 'ao'), ['only-english/en', 'power-banks/pt', 'surto-de-ebola/pt']);
  assert.deepEqual(pick('en', 'gb'), ['only-english/en', 'power-banks/en', 'surto-de-ebola/en']);
  assert.deepEqual(pick('de', 'de'), ['only-english/en', 'power-banks/en', 'surto-de-ebola/en']);
  // today's documents (no pt-br row): /pt-br as before
  const today = ROWS.filter((r) => !r.path.endsWith('/pt-br'));
  assert.deepEqual(pick('pt', 'br', today), ['only-english/en', 'power-banks/pt', 'surto-de-ebola/pt']);
});
