/* eslint-disable max-len */
/* Brief 497 item 2: a language version's page served on a market root names its Parent as a list (the
   whole trail, "/de/en/homepage, /de/en/program, /de/en/program/experts"; blocks/breadcrumb splits it at
   ", "). marketHtml rewrote <meta name="parent"> as one link, so a list never matched a path and every
   crumb linked the language version: b2b.turnsthe.page/kw/en/program/experts/at-the-airport/hubs/
   munich-airport, and on SWISS (gb/en), Brussels (gb/en) and ITA (us/en) roots alike. Each entry is
   rewritten as a link is now; the separators stay, an entry the root doesn't serve stays as written.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/parent-list-root-links.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import { marketHtml } from '../src/markets.js';

globalThis.HTMLRewriter = HTMLRewriter;

const ctx = (extra = {}) => ({
  from: 'de/en',
  to: 'kw/en',
  hosts: /^https:\/\/(?:b2b\.turnsthe\.page|main--lh-b2b--moved-permanently\.aem\.(?:page|live))/,
  www: 'www.lufthansa.com',
  allowed: (suffix) => suffix !== '/program/not-served',
  marketPath: '/kw/en/program/experts/at-the-airport/hubs/munich-airport',
  alternates: [],
  ...extra,
});

const parentOf = async (content, c = ctx()) => {
  const html = `<html><head><meta name="parent" content="${content}"></head><body></body></html>`;
  const out = await marketHtml(new Response(html, { headers: { 'content-type': 'text/html' } }), c).text();
  return out.match(/<meta name="parent" content="([^"]*)"/)[1];
};

test('a Parent list: every entry the root serves links the root', async () => {
  assert.equal(
    await parentOf('/de/en/homepage, /de/en/program, /de/en/program/experts, /de/en/program/experts/at-the-airport, /de/en/program/experts/at-the-airport/hubs'),
    '/kw/en/homepage, /kw/en/program, /kw/en/program/experts, /kw/en/program/experts/at-the-airport, /kw/en/program/experts/at-the-airport/hubs',
  );
});

test('a single Parent as before; an entry the root does not serve and an outside one stay', async () => {
  assert.equal(await parentOf('/de/en/program'), '/kw/en/program');
  assert.equal(await parentOf('/de/en/homepage, /de/en/program/not-served'), '/kw/en/homepage, /de/en/program/not-served');
  assert.equal(
    await parentOf('https://www.lufthansa.com/de/en/flights, /de/en/program'),
    'https://www.lufthansa.com/kw/en/flights, /kw/en/program',
    'www links follow the root as a link does',
  );
  assert.equal(await parentOf('https://example.com/a, /de/en/program'), 'https://example.com/a, /kw/en/program');
});

test('a host-qualified entry loses the host as a link does; nav and footer unchanged', async () => {
  assert.equal(await parentOf('https://b2b.turnsthe.page/de/en/homepage, /de/en/program'), '/kw/en/homepage, /kw/en/program');
  const html = '<html><head><meta name="nav" content="/de/en/nav"><meta name="footer" content="/de/en/footer"></head></html>';
  const out = await marketHtml(new Response(html, { headers: { 'content-type': 'text/html' } }), ctx()).text();
  assert.match(out, /<meta name="nav" content="\/kw\/en\/nav">/);
  assert.match(out, /<meta name="footer" content="\/kw\/en\/footer">/);
});
