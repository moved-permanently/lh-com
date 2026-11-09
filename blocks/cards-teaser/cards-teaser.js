import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { cleanText, decorateExternalLinks, keepImageSize } from '../../scripts/block-config.js';
import { brandWwwHost } from '../../scripts/brand.js';
import { getLocale } from '../../scripts/locale.js';
import { buildEmbed, isEmbedLink, loadMediaStyles } from '../../scripts/media.js';

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
 * Option slider on brand tap: www.flytap.com's news swiper (./cards-teaser-tap.js, loaded there
 * only). Option phone-slider: below 1025px one card per view and a dot per card
 * (./cards-teaser-slider.js).
 * @param {Element} block
 */
/** Whether the brand's theme draws a bold card CTA as a primary button (--cards-teaser-bold-cta) */
function boldCtaButton(block) {
  const read = typeof getComputedStyle === 'function' ? getComputedStyle(block) : null;
  return !!read && read.getPropertyValue('--cards-teaser-bold-cta').trim() === 'button';
}

export default async function decorate(block) {
  const ul = document.createElement('ul');
  // images in the first two sections load eagerly (the baggage page's first view), as hero-campaign
  const section = block.closest('.section');
  const sections = section && section.parentElement
    ? [...section.parentElement.querySelectorAll(':scope > .section')] : [];
  const eager = !section || sections.indexOf(section) < 2;

  [...block.children].forEach((row) => {
    const img = row.querySelector('picture img, img');
    let picture = null;
    // a video's link alone in the first cell (SWISS's aside video teasers: www's a.teaser.card with
    // its .video-player): the player as the card's media, the link's text its title
    const firstCell = row.children.length > 1 ? row.firstElementChild : null;
    const video = !img && firstCell && firstCell.children.length === 1
      && firstCell.querySelector(':scope > p > a[href]:only-child');
    if (video && isEmbedLink(video)) {
      picture = buildEmbed(video);
      if (picture) {
        firstCell.remove();
        loadMediaStyles();
      }
    }
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
      // an italic CTA (scripts.js decorateButtons makes it a.button.secondary) is www's secondary
      // maui-button-link (the 100-years teasers' outlined buttons): it stays a secondary button
      const italic = links.length === 1 && !last.querySelector('strong')
        && (last.querySelector('em a, a em') || (links[0].classList.contains('secondary')
          && !links[0].classList.contains('primary') && !links[0].classList.contains('accent')));
      // a bold CTA (decorateButtons: a.button.primary) is a primary button where the brand's theme
      // asks for it (--cards-teaser-bold-cta: button; lufthansa.com: www's primary
      // maui-button-link), else the arrow link (TAP's and Brussels' bold CTAs: www's arrow links)
      const bold = links.length === 1 && !italic && (!!last.querySelector('strong')
        || links[0].classList.contains('primary') || links[0].classList.contains('accent'));
      const boldButton = bold && boldCtaButton(block);
      if (last.tagName === 'P' && links.length === 1 && cleanText(last) === cleanText(links[0]) && boldButton) {
        const a = links[0];
        last.className = 'cards-teaser-cta cards-teaser-cta-button button-wrapper';
        a.classList.remove('secondary', 'accent');
        a.classList.add('button', 'primary');
        last.replaceChildren(a);
      } else if (last.tagName === 'P' && links.length === 1 && cleanText(last) === cleanText(links[0]) && italic) {
        const a = links[0];
        last.className = 'cards-teaser-cta cards-teaser-cta-button button-wrapper';
        a.classList.remove('primary', 'accent');
        a.classList.add('button', 'secondary');
      } else if (last.tagName === 'P' && links.length === 1 && cleanText(last) === cleanText(links[0])) {
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
  // links to the brand's own www get www.lufthansa.com's arrow (cards-teaser.css)
  const own = brandWwwHost();
  if (own) {
    ul.querySelectorAll('a.cards-teaser-cta-link[href]').forEach((a) => {
      if (new URL(a.href).hostname === own) a.classList.add('cards-teaser-cta-own');
    });
  }
  block.replaceChildren(ul);

  // option phone-slider: www's swiper below 1025px (./cards-teaser-slider.js, loaded with it only)
  if (block.classList.contains('phone-slider')) {
    const { default: decorateSlider } = await import('./cards-teaser-slider.js');
    decorateSlider(block);
  }

  // option paged (paged-N): a page of cards at a time with page numbers (./cards-teaser-pager.js)
  if ([...block.classList].some((c) => /^paged(-\d+)?$/.test(c))) {
    const { default: decoratePager } = await import('./cards-teaser-pager.js');
    decoratePager(block, (document.documentElement.lang || getLocale().lang || 'en').slice(0, 2).toLowerCase());
  }

  // option routes (Air Dolomiti's route cards): www's phone arrows under the row
  // (./cards-teaser-routes.js)
  if (block.classList.contains('routes')) {
    const { default: decorateRoutes } = await import('./cards-teaser-routes.js');
    decorateRoutes(block, (document.documentElement.lang || getLocale().lang || 'en').slice(0, 2).toLowerCase());
  }

  // TAP: the option slider is www's swiper, previous, next and bullets (R4-10)
  if (block.classList.contains('slider') && getMetadata('brand').trim().toLowerCase() === 'tap') {
    const { default: decorateTapNews } = await import('./cards-teaser-tap.js');
    decorateTapNews(block, { lang: getLocale().lang });
  }
}
