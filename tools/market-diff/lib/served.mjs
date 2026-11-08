/* eslint-disable import/extensions, import/no-relative-packages, max-len, no-restricted-syntax, no-continue, no-await-in-loop -- dev tooling: the site's market rules (outside this folder's package), one fragment after the other */
// A market root's page as the root is served (brief 468), for md-replica-check and the runs on our side: the root's own
// document, else the language version's without the sections whose markets leave the root's country out (the site's
// rule, scripts/market-rules.js), with each fragment block's document in the block's place, filtered the same way (the
// site's fragments load in the browser: neither lh-edge's .plain.html nor the version document holds their text).
import { dropMarketSections } from '../../../scripts/market-rules.js';

/** The root's country: TAP's en-ao → ao, lh-com's ch/de → ch. */
export const countryOfRoot = (root, rootStyle) => (rootStyle === 'll-cc' ? root.split('-')[1] : root.split('/')[0]);

// a block's HTML from its opening <div> to its own closing tag
function blockAt(html, at) {
  const re = /<div\b[^>]*>|<\/div>/g;
  re.lastIndex = at;
  let depth = 0;
  let m = re.exec(html);
  while (m) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return html.slice(at, re.lastIndex);
    m = re.exec(html);
  }
  return html.slice(at);
}

const docPathOf = (href) => {
  let p = href;
  try { p = new URL(href, 'https://x.invalid').pathname; } catch (e) { /* as it is */ }
  return p.replace(/\.(plain\.)?html$/, '');
};

/** The document paths the fragment blocks of a document HTML name (each block's first link). */
export function fragmentRefs(html) {
  const out = [];
  const re = /<div class="fragment"[^>]*>/g;
  let m = re.exec(html);
  while (m) {
    const href = blockAt(html, m.index).match(/href="([^"]+)"/);
    if (href) out.push(docPathOf(href[1]));
    m = re.exec(html);
  }
  return out;
}

async function withFragments(html, {
  get, country, depth, seen,
}) {
  if (depth > 3) return html;
  let out = html;
  const re = /<div class="fragment"[^>]*>/g;
  const blocks = [];
  let m = re.exec(html);
  while (m) { blocks.push(blockAt(html, m.index)); m = re.exec(html); }
  for (const block of blocks) {
    const href = block.match(/href="([^"]+)"/);
    if (!href) continue;
    const p = docPathOf(href[1]);
    const r = await get(p);
    if (r.status !== 200) continue;
    seen.push(p);
    const inner = await withFragments(dropMarketSections(r.text, country), {
      get, country, depth: depth + 1, seen,
    });
    out = out.replace(block, inner);
  }
  return out;
}

/**
 * The served view of a root's page.
 * @param {{get: (path: string) => Promise<{status: number, text: string}>, rootPath: string, versionPath: string,
 *   country: string, read?: 'root'|'version'}} o get: a document's .plain.html on the replica by its path;
 *   read 'root' (default): the replica answers the root path itself (lh-edge's market route); 'version': a host
 *   without the route (aem.page): the root's own document, else the version's with the root's sections only
 * @returns {Promise<{status: number, from: string, html: string, fragments: string[]}>}
 */
export async function servedView({
  get, rootPath, versionPath, country, read = 'root',
}) {
  let doc;
  let from;
  if (read === 'version') {
    const own = await get(rootPath);
    if (own.status === 200) { doc = own.text; from = 'own'; } else {
      const v = await get(versionPath);
      if (v.status !== 200) {
        return {
          status: v.status, from: 'none', html: '', fragments: [],
        };
      }
      doc = dropMarketSections(v.text, country);
      from = 'version';
    }
  } else {
    const r = await get(rootPath);
    if (r.status !== 200) {
      return {
        status: r.status, from: 'none', html: '', fragments: [],
      };
    }
    doc = r.text;
    from = 'root';
  }
  const fragments = [];
  const html = await withFragments(doc, {
    get, country, depth: 0, seen: fragments,
  });
  return {
    status: 200, from, html, fragments,
  };
}
