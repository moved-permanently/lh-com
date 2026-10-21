/* eslint-disable */
/* global WebImporter */

/**
 * Parser for destination-finder (Lufthansa ".fareteaserdynamicevo" / ".dcep-fare-teaser-dynamic-evo").
 *
 * Output: 2-column key/value config table read by blocks/destination-finder (readConfigRows):
 *   Heading            | Flight offers from          (headline text before the origin picker)
 *   Default origin     | Frankfurt (FRA)             (data-dcep.preselectedOrigin / link OriginCode)
 *   Origin input label | label of the origin input
 *   Trip types         | Round trip, One way         (maui-chip labels, in order)
 *   Trip duration      | 14                          (TripDuration of the recommendation links)
 *   Price label        | Round trip from             (maui-price-display label, never the price)
 *   Finder card        | image + text + link         (last slide, data-testid=destination-finder-card)
 *   CTA                | All offers & destinations link
 *   Disclaimer         | footer disclaimer text
 *   Conditions         | conditions label + text of the portalled conditions dialog
 *
 * The recommended destinations and their prices come from the live API at runtime and are
 * NOT authored. Every value is read from the source, so the parser works for all locales.
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
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);
  const para = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  };
  const linkPara = (href, label) => {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    p.append(a);
    return p;
  };
  const queryOf = (href) => {
    try { return new URL(href, 'https://www.lufthansa.com/').searchParams; } catch (e) { return new URLSearchParams(); }
  };

  // Component props (raw source page only).
  let props = {};
  const propsHost = element.querySelector('[data-dcep]') || (element.hasAttribute('data-dcep') ? element : null);
  if (propsHost) {
    try { props = JSON.parse(propsHost.getAttribute('data-dcep')) || {}; } catch (e) { props = {}; }
  }

  const cells = [];
  const addRow = (key, value) => {
    if (value === null || value === undefined) return;
    if (typeof value === 'string' && !value) return;
    if (Array.isArray(value) && !value.length) return;
    cells.push([key, value]);
  };

  // Heading: headline text up to the inline origin picker.
  const headline = element.querySelector('.inlinetextdropdown maui-headline, .fareteaser-recommendation-headline maui-headline, maui-headline');
  let headingText = '';
  if (headline) {
    const clone = headline.cloneNode(true);
    clone.querySelectorAll(`.inlinetextautocomplete, .selectable, input, label, button, ${SR_ONLY}`).forEach((n) => n.remove());
    headingText = clean(clone.textContent);
  }
  addRow('Heading', headingText);

  // Origin.
  const originInput = element.querySelector('.inlinetextautocomplete input:not([type="hidden"]), .autocomplete-airport input:not([type="hidden"])');
  const cards = [...element.querySelectorAll('.swiper-slide a.ftde-card[href], a.ftde-card[href]')]
    .filter((a, i, all) => all.indexOf(a) === i);
  const destinationCards = cards.filter((a) => a.getAttribute('data-testid') !== 'destination-finder-card' && a.querySelector('maui-price-display, .ftde-card-price'));
  const firstQuery = destinationCards.length ? queryOf(destinationCards[0].getAttribute('href')) : new URLSearchParams();
  const originCode = code(props.preselectedOrigin) || code(firstQuery.get('OriginCode'));
  const originName = attr(originInput, 'value')
    || visibleText(element.querySelector('.inlinetextautocomplete-measure'));
  if (originCode) addRow('Default origin', originName && !code(originName) ? `${originName} (${originCode})` : originCode);
  const originLabel = visibleText(element.querySelector('.inlinetextautocomplete label, .autocomplete-airport label'))
    || attr(originInput, 'placeholder');
  addRow('Origin input label', originLabel);

  // Trip types (first = round trip, second = one way).
  const chips = [...element.querySelectorAll('.trip-type-chips maui-chip, maui-chip-list maui-chip')]
    .filter((c, i, all) => all.indexOf(c) === i)
    .map((c) => attr(c, 'label') || visibleText(c))
    .filter(Boolean);
  const tripTypes = [...new Set(chips)];
  addRow('Trip types', tripTypes.join(', '));
  // data-dcep isOneWayDefault: the one-way chip starts selected (fareteaser/offers tripType)
  if (props.isOneWayDefault === true && tripTypes[1]) addRow('Default trip type', tripTypes[1]);

  addRow('Trip duration', clean(firstQuery.get('TripDuration')));
  // data-dcep airlineWhitelistingEnabled: sent as airlineDestWhitelist in the offers request
  if (props.airlineWhitelistingEnabled === true) addRow('Airline whitelist', 'yes');

  // Price label only (prices are live data).
  addRow('Price label', attr(element.querySelector('maui-price-display[label]'), 'label'));

  // Finder card (last slide): image, text, link.
  const finder = cards.find((a) => a.getAttribute('data-testid') === 'destination-finder-card')
    || cards.find((a) => !a.querySelector('maui-price-display, .ftde-card-price'));
  if (finder) {
    const content = [];
    const img = [...finder.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
    if (img) {
      const image = document.createElement('img');
      image.src = img.getAttribute('src');
      image.alt = img.getAttribute('alt') || '';
      content.push(image);
    }
    const copy = visibleText(finder.querySelector('maui-copy, p'));
    if (copy) content.push(para(copy));
    const nav = finder.querySelector('maui-navigation-link[href], maui-button-link[href]');
    const label = visibleText(nav) || attr(finder, 'aria-label');
    const href = (nav && nav.getAttribute('href')) || finder.getAttribute('href');
    if (href && label) content.push(linkPara(href, label));
    addRow('Finder card', content);
  }

  // Footer CTA.
  const cta = element.querySelector('.ftde-footer-cta maui-button-link[href], .ftde-footer-cta a[href], .recommender-footer maui-button-link[href]');
  if (cta && visibleText(cta)) addRow('CTA', [linkPara(cta.getAttribute('href'), visibleText(cta))]);

  // Disclaimer.
  const disclaimerNode = element.querySelector('.recommender-footer .disclaimer maui-copy, .recommender-footer .disclaimer p');
  const disclaimer = visibleText(disclaimerNode)
    || attr(element.querySelector('maui-price-display[conditions]'), 'conditions');
  if (disclaimer) addRow('Disclaimer', [para(disclaimer)]);

  // Conditions: dialog trigger label + content of the matching portalled dialog.
  const conditions = [];
  const trigger = element.querySelector('.disclaimerandconditions maui-link-button, .disclaimerandconditions button, .disclaimerandconditions a');
  const triggerLabel = visibleText(trigger);
  const triggerHref = trigger && trigger.getAttribute('href');
  if (triggerLabel) {
    if (triggerHref && !triggerHref.startsWith('#')) {
      conditions.push(linkPara(triggerHref, triggerLabel));
    } else {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = triggerLabel;
      p.append(strong);
      conditions.push(p);
    }
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
        if (!visibleText(node)) return;
        const p = document.createElement('p');
        p.innerHTML = node.innerHTML;
        p.querySelectorAll(SR_ONLY).forEach((n) => n.remove());
        conditions.push(p);
      });
    }
  }
  addRow('Conditions', conditions);

  const block = WebImporter.Blocks.createBlock(document, { name: 'destination-finder', cells });
  element.replaceWith(block);
}
