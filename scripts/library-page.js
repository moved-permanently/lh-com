/**
 * The block library's pages (/library/**) and the app screen documents (/content/mobile/**).
 *
 * - Library pages are what DA's Insert-block dialog shows in its preview iframe
 *   (preview.da.live/library/blocks/<block>): the blocks only, no header, footer, breadcrumb,
 *   cookie banner, alerts bar, showcase notice or tag manager, all sections at once, and the
 *   page scrolls to the entry the dialog names in the hash (again on hashchange: the dialog
 *   changes only the hash for another entry of the same block). preview.da.live composes the
 *   page without heading ids, so headings without one get the id the Edge Delivery pipeline
 *   gives (helix-html-pipeline's IDSlugger, as da-live's addHeadingIds copies it).
 * - App screens (lh-edge turns them into the app's JSON, tools/workers/lh-edge/SDUI.md) render as
 *   the app's screen: a phone-width column without the web chrome, the screen's markers
 *   ({spacer: …}, {small}, {divider}) as what the app makes of them.
 * - library-metadata tables (the library's descriptions and fields for DA) are never page
 *   content: removed before decoration on every page.
 * Paths also under the local server's /content (aem up --html-folder content).
 */

import { APP_SPACER, APP_SMALL } from './style-markers.js';

const LIBRARY = /^(?:\/content)?\/library(?:\/|$)/;
const APP_SCREEN = /^(?:\/content)?\/content\/mobile\//;

/** Whether a path is a page of the block library. */
export const isLibraryPath = (pathname) => LIBRARY.test(String(pathname || ''));

/** Whether a path is an app screen document. */
export const isAppScreenPath = (pathname) => APP_SCREEN.test(String(pathname || ''));

/**
 * github-slugger's slug (lowercase; everything but letters, marks, numbers, connector
 * punctuation, "-" and spaces removed; spaces become "-"), as the pipeline's ids.
 * @param {string} text
 * @returns {string}
 */
export function slug(text) {
  return String(text).toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-');
}

/**
 * Ids for the headings of a page that has none (preview.da.live), as the pipeline gives them:
 * the slug without leading digits ("5 miles" -> "miles"), "-1", "-2" for the second and third
 * heading of the same text. A page with heading ids (aem.page, aem.live) stays as it is.
 * @param {Element} main
 */
export function addHeadingIds(main) {
  const headings = [...main.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  if (headings.some((h) => h.id)) return;
  const occurrences = new Map();
  headings.forEach((heading) => {
    const text = heading.textContent.trim();
    if (!text) return;
    const original = slug(text).replace(/^\d+-+/, '');
    let id = original;
    while (occurrences.has(id)) {
      const count = occurrences.get(original) + 1;
      occurrences.set(original, count);
      id = `${original}-${count}`;
    }
    occurrences.set(id, 0);
    heading.id = id;
  });
}

/** Removes the library-metadata tables (never page content). */
export function removeLibraryMetadata(main) {
  main.querySelectorAll('div.library-metadata').forEach((el) => el.remove());
}

/**
 * The element a hash names (its id percent-decoded), else null.
 * @param {Document} doc
 * @param {string} hash
 */
export function hashTarget(doc, hash) {
  if (!hash || hash.length < 2) return null;
  let id = hash.slice(1);
  try { id = decodeURIComponent(id); } catch (e) { /* the hash as it is */ }
  return doc.getElementById(id);
}

/** Scrolls to the hash's element now and whenever the hash changes. */
export function followHash(doc = document) {
  const go = () => {
    const el = hashTarget(doc, window.location.hash);
    if (el) el.scrollIntoView();
  };
  go();
  window.addEventListener('hashchange', go);
}

// the app screens' markers: scripts/style-markers.js (shared with lh-edge and the importer's tools)
const SPACER = APP_SPACER;
const SMALL = APP_SMALL;

/**
 * The app screen's markers: "{spacer: medium}" (also "{spacer: medium, v2}", a space only the
 * v2 screen has) an empty space of that size, "{divider}" a rule, a paragraph ending in
 * "{small}" small text (the marker removed).
 * @param {Element} main
 */
export function decorateAppScreen(main) {
  main.querySelectorAll('p').forEach((p) => {
    const raw = p.textContent.trim();
    const sp = raw.match(SPACER);
    if (sp) {
      p.textContent = '';
      p.className = `app-spacer app-spacer-${sp[1].toLowerCase()}`;
      p.setAttribute('aria-hidden', 'true');
      return;
    }
    if (/^\{divider\}$/i.test(raw)) {
      p.textContent = '';
      p.className = 'app-divider';
      p.setAttribute('aria-hidden', 'true');
      return;
    }
    const walker = (p.ownerDocument || document).createTreeWalker(p, 4);
    let last = null;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue.trim()) last = n;
    if (last && SMALL.test(last.nodeValue)) {
      last.nodeValue = last.nodeValue.replace(SMALL, '');
      p.classList.add('app-small');
    }
  });
}

/**
 * A library page or an app screen without the web chrome: its body class, no header, footer or
 * breadcrumb (the cookie banner, alerts bar, showcase notice and tag manager are not started:
 * scripts.js).
 * @param {Document} doc
 * @param {Element} main
 * @param {'library'|'app-screen'} kind
 */
export function applyBarePage(doc, main, kind) {
  doc.body.classList.add(kind === 'library' ? 'library-page' : 'app-screen');
  doc.querySelectorAll('body > header, body > footer').forEach((el) => el.remove());
  main.querySelectorAll('div.breadcrumb').forEach((b) => {
    const wrapper = b.parentElement && b.parentElement.classList.contains('breadcrumb-wrapper') ? b.parentElement : b;
    const section = wrapper.closest('.section');
    wrapper.remove();
    if (section && !section.querySelector(':scope > *')) section.remove();
  });
  if (kind === 'app-screen') decorateAppScreen(main);
}
