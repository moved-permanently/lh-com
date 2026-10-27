/* eslint-disable no-console, max-len, import/extensions -- dev tooling */
/**
 * A root's copy of another root's document (the ch pilot: /ch/en/nav from /de/en/nav), with the
 * link step's rule (tools/loc/link-lib.mjs localizeDoc): links to the site's own hosts become
 * root-relative, a link into the source root becomes the target root's page of the same page
 * group (www's sitemap dataset, tools/source-export/feeds/sitemaps/groups.json.gz: the pages
 * www lists as each other's alternates), a link without such a page stays as it is and is listed,
 * links to other hosts stay. The locale's name (the country and language selector label) becomes
 * the target's (scripts/locale-table.js).
 *
 * Usage: node tools/markets/root-docs.mjs --from de/en --to ch/en --doc nav --doc footer [--dry]
 * Writes content/<to>/<doc>.plain.html; never uploads.
 *
 * --own-root ch/en --page /ch/en/homepage …: the imported documents of a root that is not in the
 * migration scope link into their own root on www (the importer's rule for pages outside the
 * scope); this makes those links root-relative (https://www.lufthansa.com/ch/en/x -> /ch/en/x)
 * and lists the targets that have no document in content/ (they answer 404 until the root's
 * shared pages exist). A link whose text is its www URL (the Parent row) gets the path as text.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { localizeDoc } from '../loc/link-lib.mjs';
import { LOCALE_TABLE } from '../../scripts/locale-table.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

let groups;
const loadGroups = () => {
  if (!groups) groups = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, 'tools/source-export/feeds/sitemaps/groups.json.gz'))).toString('utf8')).groups;
  return groups;
};

/** {from, to, paths: {"/<from>/x": "/<to>/y"}}: the pages of both roots in one page group. */
export function rootMap(from, to, list = loadGroups()) {
  const first = (p) => (Array.isArray(p) ? p[0] : p);
  const paths = { [`/${from}`]: `/${to}` };
  list.forEach((g) => {
    const a = g.paths[from];
    const b = g.paths[to];
    if (a && b) (Array.isArray(a) ? a : [a]).forEach((one) => { paths[one] = first(b); });
  });
  return { from, to, paths };
}

/** The target root's copy of a .plain.html document: {html, links, unmapped, names}. */
export function rootCopy(html, from, to, map = rootMap(from, to)) {
  // a .plain.html file is the inner content: localizeDoc reads a DA document with its <body>
  const r = localizeDoc(`<body>${html}</body>`, map);
  let out = r.html.replace(/^<body>|<\/body>$/g, '');
  let names = 0;
  const [a, b] = [LOCALE_TABLE[from]?.name, LOCALE_TABLE[to]?.name];
  if (a && b) {
    out = out.split(a).join(b);
    names = html.split(a).length - 1;
  }
  return {
    html: out, links: r.links, unmapped: r.unmapped, names,
  };
}

/** A root's links on www made root-relative: {html, links: [paths]}. */
export function ownRootLinks(html, rootKey) {
  const links = [];
  const re = new RegExp(`href="https://www\\.lufthansa\\.com(/${rootKey.replace('/', '\\/')}(?=[/"?#])[^"]*)"`, 'g');
  let out = html.replace(re, (m, p) => {
    links.push(p.replace(/&amp;/g, '&'));
    return `href="${p}"`;
  });
  // a link whose text is its own URL (the metadata Parent row, read by the breadcrumb) names the
  // new path, as the link step does
  let texts = 0;
  out = out.replace(/<a href="(\/[^"]+)">https:\/\/www\.lufthansa\.com(\/[^<]+)<\/a>/g, (m, href, text) => {
    if (href !== text) return m;
    texts += 1;
    return `<a href="${href}">${href}</a>`;
  });
  return { html: out, links, texts };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (name) => argv[argv.indexOf(`--${name}`) + 1];
  if (argv.includes('--own-root')) {
    const rootKey = opt('own-root');
    const pages = argv.flatMap((a, i) => (a === '--page' ? [argv[i + 1]] : []));
    const exists = (p) => fs.existsSync(path.join(root, 'content', `${p.split(/[?#]/)[0].replace(/\/$/, '')}.plain.html`));
    pages.forEach((page) => {
      const file = path.join(root, 'content', `${page}.plain.html`);
      const r = ownRootLinks(fs.readFileSync(file, 'utf8'), rootKey);
      if (!argv.includes('--dry')) fs.writeFileSync(file, r.html);
      const missing = [...new Set(r.links.filter((l) => !exists(l)))].sort();
      console.log(`${page}: ${r.links.length} links into /${rootKey} made relative, ${r.texts} link texts named the path; without a document (404 on preview): ${missing.length}`);
      missing.forEach((l) => console.log(`  ${l}`));
    });
    process.exit(0);
  }
  const [from, to] = [opt('from'), opt('to')];
  const docs = argv.flatMap((a, i) => (a === '--doc' ? [argv[i + 1]] : []));
  const map = rootMap(from, to);
  docs.forEach((doc) => {
    const src = path.join(root, 'content', from, `${doc}.plain.html`);
    const r = rootCopy(fs.readFileSync(src, 'utf8'), from, to, map);
    const dest = path.join(root, 'content', to, `${doc}.plain.html`);
    if (!argv.includes('--dry')) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, r.html);
    }
    console.log(`/${to}/${doc} from /${from}/${doc}: ${r.links} links made /${to}'s, ${r.names} locale names; left as they are (no ${to} page): ${r.unmapped.join(', ') || 'none'}`);
  });
}
