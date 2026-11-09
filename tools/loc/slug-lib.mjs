/* eslint-disable import/no-extraneous-dependencies, import/extensions -- dev tooling */
/**
 * RETIRED with the slug step (see tools/loc/slug-step.mjs): one slug per page, tools/slugs/lh-com.json.
 *
 * The slug step's pure parts (tools/loc/slug-step.mjs; tests: test/loc-slug-step.test.mjs).
 *
 * The localisation app writes the German translation of /de/en/<path> to /de/de/<path>
 * (views/translate/index.js saveLang, line 106). 72 German pages have their own slug
 * (pages.csv: /de/en/flight-search = /de/de/flugsuche). For those, the step takes the translation
 * from /de/de/<english slug> to /de/de/<german slug>, fixes its links and metadata, and removes
 * the copy at the English slug. A page whose German slug equals the English one is never touched.
 * The translation is the setup's (setup-lib.mjs locSetup translation, default today's de/en ->
 * de/de): with the global source the app writes /gc/de/<english slug> from /gc/en, and the step
 * takes it to /gc/de/<german slug> (the de/de own slugs of slug-map.json: /gc/en/flights ->
 * /gc/de/fluege). slug-map.json keeps the de/en and de/de paths; the gc ones are the same with /gc.
 */
import { parseHTML } from 'linkedom';
import { localizeHref, localizeDoc, SITE_HOSTS } from './link-lib.mjs';

export { SITE_HOSTS };
/** Today's translation (tools/loc/translate.json's German row): /de/en -> /de/de. */
export const DEFAULT_TRANSLATION = { from: 'de/en', to: 'de/de' };
/** /<a>/x -> /<b>/x */
const swap = (p, a, b) => p.replace(new RegExp(`^/${a}(?=/|$)`), `/${b}`);
/** The slug map's key of an English page (/gc/en/x -> /de/en/x). */
const mapKey = (enPath, t) => swap(enPath, t.from, 'de/en');
/** The link step's map of the translation (/<from> -> /<to>) from the slug map's paths. */
const translationMap = (map, t = DEFAULT_TRANSLATION) => ({
  from: t.from,
  to: t.to,
  paths: Object.fromEntries(Object.entries(map.paths).map(([en, de]) => [swap(en, 'de/en', t.from), swap(de, 'de/de', t.to)])),
});

/**
 * The slug map from pages.csv rows: {slugs: {"/de/en/x": "/de/de/y"}} for the rows whose German
 * path differs from the English one after the locale prefix, and `paths`: every row's
 * English -> German path (the German links of a translation).
 */
export function buildSlugMap(rows) {
  const tail = (p) => p.split('/').slice(3).join('/');
  const slugs = {};
  const paths = {};
  rows.forEach((r) => {
    if (!r.de_en || !r.de_de) return;
    paths[r.de_en] = r.de_de;
    if (tail(r.de_en) !== tail(r.de_de)) slugs[r.de_en] = r.de_de;
  });
  const sort = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  return { slugs: sort(slugs), paths: sort(paths) };
}

/**
 * Where the app writes the German translation of an English page: /de/de/<english slug>
 * (/gc/de/… with the global source).
 */
export const translationPath = (enPath, t = DEFAULT_TRANSLATION) => swap(enPath, t.from, t.to);

/**
 * The German page of an English page with its own German slug (/gc/en/flights -> /gc/de/fluege),
 * else undefined.
 */
export function germanPath(enPath, map, t = DEFAULT_TRANSLATION) {
  const de = map.slugs[mapKey(enPath, t)];
  return de ? swap(de, 'de/de', t.to) : undefined;
}

/**
 * The German href of a link in a translated page, or null to leave it:
 * - the site's own hosts (the app makes every root-relative link absolute on aem.page, dnt.js
 *   resetHrefs; a merge makes them aem.live, regional-diff.js normalizeLinks) -> root-relative;
 * - /de/en/<x> -> the German page of <x> (slug map), else unchanged and reported.
 */
export function germanHref(href, map, report = () => {}, t = DEFAULT_TRANSLATION) {
  return localizeHref(href, translationMap(map, t), report);
}

/** The metadata block's rows as [key cell, value cell]. */
function metadataRows(document) {
  const block = document.querySelector('.metadata');
  return block ? [...block.children].map((row) => [row.children[0], row.children[1], row]) : [];
}

/**
 * The translated page made the German page: links, primary-language-url, the English slug's
 * Parent. Returns {html, links: n rewritten, unmapped: [paths], primary: 'set'|'kept'|'added'}.
 * primary-language-url is the /de/en page in both setups (what helix-sitemap.yaml pairs by; the
 * market pages the German page rolls out to carry it).
 * @param {string} html the DA document (<body><header></header><main>...</main>...)
 * @param {string} page the English page (/de/en/flight-search, /gc/en/flight-search)
 */
export function germanize(html, page, map, t = DEFAULT_TRANSLATION) {
  const enPath = mapKey(page, t);
  // the links: the link step's translation fix (tools/loc/link-lib.mjs)
  const localized = localizeDoc(html, translationMap(map, t));
  const { links, unmapped } = localized;
  const { document } = parseHTML(`<html><head></head>${localized.html}</html>`);
  let primary = 'kept';
  const rows = metadataRows(document);
  const found = rows.find(([k]) => k && k.textContent.trim().toLowerCase() === 'primary-language-url');
  if (found) {
    if (found[1].textContent.trim() !== enPath) {
      found[1].textContent = enPath;
      primary = 'set';
    }
  } else {
    let block = document.querySelector('.metadata');
    if (!block) {
      const section = document.createElement('div');
      block = document.createElement('div');
      block.className = 'metadata';
      section.append(block);
      (document.querySelector('main') || document.body).append(section);
    }
    const row = document.createElement('div');
    row.innerHTML = `<div>primary-language-url</div><div>${enPath}</div>`;
    block.append(row);
    primary = 'added';
  }
  const body = document.querySelector('body');
  return {
    html: body.outerHTML, links, unmapped, primary,
  };
}

/**
 * What the step does with one page (no DA calls): {action, ...}.
 * - skip-same-slug: the German slug equals the English one (never touched);
 * - no-translation: nothing at /de/de/<english slug> (no translation project ran for it);
 * - conflict: /de/de/<english slug> is a scope page of its own (never removed);
 * (/gc/de/… with the global source's translation t)
 * - move: no German page yet: the translation becomes it;
 * - merge: the German page exists: the translation is merged onto it (the app's merge), or
 *   replaces it with --behavior overwrite.
 */
export function plan(enPath, map, { copyExists, targetExists }, t = DEFAULT_TRANSLATION) {
  const target = germanPath(enPath, map, t);
  if (!target) return { action: 'skip-same-slug', enPath };
  const copy = translationPath(enPath, t);
  const owners = Object.entries(translationMap(map, t).paths)
    .filter(([, de]) => de === copy).map(([en]) => en);
  if (owners.length) {
    return {
      action: 'conflict', enPath, copy, target, reason: `${copy} is the German page of ${owners.join(', ')}`,
    };
  }
  if (!copyExists) {
    return {
      action: 'no-translation', enPath, copy, target,
    };
  }
  return {
    action: targetExists ? 'merge' : 'move', enPath, copy, target,
  };
}

/** The preview host the at/de rollout project's URLs are written for. */
export const AEM_PAGE = 'https://main--lh-com--moved-permanently.aem.page';

/**
 * The URLs of the German rollout project for a list of English pages: since da-nx 1.29.1
 * (69006f3b) a project takes its source folder from its URLs, and a project of the German
 * location's pages offers only German Rollout, to each German locale with the same path
 * (views/rollout/index.js 112-147): /de/de pages to /at/de (today's rows), /gc/de pages to /de/de
 * and /at/de in one rollout (the global source). Per page the German page: its own German slug
 * (slug-map.json), else the same path; as https://main--lh-com--moved-permanently.aem.page/<path>,
 * one per page, in the given order.
 */
export function rolloutUrls(pages, map, t = DEFAULT_TRANSLATION) {
  return pages.map((p) => {
    if (!new RegExp(`^/${t.from}(/|$)`).test(p)) throw new Error(`rollout URLs: ${p} is no /${t.from} page (give the English pages, --page /${t.from}/…)`);
    return `${AEM_PAGE}${germanPath(p, map, t) || translationPath(p, t)}`;
  });
}
