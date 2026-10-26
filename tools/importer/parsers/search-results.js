/* eslint-disable */
/* global WebImporter */

/**
 * Parser for search-results (`.onsitesearchresult > .dcep-search-results-aem`, www's site search
 * result page /{cc}/{ll}/support/search/search-result).
 *
 * www renders the form, the "Your search for" heading and the results at runtime from the query
 * and its search API; the block does the same from the locale's search index. Output, as the
 * block library's search block: one row with the query index to search,
 * /{cc}/{ll}/search-index.json (as text: a path, so the link rules of the import leave it).
 */
export default function parse(element, { document, url, params }) {
  let pathname = '';
  try { pathname = new URL((params && params.originalURL) || url).pathname; } catch (e) { pathname = ''; }
  const m = pathname.match(/^\/([a-z]{2})\/([a-z]{2})\//);
  const cells = m ? [[`/${m[1]}/${m[2]}/search-index.json`]] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'search-results', cells });
  element.replaceWith(block);
}
