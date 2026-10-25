/* eslint-disable */
/* global WebImporter */

/**
 * Parser for message-center: the Message Center items at the top of the current travel
 * information pages (`.sidebar` whose content column holds `.messagecenterwrapper`; its items are
 * rendered from the Message Center at request time). The messages come from the Message Center
 * index (/message-center/index.json), so the sidebar becomes one empty `message-center` block
 * (blocks/message-center README: irregularities and outages; an optional "Types" row changes that).
 */
export default function parse(element, { document }) {
  const block = WebImporter.Blocks.createBlock(document, { name: 'message-center', cells: [] });
  element.replaceWith(block);
}
