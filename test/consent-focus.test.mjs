/* The focus after a choice in the cookie dialog (scripts/consent-focus.js, every brand; a minor
   finding of the parity passes): OneTrust's banner and preference center (and the fallback
   banner) left the focus on body. After a choice it goes back where it was before the dialog
   opened (the footer's "Change privacy settings" link …); when the dialog opened on load (the focus
   on body), or that element is gone or was inside a dialog, to the first skip link (brands with
   www's skip links, scripts/skip-links.js); without one it stays where it is. An element the
   visitor has focused since (not body, not inside the dialog) is left alone.
   Run: node --max-old-space-size=512 --test test/consent-focus.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML(`<!DOCTYPE html><html><body>
  <div class="skip-links"><a class="skip-link" id="skip" href="#main">Go to navigation</a></div>
  <main id="main"><a id="link" href="#privacy-settings">Change privacy settings</a><a id="other" href="/x">x</a></main>
  <div id="onetrust-consent-sdk"><button id="ot">Accept all</button></div>
  <div class="lh-consent"><button id="fb">Accept all</button></div>
</body></html>`);
globalThis.window = window;
globalThis.document = document;
const { focusReturnTarget, returnFocus } = await import('../scripts/consent-focus.js');
const $ = (id) => document.getElementById(id);

test('the element focused before the dialog, else the first skip link', () => {
  assert.ok(focusReturnTarget($('link'), document) === $('link'), 'the preferences link');
  assert.ok(focusReturnTarget(document.body, document) === $('skip'), 'opened on load');
  assert.ok(focusReturnTarget(null, document) === $('skip'));
  assert.ok(focusReturnTarget($('ot'), document) === $('skip'), 'inside OneTrust');
  assert.ok(focusReturnTarget($('fb'), document) === $('skip'), 'inside the fallback');
  const gone = document.createElement('a');
  assert.ok(focusReturnTarget(gone, document) === $('skip'), 'no longer in the page');
});

test('no skip link: null', () => {
  const { document: d } = parseHTML('<!DOCTYPE html><html><body><main><a href="/x">x</a></main></body></html>');
  assert.equal(focusReturnTarget(d.body, d), null);
});

test('returnFocus moves the focus only while it is on body or inside a dialog', () => {
  const calls = [];
  const target = { focus: (o) => calls.push(o), isConnected: true };
  const run = (active) => {
    calls.length = 0;
    returnFocus(target, { activeElement: active, body: document.body });
    return calls.length;
  };
  assert.equal(run(document.body), 1);
  assert.equal(run(null), 1);
  assert.equal(run($('ot')), 1);
  assert.equal(run($('fb')), 1);
  assert.equal(run($('other')), 0, 'the visitor moved on');
  assert.deepEqual((run(document.body), calls[0]), { preventScroll: true });
  assert.equal(returnFocus(null, { activeElement: document.body, body: document.body }), false);
});

test('consent.js and consent-banner.js return the focus after a choice', () => {
  const consent = fs.readFileSync('scripts/consent.js', 'utf8');
  assert.ok(consent.includes("from './consent-focus.js'"), 'consent.js imports it');
  const ready = consent.slice(consent.indexOf('function onOneTrustReady('), consent.indexOf('\n}\n', consent.indexOf('function onOneTrustReady(')));
  assert.ok(/afterOneTrustCloses\(/.test(ready), 'a later OptanonWrapper call (a choice) returns the focus once OneTrust is closed');
  const prefs = consent.slice(consent.indexOf('function openPreferences('), consent.indexOf('\n}\n', consent.indexOf('function openPreferences(')));
  assert.ok(prefs.includes('state.focusBefore = document.activeElement;'), 'the element before the preference center');
  const banner = fs.readFileSync('scripts/consent-banner.js', 'utf8');
  const remove = banner.slice(banner.indexOf('export function removeConsentBanner('), banner.indexOf('\n}\n', banner.indexOf('export function removeConsentBanner(')));
  assert.ok(remove.includes('returnFocus(focusReturnTarget(lastFocus, document), document)'), 'the fallback banner the same way');
});
