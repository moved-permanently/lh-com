/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-card-overlay (Lufthansa ".mainstageteaser" / ".dcep-main-stage-teaser").
 *
 * Output (1 column):
 *   Row 1: background image
 *   Row 2: eyebrow <p> (.mst-title), heading <h2> (.display-text), optional text, CTA link(s)
 *
 * The CTA is a <maui-navigation-link href> custom element on the source; it is rebuilt as <a>.
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

  const cells = [];

  // Row 1: background image (first usable image of the stage media).
  const img = [...element.querySelectorAll('.mst-bg-img img, .moving-image img, img')]
    .find((i) => !isBroken(i.getAttribute('src')) && !i.closest('.mst-card'));
  if (img) {
    const image = document.createElement('img');
    image.src = img.getAttribute('src');
    image.alt = img.getAttribute('alt') || '';
    cells.push([image]);
  }

  // Row 2: card content.
  const card = element.querySelector('.mst-card') || element;
  const content = [];

  const eyebrowText = visibleText(card.querySelector('.mst-title'));
  if (eyebrowText) {
    const p = document.createElement('p');
    p.textContent = eyebrowText;
    content.push(p);
  }

  const headingSource = card.querySelector('.display-text, h1, h2, h3');
  const headingText = visibleText(headingSource);
  if (headingText) {
    const h = document.createElement(headingSource && /^H[1-3]$/.test(headingSource.tagName) ? headingSource.tagName : 'h2');
    h.textContent = headingText;
    content.push(h);
  }

  // Optional body text (any text element other than eyebrow/heading/CTA).
  card.querySelectorAll('.mst-text, .mst-description, .mst-card p').forEach((t) => {
    const text = visibleText(t);
    if (text && text !== eyebrowText && text !== headingText) {
      const p = document.createElement('p');
      p.textContent = text;
      content.push(p);
    }
  });

  // CTA links.
  const seen = new Set();
  card.querySelectorAll('maui-navigation-link[href], maui-button[href], maui-link-button[href], a[href]').forEach((l) => {
    if ([...seen].some((s) => s.contains(l))) return;
    const label = visibleText(l);
    const href = l.getAttribute('href');
    if (!label || !href) return;
    seen.add(l);
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    p.append(a);
    content.push(p);
  });

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-card-overlay', cells });
  element.replaceWith(block);
}
