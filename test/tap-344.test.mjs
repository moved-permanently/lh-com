/* eslint-disable max-len, import/extensions */
/* TAP's destinations sheets for all eight language versions (brief 344; tools/reports/tap/parity.md
   row 45): tools/tap-data/destinations-sheet.mjs reads every version's www list as it is (names
   linked or not, two destinations in one paragraph split at the line break, the same destination
   twice kept once), places names by the root's airport sheet, then the other languages' sheets,
   then the name in the flights link, preferring codes another version placed (en-pt's), and reads
   a root's DA airport sheet as well as a recorded answer. Also row 40: the contacts picture's
   green chevron line (styles/themes/tap.css).
   Run: node --max-old-space-size=512 --test test/tap-344.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const tool = await import('../tools/tap-data/destinations-sheet.mjs');

const text = (v) => ({ nodeType: 'text', value: v });
const span = (...c) => ({ nodeType: 'span', content: c });
const link = (href, ...c) => ({ nodeType: 'link', data: { href }, content: c });

test('a paragraph\'s destinations: linked or plain, two at a line break, a new node after the country', () => {
  const plain = { nodeType: 'paragraph', content: [span(text('Berlin | Niemcy'))] };
  assert.deepEqual(tool.paragraphDestinations(plain).map((d) => [d.city, d.country, d.link]), [['Berlin', 'Niemcy', '']]);
  const two = {
    nodeType: 'paragraph',
    content: [span(text('Ateny | Grecja'), { nodeType: 'line-break', content: [] }, { nodeType: 'line-break', content: [] }, text('Barcelona | ')), link('https://www.flytap.com/pl_pl/loty-do-hiszpania', span(text('Hiszpanii')))],
  };
  assert.deepEqual(tool.paragraphDestinations(two).map((d) => [d.city, d.country, d.countryLink]), [['Ateny', 'Grecja', ''], ['Barcelona', 'Hiszpanii', 'https://www.flytap.com/pl_pl/loty-do-hiszpania']]);
  const linked = {
    nodeType: 'paragraph',
    content: [link('https://www.flytap.com/pt_[market]/voos-para-acra', span(text('Acra'))), span(text(' | ')), link('https://www.flytap.com/pt_[market]/voos-para-gana', span(text('Gana')))],
  };
  assert.deepEqual(tool.paragraphDestinations(linked).map((d) => [d.city, d.country, d.link]), [['Acra', 'Gana', 'https://www.flytap.com/pt_[market]/voos-para-acra']]);
  const glued = { nodeType: 'paragraph', content: [span(text('Ateny | Grecja')), span(text('Bolonia | Włochy'))] };
  assert.deepEqual(tool.paragraphDestinations(glued).map((d) => d.city), ['Ateny', 'Bolonia']);
});

test('a flights link\'s place name, in every version\'s wording', () => {
  assert.equal(tool.slugName('https://www.flytap.com/pl_pl/loty-do-nowy-jork'), 'nowy jork');
  assert.equal(tool.slugName('https://www.flytap.com/en_pt/flights-to-boa-vista-cv'), 'boa vista cv');
  assert.equal(tool.slugName('https://www.flytap.com/it_it/voli-per-belem?x=1'), 'belem');
  assert.equal(tool.slugName(''), '');
});

test('a DA airport sheet read as the recorded answer (code, "true" / "false")', () => {
  const rows = tool.airportsOf({
    data: [{
      code: 'LIS', city: 'LIS', cityName: 'Lisboa', tapRoute: 'true', railway: 'false',
    }, {
      code: 'XYZ', city: 'XYZ', tapRoute: 'false', railway: 'true',
    }],
  });
  assert.deepEqual(rows.map((r) => [r.airport, r.tapRoute, r.isRailway]), [['LIS', true, false], ['XYZ', false, true]]);
  assert.equal(tool.airportsOf({ entries: [{ airport: 'OPO', tapRoute: true }] })[0].tapRoute, true);
});

test('placing: a code another version placed first, the other languages\' sheets, the name in the link; the same destination once', () => {
  const coords = new Map([['SMA', { lat: 36.97, lng: -25.17 }], ['RIA', { lat: -29.71, lng: -53.69 }], ['BVC', { lat: 16.14, lng: -22.89 }], ['BVB', { lat: 2.85, lng: -60.69 }], ['BEL', { lat: -1.38, lng: -48.48 }]]);
  const own = [
    {
      airport: 'RIA', city: 'RIA', cityName: 'Santa Maria', country: 'BR', countryName: 'Brasil', tapRoute: true,
    },
    {
      airport: 'BVB', city: 'BVB', cityName: 'Boa Vista', country: 'BR', countryName: 'Brasilien', tapRoute: true,
    },
    {
      airport: 'BEL', city: 'BEL', cityName: 'Belém', country: 'BR', countryName: 'Brasilien', tapRoute: true,
    },
  ];
  const other = [
    {
      airport: 'SMA', city: 'SMA', cityName: 'Santa Maria', country: 'PT', countryName: 'Portugal', tapRoute: true,
    },
    {
      airport: 'BVC', city: 'BVC', cityName: 'Boa Vista Island', country: 'CV', countryName: 'Cape Verde', tapRoute: true,
    },
  ];
  const known = new Set(['SMA', 'BVC', 'BEL']);
  const dests = [
    { city: 'Santa Maria', country: 'Portugal', link: 'https://www.flytap.com/es_es/vuelos-a-santa-maria' },
    { city: 'Boa Vista', country: 'Kap Verde', link: 'https://www.flytap.com/de_de/fluge-nach-boa-vista' },
    { city: 'Belém', country: 'Brasile', link: 'https://www.flytap.com/it_it/voli-per-belem' },
    { city: 'Belém', country: 'Brasile', link: 'https://www.flytap.com/it_it/voli-per-belem' },
  ];
  const { rows, missing } = tool.sheetRows(dests, own, coords, [other], known);
  assert.deepEqual(rows.map((r) => [r.city, r.code]), [['Santa Maria', 'SMA'], ['Boa Vista', 'BVC'], ['Belém', 'BEL']]);
  assert.deepEqual(missing, []);
  // without the known codes: the root's own sheet as before
  assert.equal(tool.placeOf(dests[0], own, coords).code, 'RIA');
});

test('row 40: www\'s green chevron line over the contacts picture, TAP-scoped', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-tap \.hotline-finder-tap \.hotline-finder-media \{\s*position: relative;\s*display: block;/);
  assert.match(css, /body\.brand-tap \.hotline-finder-tap \.hotline-finder-media::after \{[^}]*stroke='%239efd38'/);
});
