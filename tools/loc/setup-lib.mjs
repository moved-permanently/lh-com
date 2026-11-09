/* eslint-disable no-console, import/prefer-default-export -- dev tooling */
/**
 * The translation setup of a translate.json (tools/loc/README.md "Global source (/gc)"): the
 * localisation app's languages rows decide where a project's source is, where a translation is
 * saved and which locales a rollout writes, so the loc tools read them from the translate.json
 * they are given instead of a locale list of their own (tests: test/loc-gc-setup.test.mjs):
 * - today's rows (tools/loc/translate.json): English /de/en -> /gb/en; German /de/en -> /de/de,
 *   rolled out to /at/de;
 * - the global source (test/fixtures/loc/translate-gc.json): English /gc/en -> /de/en, /gb/en;
 *   German /gc/en -> /gc/de, rolled out to /de/de and /at/de.
 * A switch (and a switch back) is a translate.json change only.
 * Other sites (`--site <site>`, tools/loc/sites.mjs): their own file tools/loc/sites/<site>/translate.json and DA document.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { daConfigUrl, configFile, siteFromArgv } from './sites.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const REPO_CONFIG = path.join(root, 'tools/loc/translate.json');
export const DA_CONFIG = 'https://admin.da.live/source/moved-permanently/lh-com/.da/translate.json';

/** '/gc/en/' -> 'gc/en' (the app's locations and locales are full path prefixes). */
const locale = (p) => String(p || '').trim().replace(/^\/+|\/+$/g, '');

/**
 * The setup of a translate.json: {rows, pairs: {'from>to': 'rollout'|'translation'}, source,
 * translation: {from, to, locales} (the German row: where its Translate reads and writes, the
 * locales its Rollout writes), global (a source under /gc)}.
 * Pairs as the app runs them: a row's Rollout writes each of its locales from its location
 * (views/rollout/index.js formatLangUrls/formatRolloutUrls 112-147), its Translate writes its
 * location from its source (the default source without one; translate/index.js
 * getSaveDestPath 107-117).
 * @param {Object} config translate.json (the sheet: config, languages)
 */
export function locSetup(config) {
  const sourceName = (config.config?.data || []).find((r) => r.key === 'source.language')?.value;
  const rows = (config.languages?.data || []).map((r) => ({
    name: r.name,
    code: r.code,
    source: locale(r.source),
    location: locale(r.location),
    locales: String(r.locales || '').split(',').map(locale).filter(Boolean),
    actions: String(r.actions || '').split(',').map((a) => a.trim().toLowerCase()).filter(Boolean),
  }));
  const source = rows.find((r) => r.name === sourceName)?.location || '';
  const pairs = {};
  rows.forEach((r) => {
    if (r.actions.includes('rollout')) r.locales.forEach((l) => { pairs[`${r.location}>${l}`] = 'rollout'; });
  });
  let translation = null;
  const translations = [];
  rows.forEach((r) => {
    if (!r.actions.includes('translate')) return;
    const from = r.source || source;
    pairs[`${from}>${r.location}`] = 'translation';
    translations.push({
      code: r.code, from, to: r.location, locales: r.locales,
    });
    if (r.code === 'de') translation = { from, to: r.location, locales: r.locales };
  });
  // a setup without a German row (the languages of a site with another first translation): its first translation
  if (!translation && translations.length) translation = { from: translations[0].from, to: translations[0].to, locales: translations[0].locales };
  return {
    rows, pairs, source, translation, translations, global: /^gc\//.test(source),
  };
}

/**
 * The translate.json to read: 'repo' (default, tools/loc/translate.json), a file path, or 'da'
 * (DA's /.da/translate.json, the one the app uses: a GET with the login, never a write).
 * @param {string} [which]
 * @param {{fetchImpl?: Function, token?: string}} [opts]
 */
export async function readConfig(which = 'repo', { fetchImpl = fetch, token = process.env.DA_TOKEN, site = 'lh-com' } = {}) {
  if (which === 'da') {
    const url = daConfigUrl(site);
    const headers = token ? { authorization: `Bearer ${token}` } : {};
    const r = await fetchImpl(url, { headers: { 'cache-control': 'no-cache', ...headers } });
    if (!r.ok) throw new Error(`DA ${r.status}: ${url}${r.status === 401 || r.status === 403 ? ` (${token ? 'DA_TOKEN was refused' : 'no login: set DA_TOKEN'})` : ''}`);
    return r.json();
  }
  return JSON.parse(fs.readFileSync(which === 'repo' ? configFile(site) : which, 'utf8'));
}

/** The CLI's setup: --config <file>|da|repo (default repo) and --site <site> (default lh-com); prints which rows it took. */
export async function setupFromArgs(argv, log = console.error) {
  const i = argv.indexOf('--config');
  const which = i >= 0 ? argv[i + 1] : 'repo';
  const site = siteFromArgv(argv);
  const setup = locSetup(await readConfig(which, { site }));
  log(`translate.json (${site === 'lh-com' ? '' : `${site}: `}${which}): source /${setup.source}; ${Object.entries(setup.pairs).map(([p, k]) => `${p.replace('>', ' -> ')} (${k})`).join(', ')}`);
  return setup;
}
