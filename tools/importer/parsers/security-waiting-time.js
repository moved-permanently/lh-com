/* eslint-disable */
/* global WebImporter */

/**
 * Parser for security-waiting-time (`.securitywaitingtime > .dcep-security-waiting-time`, the live
 * security waiting times: /{cc}/{ll}/prepare-for-your-trip/airport-information/
 * services-at-the-airport/security-waiting-time).
 *
 * The snapshot holds the component's loading frames only (www renders the select and the times
 * client-side from /service/api/security-waiting-time/*); the block does the same from the live
 * data, so nothing of the snapshot reaches the document.
 *
 * Output: an empty security-waiting-time block.
 */
export default function parse(element, { document }) {
  const block = WebImporter.Blocks.createBlock(document, { name: 'security-waiting-time', cells: [] });
  element.replaceWith(block);
}
