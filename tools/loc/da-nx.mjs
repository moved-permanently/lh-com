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

/** The page's DA metadata block (project/index.js 16, `body > .da-metadata`). */
export const DA_METADATA_SELECTOR = 'body > .da-metadata';

/**
 * nx2/utils/getElementMetadata.js (not in the downloaded loc folder): the rows of a block as
 * {key: {content, text}}; keys and texts trimmed and lower-cased, as the app reads them.
 */
export function getElementMetadata(el) {
  if (!el) return {};
  return [...el.childNodes].reduce((rdx, row) => {
    if (row.children) {
      const key = row.children[0].textContent.trim().toLowerCase();
      const content = row.children[1];
      const text = content.textContent.trim().toLowerCase();
      if (key && content) rdx[key] = { content, text };
    }
    return rdx;
  }, {});
}

/** project/index.js getPreviousHashes (237-241): the differences the author already decided. */
export function previousHashes(metadata) {
  return {
    acceptedHashes: metadata.acceptedhashes?.text?.split(',') || [],
    rejectedHashes: metadata.rejectedhashes?.text?.split(',') || [],
  };
}

/** project/index.js replaceHtml (166-195) as saveHtml calls it (no link rewrite): the saved body. */
export function saveBody(inner, daMetadata = {}) {
  const rows = Object.entries(daMetadata)
    .map(([key, value]) => `<div><div>${key}</div><div>${value?.text ?? value ?? ''}</div></div>`).join('');
  const metadataHtml = rows ? `<div class="da-metadata">${rows}</div>` : '';
  return `<body><header></header><main>${inner}</main>${metadataHtml}<footer></footer></body>`;
}

/**
 * The app's merge (project/index.js mergeCopy, lines 306-357) without its DA calls: the
 * translated document (langstore) against the existing page (regional). The existing page's DA
 * metadata (the accepted and rejected differences, labels) goes into the diff and is saved
 * again, as the app does (332-348). Returns the HTML to save, or null when they are the same
 * (the app saves nothing then). `app`: the app's modules (loadApp; a stand-in in tests).
 */
export async function mergeLikeTheApp(translatedHtml, existingHtml, app) {
  const { diff } = app || await loadApp();
  const regional = parseDoc(existingHtml);
  const langstore = parseDoc(translatedHtml);
  diff.removeLocTags(regional);
  diff.removeLocTags(langstore);
  if (langstore.querySelector('body').outerHTML === regional.querySelector('body').outerHTML) return null;
  const daMetadata = getElementMetadata(regional.querySelector(DA_METADATA_SELECTOR));
  const { acceptedHashes, rejectedHashes } = previousHashes(daMetadata);
  const main = await diff.regionalDiff(langstore, regional, acceptedHashes, rejectedHashes);
  return saveBody(main.innerHTML, daMetadata);
}
