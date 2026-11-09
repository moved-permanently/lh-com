/* eslint-disable import/no-extraneous-dependencies -- linkedom: dev dependency */
/**
 * Links of a page in the target locale after a rollout or a translation (tools/loc/link-step.mjs;
 * the slug step uses the same fix; tests: test/loc-link-step.test.mjs).
 *
 * - The site's own hosts (the app makes every root-relative link an absolute aem.page link on
 *   translation, dnt/dnt.js resetHrefs 46-52; a merge makes them aem.live, regional-diff.js
 *   normalizeLinks 103-117; authors paste links from the demo host lufthansa.turnsthe.page) become
 *   root-relative.
 * - A link into the source locale (/<from>/<x>) becomes the target locale's page of <x>: the row
 *   of tools/migration-scope/pages.csv that holds /<from>/<x> names it (own German slugs
 *   included). A link without a counterpart in the target locale stays as it is and is listed.
 * - Links to other hosts (www.lufthansa.com, partners) stay as they are.
 * - The global source (/gc, tools/loc/README.md "Global source (/gc)"): a rollout from /gc/<ll>
 *   also turns links into the other /gc locales into the target market's page (/gc/en/<x> in a
 *   /de/de page: /de/en/<x>; none for /at/de: listed), and a primary-language-url of /gc/en/<x>
 *   into /de/en/<x> (what helix-sitemap.yaml pairs by, as the market pages carry it): a rolled-out
 *   page links no /gc page.
 * The pairs a run may use come from the translate.json's languages rows (setup-lib.mjs locSetup).
 */
import { parseHTML } from 'linkedom';

export const SITE_HOSTS = /^https:\/\/(main--lh-com--moved-permanently\.aem\.(page|live)|lufthansa\.turnsthe\.page|lhedge\.bbird\.live)(?=\/|$)/;
/**
 * The global tree's pages.csv column: /gc/<ll> holds the de/<ll> pages (de/en and de/de, own
 * German slugs included; www's /content/lh/gc/<ll>), so its paths are the de_<ll> row's with /gc.
 */
export const GLOBAL = { root: 'gc', market: 'de' };

/**
 * A locale's path of a pages.csv row ('' when the row has none): /<cc>/<ll>/x; /gc/<ll>/x from
 * the de_<ll> cell.
 */
export function localePath(row, loc) {
  const [cc, ll] = loc.split('/');
  const global = cc === GLOBAL.root;
  const column = `${global ? GLOBAL.market : cc}_${ll}`;
  if (!(column in row)) throw new Error(`no pages.csv column for ${loc} (${column})`);
  const v = row[column] || '';
  return global && v ? v.replace(new RegExp(`^/${GLOBAL.market}/${ll}(?=/|$)`), `/${loc}`) : v;
}

const hasColumn = (rows, loc) => {
  try {
    return rows.length > 0 && (localePath(rows[0], loc), true);
  } catch (e) {
    return false;
  }
};

/** {"/<from>/x": "/<to>/y"} for the rows that hold both, the locale roots too. */
function paths(rows, from, to) {
  const out = { [`/${from}`]: `/${to}` };
  rows.forEach((r) => {
    const [a, b] = [localePath(r, from), localePath(r, to)];
    if (a && b) out[a] = b;
  });
  return out;
}

/**
 * The map of a site without a scope table (every site but lh-com, tools/loc/sites.mjs): one slug per page, so the page
 * /<from>/x has the counterpart /<to>/x. {from, to, same: true, hosts, paths: {}}; hosts: the site's own hosts (hostsRegex).
 */
export function sameSlugMap(from, to, { hosts = SITE_HOSTS } = {}) {
  return {
    from, to, same: true, hosts, paths: {}, also: [],
  };
}

/**
 * {from, to, paths: {"/<from>/x": "/<to>/y"}, also: [{from, paths}]} from pages.csv rows.
 * others: the setup's other /gc locales (a rollout from /gc/de: ['gc/en']): their links become
 * the target market's page in that language (no such column, as at/en: every one listed).
 */
export function pairMap(rows, from, to, { others = [] } = {}) {
  if (!hasColumn(rows, from) || !hasColumn(rows, to)) throw new Error(`unknown locale pair ${from} > ${to}`);
  const market = to.split('/')[0];
  const also = from.startsWith(`${GLOBAL.root}/`) && !to.startsWith(`${GLOBAL.root}/`)
    ? others.filter((o) => o !== from && o.startsWith(`${GLOBAL.root}/`)).map((o) => {
      const target = `${market}/${o.split('/')[1]}`;
      return { from: o, paths: hasColumn(rows, target) ? paths(rows, o, target) : {} };
    })
    : [];
  return {
    from, to, paths: paths(rows, from, to), also,
  };
}

/** The href mapped by one {from, paths}: [new href or undefined, unmapped path or undefined]. */
function mapPath(v, {
  from, to, paths: p, same,
}) {
  const re = new RegExp(`^(/${from.replace('/', '\\/')}(?:/[^?#]*)?)([?#].*)?$`);
  const m = v.match(re);
  if (!m) return [undefined, undefined];
  const path = m[1].replace(/\.html$/, '').replace(/\/$/, '') || `/${from}`;
  const target = same ? path.replace(new RegExp(`^/${from}(?=/|$)`), `/${to}`) : p[path];
  return target ? [`${target}${m[2] || ''}`, undefined] : [undefined, path];
}

/**
 * The target locale's href of a link, or null to leave it. report(path) is called for a link into
 * the source locale (or, from /gc, another /gc locale) without a counterpart.
 */
export function localizeHref(href, map, report = () => {}) {
  const raw = String(href || '');
  let v = raw.replace(map.hosts || SITE_HOSTS, '');
  if (v === '') v = '/';
  // the first map whose locale holds the link decides: its page, else the link is listed
  [map, ...(map.also || [])].some((m) => {
    const [next, missing] = mapPath(v, m);
    if (next) v = next;
    if (missing) report(missing);
    return Boolean(next || missing);
  });
  return v === raw ? null : v;
}

/** primary-language-url /gc/en/x of a page rolled out from /gc: the de/en page /de/en/x. */
const primaryFromGlobal = (text) => text.replace(new RegExp(`^/${GLOBAL.root}/(?=[a-z]{2}(/|$))`), `/${GLOBAL.market}/`);

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
      const hosts = map.hosts || SITE_HOSTS;
      const stripped = value.replace(hosts, '');
      let next = stripped !== value ? stripped : null;
      if (attr === 'href') next = localizeHref(value, map, (p) => unmapped.add(p));
      if (next === null) return;
      el.setAttribute(attr, next);
      links += 1;
      if (el.tagName === 'A' && [value, value.replace(hosts, '')].includes(el.textContent.trim())) el.textContent = next;
    });
  });
  if (map.from.startsWith(`${GLOBAL.root}/`) && !map.to.startsWith(`${GLOBAL.root}/`)) {
    document.querySelectorAll('.metadata > div').forEach((row) => {
      const [key, cell] = row.children;
      if (!cell || key.textContent.trim().toLowerCase() !== 'primary-language-url' || cell.children.length) return;
      const text = cell.textContent.trim();
      const next = primaryFromGlobal(text);
      if (next === text) return;
      cell.textContent = next;
      links += 1;
    });
  }
  return { html: document.querySelector('body').outerHTML, links, unmapped: [...unmapped].sort() };
}
