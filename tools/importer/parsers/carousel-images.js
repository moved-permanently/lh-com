/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-images (Lufthansa ".carousel" > ".new-carousel" > ".swiper.swiper-single-slide":
 * one image at a time, e.g. /de/en/100-years/chronicle, /de/en/discover-lufthansa/new-onboard-experience).
 *
 * Output (blocks/carousel-images README, EDS carousel convention): 2 columns, one row per slide:
 *   cell 1: the image only (figure img, alt kept)
 *   cell 2: the caption (figcaption.caption > maui-caption) as a paragraph; empty without one
 * Swiper loop copies (.swiper-slide-duplicate) are skipped. The swiper's aria messages
 * ("Previous slide", ...) are library defaults; the block uses its own locale labels.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const isBroken = (src) => !src || /^(data|blob):/i.test(src) || /(^|\/)undefined(\.transform|$|\/)/.test(src);

  const slides = [...element.querySelectorAll('.swiper-slide')]
    .filter((s) => !s.classList.contains('swiper-slide-duplicate'));
  const cells = [];
  slides.forEach((slide) => {
    const source = [...slide.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
    if (!source) return;
    const img = document.createElement('img');
    img.src = source.getAttribute('src');
    img.alt = clean(source.getAttribute('alt'));
    let captionCell = '';
    const figcaption = slide.querySelector('figcaption, .caption');
    if (figcaption && clean(figcaption.textContent)) {
      const inner = figcaption.querySelector('maui-caption') || figcaption;
      const p = document.createElement('p');
      [...inner.childNodes].forEach((n) => p.append(n.cloneNode(true)));
      captionCell = p;
    }
    cells.push([img, captionCell]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-images', cells });
  element.replaceWith(block);
}
