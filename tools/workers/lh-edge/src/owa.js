/* eslint-disable max-len */
/**
 * www's header, footer and portal configuration JSON for other Lufthansa Group sites and apps
 * (README "Header and footer JSON"):
 *   /content/lh/markets/<cc>/<ll>/<page>.csi-owa-header.json         from /<cc>/<ll>/nav
 *   /content/lh/markets/<cc>/<ll>/<page>.csi-owa-footer.json         from /<cc>/<ll>/footer
 *   /content/lh/markets/<cc>/<ll>/<page>.csi-owa-portal-config.json  {"appShellJs":"","remoteEntries":[]}
 * with www's field names, content-type application/json;charset=utf-8 and cache-control
 * max-age=300, public. The vanity form (/de/en/homepage.csi-owa-header.json) is not answered
 * here (www: 404). Tracking ids and the values the documents don't hold (www's DAM paths of the
 * logos and the flyout image, alt texts) come from the sheet /app/config/owa-tracking (locale,
 * part, key, track, url, text; seeded from www's answers by tools/importer/build-owa-sheet.mjs);
 * url and text there override the document where www's answer differs from it.
 */
import { readOrigin, readSheet } from './sheet.js';
import { siteFetch, servedLocale } from './markets.js';

export const OWA = /^\/content\/lh\/markets\/([a-z]{2})\/([a-z]{2})\/[^/]+(?:\/[^/]+)*\.csi-owa-(header|footer|portal-config)\.json$/;
const SHEET = '/app/config/owa-tracking.json?limit=10000';
const LIVE = 'https://www.lufthansa.com';
const HEADERS = { 'content-type': 'application/json;charset=utf-8', 'cache-control': 'max-age=300, public' };

/* ------------------------------------------------------------- a small HTML reader --------- */

const VOID = new Set(['img', 'br', 'source', 'input', 'meta', 'link', 'hr', 'wbr']);
const decode = (s) => String(s).replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (m, x) => String.fromCodePoint(parseInt(x, 16)))
  .replace(/&#(\d+);/g, (m, x) => String.fromCodePoint(Number(x)))
  .replace(/&amp;/g, '&');

/** The element tree of a document fragment: { tag, attrs, children } and text nodes { text }. */
export function parseHtml(html) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)/g;
  let m = re.exec(html);
  while (m) {
    const top = stack[stack.length - 1];
    if (m[1]) {
      const tag = m[1].toLowerCase();
      const at = stack.map((n) => n.tag).lastIndexOf(tag);
      if (at > 0) stack.length = at;
    } else if (m[2]) {
      const attrs = {};
      [...m[3].matchAll(/([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].forEach(([, k, a, b, c]) => {
        attrs[k.toLowerCase()] = decode(a ?? b ?? c ?? '');
      });
      const node = { tag: m[2].toLowerCase(), attrs, children: [] };
      top.children.push(node);
      if (!VOID.has(node.tag) && !m[4]) stack.push(node);
    } else if (m[5]) {
      top.children.push({ text: decode(m[5]) });
    }
    m = re.exec(html);
  }
  return root;
}

const elements = (node, tag) => (node && node.children ? node.children.filter((c) => c.tag && (!tag || c.tag === tag)) : []);
const first = (node, tag) => elements(node, tag)[0];
const textOf = (node) => (node.text !== undefined ? node.text : (node.children || []).map(textOf).join(''));
const clean = (s) => String(s).replace(/\s+/g, ' ').trim();
/** The text of a node without the icon marker of the documents (":wheelchair: ..."). */
const label = (node) => clean(textOf(node).replace(/^\s*:[a-z0-9-]+:\s*/, ''));

/** Descendants of a tag, in document order. */
function all(node, tag, out = []) {
  elements(node).forEach((c) => {
    if (c.tag === tag) out.push(c);
    all(c, tag, out);
  });
  return out;
}

/* ------------------------------------------------------------------ the sheet ---------------- */

/** The sheet rows of a locale and part as key -> { track, url, text }. */
export function sheetMap(rows, locale, part) {
  const map = new Map();
  rows.filter((r) => String(r.locale || '').trim() === locale && String(r.part || '').trim() === part)
    .forEach((r) => map.set(String(r.key || '').trim(), { track: String(r.track ?? ''), url: String(r.url ?? ''), text: String(r.text ?? '') }));
  return map;
}

const field = (map, name) => (map.get(`field:${name}`) || { text: '' }).text;

/* ---------------------------------------------------------------------- header --------------- */

/** www's form of a document link in the header: root-relative for www's own pages. */
const headerUrl = (href) => String(href || '').replace(/^https?:\/\/www\.lufthansa\.com(?=\/)/, '');
/** In the footer www keeps absolute URLs except for the market's pages. */
const footerUrl = (href, locale) => {
  const h = String(href || '');
  return h.startsWith(`${LIVE}/${locale}/`) ? h.slice(LIVE.length) : h;
};

/** The header JSON of a locale from its nav document and the sheet rows. */
export function buildHeader(navHtml, locale, rows) {
  const map = sheetMap(rows, locale, 'header');
  const pick = (key, values) => {
    const row = map.get(key) || {};
    return {
      track: row.track || '',
      url: row.url || values.url,
      text: row.text || values.text,
    };
  };
  const sections = elements(parseHtml(navHtml), 'div');
  const homeLink = all(sections[0], 'a')[0];
  const quick = elements(first(sections[1], 'ul'), 'li').map((li) => {
    const a = all(li, 'a')[0];
    const v = pick(`quick/${label(li)}`, { url: headerUrl(a && a.attrs.href), text: label(li) });
    return { dataIdentifierTrack: v.track, label: v.text, url: v.url };
  });
  const menuItems = elements(first(sections[2], 'ul'), 'li').map((top) => {
    const topLabel = label(first(top, 'p') || top);
    const groups = elements(first(top, 'ul'), 'li').map((group) => {
      const head = first(group, 'p');
      const headLink = head && all(head, 'a')[0];
      const groupLabel = label(head || group);
      const g = pick(`menu/${topLabel}/${groupLabel}`, { url: headerUrl(headLink && headLink.attrs.href), text: groupLabel });
      const links = elements(first(group, 'ul'), 'li').map((li) => {
        const a = all(li, 'a')[0];
        const l = pick(`menu/${topLabel}/${groupLabel}/${label(li)}`, { url: headerUrl(a && a.attrs.href), text: label(li) });
        return {
          label: l.text, href: l.url, external: false, dataIdentifierTrack: l.track,
        };
      });
      return {
        label: g.text, href: g.url, dataIdentifierTrack: g.track, menuItems: links,
      };
    });
    const t = pick(`menu/${topLabel}`, { text: topLabel });
    return { label: t.text, dataIdentifierTrack: t.track, menuItems: groups };
  });
  const tools = elements(first(sections[3], 'ul'), 'li');
  // the icon as the document has it (":wheelchair:") or as Edge Delivery renders it
  // (<span class="icon icon-wheelchair">)
  const hasIcon = (node, icon) => new RegExp(`^\\s*:${icon}:`).test(textOf(node))
    || all(node, 'span').some((sp) => String(sp.attrs.class || '').split(/\s+/).includes(`icon-${icon}`));
  const tool = (icon) => {
    const li = tools.find((x) => hasIcon(x, icon));
    const a = li && all(li, 'a')[0];
    return { url: headerUrl(a && a.attrs.href), text: li ? label(li) : '' };
  };
  const access = pick('tool/accessibility', tool('wheelchair'));
  const support = pick('tool/support', tool('help'));
  return {
    'dcep-header-quick-action-links': { id: 'dcep-header-quick-action-links', links: quick },
    'dcep-header-flyout': {
      id: 'common-header-nav-horizontal',
      burgerMenu: false,
      menuItems,
      flyoutImage: field(map, 'flyoutImage'),
      accessibilityUrl: access.url,
      accessibilityTextLabel: access.text,
      accessibilityDataTrackingId: access.track,
      supportUrl: support.url,
      supportTextLabel: support.text,
      supportDataTrackingId: support.track,
    },
    'dcep-header': {
      logoUrl: field(map, 'logoUrl'),
      logoAlt: field(map, 'logoAlt'),
      homeUrl: (map.get('field:homeUrl') || {}).text || headerUrl(homeLink && homeLink.attrs.href),
      homepageHeadline: field(map, 'homepageHeadline'),
    },
  };
}

/* ---------------------------------------------------------------------- footer --------------- */

const FOOTER_FIELDS = ['logoIcon', 'logoAltText', 'secondaryLogoIcon', 'secondaryLogoAltText', 'quoteText',
  'copyrightText', 'linkedInIcon', 'linkedInAltText', 'linkedInLink', 'linkTarget'];

/** The footer JSON of a locale from its footer document and the sheet rows. */
export function buildFooter(footerHtml, locale, rows) {
  const map = sheetMap(rows, locale, 'footer');
  const sections = elements(parseHtml(footerHtml), 'div');
  const list = (ul, n) => elements(ul, 'li').map((li) => {
    const a = all(li, 'a')[0];
    return { a, text: label(li) };
  }).filter(({ a }) => a && !String(a.attrs.href || '').startsWith('#'))
    .map(({ a, text }) => {
      const row = map.get(`list${n}/${text}`) || {};
      return { text: row.text || text, url: row.url || footerUrl(a.attrs.href, locale), eventId: row.track || '' };
    });
  const lists = [...all(sections[1], 'ul'), ...all(sections[2], 'ul')].slice(0, 7);
  const out = {};
  FOOTER_FIELDS.forEach((f) => { out[f] = field(map, f); });
  for (let n = 1; n <= 7; n += 1) out[`linkList${n}`] = lists[n - 1] ? list(lists[n - 1], n) : [];
  return out;
}

/* ----------------------------------------------------------------------- route --------------- */

export const PORTAL_CONFIG = { appShellJs: '', remoteEntries: [] };

/**
 * The sheet rows of a market root (src/markets.js) without rows of its own: its language
 * version's, their URLs moved to the market root (as the market route moves links).
 */
export function marketRows(rows, locale, version) {
  if (version === locale || rows.some((r) => String(r.locale || '').trim() === locale)) return rows;
  const from = new RegExp(`^((?:https://www\\.lufthansa\\.com)?)/${version.replace('/', '\\/')}(?=/|$)`);
  return [...rows, ...rows.filter((r) => String(r.locale || '').trim() === version)
    .map((r) => ({ ...r, locale, url: String(r.url ?? '').replace(from, `$1/${locale}`) }))];
}

/** The route. */
export async function owa(request, env) {
  const m = new URL(request.url).pathname.match(OWA);
  const locale = `${m[1]}/${m[2]}`;
  const kind = m[3];
  if (kind === 'portal-config') return new Response(JSON.stringify(PORTAL_CONFIG), { headers: { ...HEADERS, 'x-lh-edge-route': 'owa' } });
  const docPath = `/${locale}/${kind === 'header' ? 'nav' : 'footer'}.plain.html`;
  // a market root this host serves: its nav and footer as the market route answers them (its
  // own documents, else the language version's); every other locale as before
  const market = servedLocale(request, env, locale);
  let doc;
  if (market && market.version !== locale) {
    const resp = await siteFetch(new Request(request.url, { method: 'GET' }), env, new URL(docPath, `https://${env.ORIGIN}`));
    doc = resp.ok ? await resp.text() : null;
  } else {
    doc = await readOrigin(request, env, docPath);
  }
  if (!doc) return new Response('Not Found', { status: 404, headers: { 'cache-control': 'max-age=60', 'x-lh-edge-route': 'owa' } });
  const rows = marketRows(await readSheet(request, env, SHEET), locale, market ? market.version : locale);
  const body = kind === 'header' ? buildHeader(doc, locale, rows) : buildFooter(doc, locale, rows);
  return new Response(JSON.stringify(body), { headers: { ...HEADERS, 'x-lh-edge-route': 'owa' } });
}
