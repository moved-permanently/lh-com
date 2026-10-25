/* eslint-disable */
/* global WebImporter */

/**
 * Parser for destination-offer (www's destination page, ".singleofferdisplay >
 * .dcep-single-offer-display"). The widget builds the page from the URL parameters (OriginCode,
 * DestinationCode, TripDuration, Cabin / tripType) when it is viewed; opened without them it
 * shows an error ("This page isn't loading correctly ..."), which is what the snapshot holds. So
 * the block holds the widget's public configuration (data-dcep), never the rendered text:
 *
 *   data-dcep { allOffersUrl, maxAdults, maxChildren, maxInfants, tripDuration,
 *               destinationContentLanguages }
 *
 * Output (blocks/destination-offer README): key | value rows
 *   All offers        | link to allOffersUrl
 *   Trip duration     | tripDuration (the default stay when the URL has none)
 *   Max adults / Max children / Max infants
 *   Content languages | destinationContentLanguages
 */
export default function parse(element, { document }) {
  const host = element.matches('.dcep-single-offer-display[data-dcep]') ? element : element.querySelector('.dcep-single-offer-display[data-dcep]');
  let cfg = {};
  try { cfg = JSON.parse((host && host.getAttribute('data-dcep')) || '{}') || {}; } catch (e) { cfg = {}; }
  const rows = [];
  if (cfg.allOffersUrl) {
    const a = document.createElement('a');
    a.setAttribute('href', cfg.allOffersUrl);
    a.textContent = cfg.allOffersUrl;
    rows.push(['All offers', a]);
  }
  [['Trip duration', 'tripDuration'], ['Max adults', 'maxAdults'], ['Max children', 'maxChildren'], ['Max infants', 'maxInfants']]
    .forEach(([label, key]) => { if (Number(cfg[key]) > 0) rows.push([label, String(Number(cfg[key]))]); });
  if (cfg.destinationContentLanguages) rows.push(['Content languages', String(cfg.destinationContentLanguages)]);
  const wrapper = element.closest('.singleofferdisplay') || element;
  wrapper.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'destination-offer', cells: rows }));
}
