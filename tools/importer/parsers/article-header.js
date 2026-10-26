/* eslint-disable */
/* global WebImporter */
import { AUTHOR_IDS, ARTICLE_META } from './article-data.js';
import { edsDamPath, decodePath } from '../../../scripts/dam-path.js';

// header videos without a copy in DA: gone on www (404), or a 225 MB film kept in R2 only (it
// would play on lh-edge alone); their articles keep the still picture
const HEADER_VIDEOS_NOT_COPIED = new Set([
  '/content/dam/video/c3/headeranimation/lh_blog_hongkong_animation_16x9.mp4',
  '/content/dam/video/c3/campaigns/yes-story/lh/01_video/lh_blog_yes_video_tim_1920x1080.mp4',
]);

// www errors not copied: pages whose <title> is in the wrong language (de/en Toronto article:
// "A Perfect Day: Toronto an einem Tag"); their Title is the headline
const TITLE_FROM_HEADLINE = new Set(['/de/en/articles/explore-the-world/a-perfect-day-toronto-in-one-day']);

/**
 * Parser for article-header (Lufthansa Insights article: ".article-details-page >
 * .article-feature-image" plus its siblings in ".article-content").
 *
 * Output (blocks/article-header README): 1 column.
 *   row 1: feature image (src + alt), then the header video link when www's moving image has
 *          one (videoUrl, a link to the copy's /content/dam/... path, " {mobile}" after it when
 *          www plays it on small screens)
 *   row 2: H1 (".article-title h1") and intro paragraph(s) (".article-intro .article-description")
 * The tag chips (maui-chip[label]), the byline (".article-details": date | reading time |
 * author) and the share widgets are removed from the body. Tags, publication date (ISO when the
 * text can be read with the page language's month names, otherwise as shown), reading time and
 * author become page metadata: the parser writes ONE Metadata table (Title / Description /
 * Image etc. from the head as WebImporter.Blocks.getMetadata reads them, the feature image as
 * page image, plus tags / publication-date / reading-time / author) at the end of the page and
 * removes the head entries getMetadata reads, so the import script's createMetadata() call does
 * not add a second Metadata block.
 * For the article lists (query index per locale, blocks blog-overview and related-articles) the
 * Metadata also holds: page-type "article", tag-ids (www's ids "articles:<id>", from the chips'
 * links, in the order of the tag titles), author-id (www's id from article-data.js, else a slug
 * of the name), category (the path segment after /articles/), card-image and card-image-alt (the
 * feature image, which www's list cards show), keywords (meta keywords, where www has them) and
 * destinations (the IATA codes of the page's destination widgets: blog cookie, sticky price).
 * Author id, category and publication date come from www's list answer for the article when it
 * was exported (ARTICLE_META): one author name can have several ids, the category is not always
 * the path segment, at/de prints "Jänner".
 */
export default function parse(element, { document, url, params }) {
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
  const clean = (s) => (s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);
  const isBr = (n) => n && n.nodeType === 1 && n.tagName === 'BR';
  const isBlank = (n) => n && n.nodeType === 3 && !clean(n.nodeValue);
  const trimBreaks = (el) => {
    while (el.lastChild && (isBr(el.lastChild) || isBlank(el.lastChild))) el.lastChild.remove();
    while (el.firstChild && (isBr(el.firstChild) || isBlank(el.firstChild))) el.firstChild.remove();
  };

  const page = element.closest('.article-details-page') || element.parentElement || document.body;
  const content = page.querySelector('.article-content') || page;

  // --- row 1: feature image
  const img = [...element.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
  let image = null;
  if (img) {
    image = document.createElement('img');
    image.setAttribute('src', img.getAttribute('src'));
    image.setAttribute('alt', img.getAttribute('alt') || '');
  }

  // --- row 1: the header video of www's moving image (data-dcep videoUrl, on www.lufthansa.com
  // or media.lufthansa.com) as a link to the site's copy, " {mobile}" when www plays it on small
  // screens too (isVideoEnabledOnMobile); parallax images have none
  let videoLink = null;
  const moving = element.querySelector('.dcep-moving-image[data-dcep]');
  if (image && moving) {
    let cfg = {};
    try { cfg = JSON.parse(moving.getAttribute('data-dcep')) || {}; } catch (e) { cfg = {}; }
    const asset = decodePath(String(cfg.videoUrl || '').trim()
      .replace(/^https?:\/\/(www|media)\.lufthansa\.com(?=\/)/, '').split(/[?#]/)[0]);
    if (/^\/content\/dam\/.+\.mp4$/i.test(asset) && !cfg.isParallaxEnabled && !HEADER_VIDEOS_NOT_COPIED.has(asset)) {
      videoLink = document.createElement('p');
      const a = document.createElement('a');
      // the importer writes every .mp4 link absolute on www (helix-importer uploads them as
      // assets); switch-dam-media.mjs turns it into the site's copy afterwards
      a.setAttribute('href', edsDamPath(asset));
      a.textContent = edsDamPath(asset);
      videoLink.append(a);
      if (cfg.isVideoEnabledOnMobile === true) videoLink.append(document.createTextNode(' {mobile}'));
    }
  }

  // --- row 2: H1 + intro
  const text = [];
  const titleWrap = content.querySelector('.article-title');
  const h1 = (titleWrap || content).querySelector('h1');
  if (h1 && visibleText(h1)) {
    const h = document.createElement('h1');
    h.textContent = visibleText(h1);
    text.push(h);
  }
  const intro = content.querySelector('.article-intro');
  const description = intro && (intro.querySelector('.article-description') || intro);
  if (description) {
    const paras = [...description.querySelectorAll('p, ul, ol')].filter((p) => !p.parentElement.closest('p, ul, ol'));
    if (paras.length) {
      paras.forEach((p) => {
        const c = p.cloneNode(true);
        c.querySelectorAll(SKIP).forEach((s) => s.remove());
        c.removeAttribute('class');
        if (c.tagName === 'P') trimBreaks(c);
        if (clean(c.textContent)) text.push(c);
      });
    } else if (visibleText(description) && description !== intro) {
      const p = document.createElement('p');
      p.textContent = visibleText(description);
      text.push(p);
    }
  }

  // --- page metadata from the article chrome
  const chipEls = [...content.querySelectorAll('.chip-wrapper maui-chip, maui-chip')];
  const tags = chipEls.map((c) => clean(c.getAttribute('label')) || visibleText(c)).filter(Boolean);
  // www's tag id: the tag page the chip links to (.../articles/tags/<id>), else its test id
  const tagIds = chipEls.map((c) => {
    const link = c.getAttribute('data-link') || '';
    const m = link.match(/\/articles\/tags\/([^/?#]+)/);
    const id = m ? m[1] : clean(c.getAttribute('data-testid'));
    return id ? `articles:${id.replace(/\.html$/, '')}` : '';
  }).filter(Boolean);
  const pagePath = (() => {
    try { return new URL((params && params.originalURL) || url).pathname; } catch (e) { return ''; }
  })();
  const categoryMatch = pagePath.match(/^\/[a-z]{2}\/[a-z]{2}\/articles\/([^/]+)\/[^/]+/);
  const dcep = (sel) => [...document.querySelectorAll(`${sel}[data-dcep]`)].map((el) => {
    try { return JSON.parse(el.getAttribute('data-dcep')) || {}; } catch (e) { return {}; }
  });
  const destinations = [...new Set([...dcep('.dcep-blog-cookie'), ...dcep('.dcep-sticky-price')]
    .map((c) => clean(c.destinationCode).toUpperCase()).filter((c) => /^[A-Z]{3}$/.test(c)))];
  const keywordsMeta = document.querySelector('meta[name="keywords"]');
  const keywords = clean(keywordsMeta && keywordsMeta.getAttribute('content'));
  const details = (intro && intro.querySelector('.article-details')) || content.querySelector('.article-details');
  const dateText = visibleText(details && details.querySelector('.article-date'));
  const readingTime = visibleText(details && details.querySelector('.article-duration'));
  const author = visibleText(details && details.querySelector('.article-author'));

  /** "20. August 2026" / "August 20, 2026" -> 2026-08-20, using the page language's month names. */
  const toIsoDate = (value) => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const htmlLang = (document.documentElement.getAttribute('lang') || '').trim();
    const metaLang = document.querySelector('meta[name="language"]');
    const langs = [...new Set([htmlLang, metaLang && metaLang.getAttribute('content'), 'en'].filter(Boolean))];
    const norm = (s) => s.toLowerCase().replace(/\./g, '').normalize('NFC');
    const words = value.split(/[\s,./-]+/).filter(Boolean);
    let month = -1;
    let day = -1;
    let year = -1;
    words.forEach((w) => {
      if (/^\d{4}$/.test(w)) year = parseInt(w, 10);
      else if (/^\d{1,2}$/.test(w)) {
        const n = parseInt(w, 10);
        if (day < 0) day = n; else if (month < 0 && n <= 12) month = n - 1;
      } else if (month < 0) {
        langs.some((lang) => {
          try {
            for (let m = 0; m < 12; m += 1) {
              const d = new Date(Date.UTC(2000, m, 15));
              const names = ['long', 'short'].map((f) => norm(new Intl.DateTimeFormat(lang, { month: f, timeZone: 'UTC' }).format(d)));
              if (names.includes(norm(w))) { month = m; return true; }
            }
          } catch (e) { /* unsupported language tag */ }
          return false;
        });
      }
    });
    if (year < 0 || month < 0 || day < 1 || day > 31) return value;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // --- remove the parts now held by the block / metadata
  const chips = content.querySelector('.chip-wrapper');
  if (chips) (chips.parentElement !== content && chips.parentElement.children.length === 1 ? chips.parentElement : chips).remove();
  if (titleWrap) titleWrap.remove();
  else if (h1) h1.remove();
  if (intro) intro.remove();
  page.querySelectorAll('.article-share, .article-share-mobile').forEach((s) => s.remove());

  const cells = [];
  if (image) cells.push(videoLink ? [[image, videoLink]] : [image]);
  if (text.length) cells.push([text]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'article-header', cells });
  element.replaceWith(block);

  // --- one Metadata table (head values + article values); createMetadata() then adds nothing
  const meta = WebImporter.Blocks.getMetadata(document);
  if (image) {
    const pageImage = document.createElement('img');
    pageImage.setAttribute('src', image.getAttribute('src'));
    pageImage.setAttribute('alt', image.getAttribute('alt') || '');
    meta.Image = pageImage;
  }
  if (tags.length) meta.tags = [...new Set(tags)].join(', ');
  const www = ARTICLE_META[pagePath] || {};
  if (www.date || dateText) meta['publication-date'] = www.date || toIsoDate(dateText);
  if (readingTime) meta['reading-time'] = readingTime;
  if (author) meta.author = author;
  meta['page-type'] = 'article';
  if (TITLE_FROM_HEADLINE.has(pagePath) && text[0] && text[0].tagName === 'H1') meta.Title = `${text[0].textContent} | Lufthansa`;
  if (tagIds.length) meta['tag-ids'] = [...new Set(tagIds)].join(', ');
  if (www.authorId) meta['author-id'] = www.authorId;
  else if (author) {
    const slug = author.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    meta['author-id'] = AUTHOR_IDS[author] || `lh/${slug}`;
  }
  if (www.category || categoryMatch) meta.category = www.category || categoryMatch[1];
  if (image) {
    const card = document.createElement('img');
    card.setAttribute('src', image.getAttribute('src'));
    card.setAttribute('alt', image.getAttribute('alt') || '');
    meta['card-image'] = card;
    if (image.getAttribute('alt')) meta['card-image-alt'] = image.getAttribute('alt');
  }
  if (keywords) meta.keywords = keywords;
  if (destinations.length) meta.destinations = destinations.join(', ');
  if (Object.keys(meta).length) {
    const head = document.head;
    if (head) {
      const names = ['description', 'og:image', 'og:image:alt', 'og:title', 'og:description',
        'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt'];
      names.forEach((n) => head.querySelectorAll(`meta[${n.includes(':') ? 'property' : 'name'}="${n}"]`).forEach((m) => m.remove()));
      head.querySelectorAll('title').forEach((t) => t.remove());
    }
    document.body.append(WebImporter.Blocks.getMetadataBlock(document, meta));
  }
}
