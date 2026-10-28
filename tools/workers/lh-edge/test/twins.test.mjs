/* The parallel run: with wrangler.toml's vars, each turnsthe.page host is treated like its
   bbird.live twin (market roots served, alias host, alias rewrite, demo noindex lists). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { servedMarketRoots } from '../src/markets.js';
import { aliasHostOf, toAlias } from '../src/alias.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const toml = fs.readFileSync(path.join(here, '../wrangler.toml'), 'utf8');
const env = Object.fromEntries([...toml.matchAll(/^([A-Z_]+) = "([^"]*)"$/gm)].map((m) => [m[1], m[2]]));
const PAIRS = [['lhcom.bbird.live', 'lufthansa.turnsthe.page'], ['lhedge.bbird.live', 'lufthansa-edge.turnsthe.page'], ['lhcn.bbird.live', 'lufthansa-cn.turnsthe.page']];
// a request as lh-edge sees it: on its own host, and through a CDN that names the public host
const asHost = (host) => new Request(`https://${host}/ch/en/baggage`);
const viaCdn = (host) => new Request('https://lhedge.bbird.live/ch/en/baggage', { headers: { 'x-lh-public-host': host } });

test('each twin is served the same market roots as its bbird.live host', () => {
  PAIRS.forEach(([a, b]) => {
    assert.deepEqual(servedMarketRoots(asHost(b), env), servedMarketRoots(asHost(a), env), b);
    assert.deepEqual(servedMarketRoots(viaCdn(b), env), servedMarketRoots(viaCdn(a), env), `${b} via a CDN`);
  });
  const ch = servedMarketRoots(asHost('lufthansa.turnsthe.page'), env);
  assert.ok(ch.includes('ch/en') && !ch.includes('hu/en'), 'lufthansa.turnsthe.page: ch only, as lhcom');
  assert.ok(servedMarketRoots(asHost('lufthansa-edge.turnsthe.page'), env).includes('hu/en'), 'lufthansa-edge: every pilot root');
  assert.deepEqual(servedMarketRoots(asHost('other.turnsthe.page'), env), servedMarketRoots(asHost('www.lufthansa.com'), env), 'not the whole domain');
});

test('the alias twin is an alias host, and links to either family move to it', () => {
  assert.equal(aliasHostOf(new Request('https://lufthansa-cn.turnsthe.page/de/en/homepage'), env), 'lufthansa-cn.turnsthe.page');
  assert.equal(aliasHostOf(new Request('https://lufthansa.turnsthe.page/de/en/homepage'), env), null);
  const hosts = env.ALIAS_REWRITE_HOSTS.split(',');
  ['lhcom.bbird.live', 'lufthansa.turnsthe.page', 'lufthansa-edge.turnsthe.page'].forEach((h) => {
    assert.equal(toAlias(`https://${h}/de/en/baggage`, hosts, 'lufthansa-cn.turnsthe.page'), 'https://lufthansa-cn.turnsthe.page/de/en/baggage', h);
  });
});
