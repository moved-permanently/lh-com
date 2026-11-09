/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/extensions -- dev tooling */
/**
 * RETIRED (one slug per page, slug order of 2026-11-08): the pages move to the English slug and the German slug redirects to it
 * (tools/slugs/lh-com.json). Kept until the Lufthansa German round is done, then in git history only.
 *
 * Slug step, after a translation project into /de/de (tools/loc/README.md): the app writes the
 * German translation of /de/en/<path> to /de/de/<path>; for the 72 pages with their own German
 * slug (tools/loc/slug-map.json, from tools/migration-scope/pages.csv) this step
 * 1. reads the translation at /de/de/<english slug>,
 * 2. turns its links into German ones (the app's absolute aem.page/aem.live links into root-relative
 *    ones; /de/en/<x> into /de/de/<german slug of x>), Parent included,
 * 3. sets primary-language-url to the English page (what helix-sitemap.yaml pairs by),
 * 4. moves it to /de/de/<german slug>, or merges it onto the German page there with the app's own
 *    merge (regionalDiff, as translate.conflict.behavior merge does, keeping the German page's DA
 *    metadata: the differences already accepted or rejected; --behavior overwrite replaces),
 * 5. removes the copy at /de/de/<english slug>.
 * Pages whose German slug equals the English one are never touched. Never previews or publishes.
 * The translation is the translate.json's German row (setup-lib.mjs; --config <file>|da, default
 * the repo copy): today /de/en -> /de/de; with the global source /gc/en -> /gc/de (the app writes
 * /gc/de/<english slug>, the step moves it to /gc/de/<german slug>: /gc/en/flights -> /gc/de/fluege).
 *
 * Default: a dry run that lists what it would do. --apply writes (DA POST, then DELETE of the copy).
 * --root /drafts/loc-test: every DA path below that folder (copies to try the step on).
 * --simulate: where no translation exists yet, take the English page as the translation (with the
 *   app's absolute links, dnt.js resetHrefs) to show the link and merge work; never with --apply.
 * --page /de/en/x (repeatable; /gc/en/x with the global source): only these pages.
 * --build-map: rewrite slug-map.json from pages.csv.
 * --rollout-urls (with --page, dry run only, no DA call): prints the URLs of the German rollout
 *   project, one per line: the German page of each English page (its own German slug, else the same
 *   path), as https://main--lh-com--moved-permanently.aem.page/<path> (slug-lib.mjs rolloutUrls);
 *   /de/de pages for the at/de rollout, /gc/de pages for the one rollout to /de/de and /at/de.
 * Report (dry run over all pages): tools/reports/loc-slug-step.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSlugMap, translationPath, germanPath, germanize, plan, rolloutUrls, DEFAULT_TRANSLATION,
} from './slug-lib.mjs';
import { scopeRows } from './regional-diff.mjs';
import { setupFromArgs } from './setup-lib.mjs';
import { daBase, siteFromArgv, isDefaultSite } from './sites.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MAP_FILE = path.join(root, 'tools/loc/slug-map.json');
const DA = 'https://admin.da.live/source/moved-permanently/lh-com';
const AEM_PAGE = 'https://main--lh-com--moved-permanently.aem.page';

export function loadMap() {
  return JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
}

/**
 * DA source I/O (fetchImpl for tests). From a terminal DA answers 401 without a login: with
 * DA_TOKEN set (an IMS token, e.g. from da.live's console) every call sends
 * `Authorization: Bearer $DA_TOKEN`; the token is never printed. Without it no header is sent
 * (where the login is added for the tools).
 */
export function daClient(fetchImpl = fetch, token = process.env.DA_TOKEN, site = 'lh-com') {
  const url = (p) => `${site === 'lh-com' ? DA : daBase(site)}${p}.html`;
  const auth = token ? { authorization: `Bearer ${token}` } : {};
  const denied = (status) => new Error(token
    ? `DA ${status}: DA_TOKEN was refused (expired or without access to moved-permanently/${site})`
    : `DA ${status}: no login (set DA_TOKEN, or enable Document Authoring in Settings → LLM Permissions)`);
  return {
    async get(p) {
      const r = await fetchImpl(url(p), { headers: { 'cache-control': 'no-cache', ...auth } });
      if (r.status === 401 || r.status === 403) throw denied(r.status);
      return r.ok ? r.text() : null;
    },
    async put(p, html) {
      const body = new FormData();
      body.append('data', new Blob([html], { type: 'text/html' }));
      const r = await fetchImpl(url(p), { method: 'POST', body, headers: { ...auth } });
      if (r.status === 401 || r.status === 403) throw denied(r.status);
      if (!r.ok) throw new Error(`DA POST ${p}: ${r.status}`);
    },
    /** A labelled version of the document (DA's version history, as the app's saveVersion). */
    async version(p, label) {
      const r = await fetchImpl(url(p).replace('/source/', '/versionsource/'), {
        method: 'POST', body: JSON.stringify({ label }), headers: { 'content-type': 'application/json', ...auth },
      });
      if (r.status === 401 || r.status === 403) throw denied(r.status);
      if (!r.ok) throw new Error(`DA version ${p}: ${r.status}`);
    },
    async remove(p) {
      const r = await fetchImpl(url(p), { method: 'DELETE', headers: { ...auth } });
      if (r.status === 401 || r.status === 403) throw denied(r.status);
      if (!r.ok && r.status !== 404) throw new Error(`DA DELETE ${p}: ${r.status}`);
    },
  };
}

/** The app's resetHrefs (dnt/dnt.js): root-relative links become absolute aem.page links. */
const asTranslated = (html) => html.replace(/href="\//g, `href="${AEM_PAGE}/`);

/**
 * Runs the step for the given English pages. merge(translatedHtml, existingHtml) -> html|null
 * (the app's merge; injected so tests run without the app's code). translation: the setup's
 * German translation ({from, to}; default today's de/en -> de/de).
 */
export async function runStep({
  pages, map, da, merge, apply = false, behavior = 'merge', rootDir = '', simulate = false, translation = DEFAULT_TRANSLATION,
}) {
  if (apply && simulate) throw new Error('--simulate is a dry run only');
  const t = translation;
  const outside = pages.find((p) => !new RegExp(`^/${t.from}(/|$)`).test(p));
  if (outside) throw new Error(`slug step: ${outside} is no /${t.from} page (the translation of this translate.json reads /${t.from})`);
  const at = (p) => `${rootDir}${p}`;
  const results = [];
  for (const enPath of pages) {
    const copyPath = translationPath(enPath, t);
    const target = germanPath(enPath, map, t);
    if (!target) {
      results.push(plan(enPath, map, {}, t));
      continue; // eslint-disable-line no-continue
    }
    let copyHtml = await da.get(at(copyPath));
    const targetHtml = await da.get(at(target));
    const p = plan(enPath, map, { copyExists: Boolean(copyHtml), targetExists: Boolean(targetHtml) }, t);
    let simulated = false;
    if (p.action === 'no-translation' && simulate) {
      const source = await da.get(enPath);
      if (source) {
        copyHtml = asTranslated(source);
        simulated = true;
        p.action = targetHtml ? 'merge' : 'move';
      }
    }
    if (p.action === 'move' || p.action === 'merge') {
      const g = germanize(copyHtml, enPath, map, t);
      Object.assign(p, {
        simulated, links: g.links, unmapped: g.unmapped, primary: g.primary,
      });
      let out = g.html;
      if (p.action === 'merge' && behavior === 'merge') {
        out = await merge(g.html, targetHtml);
        p.mergeResult = out === null ? 'identical (nothing to save)' : `${(out.match(/da-diff-(added|deleted)/g) || []).length} differences marked`;
      } else if (p.action === 'merge') {
        p.mergeResult = 'overwrite';
      }
      if (apply) {
        if (out !== null) {
          await da.put(at(target), out);
          const back = await da.get(at(target));
          if (!back) throw new Error(`${at(target)} not readable after the save`);
        }
        await da.remove(at(copyPath));
        p.applied = true;
      }
    }
    results.push(p);
  }
  return results;
}

const line = (r) => {
  const head = `${r.action.padEnd(15)} ${r.enPath}`;
  if (r.action === 'skip-same-slug') return `${head} (the German slug is the English one: not touched)`;
  if (r.action === 'conflict') return `${head}: ${r.reason}`;
  if (r.action === 'no-translation') return `${head}: no translation at ${r.copy} yet (target ${r.target})`;
  return `${head}: ${r.copy} -> ${r.target}${r.simulated ? ' [simulated from the English page]' : ''}; ${r.links} links made German${r.unmapped.length ? `, ${r.unmapped.length} without a German page in the scope (${r.unmapped.slice(0, 3).join(', ')}${r.unmapped.length > 3 ? ', …' : ''})` : ''}; primary-language-url ${r.primary}${r.mergeResult ? `; merge: ${r.mergeResult}` : ''}; then delete ${r.copy}${r.applied ? ' — DONE' : ''}`;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (name) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : undefined);
  if (argv.includes('--build-map')) {
    const m = buildSlugMap(scopeRows());
    m.paths['/de/en'] = '/de/de';
    fs.writeFileSync(MAP_FILE, `${JSON.stringify({ source: 'tools/migration-scope/pages.csv (de_en, de_de)', retired: loadMap().retired, ...m }, null, 1)}\n`);
    console.log(`slug-map.json: ${Object.keys(m.slugs).length} own German slugs, ${Object.keys(m.paths).length} paths`);
    process.exit(0);
  }
  if (!isDefaultSite(siteFromArgv(argv))) {
    console.error(`slug-step: lh-com only (the 72 own German slugs). ${siteFromArgv(argv)} has one slug per page: no slug step; the pages whose www slug differs are listed in tools/slugs/${siteFromArgv(argv)}.json`);
    process.exit(1);
  }
  const map = loadMap();
  const listed = argv.flatMap((a, i) => (a === '--page' ? [argv[i + 1]] : []));
  const setup = await setupFromArgs(argv);
  const t = setup.translation || DEFAULT_TRANSLATION;
  if (argv.includes('--rollout-urls')) {
    if (argv.includes('--apply')) {
      console.error('slug-step --rollout-urls is a dry run only (it prints URLs, it never writes)');
      process.exit(1);
    }
    if (!listed.length) {
      console.error(`slug-step --rollout-urls: --page /${t.from}/<path> (one or more: the English pages of the translation project)`);
      process.exit(1);
    }
    try {
      const urls = rolloutUrls(listed, map, t);
      console.error(`German Rollout of these URLs writes ${(t.locales || []).map((l) => `/${l}`).join(' and ')} (one rollout)`);
      urls.forEach((u) => console.log(u));
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
    process.exit(0);
  }
  const pages = listed.length ? listed : Object.keys(map.slugs).map((p) => p.replace(/^\/de\/en(?=\/|$)/, `/${t.from}`));
  const { mergeLikeTheApp } = await import('./da-nx.mjs');
  const apply = argv.includes('--apply');
  const results = await runStep({
    pages, map, da: daClient(), merge: mergeLikeTheApp, apply, behavior: opt('behavior') || 'merge', rootDir: opt('root') || '', simulate: argv.includes('--simulate'), translation: t,
  });
  results.forEach((r) => console.log(line(r)));
  const count = (a) => results.filter((r) => r.action === a).length;
  console.log(`slug-step${apply ? '' : ' (dry run)'}: ${results.length} pages: move ${count('move')}, merge ${count('merge')}, no translation ${count('no-translation')}, conflict ${count('conflict')}, same slug ${count('skip-same-slug')}`);
  if (!listed.length && !apply && !opt('root')) {
    fs.writeFileSync(path.join(root, 'tools/reports/loc-slug-step.md'), [`# Slug step dry run (${argv.includes('--simulate') ? 'translation simulated from the English pages' : 'DA as it is'})`, '', new Date().toISOString(), '',
      `${results.length} pages with their own German slug: move ${count('move')}, merge ${count('merge')}, no translation ${count('no-translation')}, conflict ${count('conflict')}.`, '',
      '```', ...results.map(line), '```', ''].join('\n'));
  }
}
