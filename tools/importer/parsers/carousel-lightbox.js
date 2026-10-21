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
 *   cell 1: image (src + alt), cell 2: caption (".lightbox-description") or empty
 * Label row "Close label" is added when the modal carries a visible close-button text.
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
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || src.startsWith('data:');
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
  if (!cells.length) {
    const img = [...element.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
    if (img) cells.push([imageOf(img), '']);
  }

  // --- UI label authored in the modal (visible close-button text)
  const close = modal && visibleText(modal.querySelector('.modal-close-button-text, .lightbox-close'));
  if (close && cells.length) cells.push(['Close label', close]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-lightbox', cells });
  element.replaceWith(block);
}
