/* eslint-disable max-len, import/extensions */
/* TAP's help contacts (brief 352; tools/reports/tap/parity.md rows 40, 54):
   - tools/tap-data/contacts-sheet.mjs: the root's contacts sheet from www's answer to
     retrieve-contacts (the capture's www.flytap.com/api/aem/retrieve-contacts/<lang>.json) as www's
     finder shows it (the page's chunk [[...slug]]: ContactsByCountry): the cities without "NA",
     the default city (the country's defaultCity, else the first), for each city first the "NA"
     place's locations whose title the city has not, then the city's own, contact-center first,
     only locations with a telephone, an e-mail or an address; the telephones with "+" as www shows
     them, WhatsApp apart; the labels from the capture's flat rows (contacts-<root>.json);
   - hotline-finder on brand tap: the default city from the sheet, one label per kind (all its
     telephones under it), the company with the address, the schedule in a column of its own.
   Boolean asserts around linkedom nodes. Run: node --max-old-space-size=512 --test test/tap-352.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="tap"></head><body><main></main></body></html>');
globalThis.window = window;
globalThis.document = document;

const tool = await import('../tools/tap-data/contacts-sheet.mjs');
const finder = await import('../blocks/hotline-finder/hotline-finder-tap.js');

const ANSWER = {
  total: 6,
  countries: [
    {
      countryCode: 'PT',
      countryName: 'Portugal',
      defaultCity: 'Porto',
      cities: [
        {
          cityName: 'Lisbon',
          locations: [
            { title: 'balcao-de-servico-ao-cliente', contactAddress: '<p>Lisbon Airport</p>', contactSchedule: '<p>Every day: 8:30 am to 5 pm</p>' },
            { title: 'lost-and-found', phones: [{ phoneNumber: '351 211 234 406', descriptionContactPhone: '<div><p>Call to national&nbsp;landline.</p></div>' }] },
            { title: 'contact-center', phones: [{ phoneNumber: '+351 211 234 400' }] },
            { title: 'apoio-ao-cliente', contactSchedule: 'only a schedule: not shown' },
          ],
        },
        {
          cityName: 'NA',
          locations: [
            { title: 'atendimento-tap-milesgo', description: 'Please enter your TAP Miles&amp;Go number.', phones: [{ phoneNumber: '351 211 234 408', dataReference: [{ phoneNumber: '+351 211 234 407', tier: 'gold' }] }, { phoneNumber: 'WhatsApp: +351 962 006 161', isWhatsapp: true }] },
            { title: 'contact-center', phones: [{ phoneNumber: '+351 999 999 999' }], contactSchedule: 'From Monday to Sunday: 24h' },
          ],
        },
        {
          cityName: 'Porto',
          locations: [
            {
              title: 'balcao-de-vendas', phones: [{ phoneNumber: 'Fax: +351 22 000 00 00' }, { phoneNumber: '+351 22 111 11 11' }], emails: [{ email: 'porto@tap.pt' }], companyAddress: '<p>TAP Porto</p>', contactAddress: 'Rua X, Porto',
            },
          ],
        },
      ],
    },
    {
      countryCode: 'AD',
      countryName: 'Andorra',
      defaultCity: 'NA',
      cities: [{ cityName: 'NA', locations: [{ title: 'contact-center', phones: [{ phoneNumber: '+351 211 234 400' }] }] }],
    },
  ],
};
const FLAT = [
  {
    groupKey: 'contact-center', group: 'Contact Center', kind: 'phone', label: 'Telephone',
  },
  {
    groupKey: 'lost-and-found', group: 'Lost & Found', kind: 'email', label: 'Email',
  },
  {
    groupKey: 'balcao-de-servico-ao-cliente', group: 'Customer Service Desk', kind: 'address', label: 'Address',
  },
  {
    groupKey: 'balcao-de-vendas', group: 'Ticket Desk', kind: 'schedule', label: 'Schedule',
  },
  {
    groupKey: 'atendimento-tap-milesgo', group: 'TAP Miles&Go Customer Service', kind: 'description', label: null,
  },
];

test('text of www\'s HTML; telephones as www shows them', () => {
  assert.equal(tool.textOf('<div><p>Call to national&nbsp;landline.</p></div>'), 'Call to national landline.');
  assert.equal(tool.textOf('Miles&amp;Go <b>now</b>'), 'Miles&Go now');
  assert.equal(tool.phoneText('351 211 234 406'), '+351 211 234 406');
  assert.equal(tool.phoneText('Fax: +213 216'), 'Fax: +213 216');
  assert.equal(tool.phoneText('WhatsApp: +351 962'), '+351 962');
  assert.equal(tool.phoneText('41 3039 44', true), '41 3039 44', 'WhatsApp\'s as it is, no "+"');
  assert.equal(tool.textOf('Store A<br>\nStreet 1<br>\n<br>\nStore B'), 'Store A\nStreet 1\nStore B', 'www\'s lines kept');
});

test('the labels from the flat rows: groups by key, the fields by kind', () => {
  const labels = tool.labelsOf(FLAT);
  assert.equal(labels.groups['contact-center'], 'Contact Center');
  assert.equal(labels.fields.email, 'Email');
  assert.equal(labels.fields.schedule, 'Schedule');
});

test('www\'s places: the cities without NA, the default city; a country of NA alone one unnamed place', () => {
  const [pt, ad] = ANSWER.countries;
  assert.deepEqual(tool.placesOf(pt), { cities: ['Lisbon', 'Porto'], defaultCity: 'Porto' });
  assert.deepEqual(tool.placesOf(ad), { cities: ['NA'], defaultCity: 'NA' });
  assert.deepEqual(tool.placesOf({ ...pt, defaultCity: 'Faro' }).defaultCity, 'Lisbon', 'an unknown default: the first city');
});

test('www\'s locations for a city: NA\'s first without the city\'s titles, then the city\'s, contact-center first, only with a telephone, e-mail or address', () => {
  const [pt, ad] = ANSWER.countries;
  assert.deepEqual(tool.locationsFor(pt, 'Lisbon').map((l) => l.title), ['atendimento-tap-milesgo', 'contact-center', 'balcao-de-servico-ao-cliente', 'lost-and-found']);
  assert.equal(tool.locationsFor(pt, 'Lisbon').find((l) => l.title === 'contact-center').phones[0].phoneNumber, '+351 211 234 400', 'the city\'s contact center, not NA\'s');
  assert.deepEqual(tool.locationsFor(pt, 'Porto').map((l) => l.title), ['atendimento-tap-milesgo', 'contact-center', 'balcao-de-vendas']);
  assert.deepEqual(tool.locationsFor(ad, 'NA').map((l) => l.title), ['contact-center']);
});

test('the sheet\'s rows: www\'s order, the default city marked, the kinds and labels, the city empty for NA alone', () => {
  const rows = tool.rowsOf(ANSWER, tool.labelsOf(FLAT));
  assert.deepEqual(Object.keys(rows[0]), tool.COLUMNS);
  const lisbon = rows.filter((r) => r.country === 'PT' && r.city === 'Lisbon');
  assert.deepEqual(lisbon.map((r) => [r.group, r.kind, r.value]), [
    ['TAP Miles&Go Customer Service', 'text', 'Please enter your TAP Miles&Go number.'],
    ['TAP Miles&Go Customer Service', 'phone', '+351 211 234 408'],
    ['TAP Miles&Go Customer Service', 'whatsapp', '+351 962 006 161'],
    ['Contact Center', 'phone', '+351 211 234 400'],
    ['Customer Service Desk', 'address', 'Lisbon Airport'],
    ['Customer Service Desk', 'schedule', 'Every day: 8:30 am to 5 pm'],
    ['Lost & Found', 'phone', '+351 211 234 406'],
  ]);
  assert.equal(lisbon.find((r) => r.group === 'Lost & Found').note, 'Call to national landline.');
  assert.equal(lisbon.every((r) => r.default === 'false'), true);
  const porto = rows.filter((r) => r.city === 'Porto');
  assert.equal(porto.every((r) => r.default === 'true'), true);
  assert.deepEqual(porto.filter((r) => r.group === 'Ticket Desk').map((r) => [r.kind, r.label, r.value]), [
    ['phone', 'Telephone', 'Fax: +351 22 000 00 00'], ['phone', 'Telephone', '+351 22 111 11 11'], ['company', 'Address', 'TAP Porto'], ['address', 'Address', 'Rua X, Porto'], ['email', 'Email', 'porto@tap.pt'],
  ]);
  const andorra = rows.filter((r) => r.country === 'AD');
  assert.deepEqual(andorra.map((r) => [r.name, r.city, r.default, r.group]), [['Andorra', '', 'true', 'Contact Center']]);
});

/* ---------------------------------------------------------------- the block reads it ------ */

const pick = (select, value) => {
  select.querySelectorAll('option').forEach((o) => (o.value === value ? o.setAttribute('selected', '') : o.removeAttribute('selected')));
  select.dispatchEvent(new window.Event('change'));
};

test('the finder: the sheet\'s default city first, one label per kind, the company with the address, the schedule apart', async () => {
  const sheet = tool.sheetOf(tool.rowsOf(ANSWER, tool.labelsOf(FLAT)));
  const block = document.createElement('div');
  block.innerHTML = '<div><div>Sheet</div><div>/en-pt/help/contacts.json</div></div>';
  document.querySelector('main').append(block);
  await finder.default(block, { lang: 'en', country: 'PT', fetcher: async () => new Response(JSON.stringify(sheet)) });
  const [country, city] = [...block.querySelectorAll('select')];
  assert.equal(country.value, 'PT');
  assert.equal(city.value, 'Porto', 'www\'s default city');
  assert.deepEqual([...city.querySelectorAll('option')].map((o) => o.value), ['Lisbon', 'Porto'], 'www\'s order of the cities');
  const desk = [...block.querySelectorAll('.hotline-finder-group')].find((g) => g.querySelector('h3').textContent === 'Ticket Desk');
  assert.equal(Boolean(desk), true);
  const phone = desk.querySelector('.hotline-finder-phone');
  assert.equal(phone.querySelectorAll('.hotline-finder-label').length, 1, 'one label for both numbers');
  assert.equal(phone.querySelectorAll('.hotline-finder-value').length, 2);
  const address = desk.querySelector('.hotline-finder-address');
  assert.deepEqual([...address.querySelectorAll('.hotline-finder-value')].map((v) => v.textContent), ['TAP Porto', 'Rua X, Porto']);
  assert.equal(desk.querySelector('.hotline-finder-main .hotline-finder-email') !== null, true);
  pick(city, 'Lisbon');
  const center = [...block.querySelectorAll('.hotline-finder-group')].find((g) => g.querySelector('h3').textContent === 'Customer Service Desk');
  assert.equal(center.querySelector('.hotline-finder-side .hotline-finder-schedule') !== null, true, 'the schedule in its own column');
  const miles = block.querySelector('.hotline-finder-group');
  assert.equal(miles.querySelector('.hotline-finder-text').textContent, 'Please enter your TAP Miles&Go number.');
  assert.equal(miles.querySelector('.hotline-finder-whatsapp a').getAttribute('href'), 'https://wa.me/351962006161');
  pick(country, 'AD');
  assert.equal(city.closest('.hotline-finder-field').hidden, true);
  block.remove();
});

test('the finder\'s look: the schedule\'s column from 1024 px, www\'s lines kept, under body.brand-tap', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  assert.match(css, /@media \(width >= 1024px\) \{[^@]*body\.brand-tap \.hotline-finder-tap \.hotline-finder-entries \{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(css, /body\.brand-tap \.hotline-finder-tap :is\(\.hotline-finder-text, \.hotline-finder-value, \.hotline-finder-note\) \{\s*white-space: pre-line;/);
  // as www at 390 and 1440 (brief 352): the picture 358 x 420 on phones, the pills 52 px 24 apart,
  // 16 px from a label to its values, the schedule as small as the notes (13 / 19.5, 12 / 18 from
  // 1024 px), the picture and the finder 44 px apart
  assert.match(css, /\.hotline-finder-media img \{[^}]*aspect-ratio: 358 \/ 420;/);
  assert.match(css, /\.hotline-finder-field select \{[^}]*min-height: 52px;/);
  assert.match(css, /\.hotline-finder-fields \{[^}]*gap: 24px;/);
  assert.match(css, /\.hotline-finder-value \{\s*margin: 16px 0 0;/);
  assert.match(css, /:is\(\.hotline-finder-note, \.hotline-finder-schedule \.hotline-finder-value\) \{[^}]*font-size: 13px;[^}]*line-height: 19\.5px;/);
  assert.match(css, /@media \(width >= 1024px\) \{[^@]*body\.brand-tap \.hotline-finder-tap \{\s*grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\);\s*gap: 44px;[^@]*\.hotline-finder-media img \{\s*aspect-ratio: 538 \/ 275;[^@]*:is\(\.hotline-finder-note, \.hotline-finder-schedule \.hotline-finder-value\) \{\s*font-size: 12px;\s*line-height: 18px;/);
});

/* ----------------------------------------------- footer, stopover, booking box, cards ------ */

test('brief 352 (ema-lufthansa\'s 336): the footer\'s Star Alliance logo as www\'s, 140 x 20 (TAP only)', async () => {
  const fs = await import('node:fs');
  const svg = fs.readFileSync(new URL('../icons/tap-star-alliance.svg', import.meta.url), 'utf8');
  assert.equal(svg.startsWith('<svg width="140" height="20" viewBox="0 0 140 20"'), true);
  assert.equal(/<script|on\w+=|href=/i.test(svg), false, 'plain paths');
  const { default: layoutTapFooter } = await import('../blocks/footer/footer-tap.js');
  window.hlx = { ...(window.hlx || {}), codeBasePath: '' };
  const block = document.createElement('div');
  block.innerHTML = '<div class="footer-inner"><div class="footer-note">© 2026, TAP.</div></div>'
    + '<ul class="footer-logos"><li><a href="/pt-pt"><img src="/icons/tap.svg" alt="TAP"></a></li>'
    + '<li><a class="footer-logo-star-alliance" href="https://www.staralliance.com/"><img src="/icons/star-alliance.svg" alt="star alliance"></a></li></ul>';
  layoutTapFooter(block);
  const img = block.querySelector('.footer-tap-partner img');
  assert.equal(img.getAttribute('src'), '/icons/tap-star-alliance.svg');
  assert.equal(img.getAttribute('alt'), 'star alliance');
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-tap \.footer \.footer-tap-partner img \{\s*display: block;\s*width: 140px;\s*height: 20px;/);
});

test('brief 352 (ema-lufthansa\'s 336): the stopover\'s centred button and info card as www\'s, TAP only', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-tap main > \.section:has\(\+ \.section\.centred-button\) \{\s*margin-bottom: 32px;/);
  assert.match(css, /body\.brand-tap main > \.section\.centred-button \.default-content-wrapper \{\s*text-align: center;/);
  assert.match(css, /body\.brand-tap main > \.section\.centred-button a\.button:any-link \{[^}]*background-color: #9efd38;[^}]*font-size: 16px;\s*font-weight: 500;/);
  assert.match(css, /body\.brand-tap main > \.section\.info-card > \.default-content-wrapper \{[^}]*width: fit-content;[^}]*max-width: min\(790px, calc\(100% - 2 \* var\(--layout-margin\)\)\);[^}]*padding: 24px;[^}]*border-left: 4px solid #65c922;[^}]*border-radius: 4px;[^}]*background-color: #fcfcfc;/);
  assert.match(css, /body\.brand-tap main > \.section\.info-card > \.default-content-wrapper > p:first-child \{[^}]*font-family: var\(--heading-font-family\);[^}]*font-size: 18px;[^}]*font-weight: 500;/);
  assert.match(css, /body\.brand-tap main > \.section\.info-card a\.button:any-link \{[^}]*min-height: 32px;[^}]*border: 1px solid #65c922;[^}]*background-color: transparent;/);
});

test('brief 352 (row 56): the booking box\'s select arrow www\'s green triangle, TAP only', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../blocks/booking-box/booking-box.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-tap \.booking-box \.booking-box-icon-caret svg \{\s*width: 20px;\s*height: 20px;\s*fill: #397213;\s*stroke: none;/);
  assert.match(css, /body\.brand-tap \.booking-box \.booking-box-field-button \.booking-box-icon-caret svg \{\s*opacity: 0\.5;/);
  assert.match(css, /body\.brand-tap \.booking-box \.booking-box-field-button \.booking-box-icon-caret \{\s*right: 12px;/);
});

test('brief 352 (ema-lufthansa\'s 350): a feature card\'s H3 title as www\'s (GT Flexa 24 / 28.8 bold, 16 px to the text)', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-tap \.columns-media:not\(\.stack\) \.columns-media-text > h3:not\(\[class\*="heading-"\]\) \{\s*margin-bottom: 16px;\s*font-size: 24px;\s*line-height: 1\.2;\s*font-weight: 700;/);
});
