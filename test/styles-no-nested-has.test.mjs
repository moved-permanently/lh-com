/* No selector in styles/ (styles.css, the brand themes, every stylesheet there) has a :has() inside
   a :has(): browsers don't allow it, and since :has() is unforgiving the whole rule is dropped (found
   by ema-test, tools/reports/offline-2026-11-06/ema-test.md item 3; its guard for the B2B theme is
   test/b2b-parity-427.test.mjs). styles.css had seven such selectors (the table-striped sections
   after a band, the picture before a block).
   Run: node --test test/styles-no-nested-has.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const dir = new URL('../styles/', import.meta.url);
const files = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) return files(p);
  return e.name.endsWith('.css') ? [p] : [];
});

/** The selectors (rule preludes) of a stylesheet with a :has() inside a :has(). */
export function nestedHas(source) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = css.split('{').map((sel) => sel.split(/[};]/).pop().trim()).filter(Boolean);
  return selectors.filter((sel) => {
    const stack = [];
    for (let i = 0; i < sel.length; i += 1) {
      if (sel.startsWith(':has(', i)) {
        if (stack.includes(true)) return true;
        stack.push(true);
        i += 4;
      } else if (sel[i] === '(') stack.push(false);
      else if (sel[i] === ')') stack.pop();
    }
    return false;
  });
}

test('the guard finds a nested :has() and lets a flat one pass', () => {
  assert.equal(nestedHas('a:has(> b:has(c)) { x: 1 }').length, 1);
  assert.equal(nestedHas('a:has(> b):has(+ c) { x: 1 } a:is(.b, :has(c)) { y: 2 }').length, 0);
});

test('no stylesheet in styles/ has a :has() inside a :has()', () => {
  const found = files(dir.pathname).flatMap((f) => nestedHas(fs.readFileSync(f, 'utf8')).map((s) => `${path.relative(dir.pathname, f)}: ${s}`));
  assert.deepEqual(found, []);
});

// the seven rules browsers dropped, rewritten without the nesting (two :has() side by side; the
// :is() of :has() at the top), on lufthansa.com only: the other brands render as before (the rules
// never applied); www's 40 px from a picture to the block after it (/de/en/lh-rentalcar, ours 24)
// and the fleet's "Technical data" 38 / 70 / 87 px (www 48 / 89 / 96 px of ink, /de/en/359)
test('the rewritten rules, scoped to lufthansa.com', () => {
  const css = fs.readFileSync(new URL('styles.css', dir), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const TABLE = 'body.brand-lufthansa main > .section + .section.table-striped-container:has(> .default-content-wrapper:first-child > h2:only-child):has(> .default-content-wrapper:first-child + .table-striped-wrapper:last-child)';
  [['-10px', ''], ['70px', '@media (width >= 768px)'], ['87px', '@media (width >= 1025px)']].forEach(([v, media]) => {
    assert.ok(css.includes(`${TABLE} { margin-top: ${v}; }`), v);
    if (media) assert.ok(css.indexOf(`${TABLE} { margin-top: ${v}; }`) > css.indexOf(media), media);
  });
  assert.ok(css.includes('body.brand-lufthansa main > .section.grey + .section.table-striped-container:has(> .default-content-wrapper:first-child > h2:only-child):has(> .default-content-wrapper:first-child + .table-striped-wrapper:last-child) { margin-top: 76px; }'));
  const PIC = '.default-content-wrapper:is(:has(> p:last-child:not(.column-end, .column-end-outer) > picture), :has(> p:last-child:not(.column-end, .column-end-outer) > a > picture)) + div:not(.default-content-wrapper)';
  assert.ok(css.includes(`body.brand-lufthansa main:has(.column-start, .column-start-outer) > .section > ${PIC}, body.brand-lufthansa.flow-spacing main > .section > ${PIC} { margin-top: 40px; }`));
});
