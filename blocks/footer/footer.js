import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getLocale, LIVE_ORIGIN } from '../../scripts/locale.js';
import {
  uiIcon, inlineIcon, takeIconName, iconTokenImage, iconLabel,
} from '../../scripts/lh-icons.js';
import { getChannel, isFlynetHiddenLink } from '../../scripts/channel.js';
import { isOwnWwwHost } from '../../scripts/brand.js';

/*
 * Lufthansa footer. Footer document (/{cc}/{ll}/footer), one section each:
 *  1. ":search: [search page link](label)" and ":globe: Country | Language"
 *  2. link columns: heading + list of links, repeated (accordions below 768px)
 *  3. legal row: list of links
 *  4. logos: list of linked logos (images or icon tokens such as :star-alliance:,
 *     :lufthansa-group:, :iata-cargo-iq:)
 * Optional sections, marked with section metadata (Style), for brand sites (lh-ita):
 *  - badges: rows of a heading and a list of linked images (payment methods, social links) or
 *    icon links (":facebook:", ":youtube:", ":instagram:", ":linkedin:"; lh-cargo), shown between
 *    the link columns and the legal row
 *  - note: a paragraph below the legal row (the company's registration line)
 *  - wordmark: an image at the top of the link area (austrian's "servus"; beside the link columns
 *    from 1025px)
 * Footers without them (lh-com) look as before.
 * FlyNet channel (scripts/channel.js): links that book, log in or search flights are left out.
 */

const LABELS = {
  en: {
    search: 'Search', localeCurrent: 'Country and language selection; currently:', newTab: 'opens in a new tab',
  },
  de: {
    search: 'Suchen', localeCurrent: 'Auswahl von Land und Sprache; aktuell:', newTab: 'öffnet in einem neuen Tab',
  },
};

const MOBILE = window.matchMedia('(width < 768px)');

function text(node) {
  return (node ? node.textContent : '').replace(/\s+/g, ' ').trim();
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === false || v === null || v === undefined) return;
    if (k === 'className') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  children.flat().forEach((c) => {
    if (c === null || c === undefined || c === '') return;
    node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

function isExternal(href) {
  try {
    const u = new URL(href, window.location.href);
    return u.origin !== window.location.origin && !isOwnWwwHost(u.hostname);
  } catch (e) {
    return false;
  }
}

/** A footer link; external sites open in a new tab like on the live site. */
function footerLink(a, className, labels, ...prefix) {
  const href = a.getAttribute('href');
  const link = el('a', { href, className }, prefix, el('span', {}, text(a)));
  if (a.title && a.title !== text(a)) link.title = a.title;
  if (isExternal(href)) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.append(el('span', { className: 'footer-sr-only' }, ` (${labels.newTab})`));
  }
  if (href === '#privacy-settings') {
    // consent preferences: handled by the consent manager when one is installed
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('consent.preferences'));
    });
  }
  return link;
}

/* ---------------------------------------------------------------- sections ----------- */

function classifySections(fragment) {
  const all = [...fragment.querySelectorAll(':scope > .section')];
  const marked = (name) => all.filter((s) => s.classList.contains(name));
  const badges = marked('badges');
  const notes = marked('note');
  const wordmarks = marked('wordmark');
  const sections = all.filter((s) => ![...badges, ...notes, ...wordmarks].includes(s));
  const columns = sections.find((s) => s.querySelector('h2, h3, h4, h5, h6') && s.querySelector('ul'));
  const top = sections.find((s) => s !== columns && !s.querySelector('ul'));
  const logos = sections.find((s) => ![columns, top].includes(s) && s.querySelector('img, picture'));
  const legal = sections.find((s) => ![columns, top, logos].includes(s) && s.querySelector('ul'));
  return {
    top, columns, legal, logos, badges, notes, wordmarks,
  };
}

async function buildSearch(top, labels) {
  const para = top && [...top.querySelectorAll('p')].find((p) => {
    const a = p.querySelector('a[href]');
    return a && /search/i.test(a.getAttribute('href'));
  });
  if (!para) return null;
  const iconName = takeIconName(para) || 'search';
  const a = para.querySelector('a[href]');
  const label = text(a) || labels.search;
  const id = 'footer-search-input';
  const input = el('input', {
    id, type: 'search', name: 'query', placeholder: label, autocomplete: 'off',
  });
  const form = el(
    'form',
    { className: 'footer-search', role: 'search', action: a.href },
    el('label', { for: id, className: 'footer-sr-only' }, label),
    input,
    el('button', { type: 'submit', 'aria-label': labels.search }, await inlineIcon(iconName)),
  );
  // the live search page takes the term in its (empty) query parameter
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = input.value.trim();
    if (!term) {
      input.focus();
      return;
    }
    const url = new URL(a.href);
    const param = [...url.searchParams.entries()].find(([, v]) => !v || /%q%/.test(v));
    url.searchParams.set(param ? param[0] : 'query', term);
    window.location.href = url.href;
  });
  return form;
}

async function buildLocale(top, labels) {
  const para = top && [...top.querySelectorAll('p')].find((p) => !p.querySelector('a[href]'));
  if (!para) return null;
  const iconName = takeIconName(para) || 'globe';
  const label = text(para);
  if (!label) return null;
  const button = el(
    'button',
    { type: 'button', className: 'footer-locale-button', 'aria-haspopup': 'dialog' },
    await inlineIcon(iconName),
    el('span', { className: 'footer-sr-only' }, `${labels.localeCurrent} `),
    el('span', {}, label),
  );
  // the header owns the country/language dialog; without a header go to the live selector
  button.addEventListener('click', () => {
    const event = new CustomEvent('lh:locale-selector', { cancelable: true, detail: { trigger: button } });
    if (document.dispatchEvent(event)) window.location.href = `${LIVE_ORIGIN}/`;
  });
  return el('div', { className: 'footer-locale' }, button);
}

function buildColumns(section, labels) {
  if (!section) return null;
  const wrapper = el('div', { className: 'footer-columns' });
  const columns = [];
  const content = section.querySelector('.default-content-wrapper') || section;
  [...content.children].forEach((child) => {
    if (/^H[1-6]$/.test(child.tagName)) {
      columns.push({ heading: text(child), lists: [] });
    } else if (child.tagName === 'UL' || child.tagName === 'OL') {
      if (!columns.length) columns.push({ heading: '', lists: [] });
      columns[columns.length - 1].lists.push(child);
    }
  });
  columns.forEach((col, i) => {
    const listId = `footer-list-${i + 1}`;
    const links = el('ul', { id: listId, className: 'footer-column-links' });
    col.lists.forEach((list) => list.querySelectorAll('a[href]').forEach((a) => {
      links.append(el('li', {}, footerLink(a, 'footer-link', labels)));
    }));
    const columnEl = el('div', { className: 'footer-column' });
    if (col.heading) {
      const toggle = el(
        'button',
        {
          type: 'button', className: 'footer-column-toggle', 'aria-expanded': 'false', 'aria-controls': listId,
        },
        el('span', {}, col.heading),
        uiIcon('chevron-down'),
      );
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        columnEl.classList.toggle('is-open', open);
      });
      columnEl.append(el(
        'h3',
        { className: 'footer-column-heading' },
        toggle,
        el('span', { className: 'footer-column-title' }, col.heading),
      ));
    }
    columnEl.append(links);
    wrapper.append(columnEl);
  });
  return wrapper.children.length ? wrapper : null;
}

function buildLegal(section, labels) {
  if (!section) return null;
  const list = el('ul', { className: 'footer-legal' });
  section.querySelectorAll('li a[href], p a[href]').forEach((a) => {
    list.append(el('li', {}, footerLink(a, 'footer-link', labels, uiIcon('arrow-right'))));
  });
  return list.children.length ? list : null;
}

/** The badges sections: per group a heading and its linked images (payments, social links). */
function buildBadges(sections, labels) {
  if (!sections.length) return null;
  const wrapper = el('div', { className: 'footer-badges' });
  sections.forEach((section) => {
    const content = section.querySelector('.default-content-wrapper') || section;
    let group = null;
    [...content.children].forEach((child) => {
      if (/^H[1-6]$/.test(child.tagName) || !group) {
        group = el('div', { className: 'footer-badge-group' });
        wrapper.append(group);
      }
      if (/^H[1-6]$/.test(child.tagName)) {
        group.append(el('h3', { className: 'footer-badge-heading' }, text(child)));
        return;
      }
      const list = group.querySelector('ul') || group.appendChild(el('ul'));
      child.querySelectorAll('a[href]').forEach((a) => {
        const img = iconTokenImage(a, window.hlx.codeBasePath);
        const link = el('a', { href: a.getAttribute('href') });
        if (img) {
          const name = img.dataset.iconName;
          if (name) link.classList.add(`footer-badge-${name}`);
          if (!img.alt) img.alt = a.title || text(a) || iconLabel(name);
          img.loading = 'lazy';
          link.append(a.querySelector('picture') || img);
        } else {
          link.textContent = text(a);
        }
        if (isExternal(link.href)) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('aria-label', `${img ? img.alt : text(a)} (${labels.newTab})`);
        }
        list.append(el('li', {}, link));
      });
    });
  });
  return wrapper.querySelector('li') ? wrapper : null;
}

/** The wordmark sections: the brand's wordmark image atop the link area (austrian: "servus"). */
function buildWordmark(sections) {
  const pic = sections.map((s) => s.querySelector('picture') || s.querySelector('img')).find(Boolean);
  return pic ? el('div', { className: 'footer-wordmark' }, pic) : null;
}

function buildNotes(sections) {
  const paras = sections.flatMap((s) => [...s.querySelectorAll('p')]).map((p) => text(p)).filter(Boolean);
  return paras.length ? el('div', { className: 'footer-note' }, ...paras.map((t) => el('p', {}, t))) : null;
}

/*
 * Logo row icon variants: the footer shows the horizontal "STAR ALLIANCE" graphic
 * (maui-graphic star-alliance-logo-horizontal-transparent) for the :star-alliance: token.
 */
const AEM_LOGO_VARIANTS = { 'star-alliance': 'star-alliance-horizontal' };

function buildLogos(section, labels) {
  if (!section) return null;
  const list = el('ul');
  section.querySelectorAll('a[href]').forEach((a) => {
    // an undecorated ":name:" icon token stands for /icons/{name}.svg
    const img = iconTokenImage(a, window.hlx.codeBasePath, AEM_LOGO_VARIANTS);
    if (!img && !text(a)) return;
    const link = el('a', { href: a.getAttribute('href') });
    if (img) {
      const name = img.dataset.iconName;
      if (name) link.classList.add(`footer-logo-${name}`);
      if (!img.alt) img.alt = a.title || text(a) || iconLabel(name);
      img.loading = 'lazy';
      link.append(a.querySelector('picture') || img);
    } else {
      link.textContent = text(a);
    }
    if (isExternal(link.href)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${img ? img.alt : text(a)} (${labels.newTab})`);
    }
    list.append(el('li', {}, link));
  });
  return list.children.length ? el('div', { className: 'footer-logos' }, el('div', { className: 'footer-logos-inner' }, list)) : null;
}

/** On small screens the column lists are accordions; from 768px they are always open. */
function syncAccordions(root) {
  root.querySelectorAll('.footer-column-toggle').forEach((toggle) => {
    const column = toggle.closest('.footer-column');
    if (!MOBILE.matches) column.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', column.classList.contains('is-open') ? 'true' : 'false');
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const locale = getLocale();
  const labels = LABELS[locale.lang] || LABELS.en;
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : `${locale.base}/footer`;
  // a root answered from its language version without a footer of its own on this host: the
  // language version's (as before the root had a row)
  const fragment = await loadFragment(footerPath)
    || (!footerMeta && locale.versionBase ? await loadFragment(`${locale.versionBase}/footer`) : null);
  if (!fragment) return;
  if (getChannel() === 'flynet') {
    fragment.querySelectorAll('li a[href]').forEach((a) => {
      if (isFlynetHiddenLink(a.getAttribute('href'))) a.closest('li').remove();
    });
  }

  const {
    top, columns, legal, logos, badges, notes, wordmarks,
  } = classifySections(fragment);

  const inner = el('div', { className: 'footer-inner' });
  const [search, localeEl] = await Promise.all([
    buildSearch(top, labels),
    buildLocale(top, labels),
  ]);
  const columnsEl = buildColumns(columns, labels);
  const legalEl = buildLegal(legal, labels);
  const badgesEl = buildBadges(badges, labels);
  const noteEl = buildNotes(notes);
  const wordmarkEl = buildWordmark(wordmarks);
  inner.append(...[wordmarkEl, search, localeEl, columnsEl, badgesEl].filter(Boolean));
  if (legalEl) inner.append(el('hr', { className: 'footer-divider' }), legalEl);
  if (noteEl) inner.append(noteEl);
  // the grid with the optional rows (brand sites); without them the areas are as before
  if (badgesEl || noteEl || wordmarkEl) inner.classList.add('has-extras');
  if (wordmarkEl) inner.classList.add('has-wordmark');

  block.textContent = '';
  block.append(el('div', { className: 'footer-main' }, inner));
  const logosEl = buildLogos(logos, labels);
  if (logosEl) block.append(logosEl);

  syncAccordions(block);
  MOBILE.addEventListener('change', () => syncAccordions(block));
}
