/* eslint-disable max-len */
/* The form block on the brand sites (blocks/form/form.js): links to the brand's own www go to the
   same page on the page's host (pageUrl); when sending fails the block goes to the error page only
   when the form names one on this site that exists, else shows the send error above the submit
   button and keeps the entries; a drop zone whose files could exceed the 18.5 MB total names it in
   the page's language and refuses a selection over it. lh-com as before.
   DOM nodes are compared with assert.ok(a === b) only.
   Run: node --max-old-space-size=512 --test test/form-brand-sites.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
const nav = { to: null };
const setPage = (p, host) => {
  const loc = {
    hostname: host, pathname: p, search: '', hash: '', origin: `https://${host}`,
  };
  Object.defineProperty(loc, 'href', {
    get: () => `https://${host}${p}`,
    set: (v) => { nav.to = v; },
    configurable: true,
  });
  window.location = loc;
  nav.to = null;
};
setPage('/at/en/contact-form-other', 'austrian.turnsthe.page');
// scripts/aem.js (the block's loadScript) reads window.origin when it is imported
window.origin = 'https://austrian.turnsthe.page';
// the block's change events on linkedom's nodes
globalThis.Event = window.Event;
const F = await import('../blocks/form/form.js');

function onPage(meta, fn) {
  const rows = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${rows}</head><body></body></html>`);
  globalThis.document = document;
  return Promise.resolve(fn(document)).finally(() => { delete globalThis.document; });
}

test('pageUrl: the brand\'s own www names the same page on the page\'s host (ITA, Austrian); lh-com as before', async () => {
  setPage('/at/en/contact-form-other', 'austrian.turnsthe.page');
  assert.equal(await onPage({ brand: 'austrian' }, () => F.pageUrl('https://www.austrian.com/at/en/form-confirmation')), 'https://austrian.turnsthe.page/at/en/form-confirmation');
  assert.equal(await onPage({ brand: 'austrian' }, () => F.pageUrl('https://www.austrian.com/error.html')), 'https://austrian.turnsthe.page/error.html');
  assert.equal(await onPage({ brand: 'austrian' }, () => F.pageUrl('https://www.lufthansa.com/de/en/x')), 'https://austrian.turnsthe.page/de/en/x');
  assert.equal(await onPage({ brand: 'austrian' }, () => F.pageUrl('https://shop.austrian.com/x')), 'https://shop.austrian.com/x');
  setPage('/xx/en/book-and-prepare/group-travel-and-charter/group-travel', 'main--lh-ita--moved-permanently.aem.page');
  assert.equal(await onPage({ brand: 'ita' }, () => F.pageUrl('https://www.ita-airways.com/xx/en/thank-you')), 'https://main--lh-ita--moved-permanently.aem.page/xx/en/thank-you');
  assert.equal(await onPage({ brand: 'ita' }, () => F.pageUrl('https://www.austrian.com/at/en/x')), 'https://www.austrian.com/at/en/x', 'another brand\'s www stays where it is');
  // lh-com: www.lufthansa.com as before, a brand's www stays external
  setPage('/de/en/group-travel', 'lufthansa.turnsthe.page');
  assert.equal(await onPage({}, () => F.pageUrl('https://www.lufthansa.com/de/en/thank-you')), 'https://lufthansa.turnsthe.page/de/en/thank-you');
  assert.equal(await onPage({}, () => F.pageUrl('https://www.austrian.com/at/en/form-confirmation')), 'https://www.austrian.com/at/en/form-confirmation');
  assert.equal(await onPage({}, () => F.pageUrl('/de/en/thank-you')), 'https://lufthansa.turnsthe.page/de/en/thank-you');
});

/** A core form's DOM as decorate builds it: the fields, the actions, the status. */
function coreForm(document) {
  const form = document.createElement('form');
  const actions = document.createElement('div');
  actions.className = 'form-field form-actions';
  const button = document.createElement('button');
  button.type = 'submit';
  actions.append(button);
  const status = document.createElement('p');
  status.className = 'form-status';
  form.append(actions, status);
  document.body.append(form);
  return { form, button, status };
}
const labels = { sending: 'Sending…', 'success message': 'Thank you.', 'send error': 'Sorry, your request could not be sent. Please try again.' };

/** Runs sendForm with a worker answer and the HEAD answer of the error page; what happened. */
async function send({
  worker, head = 404, config = {}, page = ['/at/en/contact-form-other', 'austrian.turnsthe.page'], brand = 'austrian',
}) {
  setPage(...page);
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push(`${init.method || 'GET'} ${url}`);
    if (String(url).endsWith('/submit')) {
      if (worker === 'network') throw new TypeError('Failed to fetch');
      return new Response(JSON.stringify(worker === 200 ? { ok: true } : { ok: false, error: 'send-failed' }), { status: worker, headers: { 'content-type': 'application/json' } });
    }
    return new Response(null, { status: head });
  };
  return onPage(brand ? { brand } : {}, async (document) => {
    const { form, button, status } = coreForm(document);
    const ctx = {
      labels, config: { form: 'austrian-contact-form-other', ...config }, botCheck: null, entries: new Map(), sending: false,
    };
    await F.sendForm(form, [], ctx, button, status);
    const note = form.querySelector('.form-send-error');
    return {
      calls,
      to: nav.to,
      note: note && !note.hidden ? note.textContent : null,
      noteBeforeActions: Boolean(note) && note.nextElementSibling === form.querySelector('.form-actions'),
      role: note ? note.getAttribute('role') : null,
      busy: button.disabled,
      sending: ctx.sending,
      status: status.textContent,
    };
  });
}

test('send fails (worker 500, network error) without an error row: the message in place, the form ready again', async () => {
  const results = [await send({ worker: 500 }), await send({ worker: 'network' }), await send({ worker: 403 })];
  results.forEach((r) => {
    assert.equal(r.to, null, 'no navigation');
    assert.equal(r.note, labels['send error']);
    assert.ok(r.noteBeforeActions, 'above the submit button');
    assert.equal(r.role, 'alert');
    assert.equal(r.busy, false);
    assert.equal(r.sending, false);
    assert.equal(r.status, '');
    // the fallback /error.html was asked (404 on every site), on this host
    assert.ok(r.calls.includes('HEAD https://austrian.turnsthe.page/error.html'), r.calls.join(' | '));
  });
});

test('send fails with an error row whose page answers 404 (www\'s /error.html): the message in place', async () => {
  const r = await send({ worker: 500, config: { error: 'https://www.austrian.com/error.html' } });
  assert.equal(r.to, null);
  assert.equal(r.note, labels['send error']);
  assert.ok(r.calls.includes('HEAD https://austrian.turnsthe.page/error.html'));
  // a page on another host is not asked: the message in place
  const other = await send({ worker: 500, config: { error: 'https://example.org/error' } });
  assert.equal(other.to, null);
  assert.equal(other.note, labels['send error']);
  assert.ok(!other.calls.some((c) => c.startsWith('HEAD')));
});

test('send fails with an error row naming a page of this site that exists (Discover\'s): that page', async () => {
  const r = await send({
    worker: 500, head: 200, config: { error: '/de/en/booking/error' }, page: ['/de/en/support/contact/other-concerns', 'discover.turnsthe.page'], brand: 'discover',
  });
  assert.equal(r.to, 'https://discover.turnsthe.page/de/en/booking/error');
  assert.equal(r.note, null);
});

test('sent: the success page; the brand\'s www success row on this host', async () => {
  const r = await send({ worker: 200, config: { success: 'https://www.austrian.com/at/en/form-confirmation' } });
  assert.equal(r.to, 'https://austrian.turnsthe.page/at/en/form-confirmation');
  assert.equal(r.note, null);
  assert.ok(!r.calls.some((c) => c.startsWith('HEAD')));
});

/** A core form block with one file row (rules as lh-austrian's pages carry them). */
function fileBlock(document, rules, label = 'Drop your files here') {
  const block = document.createElement('div');
  block.className = 'form core';
  const row = (cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
  block.innerHTML = row(['Label', 'Type', 'Name', 'Required', 'Options', 'Help text', 'Placeholder', 'Validation message', 'Constraint message', 'Rules'])
    + row([label, 'file', 'Attachments', '', '', 'pdf, png, jpg', 'Select file(s)', '', '', rules.map((r) => `<p>${r}</p>`).join('')])
    + row(['', 'submit', 'submit', '', '', '', '', '', '', '']);
  document.body.append(block);
  return block;
}
const MB = 1000 * 1000;
const pdf = (name, size) => ({ name, size, type: 'application/pdf' });

/** Decorates a file row on a page and adds files; the zone's total line and the rejections. */
async function dropzone({
  page, brand = 'austrian', rules, add = [],
}) {
  setPage(...page);
  globalThis.fetch = async () => new Response('{}', { status: 404 });
  return onPage(brand ? { brand } : {}, async (document) => {
    const block = fileBlock(document, rules);
    F.default(block);
    const total = block.querySelector('.form-filedrop-total');
    const input = block.querySelector('.form-filedrop-input');
    if (add.length) {
      Object.defineProperty(input, 'files', { value: add, configurable: true });
      input.dispatchEvent(new window.Event('change'));
    }
    return {
      total: total ? total.textContent : null,
      rejected: [...block.querySelectorAll('.form-filedrop-item-rejected .form-filedrop-error')].map((e) => e.textContent),
      kept: block.querySelectorAll('.form-filedrop-item:not(.form-filedrop-item-rejected)').length,
    };
  });
}
const FIVE_BY_FIVE = ['accept=image/png, image/jpeg, image/jpg, application/pdf', 'max-files=5', 'max-size=5000000', 'not-allowed=#$%^*()[]'];

test('the data protection forms (5 x 5 MB): the zone names the total in the page\'s language and refuses a selection over it', async () => {
  const en = await dropzone({ page: ['/at/en/data-protection-contact', 'austrian.turnsthe.page'], rules: FIVE_BY_FIVE });
  assert.equal(en.total, 'All files together: max. 18.5 MB');
  const de = await dropzone({ page: ['/at/de/betroffenenrechte-anfrage', 'austrian.turnsthe.page'], rules: FIVE_BY_FIVE });
  assert.equal(de.total, 'Alle Dateien zusammen: max. 18.5 MB');
  const fr = await dropzone({ page: ['/fr/fr/data-protection-contact', 'austrian.turnsthe.page'], rules: FIVE_BY_FIVE });
  assert.equal(fr.total, 'Tous les fichiers ensemble : max. 18.5 MB');
  const ja = await dropzone({ page: ['/jp/ja/data-protection-contact', 'austrian.turnsthe.page'], rules: FIVE_BY_FIVE });
  assert.equal(ja.total, 'すべてのファイルの合計：最大 18.5 MB');
  // 5 + 5 + 5 MB kept, the fourth 5 MB would make 20 MB: refused with the total's line
  const over = await dropzone({
    page: ['/at/en/data-protection-contact', 'austrian.turnsthe.page'], rules: FIVE_BY_FIVE, add: [pdf('1.pdf', 5 * MB), pdf('2.pdf', 5 * MB), pdf('3.pdf', 5 * MB), pdf('4.pdf', 5 * MB), pdf('5.pdf', 3 * MB)],
  });
  assert.equal(over.kept, 4, '15 MB, then 3 MB more: 18 MB');
  assert.deepEqual(over.rejected, ['All files together: max. 18.5 MB']);
});

test('5 x 3.7 MB (the total itself) and lh-com\'s feedback form: no total line, as before', async () => {
  const at = await dropzone({ page: ['/at/en/contact-form-other', 'austrian.turnsthe.page'], rules: ['accept=image/png, image/jpeg, image/jpg, application/pdf', 'max-files=5', 'max-size=3700000'] });
  assert.equal(at.total, null);
  const lh = await dropzone({
    page: ['/de/en/feedback-past-flight', 'lufthansa.turnsthe.page'], brand: '', rules: ['accept=image/png, image/jpeg, image/jpg, application/pdf', 'max-files=5', 'max-size=3700000'], add: [pdf('1.pdf', 3700000), pdf('2.pdf', 3700001)],
  });
  assert.equal(lh.total, null);
  assert.equal(lh.kept, 1);
  assert.deepEqual(lh.rejected, ['Please upload a file with an accepted file size']);
});
