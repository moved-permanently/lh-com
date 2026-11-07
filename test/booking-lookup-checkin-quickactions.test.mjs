/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The booking-lookup parser and www's quick actions with a Check-in panel (brief 448, item 2:
   Brussels' online-check-in-options in six languages, brussels-snapshots-015: the form rendered,
   .dcep-quick-actions > maui-tab-control-panel[data-key="checkIn"] with Booking code, First name
   and Last name inputs and a "Check-in" button). The parser took every .dcep-quick-actions as the
   my-bookings variant (booking code and last name only): the check-in form lost its first name and
   www's labels. A quick actions block whose panel is the Check-in panel is now a plain
   booking-lookup with www's rows (Tab, Reference label / pattern / error, First name label / error,
   Last name label / error, Submit label); a My bookings panel as before.
   Run: node --max-old-space-size=256 --test test/booking-lookup-checkin-quickactions.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let out;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      out = { name, rows: cells.map(([k, v]) => [k, typeof v === 'string' ? v : v.textContent]) };
      return document.createElement('table');
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/booking-lookup.js');

const run = (panel) => {
  const { document } = parseHTML(`<html><body><div class="quickaction section"><div class="dcep-quick-actions"><maui-tab-control>${panel}</maui-tab-control></div></div></body></html>`);
  parse(document.querySelector('.quickaction'), { document, params: { originalURL: 'https://www.brusselsairlines.com/be/en/check-in-options-and-info/online-check-in-options' } });
  return out;
};

// be/en's Check-in panel (brussels-snapshots-015), its attributes as www renders them
const checkIn = `<maui-tab-control-panel data-key="checkIn" name="Check-in">
  <maui-navigation-link href="https://api.travelid.brusselsairlines.com/oauth2/authorize?client_id=x">Login</maui-navigation-link>
  <maui-input label="Booking code" pattern="^([A-Z0-9]{6}|\\d{13})$" errormessage="Please enter your booking code"></maui-input>
  <maui-input label="First name (as per booking)" autocomplete="given-name" errormessage="Please enter your first name"></maui-input>
  <maui-input label="Last name (as per booking)" autocomplete="family-name" errormessage="Please enter you last name"></maui-input>
  <maui-button type="primary" behavior="submit">Check-in</maui-button>
</maui-tab-control-panel>`;

test('the Check-in panel: a plain booking-lookup with Reference, First name and Last name rows, www\'s labels', () => {
  const r = run(checkIn);
  assert.equal(r.name, 'booking-lookup');
  assert.deepEqual(r.rows, [
    ['Tab', 'Check-in'],
    ['Reference label', 'Booking code'],
    ['Reference pattern', '^([A-Z0-9]{6}|\\d{13})$'],
    ['Reference error', 'Please enter your booking code'],
    ['First name label', 'First name (as per booking)'],
    ['First name error', 'Please enter your first name'],
    ['Last name label', 'Last name (as per booking)'],
    ['Last name error', 'Please enter you last name'],
    ['Submit label', 'Check-in'],
  ]);
});

test('a My bookings panel: the my-bookings variant, as before', () => {
  const r = run(`<maui-tab-control-panel data-key="myBookings" name="My bookings">
    <maui-navigation-link href="https://api.travelid.brusselsairlines.com/oauth2/authorize?client_id=x">Login</maui-navigation-link>
    <maui-input label="Booking code" pattern="^[A-Z0-9]{6}$"></maui-input>
    <maui-input label="Last name" autocomplete="family-name"></maui-input>
    <maui-checkbox label="I have a tour operator code"></maui-checkbox>
    <maui-button type="primary" behavior="submit">Find Bookings</maui-button>
  </maui-tab-control-panel>`);
  assert.equal(r.name, 'booking-lookup (my-bookings)');
  assert.deepEqual(r.rows.map(([k]) => k), ['Tab', 'Login link', 'Reference label', 'Reference pattern', 'Last name label', 'Tour operator label', 'Submit label']);
  assert.ok(!r.rows.some(([k]) => k === 'First name label'));
});
