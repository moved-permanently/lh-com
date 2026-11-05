/* eslint-disable max-len, import/extensions */
/* click-to-call (tools/reports/tap/parity.md row 66; brief 380 from the BySide capture
   tap-byside-001): TAP's call-back card as www.flytap.com draws it (BySide's window, e.g. pt-pt
   2023-flight-extra): a light green card with the title, the text, the telephone with its country
   code, the day and the half-hour slot, the button, the schedule line, the wide picture at the
   right (the phone one on top on phones), the small print under the card; and BySide's floating
   button at the bottom right, which scrolls to the card. The button reads "Liguem-me" in the
   opening hours (Lisbon time) and "Agendar Contacto" outside them, as www; it opens the same page
   on www in a new tab and sends nothing typed here (forms stay on TAP's site).
   (Booleans and strings only in the asserts: a failing assert on a linkedom node prints the whole
   document.)
   Run: timeout 60 node --max-old-space-size=256 --test --test-timeout=20000 test/tap-click-to-call.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

// pt-pt's 2023-flight-extra card from the capture (click-to-call.json), the pictures local copies
const ROWS = [
  ['Title', 'Dê um boost à sua viagem'],
  ['Text', '<p>Já tem reserva, mas quer mais conforto e experiência extra? Indique-nos o seu número de telefone e entraremos em <strong>contacto consigo gratuitamente</strong>.</p>'],
  ['Schedule', '<p><strong>Horário:</strong> Seg a Sex – 9:00 às 24:00 (GMT Lisboa)</p>'],
  ['Hours', 'Mon-Fri 09:00-24:00'],
  ['Button', 'Liguem-me'],
  ['Button outside hours', 'Agendar Contacto'],
  ['Phone', 'Telemóvel'],
  ['Days', 'Hoje, Amanhã'],
  ['Slots', '08:00-23:30'],
  ['Small print', '<p>Este formulário de contacto é de uso exclusivo para a venda de extras para o voo. Para outros assuntos, por favor, <a href="https://www.flytap.com/pt-pt/ajuda#contactos">contacte-nos através dos canais de atendimento da TAP</a>. A TAP respeita a sua privacidade. Para saber mais, consulte: <a href="https://www.flytap.com/privacy">Política de Privacidade</a>.</p>'],
  ['Image', '<picture><img src="/pt-pt/gerir-reserva/media_wide.png" alt="Operador" width="533" height="584"></picture>'],
  ['Mobile image', '<picture><img src="/pt-pt/gerir-reserva/media_phone.png" alt="Operador" width="343" height="191"></picture>'],
  ['Floating button', '<p>Quero mais conforto!</p><p>Ligamos grátis</p>'],
  ['Link', '<a href="https://www.flytap.com/pt-pt/gerir-reserva/extras">https://www.flytap.com/pt-pt/gerir-reserva/extras</a>'],
];
const page = (rows) => `<!DOCTYPE html><html lang="pt"><head><meta name="brand" content="tap"></head><body><main><div class="section"><div class="click-to-call-wrapper"><div class="click-to-call block">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div></div></div></main></body></html>`;
const { window, document } = parseHTML(page(ROWS));
globalThis.window = window;
globalThis.document = document;
const opened = [];
window.open = (...a) => { opened.push(a); return null; };
const mod = await import('../blocks/click-to-call/click-to-call.js');
const { default: decorate } = mod;

const text = (el) => String((el && el.textContent) || '').trim();
const block = document.querySelector('.click-to-call');
await decorate(block);
const card = block.querySelector('.click-to-call-card');

test('the card as www\'s: the phone picture, the title and text, the form, the schedule line, the wide picture; the small print under the card', () => {
  assert.equal(Boolean(card), true, 'the card');
  const parts = [...card.children].map((c) => c.className);
  assert.deepEqual(parts, ['click-to-call-media-mobile', 'click-to-call-content', 'click-to-call-media']);
  assert.equal(String(card.querySelector('.click-to-call-media-mobile img').getAttribute('src')), '/pt-pt/gerir-reserva/media_phone.png');
  assert.equal(String(card.querySelector('.click-to-call-media img').getAttribute('src')), '/pt-pt/gerir-reserva/media_wide.png');
  assert.equal(text(card.querySelector('h3.click-to-call-title')), 'Dê um boost à sua viagem');
  assert.equal(text(card.querySelector('.click-to-call-text strong')), 'contacto consigo gratuitamente');
  assert.equal(text(card.querySelector('.click-to-call-schedule strong')), 'Horário:');
  assert.equal(text(card.querySelector('.click-to-call-schedule')), 'Horário: Seg a Sex – 9:00 às 24:00 (GMT Lisboa)');
  const small = block.querySelector(':scope > .click-to-call-small');
  assert.equal(Boolean(small) && small.previousElementSibling === card, true, 'the small print right under the card');
  assert.deepEqual([...small.querySelectorAll('a')].map((a) => a.getAttribute('href')), ['https://www.flytap.com/pt-pt/ajuda#contactos', 'https://www.flytap.com/privacy']);
});

test('the fields as www shows them: the country code (+351 first, BySide\'s 37), the telephone, the day and the half-hour slot, each named', () => {
  const form = card.querySelector('form.click-to-call-form');
  const codes = [...form.querySelectorAll('select.click-to-call-code option')].map(text);
  assert.equal(codes[0], '(+351)');
  assert.equal(codes.length, 37);
  const tel = form.querySelector('input[type="tel"]');
  assert.equal(String(tel.getAttribute('placeholder')), 'Telemóvel');
  assert.equal(String(tel.getAttribute('aria-label')), 'Telemóvel');
  assert.deepEqual([...form.querySelectorAll('select.click-to-call-day option')].map(text), ['Hoje', 'Amanhã']);
  const slots = [...form.querySelectorAll('select.click-to-call-time option')].map(text);
  assert.equal(slots.length, 32);
  assert.deepEqual([slots[0], slots[1], slots.at(-1)], ['08:00', '08:30', '23:30']);
  ['select.click-to-call-code', 'select.click-to-call-day', 'select.click-to-call-time'].forEach((s) => assert.equal(Boolean(form.querySelector(s).getAttribute('aria-label')), true, s));
});

test('the button: "Liguem-me" in the opening hours (Lisbon time), "Agendar Contacto" outside them', () => {
  const hours = mod.parseHours('Mon-Fri 09:00-24:00');
  // 2026-11-04 is a Wednesday; Lisbon is UTC in November, UTC+1 in July
  assert.equal(mod.inOpeningHours(new Date('2026-11-04T10:00:00Z'), hours), true);
  assert.equal(mod.inOpeningHours(new Date('2026-11-04T08:59:00Z'), hours), false);
  assert.equal(mod.inOpeningHours(new Date('2026-11-04T23:59:00Z'), hours), true);
  assert.equal(mod.inOpeningHours(new Date('2026-11-07T12:00:00Z'), hours), false, 'Saturday');
  assert.equal(mod.inOpeningHours(new Date('2026-07-01T08:30:00Z'), hours), true, '09:30 in Lisbon (WEST)');
  const label = text(card.querySelector('button[type="submit"]'));
  assert.equal(label, mod.inOpeningHours(new Date(), hours) ? 'Liguem-me' : 'Agendar Contacto');
});

test('the button opens www\'s page in a new tab; nothing typed is sent', () => {
  const form = card.querySelector('form');
  form.querySelector('input[type="tel"]').value = '912345678';
  const e = new window.Event('submit', { cancelable: true });
  form.dispatchEvent(e);
  assert.equal(e.defaultPrevented, true);
  assert.equal(JSON.stringify(opened), JSON.stringify([['https://www.flytap.com/pt-pt/gerir-reserva/extras', '_blank', 'noopener']]));
  assert.equal(JSON.stringify(opened).includes('912345678'), false);
});

test('the floating button as BySide\'s: its two lines, it scrolls to the card', () => {
  const float = block.querySelector('button.click-to-call-float');
  assert.equal(Boolean(float), true);
  assert.equal(text(float.querySelector('.click-to-call-float-text')), 'Quero mais conforto!');
  assert.equal(text(float.querySelector('.click-to-call-float-sub')), 'Ligamos grátis');
  let scrolled = false;
  card.scrollIntoView = () => { scrolled = true; };
  float.dispatchEvent(new window.Event('click'));
  assert.equal(scrolled, true);
});

test('defaults: no floating button, picture or hours row as www\'s without them (Mon-Fri 09:00-24:00, 08:00-23:30)', async () => {
  const { document: doc } = parseHTML(page(ROWS.filter(([k]) => !['Floating button', 'Image', 'Mobile image', 'Hours', 'Slots'].includes(k))));
  const was = globalThis.document;
  globalThis.document = doc;
  const b = doc.querySelector('.click-to-call');
  await decorate(b);
  globalThis.document = was;
  assert.equal(Boolean(b.querySelector('.click-to-call-float')), false);
  assert.equal(Boolean(b.querySelector('img')), false);
  assert.equal(b.querySelectorAll('select.click-to-call-time option').length, 32);
  assert.equal(JSON.stringify(mod.parseHours('')), JSON.stringify(mod.parseHours('Mon-Fri 09:00-24:00')));
});

test('the look, scoped to the block: BySide\'s card (#f0faf2, 32 px corners, 16 on phones), the title 28 px (24 on phones), the outline button, the dark floating pill', () => {
  const css = fs.readFileSync(new URL('../blocks/click-to-call/click-to-call.css', import.meta.url), 'utf8');
  assert.match(css, /\.click-to-call \.click-to-call-card \{[^}]*border-radius: 16px;[^}]*background-color: #f0faf2;/);
  assert.match(css, /@media \(width > 600px\) \{[^@]*\.click-to-call \.click-to-call-card \{[^}]*border-radius: 32px;/);
  assert.match(css, /\.click-to-call \.click-to-call-title \{[^}]*font-family: var\(--heading-font-family\);[^}]*font-size: 24px;[^}]*font-weight: 700;/);
  assert.match(css, /\.click-to-call \.click-to-call-submit \{[^}]*border: 1px solid #65c922;[^}]*border-radius: 20px;[^}]*color: #2c7839;/);
  assert.match(css, /\.click-to-call \.click-to-call-float \{[^}]*position: fixed;[^}]*right: 10px;[^}]*bottom: 9px;/);
  css.replace(/\/\*[\s\S]*?\*\//g, '').split('}').map((r) => r.split('{')[0].trim()).filter((sel) => sel && !sel.startsWith('@'))
    .forEach((sel) => sel.split(/,(?![^(]*\))/).forEach((one) => assert.equal(one.trim().startsWith('.click-to-call'), true, one)));
});
