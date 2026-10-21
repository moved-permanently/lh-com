/* eslint-disable */
/* global WebImporter */

/**
 * Parser for booking-lookup (Lufthansa AEM ".tabs" holding the dcep-checkin widget; app-entry
 * online check-in).
 *
 * Output (blocks/booking-lookup README): 2 columns, label | value config rows, all read from the
 * DOM (no texts are invented; rows the source does not carry fall back to the block defaults):
 *   Tab               | name of the tab panel holding the form
 *   Login notice      | maui-notification text + its login link
 *   Reference label   | label of the booking-reference input (Reference pattern when the input
 *                       carries a pattern attribute)
 *   First name label  | maui-input[label] of the first-name field
 *   Last name label   | maui-input[label] of the last-name field
 *   Submit label      | text of the submit maui-button
 *   Tab + Panel       | every further tab panel: its name, then its content (paragraphs, links
 *                       (secondary/primary maui-button-link as italic/bold link), images)
 *
 * Nested blocks: blocks parsed earlier inside the tabs (cards-steps ".tabs .fourcolumn", with its
 * column title and the section break the sections transformer put before it) are hoisted out
 * and placed after the booking-lookup table, in source order, instead of being dropped.
 */
export default function parse(element, { document }) {
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
  const BLOCK_TAGS = /^(P|UL|OL|H[1-6]|TABLE|DIV|BLOCKQUOTE|PRE|DL)$/;
  const clean = (s) => (s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const attr = (el, n) => clean(el && el.getAttribute(n));
  const isBr = (n) => n && n.nodeType === 1 && n.tagName === 'BR';
  const isBlank = (n) => n && n.nodeType === 3 && !clean(n.nodeValue);
  const trimBreaks = (el) => {
    while (el.lastChild && (isBr(el.lastChild) || isBlank(el.lastChild))) el.lastChild.remove();
    while (el.firstChild && (isBr(el.firstChild) || isBlank(el.firstChild))) el.firstChild.remove();
  };
  const MAUI = 'maui-navigation-link[href], maui-button-link[href], maui-link[href], a[href]';
  const linkEl = (m) => {
    const label = visibleText(m) || attr(m, 'label');
    if (!label) return null;
    const a = document.createElement('a');
    a.setAttribute('href', m.getAttribute('href'));
    a.textContent = label;
    if (m.tagName === 'MAUI-BUTTON-LINK') {
      const type = m.getAttribute('type');
      if (type === 'primary' || type === 'secondary') {
        const wrap = document.createElement(type === 'primary' ? 'strong' : 'em');
        wrap.append(a);
        return wrap;
      }
    }
    return a;
  };

  // --- tab panels
  const panels = [...element.querySelectorAll('maui-tab-control-panel-responsive, maui-tab-control-panel, [role="tabpanel"]')]
    .filter((p) => !p.parentElement.closest('maui-tab-control-panel-responsive, maui-tab-control-panel, [role="tabpanel"]'));
  const formPanel = panels.find((p) => p.querySelector('.checkinpassengerreceiptentry, .dcep-checkin, form')) || panels[0] || element;
  const tabName = (p) => attr(p, 'name') || attr(p, 'label') || attr(p, 'aria-label') || attr(p, 'heading');

  // --- hoist blocks parsed earlier inside the tabs (with their title / section break)
  const hoisted = [];
  [...element.querySelectorAll('table')].filter((t) => !t.parentElement.closest('table')).forEach((table) => {
    const run = [table];
    let prev = table.previousSibling;
    while (prev) {
      if (prev.nodeType === 3 && !clean(prev.nodeValue)) { prev = prev.previousSibling; continue; }
      if (prev.nodeType === 1 && (/^H[1-6]$/.test(prev.tagName) || prev.tagName === 'HR')) {
        run.unshift(prev);
        prev = prev.previousSibling;
        continue;
      }
      break;
    }
    hoisted.push(...run);
  });
  hoisted.forEach((n) => n.remove());

  const cells = [];
  const form = formPanel.querySelector('.dcep-checkin, form') || formPanel;
  if (tabName(formPanel)) cells.push(['Tab', tabName(formPanel)]);

  const notice = form.querySelector('maui-notification, .message-box-maui');
  if (notice) {
    const content = [];
    const text = visibleText(notice.querySelector('maui-copy, .message-maui p, .message-maui')) || '';
    if (text) content.push(document.createTextNode(`${text} `));
    const link = notice.querySelector(MAUI);
    const a = link && linkEl(link);
    if (a) content.push(a);
    if (content.length) {
      const p = document.createElement('p');
      p.append(...content);
      cells.push(['Login notice', p]);
    }
  }

  const fields = [...form.querySelectorAll('maui-input, input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"])')]
    .filter((f) => !(f.tagName === 'INPUT' && f.closest('maui-input')));
  const labelOf = (f) => {
    if (f.tagName === 'MAUI-INPUT') return attr(f, 'label') || attr(f, 'placeholder');
    const id = f.getAttribute('id');
    let l = null;
    if (id) { try { l = form.querySelector(`label[for="${CSS.escape(id)}"]`); } catch (e) { l = null; } }
    return visibleText(l) || visibleText(f.closest('label')) || attr(f, 'aria-label') || attr(f, 'placeholder');
  };
  const key = (f) => `${f.getAttribute('name') || ''} ${f.getAttribute('id') || ''} ${f.getAttribute('autocomplete') || ''}`.toLowerCase();
  const first = fields.find((f) => /first|given/.test(key(f)));
  const last = fields.find((f) => /last|family|surname/.test(key(f)));
  const reference = fields.find((f) => f !== first && f !== last);
  if (reference && labelOf(reference)) cells.push(['Reference label', labelOf(reference)]);
  if (reference && attr(reference, 'pattern')) cells.push(['Reference pattern', attr(reference, 'pattern')]);
  if (first && labelOf(first)) cells.push(['First name label', labelOf(first)]);
  if (last && labelOf(last)) cells.push(['Last name label', labelOf(last)]);
  const submit = form.querySelector('maui-button[type="primary"], maui-button[type="submit"], button[type="submit"], .form-btn-section maui-button, .form-btn-section button');
  if (submit && visibleText(submit)) cells.push(['Submit label', visibleText(submit)]);
  const action = form.tagName === 'FORM' ? attr(form, 'action') : attr(form.querySelector('form'), 'action');
  if (action && !/^(#|javascript:)/i.test(action)) cells.push(['Submit URL', action]);

  // --- further tabs: Tab | name, Panel | rich content
  const panelContent = (panel) => {
    const out = [];
    const walk = (node) => {
      [...node.children].forEach((child) => {
        if (child.matches(SKIP) || child.matches('.separator, .swiper-pagination, .swiper-button-prev, .swiper-button-next')) return;
        if (child.matches('.hidden-lg-up, .d-md-none') && child.parentElement.querySelector(':scope > .hidden-md-down, :scope > .d-none.d-md-block')) return;
        if (child.classList.contains('text') && child.querySelector('.richtext')) {
          const rt = child.querySelector('.richtext');
          [...rt.children].forEach((n) => {
            if (!BLOCK_TAGS.test(n.tagName)) return;
            const c = n.cloneNode(true);
            c.querySelectorAll(SKIP).forEach((s) => s.remove());
            c.removeAttribute('class');
            if (c.tagName === 'P') trimBreaks(c);
            if (clean(c.textContent) || c.querySelector('img')) out.push(c);
          });
        } else if (child.classList.contains('headline')) {
          const h = child.querySelector('h1, h2, h3, h4, h5, h6');
          if (h && visibleText(h)) { const o = document.createElement(h.tagName.toLowerCase()); o.textContent = visibleText(h); out.push(o); }
        } else if (child.classList.contains('link') && child.querySelector(MAUI)) {
          const a = linkEl(child.querySelector(MAUI));
          if (a) { const p = document.createElement('p'); p.append(a); out.push(p); }
        } else if (child.classList.contains('image') && child.querySelector('img')) {
          const img = child.querySelector('img');
          if (img.getAttribute('src')) {
            const o = document.createElement('img');
            o.setAttribute('src', img.getAttribute('src'));
            o.setAttribute('alt', img.getAttribute('alt') || '');
            const p = document.createElement('p');
            p.append(o);
            out.push(p);
          }
        } else {
          walk(child);
        }
      });
    };
    walk(panel);
    return out;
  };
  panels.filter((p) => p !== formPanel).forEach((panel) => {
    const content = panelContent(panel);
    if (!tabName(panel) && !content.length) return;
    cells.push(['Tab', tabName(panel)]);
    if (content.length) cells.push(['Panel', content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'booking-lookup', cells });
  element.replaceWith(block, ...hoisted);
}
