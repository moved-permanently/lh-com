/* eslint-disable */
/* global WebImporter */

/**
 * Parser for profile-tabs (Lufthansa tabs: maui-tab-control-responsive with one
 * <maui-tab-control-panel-responsive name="..." navigation-id="..."> per tab).
 *
 * Output (blocks/profile-tabs README): one row per panel, 3 columns: the tab label (name), the
 * panel content, the deep link id (navigation-id). Option content: tabs that hold page content
 * (live .tabs.panelcontainer, /onboard-delights "Fresh on board").
 *
 * Panel content in document order, column views flattened: images (src, alt), headings (source
 * level, the Lufthansa size class kept: the cleanup writes "{heading-small}"), rich text
 * (paragraphs and lists; .richtext.limited-width as class limited-width, the cleanup writes
 * "{limited-width}") and links (maui link components: primary = bold link, secondary = italic
 * link). Separators and empty components are dropped.
 */
export default function parse(element, { document }) {
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style, noscript';
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const MAUI = 'maui-navigation-link[href], maui-button-link[href], maui-link[href], a[href]';
  const HEADING_CLASS = /^heading-/;
  const isBr = (n) => n && n.nodeType === 1 && n.tagName === 'BR';
  const isBlank = (n) => n && n.nodeType === 3 && !clean(n.nodeValue);

  /** A copy of a paragraph or list without attributes (inline markup and link targets stay). */
  const tidy = (el, limited) => {
    const c = el.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    [c, ...c.querySelectorAll('*')].forEach((n) => {
      [...n.attributes].forEach((a) => {
        if (!(n.tagName === 'A' && a.name === 'href')) n.removeAttribute(a.name);
      });
    });
    while (c.lastChild && (isBr(c.lastChild) || isBlank(c.lastChild))) c.lastChild.remove();
    while (c.firstChild && (isBr(c.firstChild) || isBlank(c.firstChild))) c.firstChild.remove();
    if (limited) c.className = 'limited-width';
    return c;
  };

  const linkPara = (scope) => {
    const m = scope.querySelector(MAUI);
    if (!m) return null;
    const label = visibleText(m) || clean(m.getAttribute('label') || m.getAttribute('aria-label'));
    const href = m.getAttribute('href');
    if (!label || !href) return null;
    const a = document.createElement('a');
    a.setAttribute('href', href);
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
    return p;
  };

  const collect = (root, out) => {
    [...root.children].forEach((child) => {
      if (child.matches(SKIP) || child.classList.contains('separator')) return;
      const cl = child.classList;
      if (cl.contains('image')) {
        const img = [...child.querySelectorAll('img')].find((i) => {
          const src = i.getAttribute('src') || '';
          return src && !/^(data|blob):/i.test(src);
        });
        if (!img) return;
        const n = document.createElement('img');
        n.setAttribute('src', img.getAttribute('src'));
        n.setAttribute('alt', img.getAttribute('alt') || '');
        const p = document.createElement('p');
        p.append(n);
        out.push(p);
        return;
      }
      if (cl.contains('headline')) {
        const h = child.querySelector('h1, h2, h3, h4, h5, h6');
        const text = h && visibleText(h);
        if (!text) return;
        const n = document.createElement(h.tagName.toLowerCase());
        n.textContent = text;
        const style = [...h.classList].find((c) => HEADING_CLASS.test(c));
        if (style) n.className = style;
        out.push(n);
        return;
      }
      if (cl.contains('text')) {
        const rt = child.querySelector('.richtext') || child;
        const limited = rt.classList.contains('limited-width');
        [...rt.children].forEach((n) => {
          if (!/^(P|UL|OL)$/.test(n.tagName) || !visibleText(n)) return;
          out.push(tidy(n, limited));
        });
        return;
      }
      if (cl.contains('link')) {
        const p = linkPara(child);
        if (p) out.push(p);
        return;
      }
      // wrappers: .onecolumn, .column-view, .row, .column-view-item, plain divs
      collect(child, out);
    });
  };

  const panels = [...element.querySelectorAll('maui-tab-control-panel-responsive')]
    .filter((p) => !p.parentElement.closest('maui-tab-control-panel-responsive'));
  const cells = panels.map((panel) => {
    const label = clean(panel.getAttribute('name'));
    const content = [];
    collect(panel, content);
    if (!label || !content.length) return null;
    return [label, content, clean(panel.getAttribute('navigation-id'))];
  }).filter(Boolean);
  if (!cells.length) return;

  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'profile-tabs', variants: ['content'], cells }));
}
