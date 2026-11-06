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
 * emitted before the block table at www's level (type, www: h3) with www's size (format, www: h2:
 * the heading-medium class, which the cleanup writes as the "{heading-medium}" marker); an h2
 * without type.
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
    const level = (el) => {
      const m = /^h([1-6])$/i.exec((el && el.getAttribute && el.getAttribute('type')) || '');
      return m ? m[1] : null;
    };
    const type = level(headline) || (headline && /^H[1-6]$/.test(headline.tagName) ? headline.tagName[1] : '2');
    const format = /^h([1-6])$/i.exec((headline && headline.getAttribute && headline.getAttribute('format')) || '');
    const SIZES = { 1: 'heading-large', 2: 'heading-medium', 3: 'heading-copytext-large', 4: 'heading-copytext-large', 5: 'heading-copytext-medium', 6: 'heading-copytext-medium' };
    const h = document.createElement(`h${type}`);
    h.textContent = headlineText;
    if (format && format[1] !== type) h.className = SIZES[format[1]];
    before.push(h);
  }

  // www's picks are not imported (its third card is a random fill): the block picks from the
  // article index at runtime; rows an editor adds come first
  const cells = [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'related-articles', cells });
  element.replaceWith(...before, block);
}
