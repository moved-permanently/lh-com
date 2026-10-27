/* eslint-disable no-console, max-len, import/extensions -- dev tooling */
/**
 * A root's copy of another root's document (the ch pilot: /ch/en/nav from /de/en/nav), with the
 * link step's rule (tools/loc/link-lib.mjs localizeDoc): links to the site's own hosts become
 * root-relative, a link into the source root becomes the target root's page of the same page
 * group (www's sitemap dataset, tools/source-export/feeds/sitemaps/groups.json.gz: the pages
 * www lists as each other's alternates), a link without such a page stays as it is and is listed,
 * a www link into the source root (a page that was not migrated) goes to www's target root, links
 * to other hosts stay. The locale's name (the country and language selector label) becomes
 * the target's (scripts/locale-table.js).
 *
 * For a root answered from its language version (scripts/locale-table.js documents "language",
 * --from that version) a link without a page group goes to the root's same path when the version
 * has the document (lh-edge serves it there).
 *
 * Usage: node tools/markets/root-docs.mjs --from de/en --to ch/en --doc nav --doc footer [--dry]
 * Writes content/<to>/<doc>.plain.html; never uploads.
 *
 * --own-root ch/en --page /ch/en/homepage …: the imported documents of a root that is not in the
 * migration scope link into their own root on www (the importer's rule for pages outside the
 * scope); this makes those links root-relative (https://www.lufthansa.com/ch/en/x -> /ch/en/x)
 * where the replica serves the target (a document of the root, or for a root answered from its
 * language version, scripts/locale-table.js documents "language", that version's document) and
 * keeps the others on www, as the four roots link pages that were not migrated. A link whose text
 * is its www URL (the Parent row) gets the path as text.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { localizeDoc } from '../loc/link-lib.mjs';
import { LOCALE_TABLE, LANGUAGE_VERSIONS } from '../../scripts/locale-table.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

let groups;
const loadGroups = () => {
  if (!groups) groups = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, 'tools/source-export/feeds/sitemaps/groups.json.gz'))).toString('utf8')).groups;
  return groups;
};

/**
 * {from, to, paths: {"/<from>/x": "/<to>/y"}}: the pages of both roots in one page group. A group
 * with several URLs of the target root (www's /ch/de/flights and /ch/de/fluege) maps to the one
 * with the same path after the root, else the first.
 */
export function rootMap(from, to, list = loadGroups()) {
  const paths = { [`/${from}`]: `/${to}` };
  list.forEach((g) => {
    const a = g.paths[from];
    const b = [g.paths[to] || []].flat();
    if (!a || !b.length) return;
    [a].flat().forEach((one) => {
      const same = `/${to}${one.slice(from.length + 1)}`;
      paths[one] = b.includes(same) ? same : b[0];
    });
  });
  return { from, to, paths };
}

/** The target root's copy of a .plain.html document: {html, links, unmapped, names}. */
export function rootCopy(html, from, to, map = rootMap(from, to)) {
  // a .plain.html file is the inner content: localizeDoc reads a DA document with its <body>
  const r = localizeDoc(`<body>${html}</body>`, map);
  // www links into the source root (pages that were not migrated) go to www's target root, same
  // path, as lh-edge's market route does (www's market roots have the language version's paths)
  let www = 0;
  let out = r.html.replace(/^<body>|<\/body>$/g, '')
    .replace(new RegExp(`(href=")https://www\\.lufthansa\\.com/${from.replace('/', '\\/')}(?=[/"?#])`, 'g'), (m, a) => {
      www += 1;
      return `${a}https://www.lufthansa.com/${to}`;
    });
  let names = 0;
  const [a, b] = [LOCALE_TABLE[from]?.name, LOCALE_TABLE[to]?.name];
  if (a && b) {
    out = out.split(a).join(b);
    names = html.split(a).length - 1;
  }
  return {
    html: out, links: r.links, unmapped: r.unmapped, names, www,
  };
}

/**
 * A root's links on www made root-relative where the replica serves the target (served(path):
 * the root's own document or its language version's), the others kept on www (a relative one
 * made www's again, as the four roots link pages that were not migrated):
 * {html, links: [paths made relative], kept: [paths on www]}.
 */
export function ownRootLinks(html, rootKey, served = () => true) {
  const links = [];
  const kept = [];
  const prefix = rootKey.replace('/', '\\/');
  const target = (p) => p.replace(/&amp;/g, '&').split(/[?#]/)[0].replace(/\/$/, '');
  const www = new RegExp(`href="https://www\\.lufthansa\\.com(/${prefix}(?=[/"?#])[^"]*)"`, 'g');
  const rel = new RegExp(`href="(/${prefix}(?=[/"?#])[^"]*)"`, 'g');
  let out = html.replace(www, (m, p) => {
    if (!served(target(p))) {
      kept.push(target(p));
      return m;
    }
    links.push(p.replace(/&amp;/g, '&'));
    return `href="${p}"`;
  }).replace(rel, (m, p) => {
    if (served(target(p))) return m;
    kept.push(target(p));
    return `href="https://www.lufthansa.com${p}"`;
  });
  // a link whose text is its own URL (the metadata Parent row, read by the breadcrumb) names the
  // new path, as the link step does
  let texts = 0;
  out = out.replace(/<a href="(\/[^"]+)">https:\/\/www\.lufthansa\.com(\/[^<]+)<\/a>/g, (m, href, text) => {
    if (href !== text) return m;
    texts += 1;
    return `<a href="${href}">${href}</a>`;
  });
  return {
    html: out, links, kept, texts,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (name) => argv[argv.indexOf(`--${name}`) + 1];
  if (argv.includes('--own-root')) {
    const rootKey = opt('own-root');
    const pages = argv.flatMap((a, i) => (a === '--page' ? [argv[i + 1]] : []));
    const exists = (p) => fs.existsSync(path.join(root, 'content', `${p}.plain.html`));
    const row = LOCALE_TABLE[rootKey];
    const version = row && row.documents === 'language' ? LANGUAGE_VERSIONS[row.lang] : null;
    const served = (p) => p === `/${rootKey}` || exists(p) || Boolean(version && exists(`/${version}${p.slice(rootKey.length + 1)}`));
    pages.forEach((page) => {
      const file = path.join(root, 'content', `${page}.plain.html`);
      const r = ownRootLinks(fs.readFileSync(file, 'utf8'), rootKey, served);
      if (!argv.includes('--dry')) fs.writeFileSync(file, r.html);
      const kept = [...new Set(r.kept)].sort();
      console.log(`${page}: ${r.links.length} links into /${rootKey} made relative, ${r.texts} link texts named the path; kept on www (no document): ${kept.length}`);
      kept.forEach((l) => console.log(`  ${l}`));
    });
    process.exit(0);
  }
  const [from, to] = [opt('from'), opt('to')];
  const docs = argv.flatMap((a, i) => (a === '--doc' ? [argv[i + 1]] : []));
  const map = rootMap(from, to);
  // a root answered from this language version (documents "language", lh-edge src/markets.js)
  // serves every page of it: links www has no page group for go to the root's same path
  const row = LOCALE_TABLE[to];
  if (row && row.documents === 'language' && LANGUAGE_VERSIONS[row.lang] === from) {
    const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
    walk(path.join(root, 'content', from)).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
      const p = `/${path.relative(path.join(root, 'content'), f).replace(/\.plain\.html$/, '')}`;
      if (!map.paths[p]) map.paths[p] = `/${to}${p.slice(from.length + 1)}`;
    });
  }
  docs.forEach((doc) => {
    const src = path.join(root, 'content', from, `${doc}.plain.html`);
    const r = rootCopy(fs.readFileSync(src, 'utf8'), from, to, map);
    const dest = path.join(root, 'content', to, `${doc}.plain.html`);
    if (!argv.includes('--dry')) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, r.html);
    }
    console.log(`/${to}/${doc} from /${from}/${doc}: ${r.links} links made /${to}'s, ${r.www} www links moved to www's /${to}, ${r.names} locale names; left as they are (no ${to} page): ${r.unmapped.join(', ') || 'none'}`);
  });
}
