/* eslint-disable */
/* global WebImporter */

/**
 * Parser for related-articles (Lufthansa Insights ".relatedarticles": a.articles-card links).
 *
 * Output (blocks/related-articles README): the empty block. The block picks three articles from
 * the locale's article index when the page is viewed (two sharing tags with the page, priority
 * tags first, and one of the page's category); www's three picked cards are not written as rows,
 * since rows are fixed picks an editor adds and come first.
 * The section heading (maui-headline.related-articles-headline) is default content and is
 * emitted as an H2 before the block table.
 */
export default function parse(element, { document }) {
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
  const clean = (s) => (s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };

  const before = [];
  const headline = element.querySelector('.related-articles-headline, maui-headline, h2, h3');
  const headlineText = visibleText(headline) || clean(headline && (headline.getAttribute('text') || headline.getAttribute('headline')));
  if (headlineText) {
    const h = document.createElement('h2');
    h.textContent = headlineText;
    before.push(h);
  }

  // www's picks are not imported (its third card is a random fill): the block picks from the
  // article index at runtime; rows an editor adds come first
  const cells = [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'related-articles', cells });
  element.replaceWith(...before, block);
}
