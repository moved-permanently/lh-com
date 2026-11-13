/* eslint-disable max-len, import/extensions */
/* The brief after 551 item 1 (the harness, the Brussels flight-search picker): www's flight manager names another root's
   group page or none (data-dcep groupBookingsUrl: student-fares /content/lh/markets/sg/en, offers /es/en, the campaign
   pages /content/sn/gc/<ll> or /content/sn/markets/be/en). The picker made that /<cc>/<ll>/group-travel, and
   site-postprocess then made it a www link (https://www.brusselsairlines.com/sg/en/group-travel). The page's own link on
   www is its root's groups page, /<cc>/<ll>/book-a-flight/groups-and-charter/groups (DA's link), which our site serves on
   every root. withGroupBooking writes that link, relative, as the import's last link step. Run:
   node --max-old-space-size=256 --test test/brussels-group-booking-551.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { withGroupBooking } from '../tools/importer/brussels-import.mjs';

const TEXT = 'Group bookings for 10 or more passengers.';
const row = (href) => `<div><div>Group booking</div><div><a href="${href}">${TEXT}</a></div></div>`;
const doc = (href) => `<div><div class="flight-search (standalone)"><div><div>Passenger picker</div><div>yes</div></div>${row(href)}<div><div>Fare preference</div><div>yes</div></div></div></div>`
  + '<div><p><a href="https://www.brusselsairlines.com/sg/en/group-travel">Elsewhere</a></p><p><a href="/be/en/book-a-flight/groups-and-charter/groups">Group bookings</a></p></div>';

test('the picker\'s Group booking link is the page\'s own root\'s groups page, relative (the 5 documents the harness kept, the campaign pages)', () => {
  [
    ['/be/en/local-page/student-fares', 'https://www.brusselsairlines.com/sg/en/group-travel'],
    ['/be/fr/local-page/student-fares', 'https://www.brusselsairlines.com/sg/en/group-travel'],
    ['/be/en/local-page/offers', 'https://www.brusselsairlines.com/es/en/group-travel'],
    ['/be/fr/local-page/offers', 'https://www.brusselsairlines.com/es/en/group-travel'],
    ['/be/nl/local-page/offers', 'https://www.lufthansa-com.invalid/es/en/group-travel'],
    ['/gb/en/local-page/ski-campaign-2026', 'https://www.brusselsairlines.com/gb/en/group-travel'],
    ['/ae/en/local-page/black-friday', 'https://www.brusselsairlines.com/content/sn/gc/en'],
    ['/be/nl/companion-special-february-2024', 'https://www.brusselsairlines.com/content/sn/markets/be/en'],
  ].forEach(([p, wrong]) => {
    const root = p.split('/').slice(0, 3).join('/');
    const out = withGroupBooking(doc(wrong), p);
    assert.ok(out.includes(row(`${root}/book-a-flight/groups-and-charter/groups`)), p);
    assert.ok(!out.includes(`href="${wrong}">${TEXT}`), p);
    // nothing else changes: the other links stay as they are
    assert.ok(out.includes('<a href="https://www.brusselsairlines.com/sg/en/group-travel">Elsewhere</a>'), p);
    assert.equal(withGroupBooking(out, p), out, `${p} (idempotent)`);
  });
});

test('a right link, a pretty-printed row and a document without the picker', () => {
  const right = doc('/cm/en/book-a-flight/groups-and-charter/groups');
  assert.equal(withGroupBooking(right, '/cm/en/homepage'), right);
  const pretty = `<div>\n  <div>Group booking</div>\n  <div><a href="https://www.brusselsairlines.com/gb/en/group-travel">${TEXT}</a></div>\n</div>`;
  assert.ok(withGroupBooking(pretty, '/us/en/local-page/ski-campaign-2026').includes('<a href="/us/en/book-a-flight/groups-and-charter/groups">'));
  const none = '<div><p><a href="https://www.brusselsairlines.com/gb/en/group-travel">Group travel</a></p></div>';
  assert.equal(withGroupBooking(none, '/gb/en/x'), none);
  assert.equal(withGroupBooking(doc('https://x.invalid/a'), '/footer'), doc('https://x.invalid/a'));
});
