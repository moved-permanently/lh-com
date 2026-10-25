/* eslint-disable */
/* global WebImporter */
import { AUTHOR_CARD_IMAGES } from './article-data.js';

/**
 * Parser for blog-overview (Lufthansa Insights article list ".blogoverview >
 * .dcep-blog-overview"). The list is live on www (all articles of the market, filtered by the
 * widget's configuration), so the block holds the configuration, not the cards, and takes it
 * from the widget's public data-dcep, not from the rendered cards: the snapshot may show the
 * first page, "Loading..." or an error text.
 *
 *   data-dcep { categoryId, selectedTag, authorId (base64 of "lh/<slug>"), paginationSize,
 *               hideFilter }
 *
 * Output (blocks/blog-overview README): key | value rows, only the options www sets:
 *   Category    | the category's path segment (www's id; "highlights-em", the English id of
 *                 Highlights, is the segment "highlights")
 *   Tag         | articles:<id>
 *   Author      | lh/<slug> (decoded)
 *   Page size   | paginationSize
 *   Hide filter | true / false
 *
 * On an author page (meta template "author") the page's Metadata also gets page-type "author",
 * author, author-id, author-description (the first paragraph of the bio) and card-image (the
 * square image of www's author slider, AUTHOR_CARD_IMAGES), for the author index: one Metadata
 * table as article-header writes it (the head entries getMetadata reads are removed).
 */
export default function parse(element, { document, url, params }) {
  const clean = (s) => String(s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const host = element.matches('.dcep-blog-overview[data-dcep]') ? element : element.querySelector('.dcep-blog-overview[data-dcep]');
  let cfg = {};
  try { cfg = JSON.parse((host && host.getAttribute('data-dcep')) || '{}') || {}; } catch (e) { cfg = {}; }

  // www's authorId is base64 of "lh/<slug>"
  const decodeAuthor = (v) => {
    const s = clean(v);
    if (!s || s.includes('/')) return s;
    try {
      const d = decodeURIComponent(escape(atob(s)));
      return /^[a-z]+\/\S+$/.test(d) ? d : s;
    } catch (e) { return s; }
  };

  const rows = [];
  const category = clean(cfg.categoryId).replace(/-em$/, '');
  if (category) rows.push(['Category', category]);
  if (clean(cfg.selectedTag)) rows.push(['Tag', clean(cfg.selectedTag)]);
  const author = decodeAuthor(cfg.authorId);
  if (author) rows.push(['Author', author]);
  if (Number(cfg.paginationSize) > 0) rows.push(['Page size', String(Number(cfg.paginationSize))]);
  if (cfg.hideFilter !== undefined && cfg.hideFilter !== '') rows.push(['Hide filter', String(cfg.hideFilter === true || cfg.hideFilter === 'true')]);

  const wrapper = element.closest('.blogoverview') || element;
  wrapper.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'blog-overview', cells: rows }));

  // --- author page metadata (the author index)
  const template = document.querySelector('meta[name="template"]');
  if (!author || !template || template.getAttribute('content') !== 'author') return;
  const pagePath = (() => {
    try { return new URL((params && params.originalURL) || url).pathname.replace(/\.html$/, '').replace(/\/$/, ''); } catch (e) { return ''; }
  })();
  const content = document.querySelector('.author-details-page .author-content, .author-content');
  const h1 = content && content.querySelector('h1');
  const name = clean(h1 && h1.textContent);
  const bio = content && [...content.querySelectorAll('p')].map((p) => clean(p.textContent)).find(Boolean);
  const meta = WebImporter.Blocks.getMetadata(document);
  meta['page-type'] = 'author';
  if (name) meta.author = name;
  meta['author-id'] = author;
  if (bio) meta['author-description'] = bio;
  const square = AUTHOR_CARD_IMAGES[pagePath];
  if (square) {
    const img = document.createElement('img');
    img.setAttribute('src', `https://www.lufthansa.com${square}`);
    img.setAttribute('alt', '');
    meta['card-image'] = img;
  }
  const head = document.head;
  if (head) {
    ['description', 'og:image', 'og:image:alt', 'og:title', 'og:description', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']
      .forEach((n) => head.querySelectorAll(`meta[${n.includes(':') ? 'property' : 'name'}="${n}"]`).forEach((m) => m.remove()));
    head.querySelectorAll('title').forEach((t) => t.remove());
  }
  document.body.append(WebImporter.Blocks.getMetadataBlock(document, meta));
}
