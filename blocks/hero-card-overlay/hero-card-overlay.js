import { createOptimizedPicture } from '../../scripts/aem.js';
import { keepImageSize } from '../../scripts/block-config.js';

let instanceCount = 0;

/**
 * The value cell of a two-cell "Conditions | title + text" row, else null.
 * @param {Element} row
 * @returns {Element|null}
 */
function conditionsRow(row) {
  const cells = [...row.children];
  if (cells.length !== 2) return null;
  return /^(conditions|konditionen)$/i.test(cells[0].textContent.trim()) ? cells[1] : null;
}

/**
 * Conditions disclosure (the live card opens them in a dialog from a "Conditions" link button):
 * the first paragraph is the title, the rest the text.
 * @param {Element} cell
 * @returns {HTMLDetailsElement|null}
 */
function buildConditions(cell) {
  const [title, ...rest] = [...cell.children];
  const label = title ? title.textContent.trim() : '';
  if (!label || !rest.length) return null;
  const details = document.createElement('details');
  details.className = 'hero-card-overlay-conditions';
  const summary = document.createElement('summary');
  summary.textContent = label;
  const body = document.createElement('div');
  body.className = 'hero-card-overlay-conditions-text';
  body.append(...rest);
  details.append(summary, body);
  return details;
}

/**
 * Full-bleed image with a text card overlaid on it.
 * Content: a background image (first picture anywhere in the block) and the card content
 * (optional eyebrow paragraph, heading, text, CTA links) in any other cell.
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const picture = block.querySelector('picture');
  const media = document.createElement('div');
  media.className = 'hero-card-overlay-media';

  if (picture) {
    const img = picture.querySelector('img');
    const section = block.closest('.section');
    const sections = section ? [...section.parentElement.querySelectorAll(':scope > .section')] : [];
    // the stage sits near the top of most templates, so load it eagerly there; with
    // no-mobile-image the CSS hides it below 768px: lazy there (a lazy image under display: none
    // isn't fetched), desktop and tablet as before
    const hidden = block.classList.contains('no-mobile-image') && !matchMedia('(min-width: 768px)').matches;
    const eager = !hidden && (!section || sections.indexOf(section) < 2);
    const optimized = img
      ? keepImageSize(img, createOptimizedPicture(img.src, img.alt || '', eager, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]))
      : picture;
    // paragraphs left empty by the moved picture are dropped below
    picture.remove();
    media.append(optimized);
  }

  const card = document.createElement('div');
  card.className = 'hero-card-overlay-card';
  let conditions = null;
  [...block.children].forEach((row) => {
    const conditionsCell = conditionsRow(row);
    if (conditionsCell) {
      conditions = buildConditions(conditionsCell) || conditions;
      return;
    }
    [...row.children].forEach((cell) => {
      [...cell.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P'
          && !node.textContent.trim() && !node.querySelector('img, a')) return;
        card.append(node);
      });
    });
  });

  // eyebrow: text paragraphs before the first heading
  const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.id = heading.id || `hero-card-overlay-heading-${instanceCount}`;
    block.setAttribute('role', 'region');
    block.setAttribute('aria-labelledby', heading.id);
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P' && !prev.querySelector('a')) prev.classList.add('hero-card-overlay-eyebrow');
      prev = prev.previousElementSibling;
    }
  }

  // CTA: paragraphs holding only links
  card.querySelectorAll(':scope > p').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length && [...links].map((a) => a.textContent).join('').trim() === p.textContent.trim()) {
      p.classList.add('hero-card-overlay-cta');
    }
  });

  if (conditions) card.append(conditions);

  block.replaceChildren(media, card);
  if (!picture) block.classList.add('hero-card-overlay-no-image');
  if (!card.children.length) card.remove();
}
