/* eslint-disable max-len */
/* Air Dolomiti's booking form: www's "flexible dates" box (parity row 54; capture
   airdolomiti-booking-001). On www the box only sets "flexible" in the JSON its widget sends to
   Air Dolomiti's own api.airdolomiti.it; the form posted to the booking engine (search,
   portalFacts) and the engine's search (flexibility 7) are the same ticked or not. So ours shows
   it as www does and sends nothing: no name, so it is in no submitted data.
   - www's label in the page's language: "Date flessibili +/- 3 giorni", "Flexible dates +/- 3
     days", "im Zeitraum +/- 3 Tage" (Italian otherwise, the site's language); unticked at first;
   - right before the search button (www's order: the fields, the box, the button), its label
     naming it (the input inside the label);
   - the theme: from 1025px a row of its own under the fields (20px under them, 11px above the
     box's edge); below 768px above the button; www's 20px box with a 1px teal ring and a 4px
     radius, teal with a white tick when ticked, the label 14px / 23.8px #1f1f1f 28px in.
   Run: node --max-old-space-size=512 --test test/airdolomiti-flexible-dates.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;

const { default: decorateAirDolomiti } = await import('../blocks/flight-search/flight-search-airdolomiti.js');

const build = () => {
  const block = document.createElement('div');
  block.className = 'flight-search airdolomiti block';
  block.innerHTML = '<form class="flight-search-form"><div class="flight-search-options"><div class="flight-search-passengers"><button type="button" class="flight-search-travellers">1 Passeggero</button></div></div><div class="flight-search-fields"><div class="airport-combobox"><input name="origin" value="MUC"></div><fieldset class="flight-search-dates"><input name="departure" value="2026-11-28"></fieldset><button type="submit" class="flight-search-submit">Cerca</button></div></form>';
  document.body.replaceChildren(block);
  return block;
};

test('the box with www\'s label in the page\'s language, unticked, right before the search button', () => {
  [['it', 'Date flessibili +/- 3 giorni'], ['en', 'Flexible dates +/- 3 days'], ['de', 'im Zeitraum +/- 3 Tage'], ['fr', 'Date flessibili +/- 3 giorni']].forEach(([lang, text]) => {
    const block = build();
    const form = block.querySelector('form');
    decorateAirDolomiti(block, { form, lang });
    const label = form.querySelectorAll('label.flight-search-flexible');
    assert.equal(label.length, 1, lang);
    assert.equal(label[0].querySelector('.flight-search-flexible-label').textContent, text);
    const input = label[0].querySelector('input');
    assert.equal(input.type, 'checkbox');
    assert.ok(!input.checked && !input.hasAttribute('checked'), 'unticked');
    assert.ok(label[0].nextElementSibling === form.querySelector('.flight-search-submit'), "label[0].nextElementSibling === form.querySelector('.flight-search-submit')");
  });
});

test('it sends nothing: no name (in no submitted data), ticking it changes no other field', () => {
  const block = build();
  const form = block.querySelector('form');
  decorateAirDolomiti(block, { form, lang: 'it' });
  const input = form.querySelector('.flight-search-flexible input');
  assert.equal(input.hasAttribute('name'), false);
  const named = () => [...form.querySelectorAll('[name]')].map((n) => [n.getAttribute('name'), n.value]);
  const before = named();
  input.checked = true;
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.deepEqual(named(), before);
});

test('the theme: www\'s box, its row under the fields from 1025px, above the button below 768px', () => {
  const css = fs.readFileSync('styles/themes/airdolomiti.css', 'utf8');
  const F = 'body.brand-airdolomiti .flight-search .flight-search-flexible';
  const rule = (sel, from = 0) => {
    const i = css.indexOf(`${sel} {`, from);
    assert.ok(i >= 0, `rule ${sel}`);
    return css.slice(i, css.indexOf('}', i));
  };
  const label = rule(F);
  assert.match(label, /padding-left: 28px;/);
  assert.match(label, /color: #1f1f1f;/);
  assert.match(label, /font-size: 14px;/);
  assert.match(label, /line-height: 23\.8px;/);
  const mark = rule(`${F} .flight-search-flexible-mark`);
  assert.match(mark, /width: 20px;/);
  assert.match(mark, /height: 20px;/);
  assert.match(mark, /border: 1px solid #00798a;/);
  assert.match(mark, /border-radius: 4px;/);
  assert.match(rule(`${F} input:checked ~ .flight-search-flexible-mark`), /background-color: #00798a;/);
  assert.match(rule(`${F}:has(input:focus-visible)`), /outline: 2px solid/);
  // from 1025px: the grid's row "flex" under the fields (20px), 11px to the box's edge
  assert.match(css, /". origin dest dep ret trav submit \." auto\n\s+"\. \. \. \. \. \. \. \." 20px\n\s+"\. flex flex flex flex flex flex \." auto\n\s+"\. \. \. \. \. \. \. \." 11px/);
  assert.match(css, /\.flight-search-form::before \{\n\s+content: "";\n\s+grid-area: 2 \/ 1 \/ 7 \/ -1;/);
  assert.match(css, /body\.brand-airdolomiti \.flight-search:not\(\.standalone\) \.flight-search-flexible \{\n\s+grid-area: flex;/);
  // 768px to 1024px: the free cell under From and To (the shared grid's other items where they were)
  assert.match(css, /@media \(width >= 768px\) and \(width < 1025px\) \{\n\s+body\.brand-airdolomiti \.flight-search \.flight-search-flexible \{\n\s+grid-area: 2 \/ 1 \/ 3 \/ 4;/);
  // below 768px: its row above the button
  assert.match(css, /"trav nonstop"\n\s+"flex flex"\n\s+"submit submit"/);
});
