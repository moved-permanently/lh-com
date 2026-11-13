/* eslint-disable max-len */
/* Standing order 12 of 2026-11-13, item 3: order 11's rule (discover.css, from 768 px 54 px under a page-ending flight
   search) never applied on the page: blocks/flight-search/flight-search.css sets the section's margin-bottom to 0 with
   `body.appear main > .section.flight-search-container:has(.flight-search.standalone)`, of the same specificity (0,5,2),
   and the block's sheet comes after the theme's, so it won (measured on our host: margin-bottom 0, flight-search de/de
   1440 still 22.13; order 11's 13.83 came from a trial appended after every sheet). The rule now names the section's
   class, (0,6,2), above every flight-search.css rule that sets that section's margin-bottom.
   Run: node --test test/discover-flight-search-end-so12.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const theme = strip(fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8'));
const block = strip(fs.readFileSync(new URL('../blocks/flight-search/flight-search.css', import.meta.url), 'utf8'));

/** split on a separator at depth 0 of the parentheses */
const top = (s, sep) => {
  const out = [];
  let depth = 0;
  let cur = '';
  [...s].forEach((c) => {
    if (c === '(') depth += 1;
    if (c === ')') depth -= 1;
    if (c === sep && depth === 0) { out.push(cur); cur = ''; } else cur += c;
  });
  out.push(cur);
  return out.map((x) => x.trim());
};
const add = (a, b) => a.map((x, i) => x + b[i]);
const max = (list) => list.reduce((m, s) => (s[0] - m[0] || s[1] - m[1] || s[2] - m[2]) > 0 ? s : m, [0, 0, 0]);
/** selector specificity [ids, classes, types] (Selectors 4: :is/:not/:has their most specific argument, :where 0) */
function specificity(sel) {
  let s = [0, 0, 0];
  let rest = sel;
  while (rest.length) {
    let m;
    if ((m = rest.match(/^:(is|not|has|where)\(/))) {
      let depth = 1;
      let i = m[0].length;
      while (depth) { if (rest[i] === '(') depth += 1; if (rest[i] === ')') depth -= 1; i += 1; }
      const inner = rest.slice(m[0].length, i - 1);
      if (m[1] !== 'where') s = add(s, max(top(inner, ',').map((x) => specificity(x.replace(/^[>+~]\s*/, '')))));
      rest = rest.slice(i);
    } else if ((m = rest.match(/^#[\w-]+/))) { s = add(s, [1, 0, 0]); rest = rest.slice(m[0].length); }
    else if ((m = rest.match(/^(\.[\w-]+|\[[^\]]*\]|:[\w-]+(\([^)]*\))?)/))) { s = add(s, [0, 1, 0]); rest = rest.slice(m[0].length); }
    else if ((m = rest.match(/^(::[\w-]+|[a-zA-Z][\w-]*)/))) { s = add(s, [0, 0, 1]); rest = rest.slice(m[0].length); }
    else rest = rest.slice(1);
  }
  return s;
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

test('specificity helper', () => {
  assert.deepEqual(specificity('body.appear main > .section.flight-search-container:has(.flight-search.standalone)'), [0, 5, 2]);
  assert.deepEqual(specificity('body.brand-discover main > .section:last-child:has(> .flight-search-wrapper:last-child)'), [0, 5, 2]);
  assert.deepEqual(specificity(':where(.a) b:is(.c, #d)'), [1, 0, 1]);
});

const OURS = 'body.brand-discover main > .section.flight-search-container:last-child:has(> .flight-search-wrapper:last-child)';

test('Discover from 768 px: 54 px under a page-ending flight search, named so it outranks flight-search.css', () => {
  assert.ok(theme.includes(`@media (width >= 768px) { ${OURS} { margin-bottom: 54px; } }`));
  assert.ok(!theme.includes('body.brand-discover main > .section:last-child:has(> .flight-search-wrapper:last-child)'));
  // every flight-search.css rule setting the flight-search section's margin-bottom from 768 px (not the phone-only ones)
  const wide = block.replace(/@media \(width < 768px\) \{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  assert.ok(wide.length < block.length);
  const rules = [...wide.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, , body]) => /(^|;)\s*margin(-bottom)?\s*:/.test(body))
    .flatMap(([, sel]) => top(sel.replace(/^.*@media[^{]*$/, '').trim(), ','))
    .filter((sel) => /\.section\.flight-search-container(:has\([^)]*\))?$/.test(sel) || /\.section\.flight-search-container:has\(.*\)$/.test(sel));
  assert.ok(rules.some((sel) => sel.includes(':has(.flight-search.standalone)')), 'the standalone rule is among them');
  rules.forEach((sel) => assert.ok(cmp(specificity(OURS), specificity(sel)) > 0, `${OURS} outranks ${sel}`));
});
