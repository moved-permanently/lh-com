/* "Change privacy settings" links (#privacy-settings) on a site without a consent tool: a brand
   without a OneTrust id in scripts/brands.js (TAP today) runs no consent tool, so the link opens
   nothing. Lufthansa Cargo has the look-alike banner since brief 422, Air Dolomiti since the brief
   after 509 (consent 'fallback'): their footer's cookie settings link stays and opens the
   preferences. The link goes while
   no consent tool runs (scripts/consent.js hidePrivacySettings, from decorateMain: pages, nav,
   footer and fragments): a list item or paragraph holding only the link with it, a link inside
   running text becomes its text. Brands with OneTrust (and lh-com, Lufthansa's) keep every link
   and its click as before.
   Run: node --max-old-space-size=512 --test test/privacy-settings-no-consent.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// scripts.js loads with the footer: on a demo host's / (lh-com, no brand) it only redirects
// (stubbed), it decorates nothing
window.hlx = { codeBasePath: '' };
const HOST = 'main--lh-com--moved-permanently.aem.page';
window.location = {
  hostname: HOST, pathname: '/', search: '', hash: '', replace: () => {}, href: `https://${HOST}/`, origin: `https://${HOST}`,
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
// decorateMain's tree walkers (linkedom has no NodeFilter; the DOM's values)
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };

const { hidePrivacySettings, hasConsentTool } = await import('../scripts/consent.js');
const { BRANDS } = await import('../scripts/brands.js');

const brand = (key) => {
  document.head.innerHTML = key ? `<meta name="brand" content="${key}">` : '';
};
beforeEach(() => brand(null));

// Cargo's footer document (main--lh-cargo /en/footer, 2026-11-01): the legal row
const LEGAL = `<div class="section"><div class="default-content-wrapper"><ul>
  <li><a href="/en/imprint">Imprint</a></li>
  <li><a href="/en/privacy">Privacy</a></li>
  <li><a href="#privacy-settings">Cookie Settings</a></li>
  <li><a href="/en/terms">Terms</a></li>
</ul></div></div>`;
const CONTENT = `<div class="section"><div class="default-content-wrapper">
  <p><a href="#privacy-settings">Change privacy settings</a></p>
  <p>You can change your choice in the <a href="#privacy-settings">privacy settings</a> at any time.</p>
  <p><a href="/en/privacy">Privacy</a></p>
</div></div>`;
const root = (html) => {
  const main = document.createElement('main');
  main.innerHTML = html;
  return main;
};
const texts = (el) => [...el.querySelectorAll('li, p')].map((n) => n.textContent.replace(/\s+/g, ' ').trim());

// TAP (briefs 312, 314): www.flytap.com's pages load no consent manager of their own, only Google
// Tag Manager (GTM-5H44JL7M), which the replica doesn't run
test('a consent tool runs where the brand has OneTrust (and on lh-com, Lufthansa\'s) and on Cargo and Air Dolomiti (the fallback banner, brief 422 and the brief after 509); not on TAP', () => {
  assert.equal(hasConsentTool(), true, 'lh-com');
  const without = Object.keys(BRANDS).filter((k) => {
    brand(k);
    return !hasConsentTool();
  });
  assert.deepEqual(without.sort(), ['tap']);
  without.forEach((k) => assert.equal(BRANDS[k].oneTrust, undefined));
});

test('TAP: the footer\'s Cookie Settings item goes, the other legal links stay in order', () => {
  brand('tap');
  const main = root(LEGAL);
  assert.equal(hidePrivacySettings(main), 1);
  assert.deepEqual(texts(main), ['Imprint', 'Privacy', 'Terms']);
  assert.equal(main.querySelectorAll('a[href="#privacy-settings"]').length, 0);
});

test('TAP: a paragraph with only the link goes; a link in running text becomes its text', () => {
  brand('tap');
  const main = root(CONTENT);
  assert.equal(hidePrivacySettings(main), 2);
  assert.deepEqual(texts(main), ['You can change your choice in the privacy settings at any time.', 'Privacy']);
  assert.equal(main.querySelectorAll('a[href="#privacy-settings"]').length, 0);
});

test('brands with OneTrust, lh-com, Cargo and Air Dolomiti (their fallback banner): every link stays, the markup as it was', () => {
  [null, 'discover', 'ita', 'austrian', 'brussels', 'cargo', 'airdolomiti'].forEach((key) => {
    brand(key);
    const main = root(LEGAL + CONTENT);
    const before = main.innerHTML;
    assert.equal(hidePrivacySettings(main), 0, String(key));
    assert.equal(main.innerHTML, before, String(key));
  });
});

test('decorateMain hides them (pages, nav, footer and fragments go through it); the footer\'s click handler stays for the others', async () => {
  const { decorateMain } = await import('../scripts/scripts.js');
  brand('tap');
  const main = root(LEGAL);
  decorateMain(main);
  assert.equal(main.querySelectorAll('a[href="#privacy-settings"]').length, 0);
  assert.deepEqual(texts(main), ['Imprint', 'Privacy', 'Terms']);
  ['discover', 'cargo'].forEach((key) => {
    brand(key);
    const kept = root(LEGAL);
    decorateMain(kept);
    assert.equal(kept.querySelectorAll('a[href="#privacy-settings"]').length, 1, key);
  });
  const footer = fs.readFileSync('blocks/footer/footer.js', 'utf8');
  assert.match(footer, /href === '#privacy-settings'/);
});
