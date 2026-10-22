import { getMetadata } from '../../scripts/aem.js';
import { cleanText } from '../../scripts/block-config.js';

const MAX_DEPTH = 10;
const CACHE_KEY = 'lh-breadcrumb:';
// hosts of this site besides the current origin (metadata links may come back absolute)
const SITE_HOST = /^(?:[a-z0-9-]+--)?lh-com--moved-permanently\.aem\.(?:page|live)$/;

/**
 * Crumbs of an authored block (documents imported before the trail came from metadata): the
 * items of a list, else every link or text paragraph of the cells in order.
 * @param {Element} block
 * @returns {{label: string, href: string}[]}
 */
function readCrumbs(block) {
  const items = [...block.querySelectorAll('li')];
  const nodes = items.length
    ? items
    : [...block.querySelectorAll(':scope > div > div')].flatMap((cell) => {
      const parts = [...cell.querySelectorAll('p, a')].filter((n) => n.tagName === 'P' || !n.closest('p'));
      return parts.length ? parts : [cell];
    });
  return nodes.map((node) => {
    const link = node.tagName === 'A' ? node : node.querySelector('a[href]');
    return { label: cleanText(link || node), href: link ? link.getAttribute('href') : '' };
  }).filter((c) => c.label);
}

/**
 * Local dev server (aem up --html-folder content) serves the documents under a folder prefix
 * (/content/de/en/...); the parent pages are fetched and linked under the same prefix.
 */
function devPrefix() {
  if (!/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) return '';
  const m = window.location.pathname.match(/^((?:\/[^/]+)*?)(?=\/(?:lhg\/)?[a-z]{2}\/[a-z]{2}(?:\/|$))/);
  return m ? m[1] : '';
}

/**
 * Path of a page of this site, or null for other sites (e.g. a parent on www.lufthansa.com).
 * @param {string} href
 */
function sitePath(href) {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin && !SITE_HOST.test(url.hostname)) return null;
    const prefix = devPrefix();
    const pathname = prefix && url.pathname.startsWith(`${prefix}/`) ? url.pathname.slice(prefix.length) : url.pathname;
    return pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  } catch {
    return null;
  }
}

/**
 * Breadcrumb values of a page from its head: label (Breadcrumb title, else og:title, else the
 * title), parent links (Parent; several when the parent is outside the site) and the labels of
 * the outside links (Parent title, "A > B").
 * @param {Document} doc
 */
function readPage(doc) {
  return {
    label: getMetadata('breadcrumb-title', doc) || getMetadata('og:title', doc) || doc.title || '',
    parent: getMetadata('parent', doc),
    parentTitle: getMetadata('parent-title', doc),
  };
}

/**
 * Breadcrumb values of another page of the site, from the head of its HTML (cached per tab).
 * @param {string} path
 * @returns {Promise<{label: string, parent: string, parentTitle: string}|null>}
 */
async function fetchPage(path) {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY + path);
    if (cached) return JSON.parse(cached);
  } catch { /* no storage */ }
  try {
    const resp = await fetch(`${devPrefix()}${path}`, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) return null;
    const html = await resp.text();
    // local dev server: the Metadata block is still in the body (no <meta> tags from it)
    const local = html.includes('<div class="metadata">');
    const end = html.search(/<\/head>/i);
    const doc = new DOMParser().parseFromString(local || end < 0 ? html : `${html.slice(0, end)}</head><body></body></html>`, 'text/html');
    if (local) {
      doc.querySelectorAll('div.metadata > div').forEach(({ children: [k, v] }) => {
        if (!k || !v) return;
        const name = k.textContent.trim().toLowerCase().replace(/[^a-z0-9:]+/g, '-');
        const links = [...v.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
        const attr = name.includes(':') ? 'property' : 'name';
        doc.head.querySelectorAll(`meta[${attr}="${name}"]`).forEach((m) => m.remove());
        const meta = doc.createElement('meta');
        meta.setAttribute(attr, name);
        meta.content = links.length ? links.join(', ') : v.textContent.trim();
        doc.head.prepend(meta);
      });
    }
    const page = readPage(doc);
    try { sessionStorage.setItem(CACHE_KEY + path, JSON.stringify(page)); } catch { /* full */ }
    return page;
  } catch {
    return null;
  }
}

/**
 * The trail from the page metadata: walks up the Parent links, each parent page names its own
 * parent. Links outside the site take their labels from Parent title and end the walk unless a
 * page of the site is listed before them.
 * @returns {Promise<{label: string, href: string}[]>} root first, the current page last
 */
async function trailFromMetadata() {
  const crumbs = [{ label: readPage(document).label, href: window.location.pathname }];
  const seen = new Set([sitePath(window.location.pathname)]);
  let page = readPage(document);
  for (let depth = 0; page && page.parent && depth < MAX_DEPTH; depth += 1) {
    const titles = (page.parentTitle || '').split(/\s+>\s+/).map((t) => t.trim()).filter(Boolean);
    let outside = -1;
    const links = page.parent.split(/,\s+/).filter(Boolean).map((href) => {
      const path = sitePath(href);
      if (path) return { path, href: path };
      outside += 1;
      return { href, label: titles[outside] };
    });
    page = null;
    for (let i = links.length - 1; i >= 0; i -= 1) {
      const link = links[i];
      if (!link.path) {
        if (link.label) crumbs.unshift({ label: link.label, href: link.href });
      } else {
        if (seen.has(link.path)) break;
        seen.add(link.path);
        // eslint-disable-next-line no-await-in-loop
        const parent = await fetchPage(link.path);
        if (parent && parent.label) {
          crumbs.unshift({ label: parent.label, href: `${devPrefix()}${link.path}` });
          page = parent;
        }
        break;
      }
    }
  }
  return crumbs;
}

function render(block, crumbs) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', document.documentElement.lang === 'de' ? 'Brotkrümelnavigation' : 'Breadcrumb');
  const ol = document.createElement('ol');
  crumbs.forEach(({ label, href }, i) => {
    const li = document.createElement('li');
    li.className = 'breadcrumb-item';
    const current = i === crumbs.length - 1;
    if (current) {
      li.classList.add('breadcrumb-current');
      const span = document.createElement('span');
      span.setAttribute('aria-current', 'page');
      span.textContent = label;
      li.append(span);
    } else {
      if (i === crumbs.length - 2) li.classList.add('breadcrumb-parent');
      const el = document.createElement(href ? 'a' : 'span');
      if (href) el.href = href;
      el.textContent = label;
      li.append(el);
    }
    ol.append(li);
  });
  nav.append(ol);
  block.replaceChildren(nav);
}

/**
 * Breadcrumb ("Home > Airport information > Boarding") of the live pages (maui-breadcrumb on
 * AEM pages, nav.breadcrumb on AirCore). Built from page metadata (see README): scripts.js adds
 * an empty block where the live page shows it; the trail is resolved without delaying the
 * section (the row keeps its height and shows when complete). An authored block (list of
 * links) is rendered as it is. Desktop shows the whole trail; small screens only the parent as
 * a back link, like the live site.
 * @param {Element} block
 */
export default function decorate(block) {
  const authored = readCrumbs(block);
  if (authored.length) {
    render(block, authored);
    return;
  }
  render(block, [{ label: readPage(document).label, href: window.location.pathname }]);
  block.classList.add('breadcrumb-loading');
  trailFromMetadata().then((crumbs) => {
    render(block, crumbs);
    block.classList.remove('breadcrumb-loading');
  });
}
