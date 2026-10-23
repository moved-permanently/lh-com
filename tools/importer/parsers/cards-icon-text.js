/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon-text (AirCore `#content > .icon-links`).
 *
 * Source: .icon-links > a[href] > .icon-wrapper img (/aircore/cache/alert.svg) +
 *         div (h4 title, span description). The whole card is the link.
 *
 * Output: one row per card, 2 cells.
 *   cell 1: icon as ":name:" token from the icon file name (alert.svg -> :alert:; the SVGs
 *           live in /icons/{name}.svg), or the image when no name can be derived
 *   cell 2: <h3><a href>title</a></h3> + <p>description</p>
 *
 * Repeating unit: .icon-wrapper (block-level); the card link and body are read from it.
 *
 * Lufthansa partner teasers (hub /digital-self-services: .threecolumn / .twocolumn of
 * a.teaser.partner > h4.teaser-heading (img.icon-svg + .teaser-heading-text) +
 * .teaser-description .desc-inline): same rows, the icon kept as an <img>, option "partner".
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

  // Lufthansa partner teasers (hub /digital-self-services: .threecolumn of a.teaser.partner, the
  // whole tile is the link): img.icon-svg + .teaser-heading-text + .desc-inline. The icon stays
  // an image (its file name is no /icons/ token), option "partner".
  const partners = [...element.querySelectorAll('a.teaser.partner')];
  if (partners.length) {
    const rows = [];
    partners.forEach((card) => {
      let iconCell = '';
      const img = card.querySelector('img.icon-svg, .image-wrapper img, img');
      const src = img && img.getAttribute('src');
      if (src && !/^(data|blob):/i.test(src)) {
        iconCell = document.createElement('img');
        iconCell.src = src;
        iconCell.alt = clean(img.getAttribute('alt'));
      }
      const content = [];
      const title = clean((card.querySelector('.teaser-heading-text') || card.querySelector('.teaser-heading, h1, h2, h3, h4, h5, h6') || {}).textContent);
      const href = card.getAttribute('href');
      if (title) {
        const h3 = document.createElement('h3');
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        content.push(h3);
      }
      card.querySelectorAll('.teaser-description p').forEach((d) => {
        const t = clean(d.textContent);
        if (!t || content.some((c) => c.textContent === t)) return;
        const p = document.createElement('p');
        p.textContent = t;
        content.push(p);
      });
      if (!iconCell && !content.length) return;
      rows.push([iconCell, content.length ? content : '']);
    });
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-icon-text', variants: ['partner'], cells: rows }));
    return;
  }

  let units = [...element.querySelectorAll('.icon-wrapper')];
  // fallback: cards without an icon wrapper
  if (!units.length) units = [...element.querySelectorAll(':scope > a, :scope > div')];

  const cells = [];
  units.forEach((unit) => {
    const isIcon = unit.matches('.icon-wrapper');
    const card = isIcon ? (unit.closest('a[href]') || unit.parentElement) : unit;
    const link = card.matches('a[href]') ? card : card.querySelector('a[href]');
    const body = isIcon
      ? [...card.children].find((c) => c !== unit && !c.matches('.icon-wrapper')) || null
      : card;

    // icon
    let iconCell = '';
    const img = isIcon ? unit.querySelector('img') : null;
    const src = img && img.getAttribute('src');
    if (src) {
      const name = (src.split('?')[0].split('/').pop() || '').replace(/\.svg$/i, '');
      if (/\.svg/i.test(src) && /^[a-z0-9-_]+$/i.test(name) && !/^(data|blob):/i.test(src)) {
        iconCell = `:${name.toLowerCase().replace(/_/g, '-')}:`;
      } else if (!/^(data|blob):/i.test(src)) { // inline icons (data:/blob:) are dropped
        const image = document.createElement('img');
        image.src = src;
        image.alt = clean(img.getAttribute('alt'));
        iconCell = image;
      }
    }

    // body: title heading + description(s)
    const content = [];
    const headingEl = body && body.querySelector('h1, h2, h3, h4, h5, h6');
    const title = clean(headingEl && headingEl.textContent);
    const href = link && link.getAttribute('href');
    if (title) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      content.push(h3);
    }
    if (body) {
      // childNodes, not children: the importer unwraps <span>s before parsers run, which
      // leaves the description as a bare text node
      [...body.childNodes].forEach((child) => {
        if (child === headingEl || (child.nodeType === 1 && child.matches('.icon-wrapper'))) return;
        if (child.nodeType !== 1 && child.nodeType !== 3) return;
        const t = clean(child.textContent);
        if (!t) return;
        const p = document.createElement('p');
        p.textContent = t;
        content.push(p);
      });
    }
    if (!title && href) {
      // no heading: keep the link on its own line so the card stays clickable
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = clean(link.textContent) || href;
      p.append(a);
      content.push(p);
    }
    if (!iconCell && !content.length) return;
    cells.push([iconCell, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-text', cells });
  element.replaceWith(block);
}
