/* eslint-disable */
/* global WebImporter */

/**
 * Parser for lounge-finder (`.loungefinder > .dcep-lounge-finder`, the live lounge finder:
 * /{cc}/{ll}/lounges, /{cc}/{ll}/tips-senior-travellers).
 *
 * The rendered form (error box, headline, field labels, button text) is dropped: the block
 * builds the form at runtime from the live labels of the page language, so frozen texts (the
 * English defaults of the at/de/lounges snapshot) do not reach the document.
 *
 * Output: an empty lounge-finder block, or one row `Image base | {imageBaseUrl}` when the
 * data-dcep `imageBaseUrl` differs from the block default. The grey band is the section
 * transformer's (the .container-gray inside the component makes it a section of its own).
 */
const DEFAULT_IMAGE_BASE = '/content/dam/lh/images/lounges';

export default function parse(element, { document }) {
  const host = element.matches('.dcep-lounge-finder') ? element : element.querySelector('.dcep-lounge-finder');
  let config = {};
  try {
    config = JSON.parse((host && host.getAttribute('data-dcep')) || '{}') || {};
  } catch (e) {
    config = {};
  }
  const imageBase = typeof config.imageBaseUrl === 'string' ? config.imageBaseUrl.trim().replace(/\/$/, '') : '';

  const cells = [];
  if (imageBase && imageBase !== DEFAULT_IMAGE_BASE) cells.push(['Image base', imageBase]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'lounge-finder', cells });
  element.replaceWith(block);
}
