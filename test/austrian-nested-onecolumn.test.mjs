/* eslint-disable max-len, import/extensions -- dev tooling */
/* Austrian's QR code and store badge pair (/at/en/austrian-app, parity row 39, brief 438): www puts the two
   pictures (wide PNGs, the QR code and badge at their left) in a two-column view, inside a one-column view that
   sits in another one-column view's item. lh-com's info importer maps a two-column view one level into a
   one-column view (":is(.section-content, .container-content) > .onecolumn > … > .column-view-item >
   .twocolumn") into columns-media; one level deeper it was left to the text flow, where the pictures stacked
   at full width (+1,438 px). withNestedOnecolumnUnwrapped: a one-column view in a one-column view's item, with
   no band of its own (its column view only "column-view flex-column"), gives its item's content to the outer
   item. String-based, the rest of the snapshot as it was.
   Run: node --max-old-space-size=512 --test test/austrian-nested-onecolumn.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const one = (inner, view = 'column-view flex-column') => `<div class="onecolumn column event"><div class="${view}"><div class="row"><div class="col-lg column-view-item">${inner}</div></div></div></div>`;
const pair = '<div class="twocolumn column event"><div class="column-view  flex-column"><div class="row"><div class="col-md-6 col-lg column-view-item"><div class="image">A</div></div><div class="col-md-6 col-lg column-view-item"><div class="image">B</div></div></div></div></div>';

test('a plain one-column view in a one-column view\'s item gives the outer item its content', async () => {
  const { withNestedOnecolumnUnwrapped } = await import('../tools/importer/austrian-import.mjs');
  const html = `<div class="section-content">${one(`<div class="text">T</div>\n${one(`<div class="headline">H</div>${pair}`)}`)}</div>`;
  assert.equal(withNestedOnecolumnUnwrapped(html), `<div class="section-content">${one(`<div class="text">T</div>\n<div class="headline">H</div>${pair}`)}</div>`);
});

test('a nested one-column view with a band of its own, or one at the top, stays', async () => {
  const { withNestedOnecolumnUnwrapped } = await import('../tools/importer/austrian-import.mjs');
  const band = `<div class="section-content">${one(one(pair, 'column-view bg-gray flex-column'))}</div>`;
  assert.equal(withNestedOnecolumnUnwrapped(band), band);
  const top = `<div class="section-content">${one(pair)}${one('<div class="text">T</div>')}</div>`;
  assert.equal(withNestedOnecolumnUnwrapped(top), top);
  const inTwo = `<div class="section-content"><div class="twocolumn"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item">${one(pair)}</div></div></div></div></div>`;
  assert.equal(withNestedOnecolumnUnwrapped(inTwo), inTwo, 'only in a one-column view');
});

test('the snapshot of /at/en/austrian-app: the QR pair\'s two-column view one level into the one-column view', async (t) => {
  const f = new URL('../tools/importer/bd-snapshots/www.austrian.com/at/en/austrian-app.html', import.meta.url);
  if (!fs.existsSync(f)) { t.skip('no snapshot'); return; }
  const { withNestedOnecolumnUnwrapped } = await import('../tools/importer/austrian-import.mjs');
  const out = withNestedOnecolumnUnwrapped(fs.readFileSync(f, 'utf8'));
  const i = out.indexOf('data-identifier="twocolumn_1687551182"');
  assert.ok(i > 0);
  // its open ancestors' classes, nearest last
  const stack = [];
  [...out.slice(0, i).matchAll(/<(\/?)div\b([^>]*)>/g)].forEach((m) => {
    if (m[1]) stack.pop(); else stack.push((m[2].match(/class="([^"]*)"/) || [])[1] || '');
  });
  const chain = stack.slice(-6).map((c) => c.split(/\s+/)[0] || '-');
  // the two-column view's own start tag is open last; above it the one outer view's item, row, view, onecolumn, section content
  assert.deepEqual(chain, ['section-content', 'onecolumn', 'column-view', 'row', 'col-lg', 'twocolumn']);
});

test('the import reads the snapshot with it', () => {
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /withoutLoads\(withNestedOnecolumnUnwrapped\(withPanelWrappersUnwrapped\(/);
});
