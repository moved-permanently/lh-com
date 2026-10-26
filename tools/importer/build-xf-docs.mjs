/* eslint-disable no-console */
/**
 * The teaser experience fragments of www's fragment catalogs (AMS rest A3,
 * tools/source-export/feeds/ams-rest/selectors/csi-xf-*.json) as DA documents under /xf/, for the
 * query index `xf` and lh-edge's `<folder>.csi-xf.json` route:
 * - one document per fragment and one per variant (a sibling below the fragment, e.g.
 *   /xf/lh/markets/de/de/contextteaser/cash-miles/master), one per folder without fragments
 *   (www lists empty folders too);
 * - Edge Delivery names (lower case, [a-z0-9-]); the AEM path is kept as metadata `xf-path`
 *   (www's folder names such as `_100_years_of_luftha` are no Edge Delivery names), with
 *   `xf-kind` (fragment, variant or folder) and `xf-tags` ("Title|id" pairs, comma separated).
 * The teasers' own content is not in the catalogs: the documents hold the title only.
 * Usage: node tools/importer/build-xf-docs.mjs  (writes content/xf/**.plain.html and
 *   tools/importer/xf-documents.txt for da-upload.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SEL = path.join(root, 'tools/source-export/feeds/ams-rest/selectors');
const XF = '/content/experience-fragments/';
const CATALOGS = {
  '/content/experience-fragments/lh/markets/de': 'csi-xf-markets-de.json',
  '/content/experience-fragments/lh/gc/en': 'csi-xf-gc-en.json',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const edsName = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
/** /content/experience-fragments/lh/gc/en/_100_years -> /xf/lh/gc/en/100-years */
const docPathOf = (aemPath) => `/xf/${aemPath.slice(XF.length).split('/').map(edsName).join('/')}`;
const tagsText = (tags) => (tags || []).map((t) => `${t.title}|${t.id}`).join(', ');

function doc({
  title, aemPath, kind, tags,
}) {
  const rows = [['Title', title], ['xf-path', aemPath], ['xf-kind', kind], ['xf-tags', tagsText(tags)], ['Robots', 'noindex, nofollow']]
    .filter(([, v]) => v !== '');
  return `<div><h1>${esc(title)}</h1></div>\n<div><div class="metadata">${rows.map(([k, v]) => `<div><div>${esc(k)}</div><div>${esc(v)}</div></div>`).join('')}</div></div>\n`;
}

const docs = new Map();
const add = (aemPath, d) => { docs.set(docPathOf(aemPath), doc({ ...d, aemPath })); };
Object.entries(CATALOGS).forEach(([base, file]) => {
  const walk = (node, folder) => {
    const subs = Object.keys(node).filter((k) => k !== 'experienceFragments');
    const fragments = node.experienceFragments || [];
    if (!subs.length && !fragments.length) add(folder, { title: folder.split('/').pop(), kind: 'folder' });
    fragments.forEach((f) => {
      add(f.path, { title: f.title, kind: 'fragment', tags: f.tags });
      (f.variants || []).forEach((v) => add(v.path, { title: v.title, kind: 'variant', tags: v.tags }));
    });
    subs.forEach((k) => walk(node[k], `${folder}/${k}`));
  };
  walk(JSON.parse(fs.readFileSync(path.join(SEL, file), 'utf8')), base);
});

docs.forEach((html, p) => {
  const file = path.join(root, 'content', `${p}.plain.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
});
fs.writeFileSync(path.join(root, 'tools/importer/xf-documents.txt'), `${[...docs.keys()].sort().join('\n')}\n`);
console.log(`build-xf-docs: ${docs.size} documents under /xf/`);
