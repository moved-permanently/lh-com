/* eslint-disable max-len */
/* global WebImporter */
/**
 * SWISS's magazine (www.swiss.com/magazine/<ll>/, lh-swiss; the capture's swiss-snapshots-033
 * onwards): one import for its pages, run offline over the snapshots by
 * tools/importer/swiss-magazine-import.mjs. www's markup is AEM core components (not the dcep
 * components of lh-com's templates); this script maps it to lh-com's blocks:
 * - an article (.articlecontentfragment): article-header (the hero picture of
 *   .header-component-wrapper; the h1 and lead), the body as default content (paragraphs,
 *   headings, lists; .dynamic-image-component as the picture and its caption; .quote as the quote
 *   block; image carousels as carousel-images; YouTube videos and Google Maps as embed; buttons as
 *   links), www's credits as the closing lines, "More stories" as related-articles (its index:
 *   scripts/site-languages.js SUB_SITES magazine articleIndex); metadata: tags and tag-ids (www's
 *   #tags), category (the breadcrumb's parent), page-type article, publication-date (ISO from the
 *   credits), author, card-image;
 * - an overview (front, section and category pages): each teaser container a blog-overview (grid)
 *   over the magazine's index (Path: the teasers' common parent, Page size: their count, Load more
 *   false; a category page's own list: its path, 12, Load more), the top stories carousels as
 *   carousel-cards (www's curated picks), the front page's featured story as carousel-cards;
 * - google ads, the story download, the language dialog: left out (the nav and footer documents:
 *   swiss-magazine-import.mjs).
 * Images: www's asset of each rendition (.../x.component.crop-16x9-L-1x.ts=1.jpeg/content/... is
 * .../x.jpeg) on www.swiss.com; the runner shows them from DA. The document path is
 * swiss-import.mjs's docName of www's (leading, trailing or double hyphens, capitals out).
 * Exported helpers: test/swiss-magazine-import.test.mjs.
 */

const ORIGIN = 'https://www.swiss.com';

export const clean = (s) => String(s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ')
  .trim();

/** The DAM asset of a www rendition src (decoded path), or '' (a placeholder: src=".jpeg"). */
export function assetOf(src) {
  let p = String(src || '').trim().split(/\s/)[0];
  try { p = decodeURIComponent(p); } catch (e) { /* as it is */ }
  p = p.replace(/^https?:\/\/(www\.)?swiss\.com/, '');
  const m = p.match(/^(\/content\/dam\/.+?)\.component\.[^/]*?\.([a-z0-9]+)\/content\//i);
  if (m) return `${m[1]}.${m[2]}`;
  return /^\/content\/dam\/.+\.[a-z0-9]+$/i.test(p) ? p : '';
}

/** The document path of a www path (swiss-import.mjs docName's rule). */
export const docName = (p) => p.split('/').map((seg) => seg.toLowerCase().replace(/&/g, '-and-').replace(/[^a-z0-9-]/g, '-')
  .replace(/-{2,}/g, '-')
  .replace(/^-|-$/g, '')).join('/');

const MONTHS = {
  de: ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'],
  en: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
};
const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** A credits date as ISO ("21. Februar 2026", "February 21, 2026", "13.04.2023"), else ''. */
export function isoDate(text) {
  const t = clean(text).toLowerCase();
  let m = t.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m) return iso(m[3], m[2], m[1]);
  // en's two-digit years ("Published: 01.06.23")
  m = t.match(/(\d{1,2})\.(\d{1,2})\.(\d{2})(?!\d)/);
  if (m) return iso(`20${m[3]}`, m[2], m[1]);
  const month = (name) => {
    const all = [...MONTHS.de, ...MONTHS.en];
    const i = all.findIndex((x) => name.startsWith(x.slice(0, 3)));
    return i < 0 ? 0 : (i % 12) + 1;
  };
  m = t.match(/(\d{1,2})\.?\s+([a-zäöü]+)\s+(\d{4})/);
  if (m && month(m[2])) return iso(m[3], month(m[2]), m[1]);
  m = t.match(/([a-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (m && month(m[1])) return iso(m[3], month(m[1]), m[2]);
  return '';
}

/** The credits (the .credits__wrapper elements): date (ISO), author (Text: ...), the lines. */
export function creditsOf(wrapper) {
  // a line each paragraph and line break ("Text und Bilder: …<br>Veröffentlicht am 05.01.2024")
  const lines = [...(wrapper || [])].flatMap((w) => [...w.querySelectorAll('p')])
    .flatMap((p) => p.innerHTML.split(/<br\s*\/?>/i).map((h) => clean(h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&'))))
    .filter(Boolean);
  // the publication date before an update's ("Aktualisiert am")
  const dated = lines.find((l) => /publi|veröffentlicht/i.test(l) && isoDate(l)) || lines.find((l) => l.length < 80 && isoDate(l)) || '';
  // "Text: Anja Suter", "Text & Video: Reto Hoffmann", "Selektion & Text: Claus Schweitzer"
  const by = lines.find((l) => /^[^:]{0,30}\b(text|autor|author)\b[^:]{0,30}:/i.test(l)) || '';
  const author = by.replace(/^[^:]+:\s*/, '').split(/\s+(?:fotos?|photos?|bilder|images?|illustrations?|video)\s*:/i)[0].trim();
  return { date: isoDate(dated), author, lines };
}

const table = (document, name, rows) => WebImporter.Blocks.createBlock(document, { name, cells: rows });

function picture(document, img) {
  if (!img) return null;
  // a lazy image's src is a placeholder (".jpg"): its picture's sources name the rendition
  const sources = [...(img.closest('picture')?.querySelectorAll('source[srcset]') || [])].map((s) => s.getAttribute('srcset'));
  const asset = [img.getAttribute('src'), img.getAttribute('data-src'), ...sources].map(assetOf).find(Boolean);
  if (!asset) return null;
  const out = document.createElement('img');
  out.setAttribute('src', `${ORIGIN}${encodeURI(asset)}`);
  const alt = clean(img.getAttribute('alt'));
  // www's alt is at times the file name ("777_01.jpeg"): none then
  out.setAttribute('alt', /\.(jpe?g|png|gif|webp)$/i.test(alt) ? '' : alt);
  return out;
}

const para = (document, ...nodes) => {
  const p = document.createElement('p');
  nodes.filter(Boolean).forEach((n) => p.append(n));
  return p;
};

/** A dynamic image component: its picture and its caption (with www's copyright) below. */
function imageOf(document, el) {
  const img = picture(document, el.querySelector('img'));
  if (!img) return [];
  const out = [para(document, img)];
  const caption = clean(el.querySelector('.caption-wrapper')?.textContent);
  const credit = clean(el.querySelector('.dynamic-image-copyright')?.textContent).replace(/^©\s*|\s*©$/g, '');
  if (caption || credit) {
    const em = document.createElement('em');
    em.textContent = [caption, credit ? `© ${credit}` : ''].filter(Boolean).join(' ');
    out.push(para(document, em));
  }
  return out;
}

/** A teaser (article.teaser): its link, title, label and image. */
function teaserOf(el) {
  const a = el.querySelector('a[href]');
  return {
    href: a ? a.getAttribute('href') : '',
    title: clean(el.querySelector('h3, h2')?.textContent),
    label: clean(el.querySelector('.teaser-label')?.textContent),
    img: el.querySelector('img'),
  };
}

/** carousel-cards rows of teasers: the image; the label, the title linked. */
function cardRows(document, teasers) {
  return teasers.filter((t) => t.href && t.title).map((t) => {
    const content = [];
    if (t.label) content.push(para(document, document.createTextNode(t.label)));
    const h = document.createElement('h3');
    const a = document.createElement('a');
    a.setAttribute('href', t.href);
    a.textContent = t.title;
    h.append(a);
    content.push(h);
    return [picture(document, t.img) || '', content];
  });
}

/** The longest common parent path of links (/magazine/de/reisen/destinationen/x ... -> its dir). */
export function commonParent(hrefs) {
  const parts = hrefs.filter(Boolean).map((h) => h.replace(/^https?:\/\/[^/]+/, '').split('?')[0].split('/').slice(0, -1));
  if (!parts.length) return '';
  const out = [];
  for (let i = 0; i < parts[0].length; i += 1) {
    if (parts.every((p) => p[i] === parts[0][i])) out.push(parts[0][i]); else break;
  }
  return out.join('/');
}

/** The article body's nodes as default content and blocks (in document order). */
function bodyOf(document, body, out) {
  const walk = (node) => {
    [...node.children].forEach((el) => {
      const cls = el.classList;
      if (el.id && /div-inside-pos|tatm-div/.test(el.id)) return;
      if (cls.contains('teasercontainer') || cls.contains('advertisement')) return;
      if (/^(P|H2|H3|H4|H5|H6|UL|OL)$/.test(el.tagName)) {
        if (!clean(el.textContent) && !el.querySelector('img')) return;
        const c = el.cloneNode(true);
        c.removeAttribute('class');
        c.querySelectorAll('[class]').forEach((x) => x.removeAttribute('class'));
        // www's bold lead-in ends in its line break (<b>Frage?<br></b>Antwort): the break after
        // the bold text, which the conversion keeps (inside it, it is dropped)
        // (also in an inline element within it: <b>Frage?<i><br> </i></b>; the importer's own
        // pass writes the trailing space as <span> </span> before the transform)
        let inner = c.innerHTML;
        for (let k = 0; k < 3; k += 1) {
          inner = inner.replace(/<(i|em|u|span)>(?:\s|&nbsp;)*<\/\1>/gi, ' ')
            .replace(/<(i|em|u|span)>\s*<br\s*\/?>\s*<\/\1>/gi, '<br>')
            .replace(/<br\s*\/?>\s*<\/(b|strong|i|em|u|span)>/gi, '</$1><br>');
        }
        // a paragraph that opens with it: the bold line and the text as two paragraphs (the
        // conversion drops a break right after bold text)
        const lead = c.tagName === 'P' && inner.match(/^\s*(<(b|strong)>[\s\S]*?<\/\2>)\s*<br>\s*([\s\S]*\S[\s\S]*)$/i);
        if (lead) {
          const [, bold, , rest] = lead;
          const head = document.createElement('p');
          head.innerHTML = bold;
          out.push(head);
          inner = rest;
        }
        c.innerHTML = inner;
        // www's links without a scheme ("hauserwirth.com"): the site they name
        // and without "mailto:" ("ambientmedia@swiss.com"); www's other link attributes go
        c.querySelectorAll('a').forEach((a) => {
          const href = (a.getAttribute('href') || '').trim();
          // www's links without an address (<a>–</a>, href=""): their text
          if (!href) { a.replaceWith(...a.childNodes); return; }
          [...a.attributes].map((x) => x.name).filter((n) => n !== 'href').forEach((n) => a.removeAttribute(n));
          // www's own link to an address below one of its pages (en's marche-aux-puces:
          // …/magazine/de/reisen/lifestyle/chezsarah.net): the site; a file as it is
          const below = href.match(/^(?:https?:\/\/(?:www\.)?swiss\.com)?\/magazine\/.*\/((?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})$/i);
          if (below && !/\.(html?|pdf|jpe?g|png|gif|svg|webp|mp4|zip|docx?|xlsx?|pptx?|txt|json|xml|ics)$/i.test(below[1])) {
            a.setAttribute('href', `https://${below[1]}`);
            return;
          }
          if (/^(https?:|\/|#|mailto:|tel:)/i.test(href)) return;
          // (www's spaces and soft hyphens in them: "www.%20lelion.net", "www.hygge%C2%ADhamburg.de")
          let bare = href;
          try { bare = decodeURIComponent(href); } catch (e) { /* as it is */ }
          bare = bare.replace(/[\s\u00AD]+/g, '');
          if (/^[^\s/:@]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(bare)) a.setAttribute('href', `mailto:${bare}`);
          else if (/^(www\.)?[\p{L}0-9-]+(\.[\p{L}0-9-]+)*\.[a-z]{2,}(\/|$)/iu.test(bare)) a.setAttribute('href', `https://${bare}`);
          // a name, not an address ("Gundari"): its text
          else a.replaceWith(...a.childNodes);
        });
        out.push(c);
        return;
      }
      if (cls.contains('dynamic-image-component')) { out.push(...imageOf(document, el)); return; }
      if (cls.contains('quote') || el.querySelector(':scope > .quote')) {
        const q = cls.contains('quote') ? el : el.querySelector(':scope > .quote');
        const text = clean(q.querySelector('.quote-text')?.textContent);
        const who = [clean(q.querySelector('.quote-source-author')?.textContent), clean(q.querySelector('.quote-source-description')?.textContent)].filter(Boolean).join(', ');
        if (text) out.push(table(document, 'quote', [[text, who]]));
        return;
      }
      if (cls.contains('teasercarousel') || cls.contains('image-series')) {
        const rows = [...el.querySelectorAll('.dynamic-image-component')].map((d) => {
          const img = picture(document, d.querySelector('img'));
          return img ? [img, clean(d.querySelector('.caption-wrapper')?.textContent)] : null;
        }).filter(Boolean);
        if (rows.length) out.push(table(document, 'carousel-images', rows));
        return;
      }
      if (cls.contains('js-video-component') || cls.contains('video')) {
        const src = el.querySelector('iframe')?.getAttribute('src') || '';
        if (/youtube/.test(src)) {
          const a = document.createElement('a');
          const [href] = src.split('?');
          a.setAttribute('href', href);
          a.textContent = href;
          out.push(table(document, 'embed', [[a]]));
          const caption = clean(el.querySelector('.video-caption')?.textContent);
          if (caption) { const em = document.createElement('em'); em.textContent = caption; out.push(para(document, em)); }
        }
        return;
      }
      if (cls.contains('js-map-component') || cls.contains('map')) {
        const src = el.querySelector('iframe')?.getAttribute('src') || '';
        if (/google\.com\/maps\/embed/.test(src)) {
          const a = document.createElement('a');
          a.setAttribute('href', src);
          a.textContent = src;
          out.push(table(document, 'embed', [[a]]));
          const caption = clean(el.querySelector('.map-caption')?.textContent);
          if (caption) { const em = document.createElement('em'); em.textContent = caption; out.push(para(document, em)); }
        }
        return;
      }
      if (cls.contains('button-component')) {
        const a = el.querySelector('a[href]');
        if (a) {
          const link = document.createElement('a');
          link.setAttribute('href', a.getAttribute('href'));
          link.textContent = clean(a.textContent);
          const strong = document.createElement('strong');
          strong.append(link);
          out.push(para(document, strong));
        }
        return;
      }
      if (cls.contains('teaserlist')) {
        const rows = cardRows(document, [...el.querySelectorAll('article.teaser')].map(teaserOf));
        if (rows.length) out.push(table(document, 'carousel-cards (grid)', rows));
        return;
      }
      walk(el);
    });
  };
  walk(body);
}

/** The page's main content (an element) and its metadata. */
export function transformPage(document, wwwPath) {
  const main = document.createElement('div');
  const lang = wwwPath.split('/')[2] || 'de';
  const meta = {};
  const intro = document.querySelector('.m-article-intro');
  const crumbs = [...document.querySelectorAll('.cmp-breadcrumb__item-link, .breadcrumb a')].map((a) => clean(a.textContent));
  if (intro) {
    // --- an article
    const heroImg = picture(document, document.querySelector('.header-component-wrapper img'));
    const h1 = document.createElement('h1');
    h1.textContent = clean(intro.querySelector('h1')?.textContent);
    const lead = [...intro.querySelectorAll('.lead p, .lead')].filter((p) => p.tagName === 'P').map((p) => para(document, document.createTextNode(clean(p.textContent)))).filter((p) => p.textContent);
    main.append(table(document, 'article-header', [[heroImg || ''], [[h1, ...lead]]]));
    // www's articles have no description of their own: the lead (the cards' and search's text)
    if (lead.length) meta.description = lead.map((p) => clean(p.textContent)).join(' ');
    const out = [];
    const body = document.querySelector('.m-article-body');
    if (body) bodyOf(document, body, out);
    out.forEach((n) => main.append(n));
    // (the credits are in the body: its closing lines, as www shows them)
    const credits = creditsOf(document.querySelectorAll('.credits__wrapper'));
    const related = document.querySelector('.js-related-stories');
    if (related) {
      main.append(document.createElement('hr'));
      const h2 = document.createElement('h2');
      // (www's heading, or its label where the container has none)
      h2.textContent = clean(related.querySelector('h2')?.textContent).replace(/:$/, '') || (lang === 'de' ? 'Weitere Beiträge' : 'More stories');
      main.append(h2, table(document, 'related-articles', [['']]));
    }
    const tags = [...intro.querySelectorAll('.article-tags a')];
    if (tags.length) {
      meta.tags = tags.map((a) => clean(a.textContent).replace(/^#/, '')).join(', ');
      meta['tag-ids'] = tags.map((a) => ((a.getAttribute('href') || '').match(/[?&]tag=([^&]+)/) || [])[1]).filter(Boolean).join(', ');
    }
    const depth = wwwPath.split('/').filter(Boolean).length;
    meta['page-type'] = depth >= 5 ? 'article' : 'page';
    if (crumbs.length >= 2) meta.category = crumbs[crumbs.length - 1];
    if (credits.date) meta['publication-date'] = credits.date;
    if (credits.author) meta.author = credits.author;
    if (heroImg) {
      meta['card-image'] = heroImg.cloneNode(true);
      meta['card-image-alt'] = heroImg.getAttribute('alt') || h1.textContent;
    }
  } else {
    // --- an overview: the featured story, the top stories, the teaser containers
    meta['page-type'] = 'overview';
    const stage = document.querySelector('.header-component-wrapper');
    // www's stage: the featured story (its label, its title as the page's h1, linked)
    const head = stage && stage.querySelector('.head h1 a[href]');
    if (head) {
      const h1 = document.createElement('h1');
      const a = document.createElement('a');
      a.setAttribute('href', head.getAttribute('href'));
      a.textContent = clean(head.textContent);
      h1.append(a);
      const label = clean(stage.querySelector('.head .tags .teaser-label')?.textContent);
      const content = [...(label ? [para(document, document.createTextNode(label))] : []), h1];
      main.append(table(document, 'hero-card-overlay', [[picture(document, stage.querySelector('img')) || ''], [content]]));
    }
    document.querySelectorAll('.topstoriescarousel, .root > .aem-Grid > .carousel').forEach((c) => {
      const rows = cardRows(document, [...c.querySelectorAll('.swiper-slide')].map(teaserOf));
      if (!rows.length) return;
      const h2 = document.createElement('h2');
      h2.textContent = clean(c.querySelector('h2')?.textContent);
      if (h2.textContent) main.append(h2);
      main.append(table(document, 'carousel-cards', rows));
    });
    const containers = [...document.querySelectorAll('section.teasercontainer, .main-container .teasercontainer:not(.js-related-stories)')];
    containers.forEach((c) => {
      const teasers = [...c.querySelectorAll('article.teaser')].map(teaserOf).filter((t) => t.href);
      const title = clean(c.querySelector('h2')?.textContent);
      const own = containers.length === 1 && !title;
      const path = own ? wwwPath : commonParent(teasers.map((t) => t.href));
      if (!path) return;
      if (title) {
        const h2 = document.createElement('h2');
        const link = document.createElement('a');
        link.setAttribute('href', path);
        link.textContent = title;
        h2.append(link);
        main.append(h2);
      }
      const rows = [['Path', path], ['Page size', String(own ? 12 : Math.max(teasers.length, 1))], ['Hide filter', 'true']];
      if (!own) rows.push(['Load more', 'false']);
      main.append(table(document, 'blog-overview (grid)', rows));
    });
    // a page of text (contact, print): its components as default content
    if (!containers.length) {
      const out = [];
      const mc = document.querySelector('.main-container');
      if (mc) bodyOf(document, mc, out);
      out.forEach((n) => main.append(n));
      meta['page-type'] = 'page';
    }
  }
  const title = clean(document.querySelector('head > title')?.textContent);
  const description = clean(document.querySelector('head > meta[name="description"]')?.getAttribute('content'));
  const robots = clean(document.querySelector('head > meta[name="robots"]')?.getAttribute('content'));
  const { description: lead, ...rest } = meta;
  const rows = [['Title', title], ['Description', description || lead], ...Object.entries(rest), ['nav', `/magazine/${lang}/nav`], ['footer', `/magazine/${lang}/footer`]];
  if (/noindex/i.test(robots)) rows.push(['Robots', robots]);
  main.append(table(document, 'Metadata', rows.filter(([, v]) => v)));
  return main;
}

export default {
  transform: ({ document, params }) => {
    const wwwPath = new URL(params.originalURL).pathname.replace(/\.html?$/, '').replace(/\/$/, '');
    const main = transformPage(document, wwwPath);
    return [{
      element: main,
      path: docName(wwwPath),
      report: { title: document.title, template: 'magazine' },
    }];
  },
};
