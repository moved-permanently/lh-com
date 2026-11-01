/* eslint-disable */
/* global WebImporter */

/**
 * Parser for micro-frontend (www's micro-frontend hosts, e.g. <trip-management> on
 * /{cc}/{ll}/book-and-manage/trip-management, <culinary-hub> on Discover's culinaryjourney). The
 * app renders itself at runtime from www's scripts (blocks/micro-frontend), so the snapshot's
 * rendered markup (the empty "Your trip" shell) is not content: the app's name (the element's
 * tag) in the first row; the culinary hub's data-configuration and data-api-gateway as the rows
 * Configuration and API gateway (the block writes them back as data- attributes).
 */
const ROWS = {
  'culinary-hub': [['Configuration', 'data-configuration'], ['API gateway', 'data-api-gateway']],
};

export default function parse(element, { document }) {
  const name = element.tagName.toLowerCase();
  const cells = [[name]];
  (ROWS[name] || []).forEach(([label, attr]) => {
    const value = (element.getAttribute(attr) || '').trim();
    if (value) cells.push([label, value]);
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'micro-frontend', cells });
  element.replaceWith(block);
}
