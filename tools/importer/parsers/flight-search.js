/* eslint-disable */
/* global WebImporter */

/**
 * Parser for flight-search (Lufthansa ".redesignedflightmanager" / ".dcep-flight-manager").
 *
 * Output: 2-column key/value config table read by blocks/flight-search (readConfigRows).
 * Keys are config keys (not visible content); every value is read from the source DOM so the
 * parser works for all locales. Rows are only emitted when the source provides a value; the
 * block falls back to locale defaults (e.g. the locale home airport) for omitted rows.
 *
 * Source (prerendered React):
 *   .tab-nav .tab-link                         -> Tabs
 *   .triptype-dropdown-wrapper button          -> Trip types / Default trip type
 *   .travel-details-opener                     -> Traveller label
 *   .btn-nonstop-only .custom-control-description -> Nonstop label
 *   .autocomplete-airport label (1st / 2nd)    -> From label / To label
 *   origin input value or data-dcep.prefilledOrigin (only when it contains an IATA code)
 *   .date-input maui-input[label|errormessage] -> Date label / Date error
 *   maui-button (submit)                       -> Submit label
 *   .flma-where-we-fly-wrapper link            -> Where we fly
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

  // React props of the flight manager (only present on the raw source page).
  let props = {};
  const propsHost = element.querySelector('[data-dcep]') || (element.hasAttribute('data-dcep') ? element : null);
  if (propsHost) {
    try { props = JSON.parse(propsHost.getAttribute('data-dcep')) || {}; } catch (e) { props = {}; }
  }

  const cells = [];
  const addRow = (key, value) => {
    if (value === null || value === undefined) return;
    if (typeof value === 'string' && !value) return;
    cells.push([key, value]);
  };

  // Tabs: only the visible flight tab(s).
  const tabs = [...element.querySelectorAll('.tab-nav .tab-link, .tab-nav [role="tab"]')]
    .filter((t, i, all) => all.indexOf(t) === i)
    .map((t) => visibleText(t) || attr(t, 'aria-label'))
    .filter(Boolean);
  addRow('Tabs', [...new Set(tabs)].join(', '));

  // Trip types: selected value from the dropdown button, further options from the menu if rendered.
  const tripWrapper = element.querySelector('.triptype-dropdown-wrapper');
  const tripButton = tripWrapper && tripWrapper.querySelector('button.dropdown-button, button');
  const selectedTrip = visibleText(tripButton && (tripButton.querySelector('.dropdown-content') || tripButton));
  let tripTypes = tripWrapper
    ? [...tripWrapper.querySelectorAll('ul li, [role="option"]')].map(visibleText).filter(Boolean)
    : [];
  if (!tripTypes.length && selectedTrip) {
    // The menu is rendered on demand; the same trip type labels are used by the trip-type chips
    // of other flight components on the page (e.g. the destination finder).
    const chips = [...document.querySelectorAll('maui-chip-list')]
      .map((list) => [...list.querySelectorAll('maui-chip')].map((c) => attr(c, 'label') || visibleText(c)).filter(Boolean))
      .find((labels) => labels.length >= 2 && labels[0].toLowerCase() === selectedTrip.toLowerCase());
    tripTypes = chips ? chips.slice(0, 2) : [selectedTrip];
  }
  addRow('Trip types', [...new Set(tripTypes)].join(', '));
  if (tripTypes.length > 1) addRow('Default trip type', selectedTrip);

  addRow('Traveller label', visibleText(element.querySelector('.travel-details-opener')));
  addRow('Nonstop label', visibleText(element.querySelector('.btn-nonstop-only .custom-control-description')));

  // Origin / destination fields.
  const airportFields = [...element.querySelectorAll('.autocomplete-airport')];
  const originField = element.querySelector('.retracted-field-origin .autocomplete-airport') || airportFields[0];
  const destinationField = airportFields.find((f) => f !== originField);
  const fieldLabel = (field) => {
    if (!field) return '';
    const input = field.querySelector('input:not([type="hidden"])');
    return visibleText(field.querySelector('label')) || attr(input, 'placeholder');
  };
  const fieldValue = (field) => attr(field && field.querySelector('input:not([type="hidden"])'), 'value');
  const withCode = (value) => (/\([A-Za-z]{3}\)/.test(value) || /^[A-Za-z]{3}$/.test(value) ? value : '');

  addRow('From label', fieldLabel(originField));
  addRow('Default origin', withCode(clean(props.prefilledOrigin)) || withCode(fieldValue(originField)));
  addRow('To label', fieldLabel(destinationField));
  addRow('Default destination', withCode(clean(props.prefilledDestination)) || withCode(fieldValue(destinationField)));

  // Dates.
  const dateInput = element.querySelector('.date-input maui-input, .date-input input, maui-input[id*="travelDatetime"]');
  addRow('Date label', attr(dateInput, 'label') || attr(dateInput, 'placeholder'));
  addRow('Date error', attr(dateInput, 'errormessage'));

  // Submit.
  const submit = element.querySelector('maui-button[behavior="submit"], form maui-button, form button[type="submit"]');
  addRow('Submit label', visibleText(submit));

  // Cabin preset (authored on the source component, empty on most pages).
  if (/^[A-Za-z]$/.test(clean(props.prefilledCabinClass))) addRow('Cabin', clean(props.prefilledCabinClass).toUpperCase());

  // "Where we fly" link (a maui-navigation-link custom element on the source).
  const wwf = element.querySelector('.flma-where-we-fly-wrapper [href]');
  if (wwf && visibleText(wwf)) {
    const a = document.createElement('a');
    a.href = wwf.getAttribute('href');
    a.textContent = visibleText(wwf);
    addRow('Where we fly', a);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'flight-search', cells });
  element.replaceWith(block);
}
