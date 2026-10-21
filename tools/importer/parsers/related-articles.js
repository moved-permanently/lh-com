/* eslint-disable */
/* global WebImporter */

/**
 * Parser for related-articles (Lufthansa Insights ".relatedarticles": a.articles-card links).
 *
 * Output (blocks/related-articles README): 1 column, one row per related article holding a link
 * (href = card target, text = ".card-title"). Card image, date, reading time and author are not
 * authored: the block reads them from the query index of the target page.
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

  const cells = [];
  const seen = new Set();
  element.querySelectorAll('a.articles-card[href], .related-articles a[href]').forEach((card) => {
    const href = card.getAttribute('href');
    if (!href || seen.has(href)) return;
    seen.add(href);
    let title = visibleText(card.querySelector('.card-title, h2, h3, h4, h5'))
      || clean(card.getAttribute('title')) || visibleText(card) || href;
    // titles are clamped with an ellipsis in the source; the card image alt holds the full one
    const truncated = title.match(/^(.*?)\s*(…|\.\.\.)$/);
    if (truncated && truncated[1]) {
      const img = card.querySelector('img[alt]');
      const alt = clean(img && img.getAttribute('alt'));
      if (alt && alt.startsWith(truncated[1])) title = alt;
    }
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = title;
    const p = document.createElement('p');
    p.append(a);
    cells.push([p]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'related-articles', cells });
  element.replaceWith(...before, block);
}
