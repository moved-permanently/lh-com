/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop, import/extensions -- dev tooling */
/* TAP's comparison table on the Economy Prime pages (brief 406, R4-8; /pt-pt/a-bordo/economy-prime,
   /en-pt/on-board/economy-prime): www.flytap.com draws it as on its fare pages (Prime and Top Prime
   as card columns from 1024 px, a table that scrolls sideways on phones, ✓ / ✕ icons, the notes as
   (i)s, the legend and notes in a box under it: 1,263 px at 1440, 963 at 390). The import writes a
   table-striped (header) with ✓ / ✕ values, then the legend's H2 and list and the notes' H2 and
   text. On brand tap such a table becomes a fare-comparison block of one table (README: no Group
   and no Cabin rows: no pills, tabs, titles or Compare), the legend and notes its Caption and Notes
   (their headings its label rows) and taken from the page. Another brand's table, a matrix (the
   Club's), a table without ✓ / ✕ or without the legend after it: table-striped as before.
   Run: node --max-old-space-size=512 --test test/tap-comparison-table.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const fixture = (name) => fs.readFileSync(new URL(`./fixtures/tap-comparison/${name}.plain.html`, import.meta.url), 'utf8');
const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.Event = window.Event;
globalThis.Node = window.Node;
globalThis.NodeFilter = { SHOW_TEXT: 4 };
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
// scripts/aem.js reads the location when it is imported
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/', search: '', hash: '', replace: () => {}, href: 'https://tap.turnsthe.page/', origin: 'https://tap.turnsthe.page',
};
window.origin = window.location.origin;
// scripts/aem.js decorateBlock reads classList[0], which linkedom's token list lacks
Object.defineProperty(window.document.documentElement.classList.constructor.prototype, 0, { get() { return [...this][0]; } });

const { comparisonRows, toComparison } = await import('../blocks/table-striped/table-striped-tap.js');
const { default: decorateStriped } = await import('../blocks/table-striped/table-striped.js');
const { default: decorateFare } = await import('../blocks/fare-comparison/fare-comparison.js');
// scripts/aem.js takes the code base from its file URL: the site's root here
window.hlx.codeBasePath = '';

/** The section as decorateSections leaves it: its default content and the block in wrappers. */
function page(html, { brand = 'tap', lang = 'pt', path = '/pt-pt/a-bordo/economy-prime' } = {}) {
  window.location = {
    hostname: 'tap.turnsthe.page', pathname: path, search: '', hash: '', href: `https://tap.turnsthe.page${path}`, origin: 'https://tap.turnsthe.page',
  };
  const { document } = parseHTML(`<!DOCTYPE html><html lang="${lang}"><head><meta name="brand" content="${brand}"></head><body><main><div class="section"></div></main></body></html>`);
  globalThis.document = document;
  const section = document.querySelector('.section');
  const { document: src } = parseHTML(`<!DOCTYPE html><html><body>${html}</body></html>`);
  let wrapper = null;
  [...src.body.children].forEach((node) => {
    const isBlock = node.tagName === 'DIV' && node.className;
    if (isBlock) {
      const w = document.createElement('div');
      w.className = `${node.classList[0]}-wrapper`;
      const block = document.importNode(node, true);
      block.classList.add('block');
      [block.dataset.blockName] = [...node.classList];
      w.append(block);
      section.append(w);
      section.classList.add(`${node.classList[0]}-container`);
      wrapper = null;
      return;
    }
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'default-content-wrapper';
      section.append(wrapper);
    }
    wrapper.append(document.importNode(node, true));
  });
  return { document, section, block: section.querySelector('.table-striped') };
}

test('the rows: the header, the services as authored, Caption and Notes from the page, their headings as label rows', () => {
  const { block } = page(fixture('economy-prime-pt-pt'));
  const found = comparisonRows(block);
  assert.ok(found, 'a comparison table');
  const rows = found.rows.map((r) => r.map((c) => c.replace(/\s+/g, ' ').trim()));
  assert.deepEqual(rows.slice(0, 2), [['Caption label', 'Legenda'], ['Notes label', 'Notas']]);
  assert.deepEqual(rows[2], ['', 'Prime', 'Top Prime']);
  assert.deepEqual(rows[3], ['Bagagem de mão<br><em>Adicionalmente, poderá levar consigo um artigo pessoal.</em>', '1 x 10 kg', '1 x 10 kg']);
  assert.equal(rows.filter((r) => r.length === 3).length, 16, 'the header and 15 services');
  assert.deepEqual(rows[rows.length - 2], ['Caption', '<ul><li>✓ Serviço incluído</li><li>✕ Serviço não incluído</li></ul>']);
  assert.deepEqual(rows[rows.length - 1], ['Notes', '<p>As tarifas aqui apresentadas podem não estar disponíveis em todos os voos TAP.</p>']);
  assert.equal(found.taken.length, 4, 'the two headings, the list and the notes');
});

test('toComparison: a fare-comparison block in the table\'s place; the legend and notes leave the page; the heading above stays', async () => {
  const { section, block } = page(fixture('economy-prime-pt-pt'));
  let loaded = null;
  const result = await toComparison(block, { load: async (b) => { loaded = b; } });
  assert.ok(result && result === loaded, 'the new block is loaded');
  assert.ok(result.classList.contains('fare-comparison') && result.classList.contains('block'));
  assert.equal(result.dataset.blockName, 'fare-comparison');
  assert.ok(result.parentElement.classList.contains('fare-comparison-wrapper'));
  assert.ok(section.classList.contains('fare-comparison-container'));
  assert.equal(section.querySelectorAll('.table-striped').length, 0);
  assert.deepEqual([...section.querySelectorAll('h2')].map((h) => h.textContent), ['Economy Prime'], 'Legenda and Notas only inside the block now');
  assert.equal(section.querySelectorAll('.default-content-wrapper').length, 1, 'the emptied wrapper removed');
  assert.ok([...section.querySelectorAll('ul')].every((u) => result.contains(u)), 'the legend only in the block');
});

test('the fare-comparison of one table: the columns, icons, (i)s and the caption box; no pills, tabs, titles or Compare', async () => {
  const { section, block } = page(fixture('economy-prime-pt-pt'));
  const fc = await toComparison(block, { load: async (b) => decorateFare(b) });
  assert.ok(fc.querySelector('.fare-comparison-groups, .fare-comparison-cabins, .fare-comparison-group-title, .fare-comparison-cabin-title, .fare-comparison-compare, dialog') === null);
  const table = fc.querySelector('table.fare-comparison-table');
  assert.deepEqual([...table.querySelectorAll('thead th')].slice(1).map((th) => [th.dataset.fare, th.querySelector('.fare-comparison-fare').textContent]), [['prime', 'Prime'], ['top-prime', 'Top Prime']]);
  assert.ok(table.querySelector('thead .fare-comparison-fare-cabin') === null, 'no cabin over the fares');
  assert.equal(table.querySelectorAll('tbody tr').length, 15);
  assert.equal(table.querySelectorAll('.fare-comparison-icon[data-mark="yes"]').length, 18);
  assert.equal(table.querySelectorAll('.fare-comparison-icon[data-mark="no"]').length, 2);
  assert.equal(table.querySelectorAll('.fare-comparison-info').length, 6, '4 labels, 2 values');
  const body = fc.querySelector('.fare-comparison-body');
  assert.equal(body.style.getPropertyValue('--fare-comparison-columns'), '2');
  assert.ok(fc.querySelector('.fare-comparison-nav .fare-comparison-next'));
  const caption = fc.querySelector('.fare-comparison-caption');
  assert.equal(caption.hidden, false);
  assert.deepEqual([...caption.querySelectorAll('h2')].map((h) => h.textContent), ['Legenda', 'Notas']);
  assert.deepEqual([...caption.querySelectorAll('li')].map((li) => li.textContent.trim()), ['Serviço incluído', 'Serviço não incluído']);
  assert.match(caption.querySelector('.fare-comparison-notes').textContent, /podem não estar disponíveis/);
  assert.ok(section.contains(fc));
});

test('en-pt: Caption and Notes, www\'s English', async () => {
  const { block } = page(fixture('economy-prime-en-pt'), { lang: 'en', path: '/en-pt/on-board/economy-prime' });
  const fc = await toComparison(block, { load: async (b) => decorateFare(b) });
  assert.deepEqual([...fc.querySelectorAll('.fare-comparison-caption h2')].map((h) => h.textContent), ['Caption', 'Notes']);
  assert.equal(fc.querySelectorAll('tbody tr').length, 15);
});

test('not a comparison table: another brand, a matrix, no ✓ / ✕, no legend after it: table-striped as before', async () => {
  const html = fixture('economy-prime-pt-pt');
  // each page made right before its check (the code reads the current document)
  const cases = [
    ['another brand', () => page(html, { brand: 'lufthansa' })],
    ['matrix', () => page(html.replace('class="table-striped header"', 'class="table-striped header matrix"'))],
    ['no marks', () => page(html.replace(/✓|✕/g, 'x'))],
    ['no legend', () => page(html.replace('<h2 id="legenda">Legenda</h2>', '<h2 id="legenda">Other</h2>').replace(/<ul>[\s\S]*?<\/ul>/, '<p>text</p>'))],
  ];
  for (const [name, make] of cases) {
    if (name !== 'another brand') assert.ok(comparisonRows(make().block) === null, name);
    const { block, section } = make();
    await decorateStriped(block);
    assert.ok(section.querySelector('.table-striped table'), name);
    assert.ok(section.querySelector('.fare-comparison') === null, name);
  }
});

test('table-striped on brand tap hands such a table over', async () => {
  const { section, block } = page(fixture('economy-prime-pt-pt'));
  await decorateStriped(block, { load: async () => {} });
  assert.ok(section.querySelector('.table-striped') === null);
  assert.ok(section.querySelector('.fare-comparison'));
});

test('the README names the one-table form', () => {
  const readme = fs.readFileSync('blocks/fare-comparison/README.md', 'utf8');
  assert.match(readme, /One table \(no `Group`, no `Cabin`\)/);
});

test('phones: the label cell 8px all round (www\'s; the label\'s 12px margin keeps the (i)\'s room), a ✓ in a 24px box (rows 40px as www)', () => {
  const css = fs.readFileSync('blocks/fare-comparison/fare-comparison.css', 'utf8');
  const phone = css.slice(0, css.indexOf('@media (width >= 1024px)'));
  const desktop = css.slice(css.indexOf('@media (width >= 1024px)'));
  const rule = (src, sel) => (src.match(new RegExp(`(?:^|\\n)\\s*${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`)) || [])[1];
  assert.ok(!/padding-right/.test(rule(phone, '.fare-comparison .fare-comparison-table tbody th[scope="row"]')));
  assert.match(rule(phone, '.fare-comparison .fare-comparison-label'), /margin-right: 12px;/);
  assert.match(rule(phone, '.fare-comparison .fare-comparison-table .fare-comparison-icon[data-mark="yes"]'), /margin: 2px;/);
  assert.match(rule(desktop, '.fare-comparison .fare-comparison-table .fare-comparison-icon[data-mark="yes"]'), /margin: 0;/);
});
