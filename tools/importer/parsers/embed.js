/* eslint-disable */
/* global WebImporter */
import { embedUrl } from './media-nodes.js';

/**
 * Parser for embed (Lufthansa video component ".video" > .video-player > iframe: YouTube;
 * iframe component ".iframe" > .iframe-wrapper > iframe: in-flight entertainment widget).
 *
 * Output (EDS embed convention): 1 column, 2 rows: the block name, then one cell with the URL
 * of the external content as a link (YouTube as https://www.youtube-nocookie.com/embed/{id},
 * the widget URL as on live with id, type, lang). No poster image: the live players have none.
 * Components that other parsers import (accordion panels, mapped column views) are detached or
 * inside their table by now and left alone; other iframes are not embeds (nothing written).
 */
export default function parse(element, { document }) {
  if (!element.isConnected || !element.parentElement || element.parentElement.closest('table')) return;
  const href = embedUrl(element);
  if (!href) return;
  const link = document.createElement('a');
  link.setAttribute('href', href);
  link.textContent = href;
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'embed', cells: [[link]] }));
}
