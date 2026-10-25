/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-campaign (Lufthansa AEM ".inspirationteaser" campaign stage).
 *
 * Output (blocks/hero-campaign README): 1 column.
 *   row 1: background image (poster) + link to the background .mp4 when the stage has a video
 *   row 2: heading (source level: H1 on the page stage, H2/H3 further down), subtitle paragraph
 *          (source h3.subheadline is a tagline, not a heading), text paragraph(s), CTA link
 *          (maui-button-link type=primary = bold link, secondary = italic link)
 * Options: "right" when the text block is ".alignment-right" (default left), "card" for the
 * ".uplift-animation" white card, "narrow" for ".inspiration-teaser-narrow".
 * No label rows: the pause/play labels are block defaults, the source has no authored labels.
 */
export default function parse(element, { document }) {
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
  const clean = (s) => (s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);
  const isBr = (n) => n && n.nodeType === 1 && n.tagName === 'BR';
  const isBlank = (n) => n && n.nodeType === 3 && !clean(n.nodeValue);
  const trimBreaks = (el) => {
    while (el.lastChild && (isBr(el.lastChild) || isBlank(el.lastChild))) el.lastChild.remove();
    while (el.firstChild && (isBr(el.firstChild) || isBlank(el.firstChild))) el.firstChild.remove();
  };

  const info = element.querySelector('.campaign-information') || element;

  // --- row 1: media
  const media = [];
  const img = [...element.querySelectorAll('img')]
    .find((i) => !isBroken(i.getAttribute('src')) && !info.contains(i));
  if (img) {
    const image = document.createElement('img');
    image.setAttribute('src', img.getAttribute('src'));
    image.setAttribute('alt', img.getAttribute('alt') || '');
    media.push(image);
  }
  const video = element.querySelector('video[src], video source[src]');
  if (video) {
    const src = video.getAttribute('src');
    const a = document.createElement('a');
    a.setAttribute('href', src);
    a.textContent = src;
    const p = document.createElement('p');
    p.append(a);
    media.push(p);
  }

  // --- row 2: text
  const text = [];
  // the stage title: the .headline that is not a tagline, at any level (the First Class stage on
  // /discover-lufthansa/new-onboard-experience is an h3.headline), else the first heading
  const HEADINGS = 'h1, h2, h3, h4, h5, h6';
  const heading = [...info.querySelectorAll(HEADINGS)].find((h) => h.matches('.headline:not(.subheadline)'))
    || [...info.querySelectorAll(HEADINGS)].find((h) => !h.matches('.subheadline'));
  if (heading && visibleText(heading)) {
    const h = document.createElement(heading.tagName.toLowerCase());
    h.textContent = visibleText(heading);
    text.push(h);
  }
  info.querySelectorAll('.subheadline').forEach((sub) => {
    const t = visibleText(sub);
    if (!t || sub === heading) return;
    const p = document.createElement('p');
    p.textContent = t;
    text.push(p);
  });
  info.querySelectorAll('.information .richtext, .information').forEach((rt) => {
    if (rt.classList.contains('information') && rt.querySelector('.richtext')) return;
    [...rt.children].forEach((n) => {
      if (n.matches(SKIP)) return;
      const c = n.cloneNode(true);
      c.querySelectorAll(SKIP).forEach((s) => s.remove());
      c.removeAttribute('class');
      if (c.tagName === 'P') trimBreaks(c);
      if (!clean(c.textContent) && !c.querySelector('img')) return;
      text.push(c);
    });
  });
  info.querySelectorAll('maui-button-link[href], maui-navigation-link[href], maui-link[href]').forEach((m) => {
    if (m.closest('.richtext')) return;
    const label = visibleText(m) || clean(m.getAttribute('label'));
    if (!label) return;
    const a = document.createElement('a');
    a.setAttribute('href', m.getAttribute('href'));
    a.textContent = label;
    const p = document.createElement('p');
    // maui-button-link: primary = bold link (yellow button), secondary = italic link (outlined)
    const type = m.tagName === 'MAUI-BUTTON-LINK' ? m.getAttribute('type') : null;
    if (type === 'primary' || type === 'secondary') {
      const wrap = document.createElement(type === 'primary' ? 'strong' : 'em');
      wrap.append(a);
      p.append(wrap);
    } else {
      p.append(a);
    }
    text.push(p);
  });

  const cells = [];
  if (media.length) cells.push([media]);
  if (text.length) cells.push([text]);
  // options: right (.alignment-right: text at the right), card (.uplift-animation: white text
  // card instead of text on the overlay), narrow (.inspiration-teaser-narrow: 350px high),
  // regular (below)
  const teaser = element.querySelector('.cms-inspiration-teaser') || element;
  const variants = [];
  if (info.classList.contains('alignment-right')) variants.push('right');
  if (info.classList.contains('uplift-animation') || teaser.classList.contains('inspiration-teaser-uplift-animation')) variants.push('card');
  if (teaser.classList.contains('inspiration-teaser-narrow')) variants.push('narrow');
  // regular (.inspiration-teaser-regular: 640px high, gb/en ski-campaign-2026)
  if (teaser.classList.contains('inspiration-teaser-regular')) variants.push('regular');

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-campaign', variants, cells });
  element.replaceWith(block);
}
