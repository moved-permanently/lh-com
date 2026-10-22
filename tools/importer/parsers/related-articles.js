/* eslint-disable */
/* global WebImporter */

/**
 * Parser for related-articles (Lufthansa Insights ".relatedarticles": a.articles-card links).
 *
 * Output (blocks/related-articles README): 1 row per related article, 2 columns:
 *   cell 1: the card image (.card-image img)
 *   cell 2: link (href = card target, text = ".card-title", the full title from the image alt
 *           when the source cuts it), then a byline paragraph "date | reading time | author"
 *           (.article-date, .article-duration, .article-author as printed on the card)
 * The block reads image, byline and title from the head of the linked page when a cell leaves
 * them out; articles outside the site (www.lufthansa.com links) only have the authored ones.
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
    const content = [p];
    const byline = ['.article-date', '.article-duration', '.article-author']
      .map((sel) => visibleText(card.querySelector(sel))).filter(Boolean);
    if (byline.length) {
      const by = document.createElement('p');
      by.textContent = byline.join(' | ');
      content.push(by);
    }
    const src = card.querySelector('.card-image img[src], img[src]');
    let imageCell = '';
    if (src && src.getAttribute('src') && !/^(data|blob):/i.test(src.getAttribute('src'))) {
      const img = document.createElement('img');
      img.src = src.getAttribute('src');
      img.alt = clean(src.getAttribute('alt'));
      imageCell = img;
    }
    cells.push([imageCell, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'related-articles', cells });
  element.replaceWith(...before, block);
}
