/* eslint-disable */
/* global WebImporter */

/**
 * Parser for micro-frontend (www's micro-frontend hosts, e.g. <trip-management> on
 * /{cc}/{ll}/book-and-manage/trip-management, <culinary-hub> on Discover's culinaryjourney). The
 * app renders itself at runtime from www's scripts (blocks/micro-frontend), so the snapshot's
 * rendered markup (the empty "Your trip" shell) is not content: the app's name (the element's
 * tag) in the first row; the culinary hub's data-configuration and data-api-gateway as the rows
 * Configuration and API gateway (the block writes them back as data- attributes).
 */
const ROWS = {
  'culinary-hub': [['Configuration', 'data-configuration'], ['API gateway', 'data-api-gateway']],
};

const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();

/**
 * The page on www where the app works: the snapshot's canonical when it names a www host
 * (www.swiss.com's claim pages), else the import URL's path on www.lufthansa.com.
 */
function livePage(document, url) {
  const canonical = (document.querySelector('link[rel="canonical"]') || { getAttribute: () => '' }).getAttribute('href') || '';
  if (/^https:\/\/www\.[a-z.-]+\/[^?#]*$/.test(canonical)) return canonical;
  try {
    const u = new URL((url || '').replace(/^http:\/\/localhost:\d+/, 'https://www.lufthansa.com'));
    return `https://www.lufthansa.com${u.pathname.replace(/\.html$/, '')}`;
  } catch (e) {
    return 'https://www.lufthansa.com/';
  }
}

/** The Fallback's Continue: bold (the site's primary button, as www's yellow one), to www's page. */
function liveButton(document, text, live) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  const a = document.createElement('a');
  a.href = live;
  a.setAttribute('data-live-link', '');
  a.textContent = text;
  strong.append(a);
  p.append(strong);
  return p;
}

/**
 * baggage-form-entry's Fallback (SWISS's /<root>/baggage-reimbursement): www's first screen, its
 * headline, the two texts above the form (bold kept) and Continue to the page on www.
 */
function baggageFallback(element, document, url) {
  const head = clean((element.querySelector('maui-headline') || {}).textContent);
  const button = clean((element.querySelector('maui-button') || {}).textContent);
  if (!head || !button) return null;
  const h1 = document.createElement('h1');
  h1.textContent = head;
  const texts = [...element.querySelectorAll('maui-copy')].slice(0, 2).map((c) => {
    const p = document.createElement('p');
    p.innerHTML = c.innerHTML.replace(/\s+/g, ' ').trim();
    return p;
  }).filter((p) => clean(p.textContent));
  return [h1, ...texts, liveButton(document, button, livePage(document, url))];
}

/**
 * claim-form-entry's Fallback (lufthansa.com's /{cc}/{ll}/support/fast-compensation/
 * compensation-flight-disruptions, SWISS's /<root>/fast-compensation; shown until the app renders,
 * and where it does not: its module comes only from a host that serves /digitalhangar/ itself, its
 * APIs answer www only): www's first step, its headline, instruction and Continue button, the
 * button a link to the page on www, where the app works.
 */
function claimFallback(element, document, url) {
  // the first screen only: its headline and the text after it (a headline, in 0.11.9 a copy), up
  // to its Continue button (the error dialogs' headlines come after it)
  const first = element.querySelector('maui-button');
  const before = (el) => first && (el.compareDocumentPosition(first) & 4);
  const heads = [...element.querySelectorAll('maui-headline, maui-copy')].filter(before)
    .map((h) => clean(h.textContent)).filter(Boolean);
  const button = clean((first || {}).textContent);
  if (!heads.length || !button) return null;
  const live = livePage(document, url);
  const out = [];
  const h1 = document.createElement('h1');
  h1.textContent = heads[0];
  out.push(h1);
  if (heads[1]) {
    const p = document.createElement('p');
    p.textContent = heads[1];
    out.push(p);
  }
  out.push(liveButton(document, button, live));
  return out;
}

const FALLBACKS = { 'claim-form-entry': claimFallback, 'baggage-form-entry': baggageFallback };

export default function parse(element, { document, url }) {
  const name = element.tagName.toLowerCase();
  const cells = [[name]];
  (ROWS[name] || []).forEach(([label, attr]) => {
    const value = (element.getAttribute(attr) || '').trim();
    if (value) cells.push([label, value]);
  });
  // the release the page's script names (SWISS's importers: data-app-version, withAppVersions)
  const version = (element.getAttribute('data-app-version') || '').trim();
  if (/^(\d+\.\d+\.\d+|latest)$/.test(version)) cells.push(['Version', version]);
  const fallback = FALLBACKS[name] ? FALLBACKS[name](element, document, url) : null;
  if (fallback) cells.push(['Fallback', fallback]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'micro-frontend', cells });
  element.replaceWith(block);
}
