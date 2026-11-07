/* eslint-disable max-len, import/extensions */
/* Links the SWISS import writes from www's markup (brief 453, item 1): current information's
   accordion (swiss-sidebar.mjs withSwissAccordions) made www's chat assistant link
   https://www.swiss.com/digitalassistant/webchat.html relative, and /digitalassistant/… answers
   404 on swiss.turnsthe.page (8 current information pages held from publishing). A www link to a
   path the replica serves (its <cc>/<ll> roots, /magazine, /corporate, /medicalservices) is
   relative (www's AEM path /content/lx/markets/<cc>/<ll>/… as the page's path); any other stays on
   www.swiss.com, also when www wrote it relative.
   Run: node --max-old-space-size=512 --test test/swiss-www-links-453.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { withSwissAccordions, wwwHref } from '../tools/importer/swiss-sidebar.mjs';

test('wwwHref: the replica\'s paths relative, www\'s others absolute', () => {
  assert.equal(wwwHref('https://www.swiss.com/ch/en/fly/flight-information/flight-irregularities'), '/ch/en/fly/flight-information/flight-irregularities');
  assert.equal(wwwHref('/ch/de/prepare/baggage/baggage-irregularities'), '/ch/de/prepare/baggage/baggage-irregularities');
  assert.equal(wwwHref('/content/lx/markets/ch/en/profile/login?deeplinkRedirect=true'), '/ch/en/profile/login?deeplinkRedirect=true');
  assert.equal(wwwHref('https://www.swiss.com/magazine/en/travel'), '/magazine/en/travel');
  assert.equal(wwwHref('https://www.swiss.com/corporate/de/company'), '/corporate/de/company');
  assert.equal(wwwHref('https://www.swiss.com/digitalassistant/webchat.html'), 'https://www.swiss.com/digitalassistant/webchat.html');
  assert.equal(wwwHref('/digitalassistant/support/webchat.html?start=refund'), 'https://www.swiss.com/digitalassistant/support/webchat.html?start=refund');
  assert.equal(wwwHref('https://www.flytap.com/x'), 'https://www.flytap.com/x', 'other hosts as they are');
  assert.equal(wwwHref('#top'), '#top');
});

test('current information\'s accordion: the chat link stays on www', () => {
  const html = '<html><body><div class="contentpage"><h1>Τρέχουσες πληροφορίες</h1><div class="airem-sidebar"><div class="sidebar-content"><div class="accordion"><maui-collapsible><div class="accordionitem"><maui-collapsible-item headline="Fast assistance"><div class="richtext"><p>Chat with us: "<a href="https://www.swiss.com/digitalassistant/webchat.html" target="_blank">SWISS Chat Assistant<span class="sr-only">opens in a new tab</span></a>" or see <a href="https://www.swiss.com/ch/el/fly/flight-information/flight-irregularities">irregularities</a>.</p></div></maui-collapsible-item></div></maui-collapsible></div></div><div class="sidebar-aside"></div></div></div></body></html>';
  const doc = '<body><header></header><main><div><h1>Τρέχουσες πληροφορίες</h1></div></main><footer></footer></body>';
  const r = withSwissAccordions(doc, html);
  assert.equal(r.made, 1);
  assert.ok(r.doc.includes('<a href="https://www.swiss.com/digitalassistant/webchat.html">SWISS Chat Assistant</a>'), r.doc);
  assert.ok(r.doc.includes('<a href="/ch/el/fly/flight-information/flight-irregularities">irregularities</a>'));
});
