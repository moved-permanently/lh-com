/* eslint-disable */
/* global WebImporter */

/**
 * Parser for flash-teaser: the Message Center strip at the top of the market homepages
 * (`.flashteasercore > .dcep-flash-teaser`, messages in its data-dcep JSON at render time).
 * The messages are not page content: they come from the Message Center index
 * (/message-center/index.json), so the component becomes one empty `flash-teaser` block
 * (blocks/flash-teaser README: all three types; an optional "Types" row limits them).
 */
export default function parse(element, { document }) {
  const block = WebImporter.Blocks.createBlock(document, { name: 'flash-teaser', cells: [] });
  element.replaceWith(block);
}
