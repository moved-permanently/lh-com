/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-cards (Lufthansa ".carousel" / ".new-carousel" swiper of teasers).
 *
 * Output: one row per teaser, 3 columns:
 *   cell 1: image
 *   cell 2: optional eyebrow <p>, heading <h3>, optional description <p>, CTA link
 *   cell 3: width token, "wide" (source .wide-teaser) or "compact" (source .compact-teaser)
 *
 * Repeating unit: .wide-teaser / .compact-teaser (one per swiper slide; a slide can also hold
 * an empty compactteaser placeholder, so slides themselves are not used). The whole card is a
 * link on the source; the CTA label is a <maui-link-mimic href="#">, so the CTA is rebuilt from
 * the card link's href and the mimic's label.
 * Swiper's own prev/next aria-labels are library defaults, not authored text, so no label rows
 * are emitted (the block uses its locale defaults).
 */
export default function parse(element, { document }) {
  const SR_ONLY = '.sr-only, .visually-hidden, maui-screen-reader-label';
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const clone = node.cloneNode(true);
    clone.querySelectorAll(SR_ONLY).forEach((n) => n.remove());
    return clean(clone.textContent);
  };
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);
  const para = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  };

  const teasers = [...element.querySelectorAll('.wide-teaser, .compact-teaser')]
    .filter((t) => !t.closest('.swiper-slide-duplicate'));

  const cells = [];
  teasers.forEach((teaser) => {
    const wide = teaser.classList.contains('wide-teaser');

    // Image.
    const img = [...teaser.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
    let imageCell = '';
    if (img) {
      const image = document.createElement('img');
      image.src = img.getAttribute('src');
      image.alt = img.getAttribute('alt') || '';
      imageCell = image;
    }

    // Text.
    const content = [];
    const body = teaser.querySelector('.teaser-body') || teaser;
    const eyebrow = visibleText(body.querySelector('.teaser-title'));
    if (eyebrow) content.push(para(eyebrow));
    const headline = visibleText(body.querySelector('.teaser-headline, h2, h3, h4, h5'));
    if (headline) {
      const h = document.createElement('h3');
      h.textContent = headline;
      content.push(h);
    }
    const description = visibleText(body.querySelector('.teaser-description'));
    if (description) content.push(para(description));

    // CTA: card link href + link mimic label.
    const cardLink = teaser.querySelector('a.wide-teaser-link[href], a.compact-teaser-link[href], a[href]');
    const mimic = body.querySelector('.teaser-link maui-link-mimic, .teaser-link a, maui-link-mimic');
    const ctaLabel = visibleText(mimic);
    const href = (mimic && mimic.getAttribute('href') && mimic.getAttribute('href') !== '#')
      ? mimic.getAttribute('href')
      : cardLink && cardLink.getAttribute('href');
    if (href && href !== '#') {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = ctaLabel || headline || eyebrow;
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    }

    if (!imageCell && !content.length) return;
    cells.push([imageCell, content.length ? content : '', wide ? 'wide' : 'compact']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-cards', cells });
  element.replaceWith(block);
}
