/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
/* Booking code entry on the brand sites (brief 369; www's capture brand-booking-001 of
   2026-11-05, fake code ABC123 / Test only). Discover, Austrian, Brussels and SWISS run the same
   page code: the login page's "Booking code" card opens a modal with two fields (booking code: 6
   capitals or digits, or a 13-digit ticket number; last name), validated in the browser with an
   error box ("2 errors have occurred. …", a "Go to error" link per field) and the message under each
   field; a valid submit posts filekeylogin, then bookingdetailslink, then posts a form in the same
   window to https://shop.<brand>/booking/manage-booking/retrieve?lang=<lang>&portalCountry=<CC> with
   lang, portalCountry, lastName, recLoc. bookingdetailslink answers the same for any code, so the
   replica builds that form itself from the language tables (scripts/handoff.js retrieveTarget);
   on the airline's own www host it makes www's two calls (Discover: X-Portal FOUR_Y, then LH).
   Block: booking-lookup (booking-code), on the login documents; links to #booking-code open it.
   ITA: www's form sends nothing (a dead end), so no replica form; lh-com as before.
   DOM nodes are compared with assert.ok(a === b) only.
   Run: node --max-old-space-size=512 --test test/booking-code-369.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.Event = window.Event;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
let submitted;
window.HTMLElement.prototype.submit = function submit() {
  submitted.push({
    action: this.getAttribute('action'), method: this.getAttribute('method'), target: this.getAttribute('target'), fields: [...this.querySelectorAll('input')].map((i) => [i.name, i.value]),
  });
};
let calls;
// linkedom keeps no activeElement for a focused div: the last element focus() was called on
let focused;
window.HTMLElement.prototype.focus = function focus() { focused = this; };
const json = (data) => new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } });
// www.swiss.com's answer for ABC123 / Test (the capture's swiss.json, ch/en)
const SWISS_LINK = {
  hasIrreg: false,
  linkTarget: {
    targetURL: 'https://shop.swiss.com/booking/manage-booking/retrieve?lang=en-GB&portalCountry=CH', newWindow: false, methodGet: false, external: true, parameters: [{ key: 'lastName', values: ['Test'] }, { key: 'recLoc', values: ['ABC123'] }], headers: [],
  },
};
beforeEach(() => {
  submitted = [];
  calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    calls.push({
      href, method: init.method || 'GET', headers: init.headers || {}, body: init.body && JSON.parse(init.body),
    });
    if (href.endsWith('/filekeylogin')) return new Response('', { status: 200, headers: { 'content-type': 'text/plain' } });
    if (href.includes('/bookingdetailslink')) return json(SWISS_LINK);
    return new Response('{}', { status: 404 });
  };
});

const handoff = await import('../scripts/handoff.js');
const { default: decorate } = await import('../blocks/booking-lookup/booking-lookup.js');
const { BOOKING_CODE_TEXTS } = await import('../blocks/booking-lookup/booking-code-texts.js');

const tick = () => new Promise((r) => { setTimeout(r, 0); });
const flush = async () => { for (let i = 0; i < 8; i += 1) await tick(); };

/** A brand login page at host + path with the booking-code block and the card's link. */
function page(brand, host, path, { hash = '' } = {}) {
  window.location = {
    hostname: host, pathname: path, search: '', hash, href: `https://${host}${path}${hash}`, origin: `https://${host}`, assign: () => {},
  };
  const { document } = parseHTML(`<!DOCTYPE html><html><head><meta name="brand" content="${brand}"></head><body><main><div class="section"><p><em><a href="#booking-code">Enter booking code</a></em></p><div class="booking-lookup booking-code"></div></div></main></body></html>`);
  globalThis.document = document;
  const block = document.querySelector('.booking-lookup');
  decorate(block);
  return { document, block, dialog: () => document.querySelector('dialog.booking-lookup-dialog') };
}
const click = (el) => el.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
const submit = (block, values) => {
  Object.entries(values).forEach(([name, value]) => { block.querySelector(`input[name="${name}"]`).value = value; });
  block.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true }));
};
const isOpen = (d) => d.hasAttribute('open');

test('retrieveTarget: www\'s shop form per brand: shop host, lang by the page\'s language, portalCountry its market', () => {
  const t = (brand, country, lang) => handoff.retrieveTarget({ reference: 'ABC123', lastName: 'Test' }, { brand, country, lang });
  assert.deepEqual(t('swiss', 'ch', 'en'), {
    targetURL: 'https://shop.swiss.com/booking/manage-booking/retrieve?lang=en-GB&portalCountry=CH',
    methodGet: false,
    newWindow: false,
    parameters: [{ key: 'lang', values: ['en-GB'] }, { key: 'portalCountry', values: ['CH'] }, { key: 'lastName', values: ['Test'] }, { key: 'recLoc', values: ['ABC123'] }],
  });
  const url = (...a) => t(...a).targetURL;
  assert.equal(url('swiss', 'ch', 'de'), 'https://shop.swiss.com/booking/manage-booking/retrieve?lang=de-CH&portalCountry=CH');
  assert.equal(url('swiss', 'kr', 'ko'), 'https://shop.swiss.com/booking/manage-booking/retrieve?lang=ko-KR&portalCountry=KR');
  assert.equal(url('discover', 'de', 'en'), 'https://shop.lufthansa.com/booking/manage-booking/retrieve?lang=en-GB&portalCountry=DE', 'Discover: Lufthansa\'s shop, as its www');
  assert.equal(url('discover', 'us', 'en'), 'https://shop.lufthansa.com/booking/manage-booking/retrieve?lang=en-GB&portalCountry=US');
  assert.equal(url('discover', 'ca', 'fr'), 'https://shop.lufthansa.com/booking/manage-booking/retrieve?lang=fr-FR&portalCountry=CA');
  assert.equal(url('austrian', 'at', 'de'), 'https://shop.austrian.com/booking/manage-booking/retrieve?lang=de-AT&portalCountry=AT');
  assert.equal(url('austrian', 'pl', 'pl'), 'https://shop.austrian.com/booking/manage-booking/retrieve?lang=pl-PO&portalCountry=PL', 'pl-PO as www writes it');
  assert.equal(url('brussels', 'be', 'nl'), 'https://shop.brusselsairlines.com/booking/manage-booking/retrieve?lang=nl-NL&portalCountry=BE');
  assert.equal(url('brussels', 'be', 'sv'), 'https://shop.brusselsairlines.com/booking/manage-booking/retrieve?lang=en-GB&portalCountry=BE', 'a language www has none for: en-GB');
  assert.equal(t('ita', 'it', 'en'), null, 'ITA: www hands nothing off');
  assert.equal(t('', 'de', 'en'), null, 'lh-com: not this flow');
  assert.equal(t('cargo', 'de', 'en'), null);
});

test('every language of the shop tables has www\'s dialog texts', () => {
  for (const [brand, { langs }] of Object.entries(handoff.BOOKING_RETRIEVE)) {
    for (const lang of Object.keys(langs)) {
      const texts = BOOKING_CODE_TEXTS[brand][lang];
      assert.ok(texts, `${brand} ${lang}`);
      assert.equal(Object.values(texts).every((v) => typeof v === 'string' && v.trim()), true, `${brand} ${lang}`);
    }
  }
  assert.deepEqual(Object.keys(handoff.BOOKING_RETRIEVE).sort(), ['austrian', 'brussels', 'discover', 'swiss']);
});

test('the dialog: closed until a link to #booking-code is used; www\'s title, labels, button; Close closes it', () => {
  const { document, block, dialog } = page('swiss', 'swiss.turnsthe.page', '/ch/de/login');
  const d = dialog();
  assert.ok(d && block.contains(d));
  assert.equal(isOpen(d), false);
  assert.equal(d.querySelector('h2').textContent, 'Buchungscode');
  assert.deepEqual([...d.querySelectorAll('label')].map((l) => l.textContent), ['Buchungscode', 'Nachname']);
  assert.equal(d.querySelector('button[type="submit"]').textContent, 'Buchung suchen', 'www\'s label (loginForm.bookings.form.submitText, lx de)');
  const ref = d.querySelector('input[name="reference"]');
  assert.equal(ref.maxLength, 13);
  assert.equal(d.querySelector('input[name="lastName"]').maxLength, 31);
  assert.equal(d.querySelector('input[name="lastName"]').autocomplete, 'family-name');
  click(document.querySelector('a[href="#booking-code"]'));
  assert.equal(isOpen(d), true);
  const close = d.querySelector('.booking-lookup-dialog-close');
  assert.equal(close.getAttribute('aria-label'), 'Schließen');
  click(close);
  assert.equal(isOpen(d), false);
});

test('the dialog opens at once on a page reached with #booking-code', () => {
  const { dialog } = page('austrian', 'austrian.turnsthe.page', '/at/en/login', { hash: '#booking-code' });
  assert.equal(isOpen(dialog()), true);
});

test('validation: an empty submit lists both errors with "Go to error", the messages under the fields, nothing sent', async () => {
  const { block, document } = page('swiss', 'swiss.turnsthe.page', '/ch/en/login');
  submit(block, { reference: '', lastName: '' });
  await flush();
  const box = block.querySelector('.booking-lookup-errorbox');
  assert.equal(box.hidden, false);
  assert.equal(box.querySelector('.booking-lookup-errorbox-headline').textContent, '2 errors have occurred. Please resolve the following issue before you continue:');
  const items = [...box.querySelectorAll('li')];
  assert.deepEqual(items.map((li) => li.querySelector('span').textContent), ['Please enter a booking code.', 'Please enter a last name.']);
  assert.deepEqual(items.map((li) => li.querySelector('a').textContent), ['Go to error', 'Go to error']);
  const ref = block.querySelector('input[name="reference"]');
  assert.equal(items[0].querySelector('a').getAttribute('href'), `#${ref.id}`);
  assert.equal(ref.getAttribute('aria-invalid'), 'true');
  assert.equal(document.getElementById(ref.getAttribute('aria-describedby')).textContent, 'Please enter a booking code.');
  assert.ok(focused === box, 'the focus on the error box');
  assert.equal(submitted.length + calls.length, 0);
});

test('validation: a wrong code is the one error (www\'s singular headline); a wrong name its pattern text; fixing it clears it', async () => {
  const { block } = page('swiss', 'swiss.turnsthe.page', '/ch/en/login');
  submit(block, { reference: '12', lastName: 'Test' });
  const box = block.querySelector('.booking-lookup-errorbox');
  assert.equal(box.querySelector('.booking-lookup-errorbox-headline').textContent, 'An error has occured. Please resolve the following issue before you continue:');
  assert.deepEqual([...box.querySelectorAll('li span')].map((s) => s.textContent), ['Please enter a valid booking code.']);
  submit(block, { reference: '1234567890123', lastName: 'Test<>' });
  assert.deepEqual([...box.querySelectorAll('li span')].map((s) => s.textContent), ['Please enter a valid last name.'], 'a 13-digit ticket number is a valid code');
  const name = block.querySelector('input[name="lastName"]');
  name.value = 'Müller-Lüdenscheidt';
  name.dispatchEvent(new window.Event('input'));
  assert.equal(name.hasAttribute('aria-invalid'), false);
  await flush();
  assert.equal(submitted.length, 0);
});

test('Brussels\' shorter texts; Austrian\'s German page (/at/de/anmeldung)', () => {
  const { block } = page('brussels', 'brussels.turnsthe.page', '/be/en/profile/login');
  submit(block, { reference: '', lastName: '' });
  assert.deepEqual([...block.querySelectorAll('.booking-lookup-errorbox li span')].map((s) => s.textContent), ['Enter a booking code.', 'Enter a surname.']);
  const at = page('austrian', 'austrian.turnsthe.page', '/at/de/anmeldung');
  assert.equal(at.dialog().querySelector('h2').textContent, BOOKING_CODE_TEXTS.austrian.de.title);
  assert.equal(at.dialog().querySelector('button[type="submit"]').textContent, BOOKING_CODE_TEXTS.austrian.de['submit label']);
});

test('a valid code on the replica: www\'s shop form in the same window, nothing sent to any API (SWISS ch/en)', async () => {
  const { block } = page('swiss', 'swiss.turnsthe.page', '/ch/en/login');
  submit(block, { reference: 'ABC123', lastName: 'Test' });
  await flush();
  assert.deepEqual(calls, []);
  // www.swiss.com's form for ABC123 / Test (the capture: action, method, target, fields in order)
  assert.deepEqual(submitted, [{
    action: 'https://shop.swiss.com/booking/manage-booking/retrieve?lang=en-GB&portalCountry=CH', method: 'POST', target: '_self', fields: [['lang', 'en-GB'], ['portalCountry', 'CH'], ['lastName', 'Test'], ['recLoc', 'ABC123']],
  }]);
});

test('the market of the page: an Austrian market root (al/en), a Discover one (us/en), a Brussels version (de/de)', async () => {
  const cases = [
    ['austrian', 'austrian.turnsthe.page', '/al/en/login', 'https://shop.austrian.com/booking/manage-booking/retrieve?lang=en-GB&portalCountry=AL'],
    ['discover', 'discover.turnsthe.page', '/us/en/profile/login', 'https://shop.lufthansa.com/booking/manage-booking/retrieve?lang=en-GB&portalCountry=US'],
    ['brussels', 'brussels.turnsthe.page', '/de/de/profile/login', 'https://shop.brusselsairlines.com/booking/manage-booking/retrieve?lang=de-DE&portalCountry=DE'],
  ];
  for (const [brand, host, path, action] of cases) {
    submitted = [];
    const { block } = page(brand, host, path);
    submit(block, { reference: 'ABC123', lastName: 'Test' });
    await flush();
    assert.equal(submitted.length, 1, path);
    assert.equal(submitted[0].action, action, path);
  }
});

test('on the airline\'s own www host: www\'s two calls, its target with the query repeated as fields (SWISS)', async () => {
  const { block } = page('swiss', 'www.swiss.com', '/ch/en/login');
  submit(block, { reference: 'ABC123', lastName: 'Test' });
  await flush();
  assert.deepEqual(calls.map((c) => [c.method, c.href]), [
    ['POST', '/service/secured/api/core/filekeylogin'],
    ['GET', '/service/secured/api/core/booking/bookingdetailslink?layout=L'],
  ]);
  assert.deepEqual(calls[0].body, { filekey: 'ABC123', lastname: 'Test' });
  assert.equal(calls[0].headers['X-Portal'], 'LX');
  assert.deepEqual(submitted, [{
    action: SWISS_LINK.linkTarget.targetURL, method: 'POST', target: '_self', fields: [['lang', 'en-GB'], ['portalCountry', 'CH'], ['lastName', 'Test'], ['recLoc', 'ABC123']],
  }]);
});

test('Discover\'s own host: filekeylogin as FOUR_Y, bookingdetailslink as LH (www\'s headers)', async () => {
  const { block } = page('discover', 'www.discover-airlines.com', '/de/en/profile/login');
  submit(block, { reference: 'ABC123', lastName: 'Test' });
  await flush();
  assert.deepEqual(calls.map((c) => c.headers['X-Portal']), ['FOUR_Y', 'LH']);
});

test('ITA and a site without a shop table: the block renders nothing, the links stay', () => {
  const { block, document, dialog } = page('ita', 'ita.turnsthe.page', '/it/en/profile/login');
  assert.equal(dialog(), null);
  assert.equal(block.hidden, true);
  assert.ok(document.querySelector('a[href="#booking-code"]'));
});
