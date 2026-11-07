/* eslint-disable max-len, import/extensions, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The flight search's passengers picker rows in the page's language (brief 448, item 3, found by
   ema-lufthansa in brief 443): the import wrote the picker's texts ("Children", "Group bookings
   for 10 or more passengers.") in English on French and other non-English pages, and the group
   booking link to www's internal address (/content/bel/markets/…). Now:
   - the texts come from the page: www's label state (window.__PRELOADED_STATE__'s
     common.booking.children/infants label and hint; Brussels' importer hands them over as the
     body's data-lh-booking-labels, its scripts stripped before the import), the group link's text
     from the rendered .group-booking-link; without them lufthansa.com's recorded en / de texts as
     before, and for another language no text rows (the block's own texts in that language) and
     no group row;
   - the group link is the site's path for any brand's /content/<brand>/markets/<cc>/<ll>/ address
     (Brussels' /fr/fr/book-a-flight/groups-and-charter/groups), lufthansa.com's group-travel
     mapping as before.
   Checked with brussels-parity-002a's fr/fr and ke/en homepages.
   Run: node --max-old-space-size=256 --test test/flight-search-picker-page-labels.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { pickerRows, groupTravelPath, pageBookingLabels } from '../tools/importer/parsers/flight-search-picker.js';

const FR_STATE = '<script>window.__PRELOADED_STATE__ = {"labels":{"common.booking.adults.label":"Adultes","common.booking.children.hint":"(2\\u00a0à 11\\u00a0ans)","common.booking.children.label":"Enfants","common.booking.infants.hint":"(0 à 23\\u00a0mois)","common.booking.infants.label":"Bébés sans siège"}}</script>';

test('the page\'s label state: the four picker texts', () => {
  assert.deepEqual(pageBookingLabels(FR_STATE), {
    'Children label': 'Enfants', 'Children hint': '(2 à 11 ans)', 'Infants label': 'Bébés sans siège', 'Infants hint': '(0 à 23 mois)',
  });
  assert.deepEqual(pageBookingLabels('<p>nothing</p>'), null);
});

test('French page: its labels, its group link text and the site\'s path for www\'s /content/bel/markets/ address', () => {
  const rows = Object.fromEntries(pickerRows({
    lang: 'fr', groupBookingsUrl: '/content/bel/markets/fr/fr/book-a-flight/groups-and-charter/groups', labels: pageBookingLabels(FR_STATE), groupText: 'Réservations de groupe pour 10 passagers ou plus.',
  }));
  assert.equal(rows['Children label'], 'Enfants');
  assert.equal(rows['Infants label'], 'Bébés sans siège');
  assert.deepEqual(rows['Group booking'], { href: '/fr/fr/book-a-flight/groups-and-charter/groups', text: 'Réservations de groupe pour 10 passagers ou plus.' });
  assert.ok(!JSON.stringify(Object.values(rows)).includes('Children'));
});

test('a language without page texts or recorded ones: no text rows, no group row (the block\'s own texts)', () => {
  const rows = pickerRows({ lang: 'it', groupBookingsUrl: '/content/lh/markets/xx/it/book-and-manage/group-travel' });
  assert.deepEqual(rows.map(([k]) => k), ['Passenger picker', 'Adults hint', 'Fare preference']);
});

test('lufthansa.com en and de without page texts: the recorded texts, as before', () => {
  const en = Object.fromEntries(pickerRows({ lang: 'en', groupBookingsUrl: '/content/lh/markets/de/en/book-and-manage/group-travel' }));
  assert.equal(en['Children label'], 'Children');
  assert.deepEqual(en['Group booking'], { href: '/de/en/group-travel', text: 'Group bookings for 10 or more passengers.' });
  assert.equal(groupTravelPath('/content/bel/markets/ke/en/book-a-flight/groups-and-charter/groups.html'), '/ke/en/book-a-flight/groups-and-charter/groups');
});

/* the parser: the page's state script, the rendered group link, Brussels' handed-over labels */
let cellsOut;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { cells }) => {
      const text = (v) => {
        if (!v || !v.nodeType) return v;
        return v.getAttribute && v.getAttribute('href') ? `${v.textContent} -> ${v.getAttribute('href')}` : v.textContent;
      };
      cellsOut = cells.map(([k, v]) => [k, text(v)]);
      return document.createElement('table');
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/flight-search.js');
const fsHtml = (body, head = '') => `<html lang="fr"><head>${head}</head><body${body.attr || ''}><div class="flightmanager" data-dcep="{&quot;groupBookingsUrl&quot;:&quot;/content/bel/markets/fr/fr/book-a-flight/groups-and-charter/groups&quot;}"><button class="travel-details-opener">Économique, 1 passager</button><maui-navigation-link href="/content/bel/markets/fr/fr/book-a-flight/groups-and-charter/groups" class="group-booking-link d-inline-block maui-link">Réservations de groupe pour 10&nbsp;passagers ou plus.</maui-navigation-link></div></body></html>`;
const parseRows = (html) => {
  const { document } = parseHTML(html);
  parse(document.querySelector('.flightmanager'), { document, url: 'https://www.brusselsairlines.com/fr/fr/homepage', params: { originalURL: 'https://www.brusselsairlines.com/fr/fr/homepage' } });
  return Object.fromEntries(cellsOut);
};

test('the parser: the state script\'s texts and the rendered group link (lufthansa.com\'s import keeps scripts until the parsers ran)', () => {
  const rows = parseRows(fsHtml({}, FR_STATE));
  assert.equal(rows['Children label'], 'Enfants');
  assert.equal(rows['Group booking'], 'Réservations de groupe pour 10 passagers ou plus. -> /fr/fr/book-a-flight/groups-and-charter/groups');
});

test('the parser: Brussels\' handed-over labels (data-lh-booking-labels on the body)', () => {
  const attr = ` data-lh-booking-labels="${JSON.stringify(pageBookingLabels(FR_STATE)).replace(/"/g, '&quot;')}"`;
  const rows = parseRows(fsHtml({ attr }));
  assert.equal(rows['Infants label'], 'Bébés sans siège');
  assert.ok(!Object.values(rows).some((v) => /Children|Group bookings/.test(String(v))));
});

test('Brussels\' importer hands the page\'s picker texts over on the body before it strips the scripts', async () => {
  const { withBookingLabels } = await import('../tools/importer/brussels-import.mjs');
  const out = withBookingLabels(`<html><head>${FR_STATE}</head><body class="x"><p>Page</p></body></html>`);
  const { document } = parseHTML(out);
  assert.deepEqual(JSON.parse(document.body.getAttribute('data-lh-booking-labels')), pageBookingLabels(FR_STATE));
  assert.equal(withBookingLabels('<html><body><p>No labels</p></body></html>'), '<html><body><p>No labels</p></body></html>');
});

test('www\'s global-content group link (/content/lh/gc/en/…, the xx roots\' flight search pages): the page\'s own root', () => {
  assert.equal(groupTravelPath('https://www.lufthansa.com/content/lh/gc/en/book-and-manage/group-travel', '/xx/pt'), '/xx/pt/group-travel');
  assert.equal(groupTravelPath('/content/lh/gc/en', '/cn/zh'), '/cn/zh');
  assert.equal(groupTravelPath('/content/lh/gc/en/book-and-manage/group-travel'), '');
  const rows = Object.fromEntries(pickerRows({
    lang: 'pt', groupBookingsUrl: '/content/lh/gc/en/book-and-manage/group-travel', root: '/xx/pt', groupText: 'Reservas de grupo para 10 ou mais passageiros.',
  }));
  assert.deepEqual(rows['Group booking'], { href: '/xx/pt/group-travel', text: 'Reservas de grupo para 10 ou mais passageiros.' });
  assert.equal(rows['Children label'], undefined);
});

test('the parser: a global-content group link on an xx root\'s page goes to that root', () => {
  const html = '<html lang="pt"><body><div class="flightmanager" data-dcep="{&quot;groupBookingsUrl&quot;:&quot;/content/lh/gc/en/book-and-manage/group-travel&quot;}"><button class="travel-details-opener">Economy, 1 passageiro</button><maui-navigation-link href="/content/lh/gc/en/book-and-manage/group-travel" class="group-booking-link">Reservas de grupo para 10 ou mais passageiros.</maui-navigation-link></div></body></html>';
  const { document } = parseHTML(html);
  parse(document.querySelector('.flightmanager'), { document, url: 'https://www.lufthansa.com/xx/pt/flight-search', params: { originalURL: 'https://www.lufthansa.com/xx/pt/flight-search' } });
  const rows = Object.fromEntries(cellsOut);
  assert.equal(rows['Group booking'], 'Reservas de grupo para 10 ou mais passageiros. -> /xx/pt/group-travel');
  assert.equal(rows['Children label'], undefined);
});
