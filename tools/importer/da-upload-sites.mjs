/* eslint-disable max-len -- path lists */
/**
 * The sites tools/importer/da-upload.mjs uploads to (one DA site each, org moved-permanently),
 * and which of their documents may be sent. Tests: test/da-upload-sites.test.mjs.
 *
 * - lh-com (the default): documents from content/, state tools/importer/da-upload-state.json, the
 *   migration scope (transformers/scope-paths.js) plus its document families (nav, footer,
 *   fragments, app screens, feeds, xf, the Page check test page), author-edits.json applied.
 * - any other site: documents from content-sites/<site>/content/ (or --content-dir), state
 *   tools/importer/da-upload-state-<site>.json, only the paths of its allowlist
 *   tools/importer/sites/<site>.json ({"paths": [...], "patterns": ["^/regex$"]}); no lh-com
 *   scope, no author edits.
 * For every site: nothing under /lhg/, never the login and profile app shells.
 */
import fs from 'node:fs';
import path from 'node:path';
import { LOCALE_TABLE } from '../../scripts/locale.js';

export const ORG = 'moved-permanently';
export const DEFAULT_SITE = 'lh-com';

// the AirCore pages (/lhg/) left the replica on 2026-10-25; their DA documents are taken off
// preview and live by hand: never upload, preview or delete anything there
export const NEVER = /^\/lhg(?:\/|$)/;
// app shells (login, profile) are built elsewhere: never uploaded, even if listed
export const APP_SHELL = /^\/[a-z]{2}\/[a-z]{2}\/(?:login|profile)(?:\/|$)/;

// the nav, footer and fragments of every root of the locale table (live and pilot, e.g. /ch/en/nav)
const TABLE_ROOT = new RegExp(`^/(${Object.keys(LOCALE_TABLE).map((k) => k.replace('/', '\\/')).join('|')})/`);
const LOCALE_DOC = { test: (p) => TABLE_ROOT.test(p) && /^\/[a-z]{2}\/[a-z]{2}\/(nav|footer|fragments\/[a-z0-9-]+)$/.test(p) };
// the Lufthansa app's screen documents (tools/importer/sdui-import.mjs; lh-edge renders them)
const APP_SCREEN = /^\/content\/mobile\/lh\/[a-z]{2}\//;
// the GraphQL feed documents (structured content, companion documents) and their DA schemas
// (tools/importer/graphql-import.mjs; lh-edge answers the persisted queries from them)
const FEED_DOC = /^\/data\/[a-z0-9-]+(?:\/[a-z0-9-]+)+$|^\/\.da\/forms\/schemas\/lh-[a-z0-9-]+$/;
// the experience fragment documents of www's fragment catalogs (tools/importer/build-xf-docs.mjs;
// lh-edge answers <folder>.csi-xf.json from their index)
const XF_DOC = /^\/xf\/lh\/[a-z0-9-]+(?:\/[a-z0-9-]+)+$/;
// the Page check plugin's test page (AMS rest A11): one issue of each kind, under /drafts/
const TEST_DOC = /^\/drafts\/page-check\/[a-z0-9-]+$/;

/** Is the path allowed for lh-com (its scope and document families)? */
export const lhComAllowed = (scope) => (p) => !NEVER.test(p)
  && (scope.has(p) || LOCALE_DOC.test(p) || APP_SCREEN.test(p) || FEED_DOC.test(p) || XF_DOC.test(p) || TEST_DOC.test(p));

/** Is the path allowed by another site's allowlist? */
export const allowlistAllowed = (list) => {
  const paths = new Set(list.paths || []);
  const patterns = (list.patterns || []).map((r) => new RegExp(r));
  return (p) => !NEVER.test(p) && (paths.has(p) || patterns.some((r) => r.test(p)));
};

/**
 * The run's site settings from the options.
 * @param {string} root the repository
 * @param {() => Promise<Set<string>>} loadScope lh-com's scope (only loaded for lh-com)
 * @param {{site?: string, contentDir?: string, stateEnv?: string}} opts
 */
export async function siteSettings(root, loadScope, { site = DEFAULT_SITE, contentDir, stateEnv } = {}) {
  if (!/^[a-z0-9-]+$/.test(site)) throw new Error(`--site ${site}: not a site name`);
  const lhCom = site === DEFAULT_SITE;
  const dir = path.resolve(root, contentDir || (lhCom ? 'content' : `content-sites/${site}/content`));
  let stateFile = path.join(root, lhCom ? 'tools/importer/da-upload-state.json' : `tools/importer/da-upload-state-${site}.json`);
  // $DA_UPLOAD_STATE keeps working for lh-com runs (other sites always have their own file)
  if (lhCom && stateEnv) stateFile = path.resolve(stateEnv);
  let allowed;
  let authorEdits = {};
  if (lhCom) {
    allowed = lhComAllowed(await loadScope());
    const editsFile = path.join(root, 'tools/importer/author-edits.json');
    authorEdits = fs.existsSync(editsFile) ? JSON.parse(fs.readFileSync(editsFile, 'utf8')) : {};
  } else {
    const listFile = path.join(root, `tools/importer/sites/${site}.json`);
    if (!fs.existsSync(listFile)) throw new Error(`--site ${site}: no allowlist ${path.relative(root, listFile)}`);
    allowed = allowlistAllowed(JSON.parse(fs.readFileSync(listFile, 'utf8')));
  }
  return {
    org: ORG, site, contentDir: dir, stateFile, allowed, authorEdits, lhCom,
  };
}
