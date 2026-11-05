/* eslint-disable max-len, import/extensions */
/* destination-grid (brief 372, tools/reports/tap/parity.md row 84): www.flytap.com's destinations
   grid (Smartvel's Explore&Go widget) from a sheet per version, /<version>/destinations/
   destination-grid.json, which tools/tap-data/destination-grid-sheet.mjs writes from the Smartvel
   capture (tap-smartvel-001): a search box, the category chips (all selected ones, AND), a Filters
   panel with the areas and the categories, Clear and Apply, then the destination cards (name,
   country, text; a picture only where the sheet gives one: Smartvel's are licensed and the sheet
   leaves them out), 16 at a time with "load more". The fixture is pt-pt's sheet, cut to 20
   destinations, without pictures.
   Run: node --max-old-space-size=512 --test test/tap-destination-grid.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const FIXTURE = JSON.parse(fs.readFileSync(new URL('./fixtures/destination-grid/pt-pt.json', import.meta.url), 'utf8'));
const tool = await import('../tools/tap-data/destination-grid-sheet.mjs');

test('the sheet tool: text without HTML, the area by the country id, www\'s shop link, the priority first', () => {
  assert.equal(tool.plainText('<p>Situada na orla&nbsp;do <strong>Atlântico</strong> &amp; mais.</p>\n<p>Outra.</p>'), 'Situada na orla do Atlântico & mais. Outra.');
  const areas = [{ properties: { slug: 'europe', regions: ['61293', '100'], translations: { pt: 'Europa', en: 'Europe' } } }, { properties: { slug: 'asia', regions: ['61293'], translations: { pt: 'Ásia' } } }];
  assert.equal(tool.areaOf('61293', areas, ['europe', 'africa']), 'europe', 'only the areas the config offers');
  assert.equal(tool.areaOf('999', areas, ['europe']), '');
  const config = {
    shop_link: 'https://www.flytap.com/pt-pt', custom_shop_link: null, custom_market_links: { 1: { PT: { banner: 'https://www.flytap.com/pt_pt/voos-para-viena' } }, 2: { PT: { banner: '' } } },
  };
  assert.equal(tool.linkOf({ id: '1' }, config, 'PT'), 'https://www.flytap.com/pt_pt/voos-para-viena');
  assert.equal(tool.linkOf({ id: '2' }, config, 'PT'), 'https://www.flytap.com/pt-pt', 'an empty banner: the shop link');
  assert.equal(tool.linkOf({ id: '1' }, { ...config, custom_shop_link: 'https://x.test/' }, 'EN'), 'https://x.test/');
  assert.deepEqual(tool.ordered([{ id: 'a' }, { id: 'b' }, { id: 'c' }], ['c', 'x']).map((r) => r.id), ['c', 'a', 'b']);
});

test('the sheet tool: one row a destination, chip, area or label; the chips the region carries; no picture unless asked', () => {
  const capture = {
    config: {
      available_chips: [{ id: 10, slug: 'art_and_culture', name: 'Cultura' }, { id: 1, slug: 'sun_and_beach', name: 'Praia' }], areas: ['europe'], region_priority: ['2'], shop_link: 'https://www.flytap.com/pt-pt', custom_market_links: {},
    },
    regions: [
      {
        id: '1', name: 'Viena', country: 'Áustria', country_id: '100', description: '<p>Graciosa.</p>', tags: [10, 3, 8], cover: { cc_photo: 'https://cdn.smartvel.com/ccpictures/region/vienna.jpg' },
      },
      {
        id: '2', name: 'Faro', country: 'Portugal', country_id: '100', description: '<p>Sol.</p>', tags: [1, 10], cover: { cc_photo: 'https://cdn.smartvel.com/ccpictures/region/faro.jpg' },
      },
    ],
    areas: [{ properties: { slug: 'europe', regions: ['100'], translations: { pt: 'Europa' } } }],
    labels: { SEARCH_PLACEHOLDER: 'Destinos', FILTERS_BTN: 'Filtros' },
    lang: 'pt-pt',
    market: 'PT',
  };
  const rows = tool.sheetRows(capture);
  assert.deepEqual(Object.keys(rows[0]), tool.COLUMNS);
  const dests = rows.filter((r) => r.type === 'destination');
  // (row 84, Ben's call: the photos from Smartvel's CDN, www's _medium rendition, no copy)
  assert.deepEqual(dests.map((r) => [r.id, r.name, r.country, r.area, r.tags, r.text, r.image]), [['2', 'Faro', 'Portugal', 'europe', '1,10', 'Sol.', 'https://cdn.smartvel.com/ccpictures/region/faro.jpg_medium'], ['1', 'Viena', 'Áustria', 'europe', '10', 'Graciosa.', 'https://cdn.smartvel.com/ccpictures/region/vienna.jpg_medium']]);
  assert.deepEqual(rows.filter((r) => r.type === 'chip').map((r) => [r.id, r.name]), [['10', 'Cultura'], ['1', 'Praia']]);
  assert.deepEqual(rows.filter((r) => r.type === 'area').map((r) => [r.id, r.name]), [['europe', 'Europa']]);
  assert.deepEqual(rows.filter((r) => r.type === 'label').map((r) => [r.id, r.name]), [['SEARCH_PLACEHOLDER', 'Destinos'], ['FILTERS_BTN', 'Filtros']]);
  assert.equal(tool.sheetRows({ ...capture, photos: false }).find((r) => r.id === '1').image, '', '--photos no leaves the column empty');
});

test('the fixture: pt-pt\'s sheet from the capture, 20 destinations, no Smartvel picture', () => {
  const rows = FIXTURE.data;
  assert.equal(rows.filter((r) => r.type === 'destination').length, 20);
  assert.equal(rows.filter((r) => r.type === 'chip').length, 9);
  assert.equal(JSON.stringify(FIXTURE).includes('ccpictures'), false);
  assert.equal(rows.every((r) => !r.image), true);
});

// the block, on a TAP page
const { window, document } = parseHTML('<!DOCTYPE html><html lang="pt"><head><meta name="brand" content="tap"></head><body><main></main></body></html>');
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/pt-pt/destinos', search: '', hash: '', href: 'https://tap.turnsthe.page/pt-pt/destinos', origin: 'https://tap.turnsthe.page',
};
window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
const fetched = [];
let answer = FIXTURE;
globalThis.fetch = async (url) => { fetched.push(String(url)); return new Response(JSON.stringify(answer), { status: answer ? 200 : 404 }); };
const { default: decorate, DESTINATION_GRID_LABELS } = await import('../blocks/destination-grid/destination-grid.js');

const SOURCE = '/pt-pt/destinations/destination-grid.json';
const place = async (sheet = FIXTURE) => {
  answer = sheet;
  document.querySelector('main').innerHTML = `<div class="section"><div class="destination-grid-wrapper"><div class="destination-grid block"><div><div>Source</div><div><a href="${SOURCE}">${SOURCE}</a></div></div></div></div></div>`;
  const block = document.querySelector('.destination-grid');
  await decorate(block);
  return block;
};
const names = (block) => [...block.querySelectorAll('.destination-grid-card h3')].map((h) => h.textContent);
const label = (id) => FIXTURE.data.find((r) => r.type === 'label' && r.id === id).name;
const dests = FIXTURE.data.filter((r) => r.type === 'destination');
const chips = FIXTURE.data.filter((r) => r.type === 'chip');
const click = (el) => el.dispatchEvent(new window.Event('click', { bubbles: true }));

test('the grid: the Source sheet, the bar (search, Filters, the chips), 16 cards of 20 and "load more"', async () => {
  const block = await place();
  assert.equal(fetched.at(-1).endsWith(SOURCE), true);
  const search = block.querySelector('input[type="search"]');
  assert.equal(search.getAttribute('placeholder'), label('SEARCH_PLACEHOLDER'));
  assert.equal(search.getAttribute('aria-label'), label('SEARCH_PLACEHOLDER'));
  const toggle = block.querySelector('.destination-grid-filters-toggle');
  assert.equal(toggle.textContent.trim(), label('FILTERS_BTN'));
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.deepEqual([...block.querySelectorAll('.destination-grid-chips button')].map((b) => [b.textContent, b.getAttribute('aria-pressed')]), chips.map((c) => [c.name, 'false']));
  assert.deepEqual(names(block), dests.slice(0, 16).map((d) => d.name));
  const card = block.querySelector('.destination-grid-card');
  assert.equal(card.querySelector('.destination-grid-country').textContent, dests[0].country);
  assert.equal(card.querySelector('h3 a').getAttribute('href'), dests[0].link);
  assert.equal(card.querySelector('img'), null, 'no picture in the sheet: none on the card');
  const text = card.querySelector('.destination-grid-text').textContent;
  assert.equal(text.length <= 203 && dests[0].text.startsWith(text.replace(/\.\.\.$/, '')), true, 'www\'s 200 characters');
  const more = block.querySelector('.destination-grid-more');
  assert.equal(more.textContent, label('LOAD_MORE_DESTINATIONS_BTN'));
  click(more);
  assert.deepEqual(names(block), dests.map((d) => d.name));
  assert.equal(more.hidden, true);
});

test('the chips filter at once, every selected one (AND); the search by name or country, accents aside', async () => {
  const block = await place();
  const buttons = [...block.querySelectorAll('.destination-grid-chips button')];
  const [a, b] = [chips[1], chips[3]];
  click(buttons[1]);
  assert.equal(buttons[1].getAttribute('aria-pressed'), 'true');
  assert.deepEqual(names(block), dests.filter((d) => d.tags.split(',').includes(a.id)).slice(0, 16).map((d) => d.name));
  click(buttons[3]);
  const both = dests.filter((d) => [a.id, b.id].every((t) => d.tags.split(',').includes(t)));
  assert.deepEqual(names(block), both.slice(0, 16).map((d) => d.name));
  click(buttons[1]);
  click(buttons[3]);
  const search = block.querySelector('input[type="search"]');
  const target = dests[5];
  const fold = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  search.value = fold(target.name).toUpperCase();
  search.dispatchEvent(new window.Event('input'));
  const q = fold(target.name);
  assert.deepEqual(names(block), dests.filter((d) => fold(d.name).includes(q) || fold(d.country).includes(q)).slice(0, 16).map((d) => d.name));
  assert.equal(names(block).includes(target.name), true);
  search.value = 'zzzz';
  search.dispatchEvent(new window.Event('input'));
  assert.deepEqual(names(block), []);
  assert.equal(block.querySelector('.destination-grid-status').textContent, label('SEARCH_NO_RESULTS'));
});

test('the Filters panel: the areas (Worldwide first) and the categories; Apply filters and closes, Clear resets both', async () => {
  const block = await place();
  const toggle = block.querySelector('.destination-grid-filters-toggle');
  const panel = block.querySelector(`#${toggle.getAttribute('aria-controls')}`);
  assert.equal(panel.hidden, true);
  click(toggle);
  assert.equal(panel.hidden, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  const areas = FIXTURE.data.filter((r) => r.type === 'area');
  const radios = [...panel.querySelectorAll('input[type="radio"]')];
  assert.deepEqual(radios.map((r) => r.closest('label').textContent.trim()), [label('EVERYWHERE'), ...areas.map((r) => r.name)]);
  assert.equal(radios[0].checked, true);
  const legends = [...panel.querySelectorAll('legend')].map((l) => l.textContent);
  assert.deepEqual(legends, [label('AREA_LIST_TITLE'), label('CATEGORIES_TITLE')]);
  assert.equal(panel.querySelectorAll('input[type="checkbox"]').length, chips.length);
  const area = areas.find((r) => dests.some((d) => d.area === r.id) && dests.some((d) => d.area !== r.id));
  radios[areas.indexOf(area) + 1].checked = true;
  radios[0].checked = false;
  click(panel.querySelector('.destination-grid-apply'));
  assert.equal(panel.hidden, true);
  assert.deepEqual(names(block), dests.filter((d) => d.area === area.id).slice(0, 16).map((d) => d.name));
  click(toggle);
  click(panel.querySelector('.destination-grid-clear'));
  assert.equal(panel.querySelector('input[type="radio"]').checked, true);
  assert.deepEqual(names(block), dests.slice(0, 16).map((d) => d.name));
  assert.equal(panel.querySelector('.destination-grid-clear').textContent, label('FILTERS_CLEAR_BTN'));
  assert.equal(panel.querySelector('.destination-grid-apply').textContent, label('FILTERS_BTN_APPLY'));
});

test('a picture where the sheet gives one; English labels where it gives none; a missing sheet leaves the block empty', async () => {
  const sheet = { ...FIXTURE, data: FIXTURE.data.filter((r) => r.type !== 'label').map((r, i) => (i === 0 ? { ...r, image: '/pt-pt/destinations/media_1.jpg' } : r)) };
  const block = await place(sheet);
  const img = block.querySelector('.destination-grid-card img');
  assert.equal(img.getAttribute('src'), '/pt-pt/destinations/media_1.jpg');
  assert.equal(img.getAttribute('alt'), '');
  assert.equal(img.getAttribute('loading'), 'lazy');
  assert.equal(block.querySelector('input[type="search"]').getAttribute('placeholder'), DESTINATION_GRID_LABELS.SEARCH_PLACEHOLDER);
  const empty = await place(null);
  assert.equal(empty.querySelector('.destination-grid-card'), null);
  assert.equal(empty.querySelector('.destination-grid-bar'), null);
});

test('the look, scoped to the block: www\'s white cards (24 px corners, soft shadow), GT Flexa titles, the pills', () => {
  const css = fs.readFileSync(new URL('../blocks/destination-grid/destination-grid.css', import.meta.url), 'utf8');
  assert.match(css, /\.destination-grid \.destination-grid-card \{[^}]*border-radius: 24px;[^}]*box-shadow: 0 1px 4px rgb\(0 0 0 \/ 10%\);/);
  assert.match(css, /\.destination-grid \.destination-grid-card h3 \{[^}]*font-family: var\(--heading-font-family\);[^}]*font-weight: 700;/);
  assert.match(css, /@media \(width >= 1024px\) \{[^@]*\.destination-grid \.destination-grid-list \{\s*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  css.replace(/\/\*[\s\S]*?\*\//g, '').split('}').map((r) => r.split('{')[0].trim()).filter((sel) => sel && !sel.startsWith('@'))
    .forEach((sel) => sel.split(/,(?![^(]*\))/).forEach((one) => assert.equal(one.trim().startsWith('.destination-grid'), true, one)));
});

test('row 84: a cover whose _medium rendition Smartvel\'s CDN lacks (New York, Montreal: 403) the ?width=800 one the widget also loads, checked once per URL', async () => {
  const rows = [
    { type: 'destination', id: '1', image: 'https://cdn.smartvel.com/ccpictures/region/ny.jpg_medium' },
    { type: 'destination', id: '2', image: 'https://cdn.smartvel.com/ccpictures/region/faro.jpg_medium' },
    { type: 'destination', id: '3', image: 'https://cdn.smartvel.com/ccpictures/region/ny.jpg_medium' },
    { type: 'chip', id: '10', image: '' },
  ];
  const asked = [];
  const fetcher = async (url) => { asked.push(url); return { ok: !url.includes('ny.jpg_medium'), status: url.includes('ny.jpg_medium') ? 403 : 200 }; };
  const out = await tool.checkImages(rows, fetcher);
  assert.deepEqual(out.map((r) => r.image), ['https://cdn.smartvel.com/ccpictures/region/ny.jpg?width=800', 'https://cdn.smartvel.com/ccpictures/region/faro.jpg_medium', 'https://cdn.smartvel.com/ccpictures/region/ny.jpg?width=800', '']);
  assert.deepEqual(asked, ['https://cdn.smartvel.com/ccpictures/region/ny.jpg_medium', 'https://cdn.smartvel.com/ccpictures/region/faro.jpg_medium'], 'once per URL');
});
