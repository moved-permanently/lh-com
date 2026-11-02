/* eslint-disable max-len, import/extensions -- the importer modules are .mjs */
/* SWISS's market roots' import steps (tools/importer/swiss-market-import.mjs): the flight search's
   default origin from the root's own homepage, the pages a root has on the site (its own documents,
   ch/<ll>'s pages whose markets row lists it), the forms' date picker out.
   Run: node --max-old-space-size=512 --test test/swiss-market-import.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  marketOriginOf, withMarketOrigin, servedPaths, withoutDatepicker,
} from '../tools/importer/swiss-market-import.mjs';
import { withFlightSearch } from '../tools/importer/swiss-import.mjs';

const HOME = '<input name="flightQuery.flightSegments[0].originCode" type="text" value="Frankfurt"><div data-dcep="{&quot;fareTeaserManualTravels&quot;:[{&quot;destination&quot;:&quot;ATL&quot;,&quot;origin&quot;:&quot;FRA&quot;},{&quot;destination&quot;:&quot;ATH&quot;,&quot;origin&quot;:&quot;FRA&quot;},{&quot;destination&quot;:&quot;NBO&quot;,&quot;origin&quot;:&quot;MUC&quot;}]}"></div>';

test('marketOriginOf: the origin field\'s city and the fare teasers\' most frequent origin code; none without both', () => {
  assert.equal(marketOriginOf(HOME), 'Frankfurt (FRA)');
  assert.equal(marketOriginOf('<input name="flightQuery.flightSegments[0].originCode" value="">'), '');
  assert.equal(marketOriginOf('<p>no flight search</p>'), '');
});

test('withMarketOrigin: after swiss-import.mjs\'s Shop row, once; a block with an origin (ch) as it is', () => {
  const doc = withFlightSearch('<div class="flight-search"><div><div>Trip</div><div>x</div></div></div>', '/de/en/homepage');
  const out = withMarketOrigin(doc, HOME);
  assert.ok(out.includes('<div><div>Shop</div><div><a href="https://shop.swiss.com/booking/availability">https://shop.swiss.com/booking/availability</a></div></div><div><div>Default origin</div><div>Frankfurt (FRA)</div></div><div><div>Trip</div>'), out);
  assert.equal(withMarketOrigin(out, HOME), out, 'once');
  const ch = withFlightSearch('<div class="flight-search"></div>', '/ch/en/homepage');
  assert.equal(withMarketOrigin(ch, HOME), ch, 'ch/en has Zurich (ZRH)');
  assert.equal(withMarketOrigin(doc, '<p></p>'), doc, 'no origin on the homepage: the hub');
});

test('servedPaths: the roots\' own documents, the language versions\' and ch/<ll>\'s pages for the roots their markets list (of that language)', () => {
  const served = servedPaths({
    own: ['/de/en/homepage', '/al/fr/local-page/x'],
    sitePaths: new Set(['/ch/en/prepare/baggage', '/ch/en/only-ch', '/ch/fr/bagages']),
    markets: { '/ch/en/prepare/baggage': ['de/en', 'al/en', 'de/de'], '/ch/en/only-ch': [], '/ch/fr/bagages': ['al/fr'], '/ch/de/x': { status: 404 } },
  });
  ['/de/en/homepage', '/al/fr/local-page/x', '/ch/en/prepare/baggage', '/de/en/prepare/baggage', '/al/en/prepare/baggage', '/al/fr/bagages'].forEach((p) => assert.ok(served.has(p), p));
  ['/de/de/prepare/baggage', '/de/en/only-ch', '/ch/de/x'].forEach((p) => assert.ok(!served.has(p), p));
});

test('withoutDatepicker: the date picker div goes, the rest stays', () => {
  assert.equal(withoutDatepicker('<main><p>a</p></main><div id="ui-datepicker-div" class="ui-datepicker"><div><a>Prev</a></div></div><p>b</p>'), '<main><p>a</p></main><p>b</p>');
});
