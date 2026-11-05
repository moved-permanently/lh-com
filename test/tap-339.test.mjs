/* eslint-disable max-len, class-methods-use-this */
/* TAP's brief 339 (tools/reports/tap/parity.md rows 45 to 47):
   - row 47, the headings' line breaks: fonts/tap holds www.flytap.com's own GT Flexa and Inter files
     (sha256 as www serves them, 2026-11-04); the difference was lh-com's balanced hero-card title,
     which brand tap wraps greedily;
   - row 45, the destinations map: tools/tap-data/destinations-sheet.mjs (the destinations of the
     captured page's __NEXT_DATA__, placed by the root's airport sheet and OurAirports) and poi-map on
     brand tap with a sheet as its Source (blocks/poi-map/poi-map-tap.js: green dots, the regions);
   - row 40, the help contacts: hotline-finder on brand tap (blocks/hotline-finder/hotline-finder-tap.js:
     country and city, the groups and their entries from the root's contacts sheet).
   Boolean asserts around linkedom nodes. Run: node --max-old-space-size=512 --test test/tap-339.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="tap"></head><body><main></main></body></html>');
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/en-pt/help', search: '', hash: '', href: 'https://tap.turnsthe.page/en-pt/help', origin: 'https://tap.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://tap.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;

const sheetTool = await import('../tools/tap-data/destinations-sheet.mjs');
const mapTap = await import('../blocks/poi-map/poi-map-tap.js');
const finderTap = await import('../blocks/hotline-finder/hotline-finder-tap.js');
const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');

test('row 47: fonts/tap are www\'s own files (the same sha256), the hero card\'s title wraps greedily as www\'s', () => {
  const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(new URL(`../fonts/tap/${f}`, import.meta.url))).digest('hex');
  assert.equal(sha('GTFlexa-400.ttf'), 'f1b507fd03a8e8bca4b829fd8c5d4321adfd579b1b6a5fb7e21156e52e510ea3');
  assert.equal(sha('GTFlexa-500.ttf'), '33179f5fe30c93aab8366f3120afcba9cf559c7cee50511073ec8d977f8d172c');
  assert.equal(sha('GTFlexa-700.ttf'), 'e5c22056af2025c3c7599f3aa1c6f1f783201b64a6b3002f2297ad86732ef419');
  assert.equal(sha('Inter-latin.woff2'), 'c940764593d0fe5d596be327ca7558855e018039fb78509aa21921fd3644c3e4');
  assert.match(css, /body\.brand-tap \.hero-card-overlay \.hero-card-overlay-card :is\(h1, h2, h3, h4, h5, h6\),\s*body\.brand-tap \.hero-card-overlay \.hero-card-overlay-card \.hero-card-overlay-eyebrow \{\s*text-wrap: wrap;/);
});

/* ------------------------------------------------------------------ the destinations sheet --- */

const para = (city, cityHref, country, countryHref, nested) => {
  const text = (v) => (nested ? { nodeType: 'span', content: [{ nodeType: 'text', value: v }] } : { nodeType: 'text', value: v });
  return {
    nodeType: 'paragraph',
    content: [
      { nodeType: 'link', content: [text(city)], data: { href: cityHref } },
      { nodeType: 'text', value: ' | ' },
      { nodeType: 'link', content: [text(country)], data: { href: countryHref } },
    ],
  };
};
const NEXT = {
  props: {
    pageProps: {
      page: {
        sections: [
          { __typename: 'ComponentHeadingModel', title: 'TAP Destinations' },
          {
            __typename: 'ComponentAccordionItemsListModel',
            items: [
              { label: 'Africa', accordionItemDescription: { json: [para('Boa Vista', 'https://www.flytap.com/en_[market]/flights-to-boa-vista-cv', 'Cape Verde', 'https://www.flytap.com/en_[market]/flights-to-cape-verde', true), para('Sal', 'https://www.flytap.com/en_[market]/flights-to-sal', 'Cape Verde', 'https://www.flytap.com/en_[market]/flights-to-cape-verde')] } },
              { label: 'America', accordionItemDescription: { json: [para('New York', 'https://www.flytap.com/en_[market]/flights-to-new-york', 'USA', 'https://www.flytap.com/en_[market]/flights-to-usa'), para('Atlantis', 'https://www.flytap.com/en_[market]/flights-to-atlantis', 'Nowhere', '')] } },
              { label: 'Europe', accordionItemDescription: { json: [para('Lisbon', 'https://www.flytap.com/en_[market]/flights-to-lisbon', 'Portugal', 'https://www.flytap.com/en_[market]/flights-to-portugal')] } },
            ],
          },
        ],
      },
    },
  },
};
const AIRPORTS = [
  {
    airport: 'BVB', city: 'BVB', cityName: 'Boa Vista', countryName: 'Brazil', tapRoute: true,
  },
  {
    airport: 'BVC', city: 'BVC', cityName: 'Boa Vista Island', countryName: 'Cape Verde', tapRoute: true,
  },
  {
    airport: 'JFK', city: 'NYC', cityName: 'New York', countryName: 'USA', tapRoute: false,
  },
  {
    airport: 'EWR', city: 'NYC', cityName: 'New York', countryName: 'USA', tapRoute: false,
  },
  {
    airport: 'YYY', city: 'NYC', cityName: 'New York', countryName: 'USA', tapRoute: false,
  },
  {
    airport: 'LIS', city: 'LIS', cityName: 'Lisbon', countryName: 'Portugal', tapRoute: true,
  },
];
const CSV = [
  '"id","ident","type","name","latitude_deg","longitude_deg","iata_code"',
  '1,"A","large_airport","Boa Vista, Brazil",2.8462,-60.6906,"BVB"',
  '2,"B","medium_airport","Aristides Pereira",16.1365,-22.8889,"BVC"',
  '3,"C","large_airport","Amilcar Cabral",16.7414,-22.9494,"SID"',
  '4,"D","large_airport","John F. Kennedy",40.6398,-73.7789,"JFK"',
  '5,"E","large_airport","Newark Liberty",40.6925,-74.1687,"EWR"',
  '6,"F","medium_airport","Mont-Joli",48.6086,-68.2081,"YYY"',
  '7,"G","large_airport","Humberto Delgado",38.7813,-9.1359,"LIS"',
  '8,"H","closed","Old field",1,1,"OLD"',
].join('\n');

test('row 45: the destinations of the page\'s __NEXT_DATA__, the links in the root\'s market, nested spans read', () => {
  const html = `<html><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(NEXT)}</script></html>`;
  const dests = sheetTool.destinationsOf(sheetTool.nextDataOf(html), 'en-pt');
  assert.deepEqual(dests.map((d) => [d.region, d.city, d.country]), [['Africa', 'Boa Vista', 'Cape Verde'], ['Africa', 'Sal', 'Cape Verde'], ['America', 'New York', 'USA'], ['America', 'Atlantis', 'Nowhere'], ['Europe', 'Lisbon', 'Portugal']]);
  assert.equal(dests[0].link, 'https://www.flytap.com/en_pt/flights-to-boa-vista-cv');
  assert.equal(sheetTool.marketLink('https://www.flytap.com/pt_%5Bmarket%5D/voos-para-acra', 'pt-pt'), 'https://www.flytap.com/pt_pt/voos-para-acra');
  assert.equal(sheetTool.fold('  São  Luís '), 'sao luis');
  assert.deepEqual(sheetTool.csvFields('1,"a, ""b""",,3'), ['1', 'a, "b"', '', '3']);
});

test('row 45: each destination placed by its airport: the destination\'s country first, a city code\'s mean without the odd airport, the hand-kept names, none for the unknown', () => {
  const coords = sheetTool.coordinatesOf(CSV);
  assert.equal(coords.has('OLD'), false, 'closed airports left out');
  const dests = sheetTool.destinationsOf(NEXT, 'en-pt');
  const { rows, missing } = sheetTool.sheetRows(dests, AIRPORTS, coords);
  const by = Object.fromEntries(rows.map((r) => [r.city, r]));
  assert.equal(by['Boa Vista'].code, 'BVC', 'Cape Verde\'s Boa Vista, not Brazil\'s');
  assert.equal(by.Sal.code, 'SID', 'a hand-kept name (PLACES)');
  assert.equal(by['New York'].code, 'NYC');
  assert.equal(Math.abs(Number(by['New York'].lat) - 40.666) < 0.01, true, 'JFK and EWR, not Mont-Joli');
  assert.equal(by.Lisbon.lat, '38.7813');
  assert.deepEqual(missing, ['Atlantis']);
  assert.deepEqual(Object.keys(rows[0]), sheetTool.COLUMNS);
  const sheet = sheetTool.sheetOf(rows);
  assert.equal(sheet[':type'], 'sheet');
  assert.equal(sheet.total, 4);
});

/* -------------------------------------------------------------------------- poi-map on tap --- */

const SHEET = {
  data: [
    {
      region: 'Africa', city: 'Accra', country: 'Ghana', lat: '5.6052', lng: '-0.1668', link: 'https://www.flytap.com/en_pt/flights-to-accra',
    },
    {
      region: 'Europe', city: 'Lisbon', country: 'Portugal', lat: '38.7813', lng: '-9.1359', link: 'https://www.flytap.com/en_pt/flights-to-lisbon',
    },
    {
      region: 'Europe', city: 'Nowhere', country: '', lat: 'x', lng: '1', link: '',
    },
    {
      region: 'Europe', city: 'Null Island', country: '', lat: '0', lng: '0', link: '',
    },
  ],
};

test('row 45: a sheet Source (a .json path) against lufthansa.com\'s JCR path; the points with coordinates, their bubbles\' texts in the page\'s language', () => {
  assert.equal(mapTap.isSheetSource('/en-pt/destinations/destinations-map.json'), true);
  assert.equal(mapTap.isSheetSource('https://main--lh-tap--moved-permanently.aem.page/drafts/x.json?sheet=data'), true);
  assert.equal(mapTap.isSheetSource('/content/lh/markets/de/en/100-years/destinations/jcr:content/par/poimapping'), false);
  const points = mapTap.pointsOfSheet(SHEET, 'pt');
  assert.deepEqual(points.map((p) => p.title), ['Accra, Ghana', 'Lisbon, Portugal']);
  assert.equal(points[0].linkLabel, 'Voos para Accra');
  assert.equal(points[0].group, 'Africa');
  assert.equal(points[1].linkExternal, true);
  assert.equal(mapTap.labelsFor('xx').all, 'All');
});

test('row 45: the sheet loaded (limit 1000), none when it does not load', async () => {
  const calls = [];
  const ok = await mapTap.loadTapMap('/en-pt/destinations/destinations-map.json', 'en', async (u) => { calls.push(u); return new Response(JSON.stringify(SHEET)); });
  assert.deepEqual(calls, ['/en-pt/destinations/destinations-map.json?limit=1000']);
  assert.equal(ok.points.length, 2);
  assert.equal(ok.sources.points, 'sheet');
  const gone = await mapTap.loadTapMap('/x.json', 'en', async () => new Response('', { status: 404 }));
  assert.equal(gone.points.length, 0);
  assert.equal(gone.sources.points, 'none');
});

test('row 45: the region buttons: All and one per region, a region shows its dots only and fits the map to them', () => {
  const points = mapTap.pointsOfSheet(SHEET, 'en');
  const block = document.createElement('div');
  const view = document.createElement('div');
  block.append(view);
  const markers = points.map((point) => ({ point, marker: document.createElement('div') }));
  let renders = 0;
  const fitted = [];
  const drawn = { markers, state: { zoom: 2, center: { x: 0, y: 0 } }, render: () => { renders += 1; } };
  mapTap.decorateTapMap(block, drawn, points, {
    lang: 'en', view, maxZoom: 19, fitBounds: (shown) => { fitted.push(shown.map((p) => p.city)); return { zoom: 5, center: { x: 1, y: 2 } }; },
  });
  assert.equal(block.classList.contains('poi-map-tap'), true);
  const buttons = [...block.querySelectorAll('.poi-map-region')];
  assert.deepEqual(buttons.map((b) => b.textContent), ['All', 'Africa', 'Europe']);
  assert.equal(buttons[0].getAttribute('aria-pressed'), 'true');
  assert.equal(block.querySelector('.poi-map-regions').nextElementSibling === view, true, 'above the map');
  buttons[2].dispatchEvent(new window.Event('click'));
  assert.deepEqual(markers.map((m) => m.marker.hidden), [true, false]);
  assert.deepEqual(fitted.pop(), ['Lisbon']);
  assert.equal(drawn.state.zoom, 5);
  assert.equal(renders, 1);
  assert.equal(buttons[2].getAttribute('aria-pressed'), 'true');
  assert.equal(buttons[0].getAttribute('aria-pressed'), 'false');
  buttons[0].dispatchEvent(new window.Event('click'));
  assert.deepEqual(markers.map((m) => m.marker.hidden), [false, false]);
  assert.equal(markers[0].marker.dataset.group, 'Africa');
});

test('row 45: poi-map hands brand tap\'s sheet Source to the variant only; drawMap gives the markers', () => {
  const src = fs.readFileSync(new URL('../blocks/poi-map/poi-map.js', import.meta.url), 'utf8');
  assert.match(src, /const isTap = \(\) => \(document\.querySelector\('meta\[name="brand"\]'\)/);
  assert.match(src, /const tap = isTap\(\);/);
  assert.match(src, /const variant = tap \? await import\('\.\/poi-map-tap\.js'\) : null;/);
  assert.match(src, /const sheet = Boolean\(variant && variant\.isSheetSource\(\(config\.source \|\| \{\}\)\.text\)\);/);
  assert.match(src, /state, render, zoomTo, markers,/);
});

/* ----------------------------------------------------------------- hotline-finder on tap ------ */

const CONTACTS = {
  data: [
    {
      country: 'PT', name: 'Portugal', city: 'Lisbon', group: 'Contact Center', kind: 'phone', label: '', value: '+351 211 234 400', note: 'Call to national landline.',
    },
    {
      country: 'PT', name: 'Portugal', city: 'Lisbon', group: 'Contact Center', kind: 'schedule', label: '', value: 'Every day: 24h', note: '',
    },
    {
      country: 'PT', name: 'Portugal', city: 'Porto', group: 'Customer Service Desk', kind: 'address', label: '', value: 'Porto Airport', note: '',
    },
    {
      country: 'ES', name: 'Spain', city: '', group: 'Contact Center', kind: 'phone', label: 'Teléfono', value: '+34 91 125 00 00', note: '',
    },
    {
      country: 'ES', name: 'Spain', city: '', group: 'Contact Center', kind: 'fax', label: '', value: 'ignored', note: '',
    },
  ],
};

test('row 40: the contacts sheet grouped: countries, their cities, the groups, their entries; unknown kinds out', () => {
  const countries = finderTap.contactsOf(CONTACTS.data);
  assert.deepEqual(countries.map((c) => [c.code, c.name, c.cities.map((x) => x.name)]), [['PT', 'Portugal', ['Lisbon', 'Porto']], ['ES', 'Spain', ['']]]);
  assert.deepEqual(countries[0].cities[0].groups[0].entries.map((e) => e.kind), ['phone', 'schedule']);
  assert.equal(countries[1].cities[0].groups[0].entries.length, 1);
  assert.equal(finderTap.telOf('+351 211 234 400'), 'tel:+351211234400');
});

const pick = (select, value) => {
  select.querySelectorAll('option').forEach((o) => (o.value === value ? o.setAttribute('selected', '') : o.removeAttribute('selected')));
  select.dispatchEvent(new window.Event('change'));
};

test('row 40: the finder: the market\'s country and its first city, the groups with labels and telephone links; another city, another country', async () => {
  const block = document.createElement('div');
  block.className = 'hotline-finder block';
  block.innerHTML = '<div><div>Sheet</div><div>/en-pt/help/contacts.json</div></div><div><div>Image</div><div><picture><img src="/x.jpg" alt=""></picture></div></div>';
  document.querySelector('main').append(block);
  const calls = [];
  await finderTap.default(block, { lang: 'en', country: 'pt', fetcher: async (u) => { calls.push(u); return new Response(JSON.stringify(CONTACTS)); } });
  assert.deepEqual(calls, ['/en-pt/help/contacts.json?limit=5000']);
  assert.equal(block.classList.contains('hotline-finder-tap'), true);
  assert.equal(block.dataset.lhSource, 'sheet');
  assert.equal(block.firstElementChild.className, 'hotline-finder-media');
  const [country, city] = [...block.querySelectorAll('select')];
  assert.equal(country.value, 'PT');
  assert.deepEqual([...city.querySelectorAll('option')].map((o) => o.value), ['Lisbon', 'Porto']);
  assert.deepEqual([...block.querySelectorAll('.hotline-finder-group-title')].map((h) => h.textContent), ['Contact Center']);
  // www's contact headings are H2s (brief 403, R4-3)
  assert.deepEqual([...block.querySelectorAll('.hotline-finder-group-title')].map((h) => h.tagName), ['H2']);
  assert.deepEqual([...block.querySelectorAll('.hotline-finder-label')].map((l) => l.textContent), ['Telephone', 'Schedule']);
  assert.equal(block.querySelector('.hotline-finder-phone a').getAttribute('href'), 'tel:+351211234400');
  assert.equal(block.querySelector('.hotline-finder-note').textContent, 'Call to national landline.');
  pick(city, 'Porto');
  assert.deepEqual([...block.querySelectorAll('.hotline-finder-group-title')].map((h) => h.textContent), ['Customer Service Desk']);
  pick(country, 'ES');
  assert.equal(city.closest('.hotline-finder-field').hidden, true, 'one place without a name: no city select');
  assert.deepEqual([...block.querySelectorAll('.hotline-finder-label')].map((l) => l.textContent), ['Teléfono']);
  block.remove();
});

test('row 40: no sheet, no finder; hotline-finder hands brand tap to the variant only', async () => {
  const block = document.createElement('div');
  block.innerHTML = '<div><div>Sheet</div><div>/gone.json</div></div>';
  await finderTap.default(block, { lang: 'en', country: 'PT', fetcher: async () => new Response('', { status: 404 }) });
  assert.equal(block.dataset.lhSource, 'none');
  assert.equal(block.querySelector('select'), null);
  const src = fs.readFileSync(new URL('../blocks/hotline-finder/hotline-finder.js', import.meta.url), 'utf8');
  assert.match(src, /if \(isTap\(\)\) \{\s*const \{ default: decorateTapFinder \} = await import\('\.\/hotline-finder-tap\.js'\);/);
});

test('rows 40 and 45: the map\'s and the finder\'s rules all under body.brand-tap', () => {
  ['TAP\'s destinations map (brief 339)', 'TAP\'s help contacts (brief 339)'].forEach((heading) => {
    const start = css.indexOf(heading);
    assert.equal(start > 0, true, heading);
    const part = css.slice(css.indexOf('*/', start) + 2).split('/* ---')[0].replace(/\/\*[\s\S]*?\*\//g, '');
    const selectors = [...part.matchAll(/(^|[{}])\s*([^{}@]+)\{/g)].map((m) => m[2].trim());
    const split = (list) => {
      const out = [''];
      let depth = 0;
      [...list].forEach((ch) => {
        if (ch === '(') depth += 1;
        if (ch === ')') depth -= 1;
        if (ch === ',' && depth === 0) out.push('');
        else out[out.length - 1] += ch;
      });
      return out.map((x) => x.trim()).filter(Boolean);
    };
    assert.equal(selectors.length > 8, true, heading);
    assert.deepEqual(selectors.flatMap(split).filter((x) => !x.startsWith('body.brand-tap ')), [], heading);
  });
});
