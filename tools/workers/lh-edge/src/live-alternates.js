/* global HTMLRewriter */
/**
 * hreflang alternates on the pages of the live roots with their own documents (the language
 * versions de/en and de/de, the own roots at/de and gb/en; the pass-through answers them), once a
 * go-live wave is live (tools/reports/markets/go-live.md: tools/markets/locale-data.json
 * liveWaves makes market roots `live`): the page's language versions, own roots and the live
 * market roots that have the page, as the market route lists them on a market page
 * (src/markets.js alternates), after the canonical; the page's own hreflang links are replaced.
 * With no live market root (liveWaves []) every answer stays as it is and no index is read.
 */
import {
  alternates, marketModel, LANGUAGE_ONLY, escapeAttr,
} from './markets.js';
import { tables } from './sites.js';

/** The market roots that are live (a wave's rows), in the table's order. */
export function liveMarketRoots(t) {
  return t.marketRoots.filter((k) => t.table[k].status === 'live');
}

/**
 * A page of a live root with its own documents: {root, lang, suffix}, or null (market roots,
 * entry paths, nav, footer, fragments and the other documents the language index leaves out,
 * files with an extension).
 */
export function liveRootPage(pathname, t) {
  const m = String(pathname).match(/^\/([a-z]{2}\/[a-z]{2})(\/[^.]+)$/);
  if (!m) return null;
  const [, root, suffix] = m;
  // a language version still pilot (fr/fr before its wave): none
  const own = (Object.values(t.versions).includes(root) && t.table[root].status === 'live') || t.ownRoots.includes(root);
  if (!own || LANGUAGE_ONLY.test(suffix) || suffix.endsWith('/')) return null;
  return { root, lang: t.table[root].lang, suffix };
}

/**
 * The answer with the alternates of a live root's page (roots: the live market roots; the
 * table's unless given), or the answer itself.
 */
export async function withLiveAlternates(resp, request, env, roots = liveMarketRoots(tables(env))) {
  if (!roots.length || request.method !== 'GET' || resp.status !== 200) return resp;
  if (!/^text\/html/i.test(resp.headers.get('content-type') || '')) return resp;
  const pg = liveRootPage(new URL(request.url).pathname, tables(env));
  if (!pg) return resp;
  let list;
  try {
    list = alternates(await marketModel(request, env, roots), pg.lang, pg.suffix);
  } catch (e) {
    return resp;
  }
  // the page itself and a live market root (a page the index lacks, or that no market root
  // shows: none)
  const self = `/${pg.root}${pg.suffix}`;
  const live = list.some((a) => roots.includes(a.root));
  if (!live || !list.some((a) => a.path === self)) return resp;
  return new HTMLRewriter()
    .on('link[href]', {
      element(e) {
        const rel = (e.getAttribute('rel') || '').toLowerCase();
        if (rel === 'alternate' && e.getAttribute('hreflang')) {
          e.remove();
        } else if (rel === 'canonical') {
          const { origin } = new URL(e.getAttribute('href'), request.url);
          const tag = (a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${escapeAttr(`${origin}${a.path}`)}">`;
          e.after(list.map(tag).join(''), { html: true });
        }
      },
    })
    .transform(resp);
}
