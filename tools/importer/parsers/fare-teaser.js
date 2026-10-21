/* eslint-disable */
/* global WebImporter */

/**
 * Parser for fare-teaser (Lufthansa ".fareteaserstatic" / ".dcep-fare-teaser-static").
 *
 * Output: the section heading as default content above the block, then a 2-column key/value
 * config table read by blocks/fare-teaser (readConfigRows):
 *   Origin        | Frankfurt (FRA)
 *   Destinations  | Chicago (CHI), Washington D.C. (WAS), ...
 *   Trip duration | 7
 *   Cabin         | E
 *   Price label   | Round trip from
 *   Link          | URL pattern (only when the source links differ from the block default)
 *   Conditions    | conditions label + conditions text (from the portalled conditions dialog)
 *
 * Live prices and destination images are NOT authored: the block loads them at runtime.
 * All values are read from the source (DOM and the component's data-dcep props), never
 * hard-coded, so the parser works for every locale.
 */
export default function parse(element, { document }) {
  const SR_ONLY = '.sr-only, .visually-hidden, maui-screen-reader-label';
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const clone = node.cloneNode(true);
    clone.querySelectorAll(SR_ONLY).forEach((n) => n.remove());
    return clean(clone.textContent);
  };
  const attr = (node, name) => clean(node ? node.getAttribute(name) : '');
  const code = (v) => (/^[A-Za-z]{3}$/.test(clean(v)) ? clean(v).toUpperCase() : '');

  // Component props (raw source page only).
  let props = {};
  const propsHost = element.querySelector('[data-dcep]') || (element.hasAttribute('data-dcep') ? element : null);
  if (propsHost) {
    try { props = JSON.parse(propsHost.getAttribute('data-dcep')) || {}; } catch (e) { props = {}; }
  }

  // Routes rendered in the DOM: code from the link's query, names from the visible card.
  const routes = [...element.querySelectorAll('.fareteaser-recommendation')].map((card) => {
    const link = card.querySelector('a[href]');
    let params = new URLSearchParams();
    let url = null;
    if (link) {
      try {
        url = new URL(link.getAttribute('href'), 'https://www.lufthansa.com/');
        params = url.searchParams;
      } catch (e) { /* ignore */ }
    }
    return {
      url,
      origin: code(params.get('OriginCode')),
      originName: visibleText(card.querySelector('.fareteaser-recommendation-origin')),
      destination: code(params.get('DestinationCode')),
      destinationName: visibleText(card.querySelector('.fareteaser-recommendation-destination')),
      tripDuration: clean(params.get('TripDuration')),
      cabin: clean(params.get('Cabin')),
    };
  });

  const manual = Array.isArray(props.fareTeaserManualTravels) ? props.fareTeaserManualTravels : [];
  const named = (c, name) => (c ? (name ? `${name} (${c})` : c) : '');

  const cells = [];
  const addRow = (key, value) => {
    if (value === null || value === undefined) return;
    if (typeof value === 'string' && !value) return;
    if (Array.isArray(value) && !value.length) return;
    cells.push([key, value]);
  };

  // Origin.
  const originCode = code(manual[0] && manual[0].origin) || (routes.find((r) => r.origin) || {}).origin || '';
  const originRoute = routes.find((r) => r.origin === originCode && r.originName);
  addRow('Origin', named(originCode, originRoute && originRoute.originName));

  // Destinations (authored list from props; DOM order/names as fallback).
  const destCodes = manual.length
    ? manual.map((t) => code(t.destination)).filter(Boolean)
    : routes.map((r) => r.destination).filter(Boolean);
  const destinations = [...new Set(destCodes)].map((c) => {
    const r = routes.find((x) => x.destination === c);
    return named(c, r && r.destinationName);
  });
  addRow('Destinations', destinations.join(', '));

  const firstRoute = routes.find((r) => r.url) || {};
  addRow('Trip duration', clean(String(props.tripDuration || '')) || firstRoute.tripDuration || '');
  addRow('Cabin', clean(props.cabin) || firstRoute.cabin || '');

  // Price label (label only, never the price).
  addRow('Price label', attr(element.querySelector('maui-price-display[label]'), 'label'));

  // Link pattern only when the route links do not use the block default
  // ({locale}/book-and-manage/destination?OriginCode&DestinationCode&TripDuration&Cabin).
  if (firstRoute.url && !/^\/[a-z]{2}\/[a-z]{2}\/book-and-manage\/destination$/.test(firstRoute.url.pathname.replace(/\.html$/, ''))) {
    let pattern = `${firstRoute.url.origin}${firstRoute.url.pathname}${firstRoute.url.search}`;
    const swap = (value, token) => {
      if (value) pattern = pattern.split(`=${encodeURIComponent(value)}`).join(`=${token}`);
    };
    swap(firstRoute.origin, '{origin}');
    swap(firstRoute.destination, '{destination}');
    swap(firstRoute.tripDuration, '{duration}');
    swap(firstRoute.cabin, '{cabin}');
    addRow('Link', pattern);
  }

  // Conditions: footer text, the "Conditions" dialog trigger label and the dialog content.
  const conditions = [];
  const footerText = clean(props.footerText);
  if (footerText) {
    const p = document.createElement('p');
    p.textContent = footerText;
    conditions.push(p);
  }
  const trigger = element.querySelector('.disclaimerandconditions maui-link-button, .disclaimerandconditions button, .disclaimerandconditions a');
  const triggerLabel = visibleText(trigger);
  const triggerHref = trigger && trigger.getAttribute('href');
  if (triggerLabel) {
    const p = document.createElement('p');
    if (triggerHref && !triggerHref.startsWith('#')) {
      const a = document.createElement('a');
      a.href = triggerHref;
      a.textContent = triggerLabel;
      p.append(a);
    } else {
      const strong = document.createElement('strong');
      strong.textContent = triggerLabel;
      p.append(strong);
    }
    conditions.push(p);
  }
  if (trigger) {
    // Conditions dialogs are portalled to <body> without an id reference: they are plain
    // rich-text maui-modals in the same order as the fare components that open them.
    const dialogs = [...document.querySelectorAll('maui-modal')]
      .filter((m) => !element.contains(m) && m.querySelector(':scope > .richtext') && !m.querySelector('maui-button, maui-button-link, form, input'));
    const owners = [...document.querySelectorAll('.disclaimerandconditions')]
      .map((d) => d.closest('[class*="fareteaser"].section, .section') || d)
      .filter((o, i, all) => all.indexOf(o) === i);
    const index = Math.max(0, owners.findIndex((o) => o === element || o.contains(element) || element.contains(o)));
    const dialog = dialogs[Math.min(index, dialogs.length - 1)];
    if (dialog) {
      dialog.querySelectorAll('.richtext p, .richtext li').forEach((node) => {
        const text = visibleText(node);
        if (!text) return;
        const p = document.createElement('p');
        p.innerHTML = node.innerHTML;
        p.querySelectorAll(SR_ONLY).forEach((n) => n.remove());
        conditions.push(p);
      });
    }
  }
  addRow('Conditions', conditions);

  // Section heading stays default content above the block.
  const headline = element.querySelector('maui-headline, h2, h3');
  const headingText = visibleText(headline) || clean(props.headline);
  const block = WebImporter.Blocks.createBlock(document, { name: 'fare-teaser', cells });
  if (headingText) {
    const type = attr(headline, 'type').toLowerCase();
    const level = /^h[1-6]$/.test(type) ? type : (headline && /^H[1-6]$/.test(headline.tagName) ? headline.tagName.toLowerCase() : 'h2');
    const heading = document.createElement(level);
    heading.textContent = headingText;
    element.replaceWith(heading, block);
  } else {
    element.replaceWith(block);
  }
}
