/* eslint-disable import/extensions */
/* Brussels' form ids (tools/importer/brussels-import.mjs formIdOf, brief 441): a form page's id is
   brussels-<page name>, as lh-forms knows them; /ro/en/my-bookings/invoices/ask-invoice1 is www's
   copy of the invoice request under another name (brussels-snapshots-013): brussels-ask-invoice, as
   the other invoice pages. il/en's rebooking request for Birthright participants keeps its own id
   (added to lh-forms). Run: node --test test/brussels-form-ids.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { formIdOf, withoutTestForms } from '../tools/importer/brussels-import.mjs';

test('ask-invoice1 is the invoice request', () => {
  assert.equal(formIdOf('/ro/en/my-bookings/invoices/ask-invoice1'), 'brussels-ask-invoice');
  assert.equal(formIdOf('/be/en/my-bookings/invoices/ask-invoice'), 'brussels-ask-invoice');
});

test('other pages: brussels-<page name>', () => {
  assert.equal(formIdOf('/il/en/rebooking-request-birthright'), 'brussels-rebooking-request-birthright');
  assert.equal(formIdOf('/be/fr/charter'), 'brussels-charter');
});

/* www's leftover test form (ro/en's ask-invoice1: a second form "Invoicing details Biztalk Test",
   a street number and a submit, posting to the same handler): dropped with its container, before
   the import; the invoice form stays. */
const form = (title) => `<div class="container responsivegrid"><form method="POST" class="cmp-form"><div class="form-section row"><div class="col-12 form-section-headline-container"><h2 class="heading-medium form-section-headline">${title}</h2></div></div><button>Request invoice</button></form></div>`;

test('www\'s test forms are dropped, the others stay', () => {
  const html = `<main>${form('Invoicing details')}<p>between</p>${form('Invoicing details Biztalk Test')}</main>`;
  assert.equal(withoutTestForms(html), `<main>${form('Invoicing details')}<p>between</p></main>`);
  assert.equal(withoutTestForms(`<main>${form('Test results request')}</main>`), `<main>${form('Test results request')}</main>`);
});
