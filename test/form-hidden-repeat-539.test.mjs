/* eslint-disable max-len */
/* The brief after 534, item 2 (Brussels' /be/en/contact/feedback/general/other, brussels-parity-004): www's repeatable
   section "Additional passengers" (div#subsection-additionalPassengers.forms-repeatable-section.collapse) is hidden until
   its checkbox "Show additional passengers" (data-target) is checked; ours showed Passenger 1 at once (+466 px at 1440):
   the parser gave a repeatable section no hidden rule and the block's checkbox toggles only reached plain sub-sections.
   And www's "this account is an Euro account" is checked at load (maui-checkbox checked); ours was not.
   - parser (tools/importer/parsers/form-core.js): a collapsed repeatable section's fieldset row gets the rule hidden; a
     checked checkbox's option ends in {selected} (the block's preselect mark)
   - block (blocks/form/form.js): a repeatable section with the rule hidden starts hidden as a whole, and a checkbox's
     toggles show it (copy 1, the add link) and hide and clear it again; repeatable sections without it as before.
   DOM nodes are compared with assert.ok(a === b) only. Run: node --max-old-space-size=512 --test test/form-hidden-repeat-539.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
const host = 'brussels.turnsthe.page';
window.location = {
  hostname: host, pathname: '/be/en/contact/feedback/general/other', search: '', hash: '', origin: `https://${host}`, href: `https://${host}/be/en/contact/feedback/general/other`,
};
window.origin = `https://${host}`;
globalThis.Event = window.Event;
globalThis.CSS = { escape: (v) => String(v) };
const F = await import('../blocks/form/form.js');
const { default: parse } = await import('../tools/importer/parsers/form-core.js');

const row = (cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
const lines = (...l) => l.map((x) => `<p>${x}</p>`).join('');
const table = (repeatRules) => [
  ['Label', 'Type', 'Name', 'Required', 'Options', 'Help text', 'Placeholder', 'Validation message', 'Constraint message', 'Rules'],
  ['Additional Passengers', 'checkbox', 'areAdditionalPassengers', '', 'true=Show additional passengers', '', '', '', '', 'toggles=additionalPassengers'],
  ['Passenger {n}', 'fieldset', 'additionalPassengers', '', '', '', '', '', '', lines('repeat=3', 'add=Add Additional Passenger', 'remove=Delete Passenger', 'remaining=You can add {n} more', ...repeatRules)],
  ['First name', 'text', 'AAPFirstName', 'yes', '', '', '', 'Please enter a first name', '', ''],
  ['', 'end', '', '', '', '', '', '', '', ''],
  ['Account Currency', 'checkbox', 'Euro', '', 'true=this account is an Euro account {selected}', '', '', '', '', ''],
  ['Send', 'submit', '', '', '', '', '', '', '', ''],
].map(row).join('');

function form(repeatRules) {
  globalThis.fetch = async () => new Response('{}', { status: 404 });
  const { document } = parseHTML(`<!DOCTYPE html><html><head><meta name="brand" content="brussels"></head><body><div class="form core">${table(repeatRules)}</div></body></html>`);
  globalThis.document = document;
  const block = document.querySelector('.form');
  F.default(block);
  return block;
}
const repeatHost = (b) => b.querySelector('.form-repeat');
const visibleCopies = (b) => [...b.querySelectorAll('.form-repeat fieldset.form-subsection')].filter((f) => !f.hidden).length;
const box = (b, name) => b.querySelector(`input[type="checkbox"][name="${name}"]`);
const check = (b, name, on) => {
  const c = box(b, name);
  c.checked = on;
  c.dispatchEvent(new window.Event('change', { bubbles: true }));
};

test('a hidden repeatable section waits for its checkbox, shows copy 1 with it and hides again', () => {
  const b = form(['hidden']);
  assert.ok(repeatHost(b).hidden, 'hidden at load');
  check(b, 'areAdditionalPassengers', true);
  assert.ok(!repeatHost(b).hidden, 'the checkbox shows it');
  assert.equal(visibleCopies(b), 1, 'copy 1, the others behind the add link');
  // (clearing is resetControls, as for any hidden section; linkedom's value setter also writes defaultValue)
  check(b, 'areAdditionalPassengers', false);
  assert.ok(repeatHost(b).hidden, 'hidden again');
  assert.ok(repeatHost(b).closest('[hidden]'), 'its fields are skipped as in any hidden section');
});

test('a repeatable section without the rule as before; a {selected} checkbox is checked at load', () => {
  const b = form([]);
  assert.ok(!repeatHost(b).hidden);
  assert.equal(visibleCopies(b), 1);
  assert.ok(box(b, 'Euro').checked);
  assert.ok(!box(b, 'areAdditionalPassengers').checked);
});

test('the parser: a collapsed repeatable section gets hidden, a checked box {selected}', () => {
  globalThis.WebImporter = {
    Blocks: {
      createBlock(doc, { cells }) {
        const t = doc.createElement('table');
        t.setAttribute('data-name', 'form');
        cells.forEach((r) => {
          const tr = doc.createElement('tr');
          r.forEach((c) => {
            const td = doc.createElement('td');
            if (Array.isArray(c)) c.forEach((n) => td.append(n)); else if (c) td.append(typeof c === 'string' ? doc.createTextNode(c) : c);
            tr.append(td);
          });
          t.append(tr);
        });
        return t;
      },
    },
  };
  const repeat = (cls, name) => `<div id="subsection-${name}" class="forms-repeatable-section ${cls}"><fieldset><legend>Passenger 1</legend><div class="text"><div class="cmp-form-text"><maui-input label="First name" name="AAPFirstName_1" type="text"></maui-input></div></div></fieldset><fieldset class="d-none"><legend>Passenger 2</legend><div class="text"><div class="cmp-form-text"><maui-input label="First name" name="AAPFirstName_2" type="text"></maui-input></div></div></fieldset><button class="btn-link forms-repeat-add">Add Additional Passenger</button></div>`;
  const checkbox = (name, label, checked) => `<div class="options"><div data-cmp-type="checkbox"><h3 class="form-group-headline">Heading</h3><maui-checkbox-group><maui-checkbox label="${label}" type="checkbox" name="${name}" value="true"${checked ? ' checked=""' : ''}></maui-checkbox></maui-checkbox-group></div></div>`;
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="form-wrapper"><form class="cmp-form" action="https://www.brusselsairlines.com/content/bel/markets/be/en/contact/feedback/general/other.html">${repeat('collapse', 'additionalPassengers')}${repeat('', 'bankDetails')}${checkbox('Euro_x', 'this account is an Euro account', true)}${checkbox('other', 'Other', false)}</form></div></main></body></html>`);
  parse(document.querySelector('.form-wrapper'), { document, url: 'https://www.brusselsairlines.com/be/en/contact/feedback/general/other' });
  const rows = [...document.querySelectorAll('table[data-name] tr')].map((tr) => [...tr.children].map((td) => td.textContent.trim()));
  const sets = rows.filter((r) => r[1] === 'fieldset');
  assert.match(sets.find((r) => r[2] === 'additionalPassengers')[9], /hidden$/);
  assert.doesNotMatch(sets.find((r) => r[2] === 'bankDetails')[9], /hidden/);
  assert.match(rows.find((r) => r[2] === 'Euro_x')[4], /^true=this account is an Euro account \{selected\}$/);
  assert.match(rows.find((r) => r[2] === 'other')[4], /^true=Other$/);
});
