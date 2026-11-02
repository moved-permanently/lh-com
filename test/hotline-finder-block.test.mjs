/* The hotline-finder block (blocks/hotline-finder): a country select and the hotline of the
   picked country from a sheet (lh-b2b's /data/hotlines.json, recorded from www's contact catalog
   by tools/importer/b2b-hotlines.mjs); the root's country by default (none on xx), the names in
   the page's language, the texts from the block's rows. The B2B importer's withHotlineFinder: the
   contact pages' phone box as the block.
   Run: node --max-old-space-size=512 --test test/hotline-finder-block.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body><main></main></body></html>');
globalThis.window = window;
globalThis.document = document;
const at = (p, host = 'b2b.turnsthe.page') => {
  window.location = {
    hostname: host, pathname: p, search: '', href: `https://${host}${p}`, origin: `https://${host}`,
  };
};
at('/at/en/about-us/contact');
const SHEET = {
  total: 3,
  data: [
    {
      country: 'AT', 'name-en': 'Austria', 'name-de': 'Österreich', phone: '+43 0720 380 065', phone2: '', email: 'dach.ppb@dlh.de', link: '', hours: 'MO 08:00-18:00; FR 08:00-16:00', 'note-en': '', 'note-de': '',
    },
    {
      country: 'DE', 'name-en': 'Germany', 'name-de': 'Deutschland', phone: '+49 69 86 799 500', phone2: '', email: 'dach.ppb@dlh.de', link: '', hours: 'MO 08:00-18:00', 'note-en': 'Free of charge', 'note-de': 'Kostenfrei',
    },
    {
      country: 'GB', 'name-en': 'United Kingdom', 'name-de': 'Vereinigtes Königreich', phone: '', phone2: '', email: 'uk.ppb@dlh.de', link: '', hours: '', 'note-en': '', 'note-de': '',
    },
  ],
};
const calls = [];
globalThis.fetch = async (url) => {
  calls.push(String(url));
  return String(url).startsWith('/data/hotlines.json') ? new Response(JSON.stringify(SHEET), { headers: { 'content-type': 'application/json' } }) : new Response('', { status: 404 });
};
const { default: decorate, parseHours } = await import('../blocks/hotline-finder/hotline-finder.js');

const ROWS = {
  en: [['Sheet', '<a href="/data/hotlines.json">/data/hotlines.json</a>'], ['Headline', 'Contacts for PartnerPlusBenefit'], ['Select', 'Please choose your country or region'], ['Contact', 'Contact Details'], ['Hours', 'Opening hours'], ['Days', 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday']],
  de: [['Sheet', '/data/hotlines.json'], ['Headline', 'Kontaktinformationen für PartnerPlusBenefit'], ['Select', 'Bitte wählen Sie Ihr Land oder Ihre Region'], ['Contact', 'Kontaktdaten'], ['Hours', 'Öffnungszeiten'], ['Days', 'Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag']],
};
const blockOf = (lang) => {
  const div = document.createElement('div');
  div.className = 'hotline-finder block';
  div.innerHTML = ROWS[lang].map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.querySelector('main').append(div);
  return div;
};
// a pick: the option selected (linkedom's select.value has no setter), then the change event
const pick = (select, value) => {
  select.querySelectorAll('option').forEach((o) => (o.value === value ? o.setAttribute('selected', '') : o.removeAttribute('selected')));
  select.dispatchEvent(new window.Event('change'));
};
const options = (block) => [...block.querySelectorAll('select option')].map((o) => [o.value, o.textContent]);

test('opening hours: weekday ids to the page\'s day names, in week order', () => {
  assert.deepEqual(parseHours('FR 08:00-16:00; MO 08:00-18:00', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']), [['Mon', '08:00 - 18:00'], ['Fri', '08:00 - 16:00']]);
  assert.deepEqual(parseHours('', []), []);
});

test('a market root (at/en): the select with every country of the sheet, Austria picked, its hotline', async () => {
  at('/at/en/about-us/contact');
  const block = blockOf('en');
  await decorate(block);
  assert.equal(block.querySelector('h3')?.textContent, 'Contacts for PartnerPlusBenefit');
  const label = block.querySelector('label');
  assert.equal(label?.textContent, 'Please choose your country or region');
  const select = block.querySelector('select');
  assert.ok(Boolean(select) && label.getAttribute('for') === select.id, 'the label names the select');
  assert.deepEqual(options(block), [['', 'Please choose your country or region'], ['AT', 'Austria'], ['DE', 'Germany'], ['GB', 'United Kingdom']]);
  assert.equal(select.value || '', 'AT');
  const tel = block.querySelector('a[href^="tel:"]');
  assert.equal(tel?.getAttribute('href'), 'tel:+430720380065');
  assert.equal(tel.textContent, '+43 0720 380 065');
  assert.equal(block.querySelector('a[href^="mailto:"]')?.getAttribute('href'), 'mailto:dach.ppb@dlh.de');
  assert.deepEqual([...block.querySelectorAll('table tr')].map((tr) => [tr.querySelector('th')?.textContent, tr.querySelector('td')?.textContent]), [['Monday', '08:00 - 18:00'], ['Friday', '08:00 - 16:00']]);
  assert.ok([...block.querySelectorAll('h4')].map((h) => h.textContent).join('|') === 'Contact Details|Opening hours');
  assert.ok(block.querySelector('[aria-live="polite"]') !== null, 'the contact is announced');
  assert.ok(calls.some((c) => c.startsWith('/data/hotlines.json')));
});

test('another country picked: its hotline replaces the first; a country with an e-mail only shows that, no hours', async () => {
  at('/at/en/about-us/contact');
  const block = blockOf('en');
  await decorate(block);
  const select = block.querySelector('select');
  pick(select, 'DE');
  assert.equal(block.querySelector('a[href^="tel:"]')?.textContent, '+49 69 86 799 500');
  assert.ok(block.textContent.includes('Free of charge'));
  pick(select, 'GB');
  assert.ok(block.querySelector('a[href^="tel:"]') === null, 'no phone');
  assert.equal(block.querySelector('a[href^="mailto:"]')?.textContent, 'uk.ppb@dlh.de');
  assert.ok(block.querySelector('table') === null, 'no hours');
  pick(select, '');
  assert.equal(block.querySelector('.hotline-finder-contact')?.children.length, 0, 'none picked: no contact');
});

test('the rest of the world (xx/de): German names and texts, no country picked, no contact until one is', async () => {
  at('/xx/de/about-us/contact');
  const block = blockOf('de');
  await decorate(block);
  assert.deepEqual(options(block).slice(0, 2), [['', 'Bitte wählen Sie Ihr Land oder Ihre Region'], ['AT', 'Österreich']]);
  assert.equal(block.querySelector('select').value || '', '');
  assert.equal(block.querySelector('.hotline-finder-contact')?.children.length, 0);
  const select = block.querySelector('select');
  pick(select, 'DE');
  assert.ok(block.textContent.includes('Kostenfrei'));
  assert.equal(block.querySelector('table th')?.textContent, 'Montag');
});

test('the box\'s image: beside the finder, the rest in the body', async () => {
  at('/de/en/about-us/contact');
  const block = blockOf('en');
  const row = document.createElement('div');
  row.innerHTML = '<div>Image</div><div><picture><img src="https://content.da.live/x/y.png" alt=""></picture></div>';
  block.append(row);
  await decorate(block);
  assert.deepEqual([...block.children].map((c) => c.className), ['hotline-finder-body', 'hotline-finder-media']);
  assert.ok(block.querySelector('.hotline-finder-media picture img') !== null);
  assert.ok(block.querySelector('.hotline-finder-body select') !== null);
  assert.equal(block.querySelector('select').value || '', 'DE');
});

test('no sheet (it answers 404): the headline stays, no select', async () => {
  at('/de/en/about-us/contact');
  const block = blockOf('en');
  block.querySelector(':scope > div').lastElementChild.textContent = '/data/none.json';
  await decorate(block);
  assert.equal(block.querySelector('h3')?.textContent, 'Contacts for PartnerPlusBenefit');
  assert.ok(block.querySelector('select') === null);
});

test('hotline-finder.css: scoped to .hotline-finder', () => {
  const css = fs.readFileSync(new URL('../blocks/hotline-finder/hotline-finder.css', import.meta.url), 'utf8');
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').match(/[^{}]+(?=\{)/g).map((s) => s.trim()).filter((s) => s && !s.startsWith('@'));
  rules.forEach((s) => s.split(',').forEach((sel) => assert.ok(sel.trim().startsWith('.hotline-finder'), sel)));
});
