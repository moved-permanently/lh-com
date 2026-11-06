/* eslint-disable */
/* global WebImporter */

/**
 * Parser for passenger-receipt: www's passenger receipt download form on
 * /{cc}/{ll}/book-and-manage/pax-receipt (`.wrapper > passenger-receipt-portal`, a React app that
 * renders the form into the page at runtime; the snapshots hold the empty element or its
 * "Loading" frame). Nothing of it is authored content, so it becomes one empty
 * `passenger-receipt` block (blocks/passenger-receipt README): the block draws www's form from its
 * texts and the live labels. Before, the importer dropped it.
 */
export default function parse(element, { document }) {
  const block = WebImporter.Blocks.createBlock(document, { name: 'passenger-receipt', cells: [] });
  element.replaceWith(block);
}
