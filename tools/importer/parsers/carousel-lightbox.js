/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-lightbox (Lufthansa AEM ".slideshow": inline preview button that opens a
 * modal swiper; fleet seat maps).
 *
 * Slides are read from the modal the preview button points to (data-target="#lightbox-..."),
 * falling back to the first ".lightbox-modal" of the page; the modal is portalled outside the
 * content and is removed by the cleanup transformer only after the parsers ran. The preview
 * image duplicates slide 1, so it is only used when no modal slides are found.
 *
 * Output (blocks/carousel-lightbox README): 2 columns, one row per slide.
 *   intro row (optional, first, 1 cell): headings/text that share the slideshow's column when
 *     the slideshow sits in a multi-column layout (e.g. /de/en/359: h3 "Sample illustration ..."
 *     above the preview in a .col-md-6); those components are moved into the block so they keep
 *     the preview's half width. Full-width slideshows keep their headings as default content.
 *   cell 1: image (src + alt), cell 2: caption (".lightbox-description") or empty
 * Label row "Close label" is added when the modal carries a visible close-button text.
 * Option "half": the slideshow shares its column view with another slideshow (/744 decks).
 */
export default function parse(element, { document }) {
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
  const clean = (s) => (s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);
  const imageOf = (img) => {
    const out = document.createElement('img');
    out.setAttribute('src', img.getAttribute('src'));
    out.setAttribute('alt', img.getAttribute('alt') || '');
    return out;
  };

  // --- the modal this preview opens
  const trigger = element.querySelector('[data-target^="#"], [data-bs-target^="#"], [href^="#lightbox"]');
  const targetId = trigger && (trigger.getAttribute('data-target') || trigger.getAttribute('data-bs-target') || trigger.getAttribute('href'));
  let modal = null;
  if (targetId && targetId.length > 1) {
    try { modal = document.getElementById(decodeURIComponent(targetId.slice(1))); } catch (e) { modal = null; }
  }
  if (!modal) modal = element.querySelector('.lightbox-modal') || document.querySelector('.lightbox-modal');

  const cells = [];
  const seen = new Set();

  // --- intro: components before the slideshow in the same column of a multi-column layout
  const intro = [];
  const column = element.closest('.column-view-item');
  const layout = column && column.closest('.twocolumn, .threecolumn, .fourcolumn');
  if (column && layout && column.parentElement && column.parentElement.children.length > 1) {
    let part = element;
    while (part.parentElement && part.parentElement !== column) part = part.parentElement;
    const before = [];
    for (let n = part.previousElementSibling; n; n = n.previousElementSibling) before.unshift(n);
    before.forEach((comp) => {
      const nodes = [...comp.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol')]
        .filter((n) => !n.parentElement.closest('p, ul, ol, h1, h2, h3, h4, h5, h6'));
      if (!nodes.length || comp.querySelector('img, picture, video, iframe, form, table')) return;
      nodes.forEach((n) => {
        const text = visibleText(n);
        if (!text) return;
        let out;
        if (/^H[1-6]$/.test(n.tagName)) {
          out = document.createElement(n.tagName.toLowerCase());
          out.textContent = text;
        } else {
          out = n.cloneNode(true);
          out.querySelectorAll(SKIP).forEach((x) => x.remove());
          out.removeAttribute('class');
        }
        intro.push(out);
      });
      comp.remove();
    });
  }
  if (intro.length) cells.push([intro]);
  if (modal) {
    modal.querySelectorAll('.swiper-slide').forEach((slide) => {
      if (slide.classList.contains('swiper-slide-duplicate')) return;
      const img = [...slide.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
      if (!img || seen.has(img.getAttribute('src'))) return;
      seen.add(img.getAttribute('src'));
      const caption = slide.querySelector('.lightbox-description');
      let captionCell = '';
      if (caption && visibleText(caption)) {
        const blocks = [...caption.querySelectorAll('p, ul, ol, h1, h2, h3, h4, h5, h6')];
        if (blocks.length) {
          captionCell = blocks.filter((b) => !b.parentElement.closest('p, ul, ol')).map((b) => {
            const c = b.cloneNode(true);
            c.querySelectorAll(SKIP).forEach((s) => s.remove());
            c.removeAttribute('class');
            return c;
          });
        } else {
          const p = document.createElement('p');
          p.textContent = visibleText(caption);
          captionCell = [p];
        }
      }
      cells.push([imageOf(img), captionCell]);
    });
  }
  if (cells.length === (intro.length ? 1 : 0)) {
    const img = [...element.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
    if (img) cells.push([imageOf(img), '']);
  }

  // --- UI label authored in the modal (visible close-button text)
  const close = modal && visibleText(modal.querySelector('.modal-close-button-text, .lightbox-close'));
  if (close && cells.length > (intro.length ? 1 : 0)) cells.push(['Close label', close]);

  // two slideshows side by side in one column view (/744 main deck | upper deck): option half
  // (counted once per column view: the first slideshow is a table when the second is parsed)
  let half = false;
  if (column && layout && column.parentElement) {
    const row = column.parentElement;
    if (!row.hasAttribute('data-lh-slideshows')) {
      row.setAttribute('data-lh-slideshows', [...row.children].filter((c) => c.querySelector('.slideshow')).length);
    }
    half = Number(row.getAttribute('data-lh-slideshows')) > 1;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-lightbox', variants: half ? ['half'] : [], cells });
  element.replaceWith(block);
}
