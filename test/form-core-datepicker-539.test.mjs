/* eslint-disable max-len */
/* The brief after 534, item 2 (the two form pages): www's older date field in a core form, a text input with the jQuery
   date picker (div.input > label + input.forms-datepicker, the format in a hidden date-format input: "dd/mm/yy"), had no
   row: Brussels' /be/en/contact/feedback/general/other lost its "Flight Date" in every flight (brussels-parity-004), as
   do emergency-contact and charter there and 64 SWISS form snapshots. It becomes a date row: its label, base name, the
   required mark and messages as the other fields, the mask from the date format (dd/mm/yy -> DD/MM/YYYY, dd.mm.yy ->
   DD.MM.YYYY). Markup: the recording of www.brusselsairlines.com/be/en/contact/feedback/general/other (1440), trimmed.
   Run: node --max-old-space-size=256 --test test/form-core-datepicker-539.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import parse from '../tools/importer/parsers/form-core.js';

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', 'form');
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
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

const picker = ({
  name = 'depDayScheduled_1', format = 'dd/mm/yy', wrap = '', req = '',
} = {}) => `<div class="text aem-GridColumn"><div class="cmp-form-text"${wrap}><div class="input show-feedback"><div class="input-wrapper"><label for="form-text-77532456_1">Flight Date</label><div class="input-border-wrapper forms-datepicker-wrapper"><input autocomplete="off" data-cmp-hook-form-text="input" placeholder="Flight Date" id="form-text-77532456_1" class="datepicker form-input forms-datepicker forms-input-enhancer hasDatepicker" name="${name}" type="text" pattern="^\\d{2}[./-]\\d{2}[./-]\\d{4}$"${req}><input type="hidden" name="date-format" id="date-format-form-text-77532456" value="${format}"></div><span class="input-wrapper-optional"></span></div><span class="sr-only">Please enter the date or select a date from the calendar.</span></div></div></div>`;
const flightNo = '<div class="text aem-GridColumn"><div class="cmp-form-text" data-cmp-required="" data-cmp-required-message="Please enter your flight number."><div class="form-text-align"><maui-input label="Flight Number" name="FlightNo_1" required="" type="text"></maui-input></div></div></div>';
const rowsOf = (inner) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="form-wrapper"><form class="cmp-form" action="https://www.brusselsairlines.com/content/bel/markets/be/en/contact/feedback/general/other.html">${inner}</form></div></main></body></html>`);
  parse(document.querySelector('.form-wrapper'), { document, url: 'https://www.brusselsairlines.com/be/en/contact/feedback/general/other' });
  return [...document.querySelectorAll('table[data-name] tr')].map((tr) => [...tr.children].map((td) => td.textContent.trim()));
};

test('www\'s date-picker field is a date row: label, name, the mask from its date format', () => {
  const rows = rowsOf(flightNo + picker());
  const date = rows.find((r) => r[1] === 'date');
  assert.ok(date, 'a date row');
  assert.equal(date[0], 'Flight Date');
  assert.equal(date[2], 'depDayScheduled_1');
  assert.equal(date[3], '', 'not required (www: no required mark)');
  assert.match(date[9], /^mask=DD\/MM\/YYYY$/);
  assert.ok(rows.findIndex((r) => r[0] === 'Flight Number') < rows.indexOf(date), 'in www\'s place, after the flight number');
  assert.ok(!rows.some((r) => r.join(' ').includes('Please enter the date or select')), 'the screen-reader instruction is no row');
});

test('a required one with its messages; the German format', () => {
  const rows = rowsOf(picker({
    name: 'flugdatum', format: 'dd.mm.yy', wrap: ' data-cmp-required="" data-cmp-required-message="Bitte geben Sie das Datum ein." data-cmp-constraint-message="Bitte prüfen Sie das Datum."', req: ' required=""',
  }));
  const date = rows.find((r) => r[1] === 'date');
  assert.equal(date[3], 'yes');
  assert.equal(date[7], 'Bitte geben Sie das Datum ein.');
  assert.equal(date[8], 'Bitte prüfen Sie das Datum.');
  assert.match(date[9], /^mask=DD\.MM\.YYYY$/);
});
