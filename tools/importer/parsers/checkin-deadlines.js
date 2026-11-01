/* eslint-disable */
/* global WebImporter */

/**
 * Parser for checkin-deadlines (`.checkindeadlinesearch > .dcep-checkin-deadline-search`, www's
 * check-in deadline search: /{cc}/{ll}/check-in-deadlines).
 *
 * The snapshot holds the component's form only (the countries, then airports and deadlines come
 * client-side from /service/api/catalogs/checkin/info/*); the block does the same from the live
 * data, with lh's labels and www's page as its fallback link, so nothing of the snapshot reaches
 * the document.
 *
 * Output: an empty checkin-deadlines block.
 */
export default function parse(element, { document }) {
  const block = WebImporter.Blocks.createBlock(document, { name: 'checkin-deadlines', cells: [] });
  element.replaceWith(block);
}
