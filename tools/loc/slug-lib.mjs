/* eslint-disable import/no-extraneous-dependencies -- dev tooling */
/**
 * The slug step's pure parts (tools/loc/slug-step.mjs; tests: test/loc-slug-step.test.mjs).
 *
 * The localisation app writes the German translation of /de/en/<path> to /de/de/<path>
 * (views/translate/index.js saveLang, line 106). 72 German pages have their own slug
 * (pages.csv: /de/en/flight-search = /de/de/flugsuche). For those, the step takes the translation
 * from /de/de/<english slug> to /de/de/<german slug>, fixes its links and metadata, and removes
 * the copy at the English slug. A page whose German slug equals the English one is never touched.
 */
import { parseHTML } from 'linkedom';

export const SITE_HOSTS = /^https:\/\/(main--lh-com--moved-permanently\.aem\.(page|live)|lhcom\.bbird\.live)(?=\/)/;

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

/** Where the app writes the German translation of an English page: /de/de/<english slug>. */
export const translationPath = (enPath) => enPath.replace(/^\/de\/en(?=\/|$)/, '/de/de');

/**
 * The German href of a link in a translated page, or null to leave it:
 * - the site's own hosts (the app makes every root-relative link absolute on aem.page, dnt.js
 *   resetHrefs; a merge makes them aem.live, regional-diff.js normalizeLinks) -> root-relative;
 * - /de/en/<x> -> the German page of <x> (slug map), else unchanged and reported.
 */
export function germanHref(href, map, report = () => {}) {
  const raw = String(href || '');
  let v = raw.replace(SITE_HOSTS, '');
  const m = v.match(/^(\/de\/en(?:\/[^?#]*)?)([?#].*)?$/);
  if (m) {
    const target = m[1].replace(/\.html$/, '').replace(/\/$/, '') || '/de/en';
    const german = map.paths[target];
    if (german) v = `${german}${m[2] || ''}`;
    else report(target);
  }
  return v === raw ? null : v;
}

/** The metadata block's rows as [key cell, value cell]. */
function metadataRows(document) {
  const block = document.querySelector('.metadata');
  return block ? [...block.children].map((row) => [row.children[0], row.children[1], row]) : [];
}

/**
 * The translated page made the German page: links, primary-language-url, the English slug's
 * Parent. Returns {html, links: n rewritten, unmapped: [paths], primary: 'set'|'kept'|'added'}.
 * @param {string} html the DA document (<body><header></header><main>...</main>...)
 * @param {string} enPath the English page (/de/en/flight-search)
 */
export function germanize(html, enPath, map) {
  const { document } = parseHTML(/^\s*<html/i.test(html) ? html : `<html><head></head>${html}</html>`);
  const unmapped = new Set();
  let links = 0;
  document.querySelectorAll('[href], img[src], source[srcset]').forEach((el) => {
    ['href', 'src', 'srcset'].forEach((attr) => {
      if (!el.hasAttribute(attr)) return;
      const value = el.getAttribute(attr);
      const stripped = value.replace(SITE_HOSTS, '');
      let next = stripped !== value ? stripped : null;
      if (attr === 'href') next = germanHref(value, map, (p) => unmapped.add(p));
      if (next !== null) {
        el.setAttribute(attr, next);
        links += 1;
        // a link whose text is its own URL (the metadata Parent row) says the new URL too
        if (el.tagName === 'A' && [value, value.replace(SITE_HOSTS, '')].includes(el.textContent.trim())) el.textContent = next;
      }
    });
  });
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
    html: body.outerHTML, links, unmapped: [...unmapped].sort(), primary,
  };
}

/**
 * What the step does with one page (no DA calls): {action, ...}.
 * - skip-same-slug: the German slug equals the English one (never touched);
 * - no-translation: nothing at /de/de/<english slug> (no translation project ran for it);
 * - conflict: /de/de/<english slug> is a scope page of its own (never removed);
 * - move: no German page yet: the translation becomes it;
 * - merge: the German page exists: the translation is merged onto it (the app's merge), or
 *   replaces it with --behavior overwrite.
 */
export function plan(enPath, map, { copyExists, targetExists }) {
  const target = map.slugs[enPath];
  if (!target) return { action: 'skip-same-slug', enPath };
  const copy = translationPath(enPath);
  const owners = Object.entries(map.paths).filter(([, de]) => de === copy).map(([en]) => en);
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
