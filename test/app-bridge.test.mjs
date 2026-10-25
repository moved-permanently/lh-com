/* Bridge to the app (scripts/app-bridge.js). Run: node --test test/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasAppBridge, postToApp, bookingRequest, fareAlertLoginRequest, requestFareAlertLogin,
} from '../scripts/app-bridge.js';

const android = () => { const sent = []; return { sent, win: { groupapp: { postMessage: (m) => sent.push(m) }, location: { href: 'https://lh.example/de/en/offers' } } }; };
const ios = () => { const sent = []; return { sent, win: { webkit: { messageHandlers: { groupapp: { postMessage: (m) => sent.push(m) } } }, location: { href: 'https://lh.example/de/en/offers.solo_continue' } } }; };

test('a normal browser: no bridge, postToApp returns false', () => {
  const win = { location: { href: 'https://lh.example/' } };
  assert.equal(hasAppBridge(win), false);
  assert.equal(postToApp({ type: 'X' }, win), false);
  assert.equal(hasAppBridge(undefined), false);
});

test('Android (window.groupapp) and iOS (webkit.messageHandlers.groupapp) get a JSON string', () => {
  const a = android();
  assert.equal(postToApp({ type: 'AirEMProfileDeleted' }, a.win), true);
  assert.deepEqual(a.sent, ['{"type":"AirEMProfileDeleted"}']);
  const i = ios();
  assert.equal(postToApp('{ "type": "AirEMProfileDeleted" }', i.win), true);
  assert.deepEqual(i.sent, ['{ "type": "AirEMProfileDeleted" }']);
  // Android wins when both exist (as www)
  const both = android();
  both.win.webkit = ios().win.webkit;
  postToApp({ type: 'X' }, both.win);
  assert.equal(both.sent.length, 1);
  // a throwing interface: false, the caller navigates
  assert.equal(postToApp({ type: 'X' }, { groupapp: { postMessage: () => { throw new Error('x'); } } }), false);
});

test('booking requests: targetURL and parameters [{key, values}] from the link', () => {
  const m = bookingRequest('OfferBookingRequest', '/de/en/book-and-manage/destination.solo_continue?OriginCode=FRA&DestinationCode=NYC&x=1&x=2', 'https://lh.example/de/en/offers');
  assert.deepEqual(m, {
    type: 'OfferBookingRequest',
    targetURL: 'https://lh.example/de/en/book-and-manage/destination',
    parameters: [{ key: 'OriginCode', values: ['FRA'] }, { key: 'DestinationCode', values: ['NYC'] }, { key: 'x', values: ['1', '2'] }],
    newWindow: false,
    methodGet: true,
  });
  assert.equal(bookingRequest('DestinationFinderBookingRequest', 'https://lh.example/a', 'https://lh.example/').type, 'DestinationFinderBookingRequest');
});

test('fare alert login: www\'s fields; posted only in a solo page, else navigation', () => {
  assert.deepEqual(fareAlertLoginRequest('https://login.example/x'), {
    type: 'FareAlertLoginRequest', targetURL: 'https://login.example/x', newWindow: false, methodGet: false, external: false, parameters: [], headers: [],
  });
  const i = ios();
  assert.equal(requestFareAlertLogin('https://login.example/x', i.win), true);
  assert.equal(JSON.parse(i.sent[0]).type, 'FareAlertLoginRequest');
  const a = android(); // not a solo URL: navigates like www
  assert.equal(requestFareAlertLogin('https://login.example/x', a.win), false);
  assert.equal(a.win.location.href, 'https://login.example/x');
  assert.equal(a.sent.length, 0);
});
