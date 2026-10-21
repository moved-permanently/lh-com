/* eslint-disable */
/* global WebImporter */

/**
 * Parser for weather (AirCore `#content > .weather`).
 *
 * The source widget is an empty shell (".weather.weather-wrapper.hidden" with only an H2);
 * the forecast is loaded at runtime from /aircore/weather/{code} by the block. The parser only
 * emits the configuration.
 *
 * Output: 2-column key/value config table.
 *   Title    | heading text of the widget ("Current weather in New York")
 *   Location | city/airport code of the destination. Read, in this order, from
 *              - a data attribute on the widget (data-location / data-city / data-iata ...)
 *              - the destination preset of the AirCore flight search (#flightTo-input[data-value])
 *              - an already converted flight-search block ("Default destination" row)
 *              - a 3-letter code in parentheses in the page H1 ("Flight to New York (NYC) ...")
 *              Without a code the row is omitted and the block stays hidden (like the source).
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const code = (value) => {
    const v = clean(value);
    const inParens = v.match(/\(([A-Za-z]{3})\)/);
    if (inParens) return inParens[1].toUpperCase();
    return /^[A-Za-z]{3}$/.test(v) ? v.toUpperCase() : '';
  };

  const heading = element.querySelector('h1, h2, h3, h4');
  const title = clean(heading && heading.textContent);

  let location = '';
  ['data-location', 'data-city', 'data-iata', 'data-code', 'data-destination'].some((name) => {
    const host = element.hasAttribute(name) ? element : element.querySelector(`[${name}]`);
    location = host ? code(host.getAttribute(name)) : '';
    return Boolean(location);
  });
  if (!location) {
    const to = document.querySelector('#flightTo-input[data-value]');
    location = to ? code(to.getAttribute('data-value')) : '';
  }
  if (!location) {
    // flight-search may already have been converted into a block table
    const row = [...document.querySelectorAll('table tr')].find((tr) => {
      const first = tr.querySelector('td, th');
      return first && /^default destination$/i.test(clean(first.textContent));
    });
    const valueCell = row && row.querySelectorAll('td, th')[1];
    location = valueCell ? code(valueCell.textContent) : '';
  }
  if (!location) {
    const h1 = document.querySelector('h1');
    location = h1 ? code((clean(h1.textContent).match(/\(([A-Za-z]{3})\)/) || [])[0]) : '';
  }

  const cells = [];
  if (title) cells.push(['Title', title]);
  if (location) cells.push(['Location', location]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'weather', cells });
  element.replaceWith(block);
}
