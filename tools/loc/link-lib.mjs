/* eslint-disable import/no-extraneous-dependencies -- linkedom: dev dependency */
/**
 * Links of a page in the target locale after a rollout or a translation (tools/loc/link-step.mjs;
 * the slug step uses the same fix; tests: test/loc-link-step.test.mjs).
 *
 * - The site's own hosts (the app makes every root-relative link an absolute aem.page link on
 *   translation, dnt/dnt.js resetHrefs 46-52; a merge makes them aem.live, regional-diff.js
 *   normalizeLinks 103-117; authors paste lhcom.bbird.live links) become root-relative.
 * - A link into the source locale (/<from>/<x>) becomes the target locale's page of <x>: the row
 *   of tools/migration-scope/pages.csv that holds /<from>/<x> names it (own German slugs
 *   included). A link without a counterpart in the target locale stays as it is and is listed.
 * - Links to other hosts (www.lufthansa.com, partners) stay as they are.
 */
import { parseHTML } from 'linkedom';

export const SITE_HOSTS = /^https:\/\/(main--lh-com--moved-permanently\.aem\.(page|live)|lhcom\.bbird\.live|lhedge\.bbird\.live)(?=\/|$)/;
export const COLUMN = {
  'de/en': 'de_en', 'de/de': 'de_de', 'at/de': 'at_de', 'gb/en': 'gb_en',
};
/** The locale pairs the step knows: rollouts and the translation. */
export const PAIRS = {
  'de/de>at/de': 'rollout', 'de/en>gb/en': 'rollout', 'de/en>de/de': 'translation',
};

/** {from, to, paths: {"/<from>/x": "/<to>/y"}} from pages.csv rows (both cells set). */
export function pairMap(rows, from, to) {
  const [a, b] = [COLUMN[from], COLUMN[to]];
  if (!a || !b) throw new Error(`unknown locale pair ${from} > ${to}`);
  const paths = { [`/${from}`]: `/${to}` };
  rows.forEach((r) => { if (r[a] && r[b]) paths[r[a]] = r[b]; });
  return { from, to, paths };
}

/**
 * The target locale's href of a link, or null to leave it. report(path) is called for a link into
 * the source locale without a counterpart.
 */
export function localizeHref(href, map, report = () => {}) {
  const raw = String(href || '');
  let v = raw.replace(SITE_HOSTS, '');
  if (v === '') v = '/';
  const re = new RegExp(`^(/${map.from.replace('/', '\\/')}(?:/[^?#]*)?)([?#].*)?$`);
  const m = v.match(re);
  if (m) {
    const path = m[1].replace(/\.html$/, '').replace(/\/$/, '') || `/${map.from}`;
    const target = map.paths[path];
    if (target) v = `${target}${m[2] || ''}`;
    else report(path);
  }
  return v === raw ? null : v;
}

/**
 * The page's links made the target locale's: {html, links: n changed, unmapped: [paths]}.
 * A link whose text is its own URL (the metadata Parent row) gets the new URL as its text too.
 */
export function localizeDoc(html, map) {
  const { document } = parseHTML(/^\s*<html/i.test(html) ? html : `<html><head></head>${html}</html>`);
  const unmapped = new Set();
  let links = 0;
  document.querySelectorAll('[href], img[src], source[srcset]').forEach((el) => {
    ['href', 'src', 'srcset'].forEach((attr) => {
      if (!el.hasAttribute(attr)) return;
      const value = el.getAttribute(attr);
      const stripped = value.replace(SITE_HOSTS, '');
      let next = stripped !== value ? stripped : null;
      if (attr === 'href') next = localizeHref(value, map, (p) => unmapped.add(p));
      if (next === null) return;
      el.setAttribute(attr, next);
      links += 1;
      if (el.tagName === 'A' && [value, value.replace(SITE_HOSTS, '')].includes(el.textContent.trim())) el.textContent = next;
    });
  });
  return { html: document.querySelector('body').outerHTML, links, unmapped: [...unmapped].sort() };
}
