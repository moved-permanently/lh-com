/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling; linkedom is a dev dependency */
/**
 * lh-discover's footer documents of its own roots (de/en, de/de, xx/fr; the market roots answer
 * with their language version's, lh-edge's market route) from www's homepage snapshots
 * (tools/importer/bd-snapshots/www.discover-airlines.com/<root>/homepage.html), offline: the nav
 * importer's footer (tools/importer/import-nav.js: search and country label, link columns, the
 * "Follow us" row as a badges section, the legal row, the logos) as a .plain.html document,
 * then site-postprocess.mjs (www.lufthansa.com URLs to Discover's host, links to the site's pages
 * relative, links to pages it lacks absolute on www). Writes
 * content-sites/lh-discover/content/<root>/footer.plain.html (--dry-run: prints the sections).
 *
 * Usage: node tools/importer/discover-footer.mjs [--root de/en ...] [--dry-run]
 */
/* global globalThis */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { postprocess } from './site-postprocess.mjs';
import { withPlaceholder, PLACEHOLDER } from './discover-import.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HOST = 'www.discover-airlines.com';
export const OWN_ROOTS = ['de/en', 'de/de', 'xx/fr'];

const blockDiv = (table) => {
  const rows = [...table.querySelectorAll('tr')];
  const name = rows[0].textContent.trim().toLowerCase().replace(/\s+/g, '-');
  const cells = rows.slice(1).map((tr) => `<div>${[...tr.children].map((td) => `<div>${td.innerHTML}</div>`).join('')}</div>`);
  return `<div class="${name}">${cells.join('')}</div>`;
};

/** The importer's footer element as a document: one <div> per section (its <hr>), blocks as divs. */
export function footerPlain(element) {
  const sections = element.innerHTML.split('<hr>');
  return `${sections.map((s) => {
    const { document } = parseHTML(`<div id="s">${s}</div>`);
    const div = document.getElementById('s');
    div.querySelectorAll('table').forEach((t) => t.replaceWith(parseHTML(blockDiv(t)).document.firstElementChild));
    return `<div>${div.innerHTML.replace(/<(ul|\/li)>/g, '<$1>\n').replace(/<\/ul>/g, '\n</ul>').replace(/\n\n/g, '\n')}</div>`;
  }).join('\n')}\n`;
}

/** The footer document of a root from its homepage snapshot. */
export async function footerDocument(key, list) {
  globalThis.WebImporter ||= { DOMUtils: { remove: () => {} }, Blocks: {} };
  const { default: nav } = await import('./import-nav.js');
  const snap = path.join(root, 'tools/importer/bd-snapshots', HOST, key, 'homepage.html');
  const { document } = parseHTML(withPlaceholder(fs.readFileSync(snap, 'utf8')));
  const url = `https://${HOST}/${key}/homepage#footer`;
  const [out] = nav.transform({ document, url, params: { originalURL: url } });
  const r = postprocess(footerPlain(out.element), {
    sourceHost: HOST, sitePaths: new Set(list.paths), marketRoots: list.marketRoots,
  });
  return r.html.split(`https://${PLACEHOLDER}`).join('https://www.lufthansa.com');
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const roots = argv.flatMap((a, i) => (a === '--root' ? [argv[i + 1]] : []));
  const list = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-discover.json'), 'utf8'));
  for (const key of roots.length ? roots : OWN_ROOTS) { // eslint-disable-line no-restricted-syntax
    const html = await footerDocument(key, list); // eslint-disable-line no-await-in-loop
    const file = path.join(root, 'content-sites/lh-discover/content', key, 'footer.plain.html');
    if (argv.includes('--dry-run')) console.log(`== ${key}\n${html}`);
    else fs.writeFileSync(file, html);
    console.log(`${key}: footer ${html.split('\n<div>').length} sections${argv.includes('--dry-run') ? ' (dry run)' : ` -> ${path.relative(root, file)}`}`);
  }
}
