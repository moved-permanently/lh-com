/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 57 of 2026-11-18/19 (ema-adobe), the collapse:
   item 5: a section the collapse splits keeps its market in the documents' own form too, the Section Metadata row
     "Markets" (the importers' output and DA's copies; 06bb987 covered the served form, data-markets, only);
   item 6a: a link list's layout marker ({links-horizontal|responsive|vertical}, last item of the list) is the section style of
     that name, in a block its block option (a bare one stayed a marker; beside a column mark it went without a carrier:
     /de/en/data-collection-canada, ema-test's order 59);
   item 6b: a marker's element loses its trailing white space, a no-break space too ("…wurde.&nbsp; {small}": the entity a
     text node of its own; lh-edge drops it).
   Run: node --max-old-space-size=256 --test test/collapse-leftovers-adobe-so57.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';

const run = (html, path = '/de/en/x') => collapseHtml(html, {
  path, brand: 'lufthansa', parse: parseHTML, force: true,
}).html;
const MARKER = /\{[a-z][^}]*\}/;
const sections = (html) => {
  const { document } = parseHTML(`<html><body><main>${html}</main></body></html>`);
  return [...document.querySelector('main').children];
};
const marketOf = (s) => {
  const row = [...s.querySelectorAll(':scope > .section-metadata > div')].find((r) => r.children[0] && r.children[0].textContent.trim() === 'Markets');
  return row ? row.children[1].textContent.trim() : null;
};

test('item 5: the parts of a section with a Markets row keep the row; a section for every market splits without one', () => {
  const out = sections(run('<div><h1>T</h1><p>a</p><p>{column-start}</p><h2>Book</h2><p>b</p><p>{column-end}</p><h2>More</h2><p>c</p><div class="section-metadata"><div><div>Markets</div><div>-de</div></div></div></div><div><p>all</p></div>'));
  assert.ok(out.length > 2, String(out.length));
  out.slice(0, -1).forEach((s) => assert.equal(marketOf(s), '-de', s.outerHTML));
  assert.equal(marketOf(out[out.length - 1]), null);
  const plain = sections(run('<div><h1>T</h1><p>a</p><p>{column-start}</p><h2>Book</h2><p>b</p><p>{column-end}</p><h2>More</h2><p>c</p></div>'));
  plain.forEach((s) => assert.equal(marketOf(s), null));
});

test('item 6a: a link list layout is a section style, in a block a block option; no marker left', () => {
  const bare = run('<div><h2>T</h2><ul><li><a href="/a">A</a></li><li><a href="/b">B</a> {links-vertical}</li></ul></div>');
  assert.ok(!MARKER.test(bare), bare);
  assert.ok(/<div>Style<\/div><div>links-vertical<\/div>/.test(bare), bare);
  const withMark = run('<div><h2>T</h2><p>{column-start-outer}</p><ul><li><a href="/a">A</a></li><li><a href="/b">B</a> {links-vertical column-end-outer}</li></ul><h2>Next</h2><p>x</p></div>');
  assert.ok(!MARKER.test(withMark), withMark);
  assert.ok(/links-vertical/.test(withMark), 'kept beside a column mark');
  const inBlock = run('<div><div class="columns-media"><div><div><ul><li><a href="/a">A</a></li><li><a href="/b">B</a> {links-horizontal}</li></ul></div></div></div></div>');
  assert.ok(/class="columns-media links-horizontal"/.test(inBlock), inBlock);
});

test('item 6b: no trailing no-break space after the marker goes; one between words stays', () => {
  const app = run('<div><p>Text <i>Buch</i>, wurde.&nbsp; {small}</p><p>Next</p></div>', '/content/mobile/lh/de/content-pages/x');
  assert.ok(app.includes('wurde.</p>'), app);
  assert.ok(run('<div><p>Small print here.&nbsp; {copytext-small}</p><p>Text</p></div>').includes('here.</p>'));
  assert.ok(/A(&#160;|&nbsp;|\u00a0)B<\/p>/.test(run('<div><p>A&nbsp;B {copytext-small}</p><p>T</p></div>')));
});

test('the page: a links-… section style or block option gives the link lists their class; other lists none (item 6a)', async () => {
  const { document } = parseHTML('<html><body><main><div class="links-vertical"><h2>T</h2><ul><li><a href="/a">A</a></li><li><a href="/b">B</a></li></ul><ul><li>plain text item</li></ul></div><div><div class="columns-media links-horizontal"><div><div><ul><li><a href="/c">C</a></li></ul></div></div></div></div></main></body></html>');
  globalThis.document = document;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand: 'lufthansa', path: '/de/en/data-collection-canada', read: () => '' });
  const [links, plain] = main.querySelectorAll(':scope > div:first-child > ul');
  assert.ok(links.classList.contains('links-vertical'), main.innerHTML);
  assert.equal(plain.className, '');
  assert.ok(main.querySelector('.columns-media ul').classList.contains('links-horizontal'));
});

test('item 4: a Divider block takes its space as an option (m, l) with its width option; the plain one as before', async () => {
  const { readPurposeBlock, SPACE, DIVIDER_SPACE } = await import('../scripts/style-markers.js');
  assert.equal(readPurposeBlock('divider', []).px, DIVIDER_SPACE);
  assert.equal(readPurposeBlock('divider', ['l', 'from-768']).px, SPACE.l);
  assert.ok(readPurposeBlock('divider', ['l', 'from-768']).fromTablet);
  assert.equal(readPurposeBlock('divider', ['m', 'below-768']).px, SPACE.m);
  const { document } = parseHTML('<html><body><main><div><p>a</p><div class="divider l from-768"><div><div></div></div></div><div class="divider m below-768"><div><div></div></div></div><h2>B</h2></div></main></body></html>');
  globalThis.document = document;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand: 'lufthansa', path: '/de/en/shopping', read: () => '' });
  const seps = [...main.querySelectorAll('p.spacer.divider')];
  // the page's sizes (the switch branch: lufthansa.com's own M, from 768 px its own too)
  const { themeFor } = await import('../scripts/style-markers.js');
  const own = themeFor('lufthansa').space || {};
  const l768 = (own.from768 && own.from768.l) || own.l || SPACE.l;
  const m = own.m || SPACE.m;
  assert.deepEqual(seps.map((p) => [p.style.getPropertyValue('--spacer-size'), p.classList.contains('from-768'), p.classList.contains('below-768')]), [[`${l768}px`, true, false], [`${m}px`, false, true]], main.innerHTML);
});

test('item 2(d): a small separator between a chapter and the next heading in a Columns Media cell is the option chapters; drawn 25 px before each such heading', async () => {
  const out = run('<div><div class="columns-media padded"><div><div><h2>Lufthansa</h2><p>a</p><p>{spacer-25}</p><h2>Austrian</h2><p>b</p></div></div></div></div>', '/de/en/terms-of-service-group');
  assert.ok(/class="columns-media padded chapters"/.test(out), out);
  assert.ok(!MARKER.test(out));
  assert.ok(!/chapters/.test(run('<div><div class="columns-media"><div><div><p>a</p><p>{spacer-24}</p><p>b</p></div></div></div></div>')), 'between paragraphs: as before');
  const { document } = parseHTML('<html><body><main><div><div class="columns-media chapters"><div><div><h2>Lufthansa</h2><p>a</p><h2>Austrian</h2><p>b</p><h3>Sub</h3></div></div></div></div></main></body></html>');
  globalThis.document = document;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand: 'lufthansa', path: '/de/en/terms-of-service-group', read: () => '' });
  const cell = main.querySelector('.columns-media > div > div');
  assert.deepEqual([...cell.children].map((e) => (e.matches('p.spacer') ? `sp${e.style.getPropertyValue('--spacer-size')}` : e.tagName)), ['H2', 'P', 'sp25px', 'H2', 'P', 'sp25px', 'H3'], cell.innerHTML);
});

test('a split keeps a separator style at its end: above on the first part, below moved to the last (Style row and class form)', () => {
  const styleOf = (s) => {
    const row = [...s.querySelectorAll(':scope > .section-metadata > div')].find((r) => r.children[0] && r.children[0].textContent.trim() === 'Style');
    return row ? row.children[1].textContent.split(',').map((x) => x.trim()) : [];
  };
  const out = sections(run('<div><p>{column-start}</p><h2>A</h2><p>a</p><p>{column-end}</p><h2>B</h2><p>b</p><div class="section-metadata"><div><div>Style</div><div>grey, space-m, space-below-l-768</div></div></div></div>'));
  assert.equal(out.length, 2, out.map((s) => s.outerHTML).join('\n'));
  assert.ok(styleOf(out[0]).includes('space-m') && !styleOf(out[0]).includes('space-below-l-768'), styleOf(out[0]).join());
  assert.ok(styleOf(out[1]).includes('space-below-l-768') && !styleOf(out[1]).includes('space-m'), styleOf(out[1]).join());
  assert.ok(styleOf(out[1]).includes('grey'), 'the other styles go with the part');
  const served = sections(run('<div class="space-below-l-768 space-below-m-below-768"><h1>T</h1><p>intro</p><p>{column-start}</p><h2>A</h2><p>a</p><p>{column-end}</p><h2>B</h2><p>b</p></div>', '/de/en/hotel-offers'));
  assert.ok(!served[0].classList.contains('space-below-l-768'), served[0].className);
  assert.ok(served[served.length - 1].classList.contains('space-below-l-768') && served[served.length - 1].classList.contains('space-below-m-below-768'));
});
