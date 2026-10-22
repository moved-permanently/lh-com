/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-steps (Lufthansa AEM ".fourcolumn" column view of numbered steps; app-entry
 * "How to get your boarding pass", nested in the check-in tabs).
 *
 * Output (blocks/cards-steps README): 1 column, one row per ".column-view-item":
 *   step number as the first paragraph (the source uses a large h2 for the digit; it is not a
 *   heading), H3 title, description paragraph(s), optional CTA link as the last paragraph.
 * The column title (".column-view > div:not(.row) > h2") is default content before the table.
 * The booking-lookup parser later hoists this table (and its title / section break) out of the
 * surrounding tabs.
 */
export default function parse(element, { document }) {
  const BLOCK_TAGS = /^(P|UL|OL|H[1-6]|TABLE|DIV|BLOCKQUOTE|PRE|DL)$/;
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
  const clean = (s) => (s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const isBr = (n) => n && n.nodeType === 1 && n.tagName === 'BR';
  const isBlank = (n) => n && n.nodeType === 3 && !clean(n.nodeValue);
  const trimBreaks = (el) => {
    while (el.lastChild && (isBr(el.lastChild) || isBlank(el.lastChild))) el.lastChild.remove();
    while (el.firstChild && (isBr(el.firstChild) || isBlank(el.firstChild))) el.firstChild.remove();
  };
  const tidy = (el) => {
    el.querySelectorAll(SKIP).forEach((s) => s.remove());
    el.querySelectorAll('em, i, span').forEach((s) => {
      if ([...s.classList].some((c) => /^lh(-|$)/.test(c)) && !clean(s.textContent)) s.remove();
    });
    el.removeAttribute('class');
    if (el.tagName === 'P') trimBreaks(el);
    return el;
  };
  const richNodes = (scope) => {
    const rt = scope.querySelector('.richtext') || scope;
    const out = [];
    let run = null;
    const flush = () => { if (run && (clean(run.textContent) || run.querySelector('img'))) out.push(tidy(run)); run = null; };
    [...rt.childNodes].forEach((n) => {
      if (n.nodeType === 8) return;
      if (n.nodeType === 1 && BLOCK_TAGS.test(n.tagName)) {
        flush();
        const c = tidy(n.cloneNode(true));
        if (clean(c.textContent) || c.querySelector('img')) out.push(c);
        return;
      }
      if (isBlank(n) && !run) return;
      if (!run) run = document.createElement('p');
      run.append(n.cloneNode(true));
    });
    flush();
    return out;
  };
  const MAUI = 'maui-navigation-link[href], maui-button-link[href], maui-link[href], a[href]';
  const linkPara = (scope) => {
    const m = scope.querySelector(MAUI);
    if (!m) return null;
    const label = visibleText(m) || clean(m.getAttribute('label'));
    if (!label) return null;
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
    return p;
  };

  const view = element.querySelector(':scope > .column-view') || element.querySelector('.column-view') || element;
  const titles = [];
  [...view.children].filter((d) => !d.classList.contains('row') && !d.classList.contains('carousel')).forEach((d) => {
    d.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      const t = visibleText(h);
      if (!t) return;
      const out = document.createElement(h.tagName.toLowerCase());
      out.textContent = t;
      titles.push(out);
    });
  });

  const items = [...view.querySelectorAll('.column-view-item')].filter((it) => it.closest('.column-view') === view);
  const cells = [];
  items.forEach((item) => {
    const content = [];
    let hasNumber = false;
    [...item.querySelectorAll('.headline, .text, .link, .image')].filter((c) => !c.parentElement.closest('.headline, .text, .link, .image')).forEach((comp) => {
      if (comp.classList.contains('headline')) {
        const h = comp.querySelector('h1, h2, h3, h4, h5, h6');
        const t = visibleText(h || comp);
        if (!t) return;
        // the step digit is styled as a heading in the source; it is a paragraph
        if (!hasNumber && !content.length && /^\d+\.?$/.test(t)) {
          const p = document.createElement('p');
          p.textContent = t;
          content.push(p);
          hasNumber = true;
          return;
        }
        const out = document.createElement('h3');
        out.textContent = t;
        content.push(out);
      } else if (comp.classList.contains('link')) {
        const p = linkPara(comp);
        if (p) content.push(p);
      } else if (comp.classList.contains('image')) {
        const img = comp.querySelector('img');
        if (img && img.getAttribute('src')) {
          const out = document.createElement('img');
          out.setAttribute('src', img.getAttribute('src'));
          out.setAttribute('alt', img.getAttribute('alt') || '');
          const p = document.createElement('p');
          p.append(out);
          content.push(p);
        }
      } else {
        content.push(...richNodes(comp));
      }
    });
    if (content.length) cells.push([content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-steps', cells });
  element.replaceWith(...titles, block);
}
