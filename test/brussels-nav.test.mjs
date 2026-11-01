/* eslint-disable max-len */
/* tools/importer/brussels-nav.mjs: the menu's "My flights" and "Manage bookings" (www's cockpit deep
   link) go to the root's own login page, as the menus on DA (2026-11-01); other links as before.
   Run: node --max-old-space-size=512 --test test/brussels-nav.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

// eslint-disable-next-line import/extensions
const { navDocument } = await import('../tools/importer/brussels-nav.mjs');

const dcepAttr = (j) => JSON.stringify(j).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const snapshot = (key) => {
  const [cc, ll] = key.split('/').map((x) => x.toUpperCase());
  const cockpit = `https://www.brusselsairlines.com/deeplink/cockpit?country=${cc}&language=${ll}`;
  const quick = { links: [{ label: 'My flights', url: cockpit }, { label: 'Check-in', url: `/${key}/check-in` }] };
  const menu = {
    id: 'common-header-nav-horizontal',
    menuItems: [{ label: 'Manage', menuItems: [{ label: 'Bookings', href: `/content/bel/markets/${key}/my-bookings.html`, menuItems: [{ label: 'Manage bookings', href: cockpit }, { label: 'Book', href: 'https://www.brusselsairlines.com/deeplink/booking?x=1' }] }] }],
  };
  return parseHTML(`<html><body><header><div class="dcep-header-quick-action-links" data-dcep="${dcepAttr(quick)}"></div><div data-dcep="${dcepAttr(menu)}"></div></header></body></html>`).document;
};

test('the cockpit deep link in the quick actions and the menu: the root\'s own login page', () => {
  const doc = navDocument(snapshot('be/en'), 'be/en', new Set(['/be/en/my-bookings']));
  assert.match(doc, /<a href="\/be\/en\/profile\/login">My flights<\/a>/);
  assert.match(doc, /<a href="\/be\/en\/profile\/login">Manage bookings<\/a>/);
  assert.ok(!doc.includes('deeplink/cockpit'));
  assert.match(doc, /<a href="\/be\/en\/my-bookings">Bookings<\/a>/, 'site pages relative, as before');
  assert.match(doc, /<a href="https:\/\/www\.brusselsairlines\.com\/deeplink\/booking\?x=1">Book<\/a>/, 'other deep links stay on www');
  assert.match(doc, /<a href="https:\/\/www\.brusselsairlines\.com\/be\/en\/check-in">Check-in<\/a>/);
});

test('a market root: its own root\'s login page', () => {
  const doc = navDocument(snapshot('sn/fr'), 'sn/fr', new Set());
  assert.match(doc, /<a href="\/sn\/fr\/profile\/login">My flights<\/a>/);
  assert.equal((doc.match(/href="\/sn\/fr\/profile\/login"/g) || []).length, 2);
});
