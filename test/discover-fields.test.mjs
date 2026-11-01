/* Discover's fields as www.discover-airlines.com draws them (www's maui-select, measured
   2026-11-01: 50px high, pill radius, 1px rgba(0, 62, 123, 0.8) border, #e9f2fb fill, 18px/24px
   dark sky blue, the label inside; a filled field's label 12px at the top):
   styles/themes/discover.css, the only stylesheet only Discover loads (scripts/brand.js). Every
   field rule is scoped to body.brand-discover, so no other brand (lh-com, ITA, Austrian, Brussels,
   Cargo, Air Dolomiti) can pick one up, and it beats the blocks' own rules, which load later.
   Blocks: security-waiting-time (the airport select), flight-search (origin, destination, the
   dates), search-results (the search box), form (inputs, selects, textareas).
   Run: node --max-old-space-size=512 --test test/discover-fields.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8');
const section = css.slice(css.indexOf('/* fields'));

/** The selectors of a selector list, split on the commas outside parentheses. */
function selectorList(list) {
  const out = [];
  let depth = 0;
  let cur = '';
  [...list].forEach((c) => {
    if (c === '(') depth += 1;
    if (c === ')') depth -= 1;
    if (c === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += c;
  });
  out.push(cur.trim());
  return out.filter(Boolean);
}

// the section's rules (comments removed, @media unwrapped)
const rules = section.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@media[^{]*\{/g, '')
  .split('}')
  .map((r) => r.split('{')[0].trim())
  .filter(Boolean);

test('a fields section with www\'s field values', () => {
  assert.ok(css.includes('/* fields'), 'a fields section');
  ['50px', '#e9f2fb', 'rgb(0 62 123 / 80%)', '9999px']
    .forEach((v) => assert.ok(section.includes(v), v));
});

test('every field rule is scoped to body.brand-discover', () => {
  assert.ok(rules.length > 10, `${rules.length} rules`);
  rules.flatMap(selectorList)
    .forEach((s) => assert.ok(s === 'body.brand-discover' || s.startsWith('body.brand-discover '), s));
});

test('the four blocks\' fields are covered', () => {
  const all = rules.join('\n');
  ['.security-waiting-time-select', '.airport-combobox input', '.flight-search-dates',
    '.search-results-form', '.form-control'].forEach((s) => assert.ok(all.includes(s), s));
});
