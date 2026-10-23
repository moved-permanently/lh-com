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

  // CTA links: navigation links stay links (arrow), button links become buttons
  // (maui-button-link type=secondary: italic = outlined button, primary: bold = yellow button).
  const seen = new Set();
  card.querySelectorAll('maui-navigation-link[href], maui-button-link[href], maui-button[href], maui-link-button[href], a[href]').forEach((l) => {
    if ([...seen].some((s) => s.contains(l))) return;
    const label = visibleText(l);
    const href = l.getAttribute('href');
    if (!label || !href) return;
    seen.add(l);
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    const type = (l.getAttribute('type') || '').toLowerCase();
    let wrapped = a;
    if (l.matches('maui-button-link, maui-button') && (type === 'secondary' || type === 'primary')) {
      wrapped = document.createElement(type === 'secondary' ? 'em' : 'strong');
      wrapped.append(a);
    }
    p.append(wrapped);
    content.push(p);
  });

  if (content.length) cells.push([content]);

  // Promotion teaser props (data-dcep.promotionTeaser): card alignment and the conditions dialog.
  let teaser = {};
  const propsHost = element.matches('[data-dcep]') ? element : element.querySelector('[data-dcep]');
  try { teaser = (JSON.parse(propsHost ? propsHost.getAttribute('data-dcep') : '{}') || {}).promotionTeaser || {}; } catch (e) { teaser = {}; }

  // Conditions: the dialog trigger (maui-link-button.termsandcondition, "Conditions") and the
  // dialog content (termsAndConditions headline + rich text): "Conditions | title + text".
  const trigger = card.querySelector('.termsandcondition, maui-link-button[variant="dialog"]');
  const terms = teaser.termsAndConditions || {};
  const triggerLabel = visibleText(trigger);
  if (triggerLabel && terms.content) {
    const conditions = [];
    const title = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = triggerLabel;
    title.append(strong);
    conditions.push(title);
    if (clean(terms.headline)) {
      const headline = document.createElement('p');
      const b = document.createElement('strong');
      b.textContent = clean(terms.headline);
      headline.append(b);
      conditions.push(headline);
    }
    const holder = document.createElement('div');
    holder.innerHTML = terms.content;
    holder.querySelectorAll('p, li').forEach((node) => {
      if (!visibleText(node)) return;
      const p = document.createElement('p');
      p.innerHTML = node.innerHTML;
      conditions.push(p);
    });
    cells.push(['Conditions', conditions]);
  }

  // Variants: card on the right (.mst-card.align-self-end, promotionTeaser.alignment "right");
  // white card ("light"); no image below 768px (promotionTeaser.displayImageOnMobile false: the live stage shows the
  // card alone on phones).
  const variants = [];
  if (card.classList.contains('align-self-end') || clean(teaser.alignment).toLowerCase() === 'right') variants.push('right');
  if (teaser.displayImageOnMobile === false) variants.push('no mobile image');
  // white card with dark blue text (.mst-card.non-inverted, promotionTeaser.isInverted false: at/de)
  if (card.classList.contains('non-inverted') || teaser.isInverted === false) variants.push('light');
  const name = variants.length ? `Hero Card Overlay (${variants.join(', ')})` : 'hero-card-overlay';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
