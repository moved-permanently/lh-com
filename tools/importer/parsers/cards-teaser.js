/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-teaser (Lufthansa AEM ".twocolumn" / ".threecolumn" column views whose items
 * are image + headline + text + link teasers). Used by hub, campaign and app-entry.
 *
 * Output (blocks/cards-teaser README): 2 columns, one row per card.
 *   cell 1: image (src + alt)
 *   cell 2: heading (source level kept), description paragraph(s), CTA link as last paragraph
 * A ".threecolumn" source adds the option "three-up" (Cards Teaser (three-up)), a ".fourcolumn"
 * the option "four-up" (hub /at/de/flughafeninformation). Column views of
 * stage teasers (".stage .stage-teaser", Insights "Explore more") add the option "overlay":
 * image | headline as h3, subheadline as the CTA link to the tile's target.
 *
 * Column title (".column-view > div:not(.row) > h2") is default content: it is emitted before
 * the block table. When the source splits one teaser grid over several adjacent column views
 * (hub: 3 x .twocolumn, campaign: 2 x .twocolumn in two AEM sections) and this instance has no
 * own column title, its rows are appended to the previous Cards Teaser table of the same
 * variant, provided nothing but empty wrappers sits between the two.
 */
export default function parse(element, { document }) {
  const BLOCK_TAGS = /^(P|UL|OL|H[1-6]|TABLE|DIV|BLOCKQUOTE|PRE|DL)$/;
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);

  const imageFrom = (scope) => {
    const img = [...scope.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
    if (!img) return null;
    const out = document.createElement('img');
    out.setAttribute('src', img.getAttribute('src'));
    out.setAttribute('alt', img.getAttribute('alt') || '');
    return out;
  };

  const trimTrailingBreaks = (el) => {
    let last = el.lastChild;
    while (last && ((last.nodeType === 3 && !clean(last.nodeValue)) || (last.nodeType === 1 && last.tagName === 'BR'))) {
      const prev = last.previousSibling;
      last.remove();
      last = prev;
    }
  };

  /** Block-level copies of a richtext container; loose inline runs are wrapped in <p>. */
  const richNodes = (scope) => {
    const rt = scope.querySelector('.richtext') || scope;
    const out = [];
    let run = null;
    const flush = () => {
      if (run) {
        trimTrailingBreaks(run);
        if (clean(run.textContent) || run.querySelector('img')) out.push(run);
      }
      run = null;
    };
    [...rt.childNodes].forEach((n) => {
      if (n.nodeType === 8) return;
      if (n.nodeType === 1 && BLOCK_TAGS.test(n.tagName)) {
        flush();
        const c = n.cloneNode(true);
        c.querySelectorAll(SKIP).forEach((s) => s.remove());
        if (c.tagName === 'P') trimTrailingBreaks(c);
        if (clean(c.textContent) || c.querySelector('img')) out.push(c);
        return;
      }
      if (n.nodeType === 3 && !clean(n.nodeValue) && !run) return;
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

  const headingFrom = (scope) => {
    const h = scope.querySelector('h1, h2, h3, h4, h5, h6');
    const text = visibleText(h || scope);
    if (!text) return null;
    const out = document.createElement(h ? h.tagName.toLowerCase() : 'h3');
    out.textContent = text;
    // the Lufthansa size class (h3.heading-small); the cleanup turns it into a
    // "{heading-small}" marker when it differs from the level's size
    const style = h && [...h.classList].find((c) => /^heading-/.test(c));
    if (style) out.className = style;
    return out;
  };

  // Lufthansa stage teasers (".stage .stage-teaser": the whole tile links, headline and
  // subheadline over the image): option "overlay", heading = headline, CTA = subheadline
  const overlay = !!element.querySelector('.column-view-item > .stage .stage-teaser');

  // --- column title (default content before the block)
  const view = element.querySelector(':scope > .column-view') || element;
  const titles = [];
  // a column view with carousel behaviour (.carousel: desktop grid + swiper copy, hub
  // /meetings-and-events steps) holds the cards, not a title
  [...view.children].filter((d) => !d.classList.contains('row') && !d.classList.contains('carousel')).forEach((d) => {
    d.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      const t = visibleText(h);
      if (!t) return;
      const out = document.createElement(h.tagName.toLowerCase());
      out.textContent = t;
      // the size class (overlay tiles: Insights "Explore more" h2.heading-small; flight-search
      // and digital-self-services "This might also be of interest to you" h2.heading-small,
      // 28px light at 1440 / 22px at 390 on live, were 36 / 28) becomes the cleanup's heading
      // marker when it differs from the level's size
      const style = [...h.classList].find((c) => /^heading-/.test(c));
      if (style) out.className = style;
      titles.push(out);
    });
  });

  // --- cards: one row per column-view item
  const items = [...element.querySelectorAll('.column-view-item')]
    .filter((it) => !it.parentElement.closest('.column-view-item'));
  const cells = [];
  items.forEach((item) => {
    let media = null;
    const body = [];
    [...item.children].forEach((comp) => {
      if (comp.classList.contains('image')) {
        const img = imageFrom(comp);
        if (!img) return;
        if (!media) media = img;
        else { const p = document.createElement('p'); p.append(img); body.push(p); }
      } else if (comp.classList.contains('headline')) {
        const h = headingFrom(comp);
        if (h) body.push(h);
      } else if (comp.classList.contains('stage') && comp.querySelector('.stage-teaser')) {
        const img = imageFrom(comp);
        if (img && !media) media = img;
        const head = visibleText(comp.querySelector('.stage-teaser-headline'));
        if (head) { const h = document.createElement('h3'); h.textContent = head; body.push(h); }
        const link = comp.querySelector('a.stage-teaser-link[href], a[href]');
        const sub = visibleText(comp.querySelector('.stage-teaser-subheadline'));
        if (link && (sub || head)) {
          const a = document.createElement('a');
          a.setAttribute('href', link.getAttribute('href'));
          a.textContent = sub || head;
          const p = document.createElement('p');
          p.append(a);
          body.push(p);
        }
      } else if (comp.classList.contains('link')) {
        const p = linkPara(comp);
        if (p) body.push(p);
      } else if (visibleText(comp)) {
        body.push(...richNodes(comp));
      }
    });
    if (!media && !body.length) return;
    cells.push([media || '', body.length ? body : '']);
  });

  let variants = [];
  if (element.classList.contains('threecolumn')) variants = ['three-up'];
  else if (element.classList.contains('fourcolumn')) variants = ['four-up'];
  if (overlay) variants.push('overlay');
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', variants, cells });

  // --- merge into the previous Cards Teaser table when this is its continuation
  const headerText = (t) => clean((t.querySelector('tr') || t).textContent).toLowerCase();
  const previousSameBlock = () => {
    const name = headerText(block);
    const before = [...document.querySelectorAll('table')].filter((t) => !element.contains(t)
      && (t.compareDocumentPosition(element) & 4) && headerText(t) === name);
    const prev = before[before.length - 1];
    if (!prev) return null;
    const range = document.createRange();
    range.setStartAfter(prev);
    range.setEndBefore(element);
    const between = range.cloneContents();
    if (clean(between.textContent)) return null;
    if (between.querySelector('img, picture, video, iframe, hr, table, h1, h2, h3, h4, h5, h6, form, input')) return null;
    return prev;
  };
  if (!titles.length && cells.length) {
    const prev = previousSameBlock();
    if (prev) {
      const rows = [...block.querySelectorAll('tr')].slice(1);
      const lastRow = [...prev.querySelectorAll('tr')].pop();
      rows.forEach((r) => lastRow.parentNode.append(r));
      element.remove();
      return;
    }
  }

  element.replaceWith(...titles, block);
}
