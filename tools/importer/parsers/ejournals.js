/* eslint-disable */
/* global WebImporter */

/**
 * Parser for ejournals: the eJournals download of /{de/de,de/en,at/de,gb/en}/unterhaltung-an-bord
 * (`.ejournals > .dcep-ejournals`, no data-dcep). The snapshots caught the live app at its
 * "Loading..." frames, and none of what it renders is authored content, so the component becomes
 * one empty `ejournals` block (blocks/ejournals README): the block renders the logged-out view
 * from the live labels. The "Login" heading before it stays (the page's "Go to login" link points
 * to #login).
 */
export default function parse(element, { document }) {
  const block = WebImporter.Blocks.createBlock(document, { name: 'ejournals', cells: [] });
  element.replaceWith(block);
}
