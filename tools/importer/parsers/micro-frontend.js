/* eslint-disable */
/* global WebImporter */

/**
 * Parser for micro-frontend (www's micro-frontend hosts, e.g. <trip-management> on
 * /{cc}/{ll}/book-and-manage/trip-management). The app renders itself at runtime from www's
 * scripts (blocks/micro-frontend), so the snapshot's rendered markup (the empty "Your trip" shell)
 * is not content: one cell, the app's name (the element's tag).
 */
export default function parse(element, { document }) {
  const name = element.tagName.toLowerCase();
  const block = WebImporter.Blocks.createBlock(document, { name: 'micro-frontend', cells: [[name]] });
  element.replaceWith(block);
}
