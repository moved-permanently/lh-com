/*
 * The FAQ's two-level picker on brand tap (TAP Air Portugal), as
 * www.flytap.com/<root>/help/frequently-asked-questions (tools/reports/tap/parity.md row 65):
 * the categories (each section's H2) as pills under the page's title, the chosen category's title,
 * then its subcategories (the H3 before each FAQ block): from 1024 px a list on the left (WAI-ARIA
 * tabs, vertical: arrow keys, Home and End) beside its questions, on phones a select over them.
 * One category and one subcategory at a time; a #hash of a category or a subcategory picks it (the
 * help centre links to #before-the-flight). accordion-columns.js hands a TAP page's FAQ blocks
 * here; the page is built once. The look: styles/themes/tap.css (.faq-picker-*).
 */

const node = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') n.className = v;
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v);
  });
  n.append(...kids.filter(Boolean));
  return n;
};

let pickers = 0;

/** The FAQ page's slug in TAP's languages (the picker is www's on that page only). */
export const FAQ_SLUGS = [
  'frequently-asked-questions', 'perguntas-frequentes', 'preguntas-frecuentes', 'questions-frequentes',
  'haufige-gestellte-fragen', 'domande-frequenti', 'czesto-zadawane-pytania',
];

/** Whether a path is a root's FAQ page. */
export const isFaqPage = (pathname) => FAQ_SLUGS.includes(String(pathname || '').replace(/\/+$/, '').split('/').pop());

/**
 * The page's categories, in the page's order: each H2 of a section's default content and the
 * section's children after it up to the next H2 (a section may hold several, as the FAQ page is
 * imported); its subcategories the FAQ blocks' wrappers among them, each with the last H3 before
 * it.
 * @param {Element} main
 * @returns {Array<{heading: Element, parts: Element[], subs: Array<{heading: Element,
 *   panel: Element}>}>}
 */
export function faqModel(main) {
  const categories = [];
  [...main.querySelectorAll(':scope > .section')].forEach((section) => {
    let current = null;
    let last = null;
    [...section.children].forEach((child) => {
      const content = child.matches('.default-content-wrapper');
      const h2 = content && child.querySelector('h2');
      if (h2) {
        current = { heading: h2, parts: [], subs: [] };
        categories.push(current);
        last = null;
      }
      if (!current) return;
      current.parts.push(child);
      const h3s = content ? child.querySelectorAll('h3') : [];
      if (h3s.length) last = h3s[h3s.length - 1];
      if (child.querySelector(':scope > .accordion-columns.faq') && last) {
        current.subs.push({ heading: last, panel: child });
        last = null;
      }
    });
  });
  return categories.filter((c) => c.subs.length);
}

/**
 * Builds the picker over the page's FAQ sections (once).
 * @param {Element} main
 */
export function buildFaqPicker(main) {
  if (!main || main.dataset.faqPicker) return;
  const categories = faqModel(main);
  if (categories.length < 1) return;
  main.dataset.faqPicker = 'true';
  pickers += 1;
  const id = `faq-picker-${pickers}`;

  // the categories: pills under the title
  const pills = categories.map((c) => node('button', { type: 'button', className: 'faq-picker-pill', 'aria-pressed': 'false' }, c.heading.textContent.trim()));
  const nav = node('nav', { className: 'faq-picker-categories', 'aria-label': (main.querySelector('h1') || {}).textContent || '' }, ...pills);
  // each category in a container of its own where its first part was
  categories.forEach((c) => {
    c.box = node('div', { className: 'faq-picker-category' });
    c.parts[0].before(c.box);
    c.box.append(...c.parts);
  });
  // the pills right before the first category (under the page's title)
  categories[0].box.before(nav);

  // each category: its subcategories as vertical tabs and a select, beside their questions
  const parts = categories.map((c, ci) => {
    c.box.closest('.section').classList.add('faq-picker-section');
    c.subs.forEach((s) => s.heading.classList.add('faq-picker-sub-heading'));
    const tabs = c.subs.map((s, si) => node('button', {
      type: 'button', role: 'tab', id: `${id}-${ci}-${si}`, className: 'faq-picker-tab', 'aria-selected': 'false', tabindex: '-1',
    }, s.heading.textContent.trim()));
    const list = node('div', { role: 'tablist', className: 'faq-picker-tabs', 'aria-orientation': 'vertical' }, ...tabs);
    const select = node('select', { className: 'faq-picker-select', 'aria-label': c.heading.textContent.trim() }, ...c.subs.map((s, si) => node('option', { value: String(si) }, s.heading.textContent.trim())));
    const panels = c.subs.map((s, si) => {
      s.panel.setAttribute('role', 'tabpanel');
      s.panel.id = s.panel.id || `${id}-${ci}-${si}-panel`;
      s.panel.setAttribute('aria-labelledby', tabs[si].id);
      tabs[si].setAttribute('aria-controls', s.panel.id);
      return s.panel;
    });
    const questions = node('div', { className: 'faq-picker-questions' });
    questions.append(...panels);
    const body = node('div', { className: 'faq-picker-body' }, node('div', { className: 'faq-picker-subs' }, list, select), questions);
    c.box.append(body);
    const show = (si, focus = false) => {
      tabs.forEach((t, i) => {
        t.setAttribute('aria-selected', String(i === si));
        t.setAttribute('tabindex', i === si ? '0' : '-1');
      });
      panels.forEach((p, i) => { p.hidden = i !== si; });
      select.querySelectorAll('option').forEach((o, i) => {
        if (i === si) o.setAttribute('selected', '');
        else o.removeAttribute('selected');
        // (a browser's chosen option after a change; a DOM without the setter keeps the attribute)
        try { o.selected = i === si; } catch (e) { /* the attribute stands */ }
      });
      if (focus) tabs[si].focus();
    };
    tabs.forEach((t, si) => t.addEventListener('click', () => show(si)));
    list.addEventListener('keydown', (e) => {
      const at = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      const keys = {
        ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: tabs.length - 1,
      };
      if (!(e.key in keys)) return;
      e.preventDefault();
      show((keys[e.key] + tabs.length) % tabs.length, true);
    });
    select.addEventListener('change', () => show(Math.max(0, Number(select.value) || 0)));
    return { show };
  });

  const pick = (ci) => {
    categories.forEach((c, i) => { c.box.hidden = i !== ci; });
    pills.forEach((p, i) => p.setAttribute('aria-pressed', String(i === ci)));
  };
  pills.forEach((p, ci) => p.addEventListener('click', () => pick(ci)));

  // the hash: a category's or a subcategory's id, else the first of each
  const hash = decodeURIComponent(((window.location && window.location.hash) || '').slice(1));
  let ci = categories.findIndex((c) => c.heading.id === hash);
  let si = 0;
  if (ci < 0) {
    ci = categories.findIndex((c) => c.subs.some((s) => s.heading.id === hash));
    if (ci >= 0) si = categories[ci].subs.findIndex((s) => s.heading.id === hash);
  }
  parts.forEach((part, i) => part.show(i === ci ? si : 0));
  pick(Math.max(ci, 0));
}

/**
 * accordion-columns.js on brand tap: a FAQ block of the FAQ page builds the page's picker.
 * @param {Element} block
 */
export default function decorateTapFaq(block) {
  if (!isFaqPage((window.location && window.location.pathname) || '')) return;
  buildFaqPicker(block.closest('main'));
}
