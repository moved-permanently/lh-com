import { createOptimizedPicture } from '../../scripts/aem.js';
import { cleanText, decorateExternalLinks, keepImageSize } from '../../scripts/block-config.js';

const PICTURE_BREAKPOINTS = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }];

/**
 * Body elements of a row (all cells merged) once the media picture is taken out.
 * Cells authored without paragraphs become a paragraph; emptied wrappers are dropped.
 * @param {Element} row
 * @returns {Element[]}
 */
function bodyElements(row) {
  const elements = [];
  [...row.children].forEach((cell) => {
    const hasBlocks = [...cell.children].some((el) => /^(P|H[1-6]|UL|OL|DIV)$/.test(el.tagName));
    if (hasBlocks) {
      [...cell.children].forEach((el) => {
        if (cleanText(el) || el.querySelector('picture, img, span.icon')) elements.push(el);
      });
    } else if (cleanText(cell) || cell.querySelector('picture, img, span.icon')) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      elements.push(p);
    }
  });
  return elements;
}

/**
 * Borderless image teasers: image on top, heading, text and an arrow CTA link.
 * One row per card. Cell 1: image; cell 2: heading (any level), paragraphs, CTA (last link).
 * Merged or missing cells: the first picture is the media, everything else the body.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  // images in the first two sections load eagerly (the baggage page's first view), as hero-campaign
  const section = block.closest('.section');
  const sections = section && section.parentElement
    ? [...section.parentElement.querySelectorAll(':scope > .section')] : [];
  const eager = !section || sections.indexOf(section) < 2;

  [...block.children].forEach((row) => {
    const img = row.querySelector('picture img, img');
    let picture = null;
    if (img) {
      picture = keepImageSize(img, createOptimizedPicture(img.src, img.alt || '', eager, PICTURE_BREAKPOINTS));
      (img.closest('picture') || img).remove();
    }
    const elements = bodyElements(row);
    if (!picture && !elements.length) return;

    const li = document.createElement('li');
    if (picture) {
      const media = document.createElement('div');
      media.className = 'cards-teaser-image';
      media.append(picture);
      li.append(media);
    } else {
      li.classList.add('cards-teaser-text-only');
    }

    if (elements.length) {
      const body = document.createElement('div');
      body.className = 'cards-teaser-body';
      const heading = elements.find((el) => /^H[1-6]$/.test(el.tagName));
      if (heading) heading.classList.add('cards-teaser-title');

      // CTA: the last link of the card, when it sits alone in the last paragraph
      const last = elements[elements.length - 1];
      const links = last.querySelectorAll('a[href]');
      if (last.tagName === 'P' && links.length === 1 && cleanText(last) === cleanText(links[0])) {
        const a = links[0];
        last.className = 'cards-teaser-cta';
        a.classList.remove('button', 'primary', 'secondary', 'accent');
        a.classList.add('cards-teaser-cta-link');
        // drop authored bold/italic around the link (it is styled as an arrow link)
        last.replaceChildren(a);
      }
      body.append(...elements);
      li.append(body);
    }
    ul.append(li);
  });

  decorateExternalLinks(ul);
  block.replaceChildren(ul);
}
