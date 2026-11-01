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

/**
 * claim-form-entry's Fallback (lufthansa.com's /{cc}/{ll}/support/fast-compensation/
 * compensation-flight-disruptions; shown until the app renders, and where it does not: its module
 * comes only from a host that serves /digitalhangar/ itself, its APIs answer www.lufthansa.com
 * only): www's first step, its headline, instruction and Continue button, the button (bold: the
 * site's primary button, as www's yellow one) a link to the page on www, where the app works.
 */
function claimFallback(element, document, url) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const heads = [...element.querySelectorAll('maui-headline')].map((h) => clean(h.textContent)).filter(Boolean);
  const button = clean((element.querySelector('maui-button') || {}).textContent);
  if (!heads.length || !button) return null;
  let live = 'https://www.lufthansa.com/';
  try {
    const u = new URL((url || '').replace(/^http:\/\/localhost:\d+/, 'https://www.lufthansa.com'));
    live = `https://www.lufthansa.com${u.pathname.replace(/\.html$/, '')}`;
  } catch (e) {
    // the default
  }
  const out = [];
  const h1 = document.createElement('h1');
  h1.textContent = heads[0];
  out.push(h1);
  if (heads[1]) {
    const p = document.createElement('p');
    p.textContent = heads[1];
    out.push(p);
  }
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  const a = document.createElement('a');
  a.href = live;
  a.setAttribute('data-live-link', '');
  a.textContent = button;
  strong.append(a);
  p.append(strong);
  out.push(p);
  return out;
}

export default function parse(element, { document, url }) {
  const name = element.tagName.toLowerCase();
  const cells = [[name]];
  (ROWS[name] || []).forEach(([label, attr]) => {
    const value = (element.getAttribute(attr) || '').trim();
    if (value) cells.push([label, value]);
  });
  const fallback = name === 'claim-form-entry' ? claimFallback(element, document, url) : null;
  if (fallback) cells.push(['Fallback', fallback]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'micro-frontend', cells });
  element.replaceWith(block);
}
