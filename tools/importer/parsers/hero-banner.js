/* eslint-disable */
/* global WebImporter */
import { publicPath } from './aem-paths.js';

/**
 * Parser for hero-banner (Lufthansa ".herobanner .dcep-hero-banner": expanding image panes,
 * hub /speisen-und-getraenke, /lufthansa-reiseklassen).
 *
 * Source: .hero-container > .hero-item (one per pane):
 *   h2.hero-subheading > button.hero-accordion-header-button  tab label ("First Class")
 *   .hero-items-contents > h3.hero-header (text or "label")    headline
 *                        > p.hero-paragraph (often empty)       text
 *                        > maui-button-link.hero-button[href][label][type]  button
 *   .moving-image img                                            pane image
 *   .transparent-overlay[style="--transparent-overlay-color: #6F625A"]
 * The empty intro animation (h1.animated-text) is not imported.
 *
 * Output: one row per pane: image | h2 label, h3 headline, p text, p > em > a (secondary
 * button; primary: strong). Button hrefs are AEM paths and become the public paths
 * (aem-paths.js: /content/lh/markets/de/de/prepare-for-your-trip/travel-classes/first-class ->
 * /de/de/first-class). Last row "Overlay | #6F625A" when the source sets an overlay colour.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const text = (el) => {
    if (!el) return '';
    const c = el.cloneNode(true);
    c.querySelectorAll('.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"]').forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);

  const rows = [];
  let overlay = '';
  element.querySelectorAll('.hero-item').forEach((item) => {
    const img = [...item.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
    let imageCell = '';
    if (img) {
      imageCell = document.createElement('img');
      imageCell.setAttribute('src', img.getAttribute('src'));
      imageCell.setAttribute('alt', img.getAttribute('alt') || '');
    }

    const content = [];
    const label = text(item.querySelector('.hero-accordion-header-button, .hero-subheading'));
    if (label) {
      const h2 = document.createElement('h2');
      h2.textContent = label;
      content.push(h2);
    }
    const headerEl = item.querySelector('.hero-header');
    const headline = text(headerEl) || clean(headerEl && headerEl.getAttribute('label'));
    if (headline) {
      const h3 = document.createElement('h3');
      h3.textContent = headline;
      content.push(h3);
    }
    item.querySelectorAll('.hero-paragraph').forEach((p) => {
      const t = text(p) || clean(p.getAttribute('aria-label') || p.getAttribute('label'));
      if (!t) return;
      const out = document.createElement('p');
      out.textContent = t;
      content.push(out);
    });
    const btn = item.querySelector('maui-button-link[href], maui-navigation-link[href], maui-link[href], a[href]');
    if (btn) {
      const btnLabel = text(btn) || clean(btn.getAttribute('label'));
      const href = btn.getAttribute('href');
      if (btnLabel && href) {
        const a = document.createElement('a');
        a.setAttribute('href', publicPath(href));
        a.textContent = btnLabel;
        const wrap = document.createElement(btn.getAttribute('type') === 'primary' ? 'strong' : 'em');
        wrap.append(a);
        const p = document.createElement('p');
        p.append(wrap);
        content.push(p);
      }
    }

    if (!overlay) {
      const ov = item.querySelector('.transparent-overlay[style]');
      const m = ov && ov.getAttribute('style').match(/--transparent-overlay-color:\s*(#[0-9a-f]{3,8})/i);
      if (m) overlay = m[1];
    }

    if (!imageCell && !content.length) return;
    rows.push([imageCell, content.length ? content : '']);
  });

  if (!rows.length) return;
  if (overlay) rows.push(['Overlay', overlay]);
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells: rows }));
}
