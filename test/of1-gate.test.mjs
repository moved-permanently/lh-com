/* When OF1's "the site notices you" runs (scripts/of1/index.js): lh-com's pages on lufthansa's
   turnsthe.page hosts, never on *.of1.live (OF1's own scripts run there), in an authoring
   context, in the app channel or on a brand's page; on only with the site flag `of1` (the flags
   sheet's row, value on) or, on a demo host only, the tester switch localStorage lh-of1 = on.
   window.of1Consent on /of1 only with C0004 (without it OF1's client allows the typed search).
   Run: node --max-old-space-size=512 --test test/of1-gate.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { of1Applies, of1SwitchedOn, consentApiWanted } from '../scripts/of1/gate.js';

const page = (over = {}) => ({
  hostname: 'lufthansa.turnsthe.page', channel: 'website', authoring: false, brand: null, ...over,
});

test('where it applies: lufthansa\'s turnsthe.page hosts, lh-com pages, the website and FlyNet channels', () => {
  assert.equal(of1Applies(page()), true);
  assert.equal(of1Applies(page({ hostname: 'lufthansa-edge.turnsthe.page' })), true);
  assert.equal(of1Applies(page({ channel: 'flynet' })), true);
  [
    page({ hostname: 'main--lh-com--moved-permanently.of1.live' }),
    page({ hostname: 'prev--main--lh-com--moved-permanently.of1.live' }),
    page({ hostname: 'anything.of1.live' }),
    page({ hostname: 'main--lh-com--moved-permanently.aem.page' }),
    page({ hostname: 'www.lufthansa.com' }),
    page({ hostname: 'discover.turnsthe.page' }),
    page({ authoring: true }),
    page({ channel: 'app' }),
    page({ brand: { name: 'discover' } }),
  ].forEach((p) => assert.equal(of1Applies(p), false, JSON.stringify(p)));
});

test('switched on: the flag, or the tester switch on a demo host only', () => {
  assert.equal(of1SwitchedOn({ flag: true, demo: false, tester: '' }), true);
  assert.equal(of1SwitchedOn({ flag: false, demo: true, tester: 'on' }), true);
  assert.equal(of1SwitchedOn({ flag: false, demo: true, tester: ' ON ' }), true);
  assert.equal(of1SwitchedOn({ flag: false, demo: false, tester: 'on' }), false, 'never on production by the switch');
  assert.equal(of1SwitchedOn({ flag: false, demo: true, tester: 'yes' }), false);
  assert.equal(of1SwitchedOn({ flag: false, demo: true, tester: null }), false);
});

test('window.of1Consent: on every page, on /of1 only with C0004', () => {
  assert.equal(consentApiWanted('/de/en/homepage', ['C0001']), true);
  assert.equal(consentApiWanted('/de/en/homepage', ['C0001', 'C0004']), true);
  assert.equal(consentApiWanted('/of1', ['C0001']), false);
  assert.equal(consentApiWanted('/of1', ['C0001', 'C0002']), false);
  assert.equal(consentApiWanted('/of1', ['C0001', 'C0004']), true);
  assert.equal(consentApiWanted('/of1/', ['C0001']), false);
});
