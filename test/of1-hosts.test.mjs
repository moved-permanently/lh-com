/* The OF1 block's host kinds (blocks/of1/of1-hosts.js): where the generative page can call OF1's
   API. *.of1.live: the client script's own same-origin path; the lh-edge hosts on turnsthe.page:
   the page's own origin (lh-edge forwards /api/* to the OF1 proxy); anywhere else (aem.page,
   aem.live, localhost): no API route, a note that names the hosts where it works.
   Run: node --test test/of1-hosts.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { of1HostKind, of1ApiBase, of1DemoLinks } from '../blocks/of1/of1-hosts.js';

test('of1.live hosts (live and preview proxy) are the proxy kind', () => {
  assert.equal(of1HostKind('main--lh-com--moved-permanently.of1.live'), 'proxy');
  assert.equal(of1HostKind('prev--main--lh-com--moved-permanently.of1.live'), 'proxy');
  assert.equal(of1HostKind('MAIN--LH-COM--MOVED-PERMANENTLY.OF1.LIVE'), 'proxy');
});

test('the turnsthe.page brand hosts are the edge kind', () => {
  assert.equal(of1HostKind('lufthansa.turnsthe.page'), 'edge');
  assert.equal(of1HostKind('lufthansa-edge.turnsthe.page'), 'edge');
  assert.equal(of1HostKind('discover.turnsthe.page'), 'edge');
});

test('Edge Delivery, local and foreign hosts have no API route', () => {
  assert.equal(of1HostKind('main--lh-com--moved-permanently.aem.page'), 'none');
  assert.equal(of1HostKind('main--lh-com--moved-permanently.aem.live'), 'none');
  assert.equal(of1HostKind('localhost'), 'none');
  assert.equal(of1HostKind('www.lufthansa.com'), 'none');
  assert.equal(of1HostKind('evil.of1.live.example.com'), 'none');
  assert.equal(of1HostKind('other.turnsthe.page'), 'none');
  assert.equal(of1HostKind(''), 'none');
});

test('api base: none on the proxy (the client script uses its own origin), origin on edge hosts', () => {
  assert.equal(of1ApiBase({ hostname: 'main--lh-com--moved-permanently.of1.live', origin: 'https://main--lh-com--moved-permanently.of1.live' }), null);
  assert.equal(of1ApiBase({ hostname: 'lufthansa.turnsthe.page', origin: 'https://lufthansa.turnsthe.page' }), 'https://lufthansa.turnsthe.page');
  assert.equal(of1ApiBase({ hostname: 'main--lh-com--moved-permanently.aem.page', origin: 'https://main--lh-com--moved-permanently.aem.page' }), null);
});

test('demo links: the of1.live host of the same stage and the main host, query kept', () => {
  const page = of1DemoLinks({ hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/of1', search: '?q=lounges' });
  assert.deepEqual(page, [
    'https://prev--main--lh-com--moved-permanently.of1.live/of1?q=lounges',
    'https://lufthansa.turnsthe.page/of1?q=lounges',
  ]);
  const live = of1DemoLinks({ hostname: 'main--lh-com--moved-permanently.aem.live', pathname: '/of1', search: '' });
  assert.deepEqual(live, [
    'https://main--lh-com--moved-permanently.of1.live/of1',
    'https://lufthansa.turnsthe.page/of1',
  ]);
  // a branch preview keeps its branch on the of1.live host
  const branch = of1DemoLinks({ hostname: 'of1--lh-com--moved-permanently.aem.page', pathname: '/of1', search: '' });
  assert.equal(branch[0], 'https://prev--of1--lh-com--moved-permanently.of1.live/of1');
  // any other host: the main host only
  assert.deepEqual(of1DemoLinks({ hostname: 'localhost', pathname: '/of1', search: '' }), ['https://lufthansa.turnsthe.page/of1']);
});
