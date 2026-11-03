/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies, import/prefer-default-export -- tooling */
/**
 * The nav and footer documents of SWISS's market roots (content-sites/lh-swiss-mk/content/<root>/
 * nav|footer.plain.html), next to swiss-nav.mjs (ema-cashub's: ch/<ll>) and with its builders as
 * they are, from each root's own captured homepage (its menu, quick actions, tools and footer, as
 * www shows them on that root): links to the root's pages on the site relative (its own
 * documents, ch/<ll>'s pages its markets lists: swiss-market-import.mjs servedPaths), the
 * sub-sites' captured pages relative, the rest on www; images from their place in lh-swiss's DA.
 *
 * Usage: node tools/importer/swiss-market-nav.mjs   (every imported root with a homepage snapshot)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { navDocument, footerDocument } from './swiss-nav.mjs';
import { subSiteLinks, capturedPages } from './swiss-sub-import.mjs';
import { withDaImages } from './swiss-sub-dam.mjs';
import { servedPaths, onSite, W } from './swiss-market-import.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** The nav and footer of a market root (key: de/en) from its homepage's document. */
export function marketNavDocuments(document, key, served, subPages) {
  const fix = (doc) => withDaImages(subSiteLinks(doc, { subPages, sitePaths: served, mapHosts: false }));
  return { nav: fix(navDocument(document, key, served)), footer: fix(footerDocument(document, served)) };
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const SNAP = path.join(W, 'snapshots-src/www.swiss.com');
  const allow = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-swiss.json'), 'utf8'));
  const marketsFile = path.join(W, 'runs/markets.json');
  const markets = fs.existsSync(marketsFile) ? JSON.parse(fs.readFileSync(marketsFile, 'utf8')) : {};
  const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
  const own = walk(SNAP).filter((f) => f.endsWith('.html')).map((f) => `/${path.relative(SNAP, f).replace(/\.html$/, '')}`).filter(onSite);
  // the market roots: the imported languages' homepages
  const marketRoots = own.filter((x) => x.endsWith('/homepage')).map((x) => x.split('/').slice(1, 3).join('/'));
  const served = servedPaths({
    own, sitePaths: new Set(allow.paths), markets, roots: marketRoots,
  });
  const subPages = capturedPages(path.join(root, 'content-sites/lh-swiss-sub/snapshots-src/www.swiss.com'));
  const roots = own.filter((p) => p.endsWith('/homepage')).map((p) => p.split('/').slice(1, 3).join('/'));
  roots.forEach((key) => {
    const { document } = parseHTML(fs.readFileSync(path.join(SNAP, key, 'homepage.html'), 'utf8'));
    const { nav, footer } = marketNavDocuments(document, key, served, subPages);
    const dir = path.join(W, 'content', key);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'nav.plain.html'), nav);
    fs.writeFileSync(path.join(dir, 'footer.plain.html'), footer);
  });
  console.log(`swiss-market-nav: ${roots.length} roots`);
}
