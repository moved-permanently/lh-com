/* The form block's submission on the sites without <cc>/<ll> roots, and three fixes from the Cargo
   test on cargo.turnsthe.page/en/contact-us (2026-11-01):
   - locale: the page's language there (as scripts/message-center.js messageLocale: `language`
     metadata, else the first path segment; no country): airdolomiti.turnsthe.page's Italian
     /iscrizione-newsletter sends `it` (was de-de), Cargo's /en/contact-us `en` (was de-en);
     lh-com, ITA, Austrian, Discover, Brussels their root as before (de-en, it-en, ...);
   - the file field reaches the mail under its own label (the list headline, "Uploaded files"),
     not the drop zone's prompt ("Drag file(s) here"); the worker lists a file once
     (tools/workers/lh-forms: not again under Attachments);
   - after a successful send (no success page) the form gives way to the success message in its
     place (a card in the form's column, focused, announced): no values left, no second submit.
   Run: node --max-old-space-size=512 --test test/form-submit-fixes.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
const setPage = (p, host) => {
  window.location = {
    hostname: host, pathname: p, search: '', hash: '', origin: `https://${host}`, href: `https://${host}${p}`,
  };
};
setPage('/en/contact-us', 'cargo.turnsthe.page');
window.origin = 'https://cargo.turnsthe.page';
globalThis.Event = window.Event;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };
const F = await import('../blocks/form/form.js');

// the element last focused (linkedom keeps no focus)
let focused = null;
function onPage(meta, fn) {
  const rows = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const { document, window: page } = parseHTML(`<!DOCTYPE html><html><head>${rows}</head><body></body></html>`);
  // linkedom keeps no focus
  page.HTMLElement.prototype.focus = function focus() { focused = this; };
  focused = null;
  globalThis.document = document;
  return Promise.resolve(fn(document)).finally(() => { delete globalThis.document; });
}

test('submissionLocale: the page\'s language on Cargo and Air Dolomiti; the root elsewhere, as before', async () => {
  const cases = [
    [{ brand: 'airdolomiti', language: 'it' }, '/iscrizione-newsletter', 'airdolomiti.turnsthe.page', 'it'],
    [{ brand: 'airdolomiti' }, '/iscrizione-newsletter', 'airdolomiti.turnsthe.page', 'it'],
    [{ brand: 'airdolomiti', language: 'en' }, '/en/newsletter-subscription', 'airdolomiti.turnsthe.page', 'en'],
    [{ brand: 'airdolomiti' }, '/de/newsletter-anmeldung', 'airdolomiti.turnsthe.page', 'de'],
    [{ brand: 'cargo', language: 'en' }, '/en/contact-us', 'cargo.turnsthe.page', 'en'],
    [{ brand: 'cargo' }, '/de/kontakt', 'cargo.turnsthe.page', 'de'],
    [{}, '/de/en/feedback-past-flight', 'lufthansa.turnsthe.page', 'de-en'],
    [{ brand: 'ita' }, '/it/en/contact', 'ita.turnsthe.page', 'it-en'],
    [{ brand: 'austrian' }, '/at/en/contact-form-other', 'austrian.turnsthe.page', 'at-en'],
    [{ brand: 'discover' }, '/de/de/kontakt', 'discover.turnsthe.page', 'de-de'],
    [{ brand: 'brussels' }, '/be/fr/contact', 'brussels.turnsthe.page', 'be-fr'],
  ];
  const results = await cases.reduce(async (prev, [meta, path, host]) => {
    const list = await prev;
    setPage(path, host);
    return [...list, await onPage(meta, () => F.submissionLocale())];
  }, Promise.resolve([]));
  assert.deepEqual(results, cases.map((c) => c[3]));
});

/** Cargo's contact form, shortened (main--lh-cargo /en/contact-us), as a core form block. */
const ROWS = [
  ['Label', 'Type', 'Name', 'Required'],
  ['Your name', 'text', 'name', 'yes'],
  ['Drag file(s) here', 'file', 'attachments', 'Optional'],
  ['Uploaded files', 'label', 'file list headline', ''],
  ['Submit', 'submit', '', ''],
  ['cargo-contact-us', 'config', 'form', ''],
  ['Your request has been submitted successfully.', 'label', 'success message', ''],
];
const flush = () => new Promise((resolve) => { setImmediate(resolve); });

/** Decorates the form on Cargo's /en/contact-us, fills it, adds a file; posts are recorded. */
async function cargoForm(document) {
  setPage('/en/contact-us', 'cargo.turnsthe.page');
  const posts = [];
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    if (href.endsWith('/submit')) {
      posts.push(init.body);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (href.endsWith('/config')) return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
    return new Response(null, { status: 404 });
  };
  const block = document.createElement('div');
  block.className = 'form core';
  block.innerHTML = ROWS.map((r) => `<div>${r.map((c) => `<div>${c}</div>`).join('')}</div>`).join('');
  document.body.append(block);
  F.default(block);
  const name = block.querySelector('input[name="name"]');
  name.value = 'Erika';
  name.dispatchEvent(new window.Event('input', { bubbles: true }));
  const input = block.querySelector('input.form-filedrop-input');
  Object.defineProperty(input, 'files', { configurable: true, value: [new File([new TextEncoder().encode('%PDF-1.7')], 'awb.pdf', { type: 'application/pdf' })] });
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
  const form = block.querySelector('form');
  // linkedom's form has no reset(): the browser's, for the fields used here
  form.reset = () => {
    form.querySelectorAll('input, textarea').forEach((i) => {
      if (i.type === 'checkbox' || i.type === 'radio') i.checked = false;
      else if (i.type !== 'file') i.value = '';
    });
  };
  const submit = async () => {
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    for (let i = 0; i < 30; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await flush();
    }
  };
  return {
    block, form, posts, submit,
  };
}

test('the submission: locale en, the file field under its own label, the file once', async () => {
  await onPage({ brand: 'cargo', language: 'en' }, async (document) => {
    const { posts, submit } = await cargoForm(document);
    await submit();
    assert.equal(posts.length, 1);
    const body = posts[0];
    assert.equal(body.get('locale'), 'en');
    const fields = JSON.parse(body.get('fields'));
    const files = fields.filter((f) => f.name === 'attachments');
    assert.equal(files.length, 1);
    assert.equal(files[0].label, 'Uploaded files', 'the field\'s own label, not the drop prompt');
    assert.equal(files[0].value, 'awb.pdf');
    assert.ok(!fields.some((f) => f.label === 'Drag file(s) here'));
    assert.equal(body.get('file_1').name, 'awb.pdf');
  });
});

test('after a successful send: the success message in the form\'s place, no values left, no second submit', async () => {
  await onPage({ brand: 'cargo', language: 'en' }, async (document) => {
    const {
      block, form, posts, submit,
    } = await cargoForm(document);
    await submit();
    assert.equal(posts.length, 1);
    const done = block.querySelector('.form-success');
    assert.ok(done, 'a success panel');
    assert.equal(done.textContent.trim(), 'Your request has been submitted successfully.');
    assert.equal(done.getAttribute('role'), 'status');
    assert.ok(focused === done || done.contains(focused), 'focus moves to the message');
    // in the form's place: a card in the form's step grid, where the form was
    assert.ok(done.classList.contains('form-step'));
    assert.ok(done.querySelector('.form-step-card'));
    assert.ok(done.nextElementSibling === form || done.previousElementSibling === form);
    assert.ok(form.hidden, 'the form gives way');
    assert.equal(form.querySelector('input[name="name"]').value, '', 'no values left');
    // a second submit sends nothing
    await submit();
    assert.equal(posts.length, 1);
  });
});

test('form.css: the hidden form is gone (its own display would keep it), the message in the bands\' style', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync('blocks/form/form.css', 'utf8');
  assert.match(css, /\.form \.form-form\[hidden\] \{\n {2}display: none;\n\}/);
  assert.match(css, /\.form \.form-success-message \{/);
});
