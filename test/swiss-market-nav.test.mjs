/* eslint-disable max-len, import/extensions -- the importer modules are .mjs */
/* SWISS's market roots' nav and footer (tools/importer/swiss-market-nav.mjs): swiss-nav.mjs's
   documents from the root's own homepage (its menu, quick actions, footer, as www shows them on
   that root), links to the root's pages on the site relative (its own documents, ch/<ll>'s pages
   its markets lists), the rest on www, the images from their place in lh-swiss's DA.
   Run: node --max-old-space-size=512 --test test/swiss-market-nav.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { marketNavDocuments } from '../tools/importer/swiss-market-nav.mjs';

const json = (o) => JSON.stringify(o).replace(/"/g, '&quot;');
const MENU = {
  id: 'common-header-nav-horizontal',
  menuItems: [{ label: 'Book', menuItems: [{ label: 'Baggage', href: '/de/en/prepare/baggage', menuItems: [{ label: 'Only on ch', href: '/de/en/only-ch' }, { label: 'Local', href: '/de/en/local-page/x' }] }] }],
};
const HOME = `<html><body><header><img class="common-header-logo-image" src="/etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg" alt="SWISS">
<div class="dcep-header-quick-action-links" data-dcep="${json({ links: [{ label: 'Check-in', url: '/de/en/fly/check-in' }] })}"></div>
<div data-dcep="${json(MENU)}"></div></header>
<footer><div class="swiss-link-content"><div class="link-list"><div class="hidden-sm-down"><h3>About us</h3></div><ul class="vertical"><li><a href="/de/en/prepare/baggage">Baggage</a></li><li><a href="https://www.lufthansa.com/de/en">Lufthansa</a></li></ul></div></div></footer></body></html>`;

test('a market root\'s nav and footer: its homepage\'s menu and footer, its served pages relative, the rest on www, Lufthansa\'s links as they are', () => {
  const { document } = parseHTML(HOME);
  const served = new Set(['/de/en/homepage', '/de/en/prepare/baggage', '/de/en/local-page/x', '/de/en/fly/check-in']);
  const { nav, footer } = marketNavDocuments(document, 'de/en', served, new Set());
  assert.ok(nav.includes('<a href="/de/en/homepage">'), 'the logo to the root\'s homepage');
  assert.ok(nav.includes('<a href="/de/en/fly/check-in">Check-in</a>'));
  assert.ok(nav.includes('<a href="/de/en/prepare/baggage">Baggage</a>'));
  assert.ok(nav.includes('<a href="/de/en/local-page/x">Local</a>'));
  assert.ok(nav.includes('<a href="https://www.swiss.com/de/en/only-ch">Only on ch</a>'), 'a page the root does not get: www');
  assert.ok(footer.includes('<a href="/de/en/prepare/baggage">Baggage</a>'));
  assert.ok(footer.includes('href="https://www.lufthansa.com/de/en"'), 'Lufthansa\'s link as www has it');
  assert.ok(nav.includes('src="https://content.da.live/moved-permanently/lh-swiss/etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg"'), 'the logo from DA');
});
