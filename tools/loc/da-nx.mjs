/* eslint-disable no-restricted-syntax, no-undef, max-len, import/no-extraneous-dependencies -- dev tooling, browser globals */
/**
 * The localisation app's own code (adobe/da-nx nx/blocks/loc at DA_NX_COMMIT), downloaded into a
 * temp folder (never into the repository) so lh-com's tools run exactly what the app runs:
 * the options, path and DNT functions (check-config.mjs) and the merge (regionalDiff,
 * removeLocTags; slug-step.mjs). The nx2 imports of utils/utils.js are stubbed (no DA calls).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { parseHTML, DOMParser } from 'linkedom';

export const DA_NX_COMMIT = 'f0c63255bc8ce34f79d6908d98351bb3d426e927';
const FILES = ['views/options/utils/utils.js', 'utils/utils.js', 'dnt/dnt.js', 'dnt/decorateTable.js', 'dnt/parseQuery.js',
  'dnt/processAltText.js', 'dnt/json2html.js', 'regional-diff/regional-diff.js', 'regional-diff/object_hash.js'];
export const CACHE = path.join(os.tmpdir(), `da-nx-${DA_NX_COMMIT.slice(0, 8)}`, 'loc');

let loaded;

/** Sets the browser globals the app's modules use (DOMParser, document, Node, window). */
function setGlobals() {
  const { window, document, Node } = parseHTML('<html><body></body></html>');
  globalThis.DOMParser = DOMParser;
  globalThis.document = document;
  globalThis.Node = Node;
  // object_hash.js attaches itself to window; regional-diff.js calls the global objectHash
  globalThis.window = globalThis;
  globalThis.location = { hash: '#/translate/moved-permanently/lh-com', href: 'https://da.live/apps/loc#/translate/moved-permanently/lh-com' };
  return window;
}

export async function loadApp() {
  if (loaded) return loaded;
  for (const f of FILES) {
    const file = path.join(CACHE, f);
    if (!fs.existsSync(file)) {
      // eslint-disable-next-line no-await-in-loop
      const resp = await fetch(`https://raw.githubusercontent.com/adobe/da-nx/${DA_NX_COMMIT}/nx/blocks/loc/${f}`);
      if (!resp.ok) throw new Error(`da-nx ${f}: ${resp.status}`);
      // eslint-disable-next-line no-await-in-loop
      let src = await resp.text();
      if (f === 'utils/utils.js') {
        src = src.replace(/^import .*nx2\/utils\/.*$/gm, '')
          .replace(/^/, "const DA_ADMIN = 'https://admin.da.live'; const daFetch = async () => ({ ok: false }); const loadIms = async () => ({});\n");
      }
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, src);
    }
  }
  setGlobals();
  // Node loads object_hash.js (no import or export) as CommonJS: it exports itself instead of
  // setting the global the browser gets
  globalThis.objectHash = createRequire(import.meta.url)(path.join(CACHE, 'regional-diff/object_hash.js'));
  const imp = (f) => import(pathToFileURL(path.join(CACHE, f)).href);
  loaded = {
    options: await imp('views/options/utils/utils.js'),
    utils: await imp('utils/utils.js'),
    dnt: await imp('dnt/dnt.js'),
    diff: await imp('regional-diff/regional-diff.js'),
  };
  return loaded;
}

/** A DA document as the app reads it (project/index.js getHtml: a parsed document). */
// linkedom keeps a bare <body> as the root; a browser wraps it in <html> (as DA's documents need)
export const parseDoc = (html) => new DOMParser().parseFromString(/^\s*<html/i.test(html) ? html : `<html><head></head>${html}</html>`, 'text/html');

/**
 * The app's merge (project/index.js mergeCopy, lines 306-357) without its DA calls: the
 * translated document (langstore) against the existing page (regional). Returns the HTML to
 * save, or null when they are the same (the app saves nothing then).
 */
export async function mergeLikeTheApp(translatedHtml, existingHtml) {
  const { diff } = await loadApp();
  const regional = parseDoc(existingHtml);
  const langstore = parseDoc(translatedHtml);
  diff.removeLocTags(regional);
  diff.removeLocTags(langstore);
  if (langstore.querySelector('body').outerHTML === regional.querySelector('body').outerHTML) return null;
  const main = await diff.regionalDiff(langstore, regional, [], []);
  return `<body><header></header><main>${main.innerHTML}</main><footer></footer></body>`;
}
