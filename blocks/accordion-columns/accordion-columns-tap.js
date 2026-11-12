/*
 * The FAQ's two-level picker on brand tap (TAP Air Portugal), as
 * www.flytap.com/<root>/help/frequently-asked-questions (tools/reports/tap/parity.md row 65):
 * the categories (each section's H2) as pills under the page's title, the chosen category's title,
 * then its subcategories (the H3 before each FAQ block): from 1024 px a list on the left (WAI-ARIA
 * tabs, vertical: arrow keys, Home and End) beside its questions, on phones a select over them.
 * One category and one subcategory at a time; a #hash of a category or a subcategory picks it (the
 * help centre links to #before-the-flight). The Miles&Go partners page is www's same component
 * (its categories, the partners, their accordion; brief 386). accordion-columns.js hands a TAP
 * page's FAQ blocks here; the page is built once. The look: styles/themes/tap.css (.faq-picker-*).
 */
import { removeSectionTabs } from '../../scripts/section-tabs-sets.js';

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

/** The Miles&Go partners page's slug in TAP's versions (www's same CategoryAccordion). */
export const PARTNER_SLUGS = ['parceiros', 'partners', 'socios', 'partenaires', 'partner'];

/** Whether a path has www's two-level picker: the FAQ page, the Miles&Go partners page. */
export const isPickerPage = (pathname) => {
  const parts = String(pathname || '').replace(/\/+$/, '').split('/');
  const [slug, parent] = [parts[parts.length - 1], parts[parts.length - 2]];
  return isFaqPage(pathname) || (parent === 'miles-and-go' && PARTNER_SLUGS.includes(slug));
};

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
  // categories imported as a tab set (row 134's "categories", TAP row 151): the pills are their
  // tabs, so the set's tab list, toggles and hidden panels go
  removeSectionTabs(categories.flatMap((c) => c.parts.map((p) => p.closest('.section'))));

  // the categories: pills under the title
  const pills = categories.map((c) => node('button', { type: 'button', className: 'faq-picker-pill', 'aria-pressed': 'false' }, c.heading.textContent.trim()));
  // (a market's categories come in a fragment, built in a main of its own: the page's title)
  const title = main.querySelector('h1') || document.querySelector('main h1');
  const nav = node('nav', { className: 'faq-picker-categories', 'aria-label': (title || {}).textContent || '' }, ...pills);
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

/** The inspiration pages' slug in TAP's languages (www's same CategoryAccordion as the FAQ). */
export const INSPIRATION_SLUGS = ['get-inspired', 'inspire-se', 'inspirate', 'inspirez-vous', 'inspirieren', 'ispirati'];

/** Whether a path is a root's inspiration page. */
export const isInspirationPage = (pathname) => INSPIRATION_SLUGS.includes(String(pathname || '').replace(/\/+$/, '').split('/').pop());

/** The stopover partners page's slug in TAP's languages (its regions: www's CategoryAccordion). */
export const STOPOVER_PARTNER_SLUGS = [...PARTNER_SLUGS, 'partnerzy'];

/** Whether a path is a root's stopover partners page (row 147: a region a fragment). */
export const isStopoverPartnersPage = (pathname) => {
  const parts = String(pathname || '').replace(/\/+$/, '').split('/');
  return parts[parts.length - 2] === 'stopover' && STOPOVER_PARTNER_SLUGS.includes(parts[parts.length - 1]);
};

/**
 * The second level of www's picker in a fragment of an inspiration page (TAP row 137): the
 * fragment holds one category's subcategories (its countries: an H3 and a FAQ block each; the
 * category is the page's tab, row 134), shown as the FAQ page's subcategories are: from 1024 px a
 * list on the left (vertical tabs) beside the chosen one's questions, on phones a select over
 * them; one at a time, the first at first. Built once a main.
 * @param {Element} main the fragment's main
 */
export function buildSubPicker(main) {
  if (!main || main.dataset.faqPicker) return;
  const subs = [];
  let box = null;
  [...main.querySelectorAll(':scope > .section')].forEach((section) => {
    let last = null;
    [...section.children].forEach((child) => {
      const h3s = child.matches('.default-content-wrapper') ? child.querySelectorAll('h3') : [];
      if (h3s.length) last = h3s[h3s.length - 1];
      if (child.querySelector(':scope > .accordion-columns.faq') && last) {
        subs.push({ heading: last, panel: child, section });
        last = null;
      }
    });
  });
  if (!subs.length) return;
  main.dataset.faqPicker = 'true';
  pickers += 1;
  const id = `faq-picker-${pickers}`;
  const name = (main.querySelector('h2') || {}).textContent || '';
  subs.forEach((x) => {
    x.section.classList.add('faq-picker-section');
    x.heading.classList.add('faq-picker-sub-heading');
  });
  const tabs = subs.map((x, si) => node('button', {
    type: 'button', role: 'tab', id: `${id}-0-${si}`, className: 'faq-picker-tab', 'aria-selected': 'false', tabindex: '-1',
  }, x.heading.textContent.trim()));
  const list = node('div', { role: 'tablist', className: 'faq-picker-tabs', 'aria-orientation': 'vertical' }, ...tabs);
  const select = node('select', { className: 'faq-picker-select', 'aria-label': name.trim() || subs[0].heading.textContent.trim() }, ...subs.map((x, si) => node('option', { value: String(si) }, x.heading.textContent.trim())));
  const panels = subs.map((x, si) => {
    x.panel.setAttribute('role', 'tabpanel');
    x.panel.id = x.panel.id || `${id}-0-${si}-panel`;
    x.panel.setAttribute('aria-labelledby', tabs[si].id);
    tabs[si].setAttribute('aria-controls', x.panel.id);
    return x.panel;
  });
  // the body where the first subcategory's heading was, in its section
  const first = subs[0].heading.closest('.default-content-wrapper') || subs[0].panel;
  const questions = node('div', { className: 'faq-picker-questions' });
  box = node('div', { className: 'faq-picker-category' }, node('div', { className: 'faq-picker-body' }, node('div', { className: 'faq-picker-subs' }, list, select), questions));
  first.before(box);
  questions.append(...panels);
  const show = (si, focus = false) => {
    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === si));
      t.setAttribute('tabindex', i === si ? '0' : '-1');
    });
    panels.forEach((x, i) => { x.hidden = i !== si; });
    select.querySelectorAll('option').forEach((o, i) => {
      if (i === si) o.setAttribute('selected', '');
      else o.removeAttribute('selected');
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
  show(0);
}

/**
 * accordion-columns.js on brand tap: a FAQ block of the FAQ page or the Miles&Go partners page
 * builds the page's picker; one in a fragment of an inspiration page (row 137) or of a stopover
 * partners page (a region, row 147) builds that fragment's subcategory picker.
 * @param {Element} block
 */
export default function decorateTapFaq(block) {
  const path = (window.location && window.location.pathname) || '';
  if (isInspirationPage(path) || isStopoverPartnersPage(path)) {
    const main = block.closest('main');
    if (main && main !== document.querySelector('main')) buildSubPicker(main);
    return;
  }
  if (!isPickerPage(path)) return;
  buildFaqPicker(block.closest('main'));
}

/**
 * Accordion items whose panel names a fragment document (the inspiration pages' articles, brief
 * 488, parity row 126: the importer writes an article with its card lists as a fragment of its
 * own, the panel a paragraph of its path as code; not a link, which scripts.js would load with the
 * page): the fragment goes into the panel in the path's place when the item opens, the open one
 * at once, each once. A path in running text stays as it is.
 * @param {Element} block a decorated accordion-columns block
 * @param {{load?: (path: string) => Promise<Element|null>}} [options] the fragment loader (tests)
 */
export async function loadPanelFragments(block, { load } = {}) {
  const loader = load || (async (p) => (await import('../fragment/fragment.js')).loadFragment(p));
  const waits = [];
  block.querySelectorAll(':scope > details.accordion-columns-item').forEach((item) => {
    const para = [...item.querySelectorAll('.accordion-columns-panel p')].find((p) => {
      const code = p.querySelector(':scope > code:only-child');
      return code && p.textContent.trim() === code.textContent.trim()
        && /^\/[a-z]{2}-[a-z]{2}\/fragments\/[\w/-]+$/.test(code.textContent.trim());
    });
    if (!para) return;
    const href = para.textContent.trim();
    let started = false;
    const fill = async () => {
      if (started) return;
      started = true;
      const main = await loader(href);
      if (!main) return;
      // a fragment decorated as a page gets the page's breadcrumb (scripts.js): not in a panel
      main.querySelectorAll('.breadcrumb-wrapper').forEach((b) => b.remove());
      para.replaceWith(...main.childNodes);
    };
    const isOpen = () => item.open || item.hasAttribute('open');
    if (isOpen()) waits.push(fill());
    else item.addEventListener('toggle', () => { if (isOpen()) fill(); });
  });
  await Promise.all(waits);
}
