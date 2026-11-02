/* A linkedom page that decorates the footer block from a footer document, no network: the
   document is the fetch answer for the page's `footer` metadata (blocks/footer, loadFragment,
   decorateMain). footerOf(brand, file, page) returns the decorated block. Used by
   test/footer-logos-first.test.mjs and tools/../make-footer-hashes. */
/* global globalThis */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const HOST = 'main--lh-com--moved-permanently.aem.page';
const at = (pathname) => {
  window.location = {
    hostname: HOST, pathname, search: '', hash: '', replace: () => {}, href: `https://${HOST}${pathname}`, origin: `https://${HOST}`, toString: () => `https://${HOST}${pathname}`,
  };
};
at('/');
window.origin = `https://${HOST}`;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };
globalThis.DOMParser = window.DOMParser;
globalThis.IntersectionObserver = function IntersectionObserver() {
  return { observe: () => {}, disconnect: () => {}, unobserve: () => {} };
};

let served = '';
globalThis.fetch = async (input) => {
  const u = new URL(String(input), window.location.href);
  if (u.pathname === '/fixture/footer.plain.html') return new Response(served, { headers: { 'content-type': 'text/html' } });
  // the site's own icons from the repository
  const own = new URL(`..${u.pathname}`, import.meta.url);
  if (/^\/icons\/[a-z0-9-]+\.svg$/.test(u.pathname) && fs.existsSync(own)) return new Response(fs.readFileSync(own, 'utf8'), { headers: { 'content-type': 'image/svg+xml' } });
  return new Response('', { status: 404 });
};

const { default: decorate } = await import('../blocks/footer/footer.js');

/**
 * The footer block of a brand's page, decorated from a fixture file (test/fixtures/footers/).
 * @param {string} brand the page's brand metadata ('' for lh-com)
 * @param {string} file fixture name
 * @param {string} pathname the page's path (its locale)
 */
export async function footerOf(brand, file, pathname) {
  served = fs.readFileSync(new URL(`./fixtures/footers/${file}.plain.html`, import.meta.url), 'utf8');
  at(pathname);
  document.head.innerHTML = `${brand ? `<meta name="brand" content="${brand}">` : ''}<meta name="footer" content="/fixture/footer">`;
  document.body.innerHTML = '<footer><div class="footer block" data-block-name="footer"></div></footer>';
  const block = document.querySelector('.footer.block');
  await decorate(block);
  return block;
}

/**
 * A short hash of a decorated footer's markup, the checkout's directory left out (aem.js sets
 * codeBasePath from its own URL: under node the checkout's path, in icons' src), so the hash is
 * the same in every checkout.
 */
export const hashOf = (el) => {
  const base = window.hlx.codeBasePath;
  const html = base ? el.outerHTML.split(`${base}/`).join('/') : el.outerHTML;
  return crypto.createHash('sha256').update(html).digest('hex').slice(0, 16);
};

// the brands' footers: brand metadata, fixture, page path
export const FOOTERS = [
  ['', 'lufthansa', '/de/en/homepage'],
  ['discover', 'discover', '/de/en/homepage'],
  ['ita', 'ita', '/it/en/homepage'],
  ['austrian', 'austrian', '/at/en/homepage'],
  ['brussels', 'brussels', '/be/en/homepage'],
  ['cargo', 'cargo', '/en/home'],
  ['airdolomiti', 'airdolomiti', '/'],
  ['b2b', 'b2b', '/de/en/homepage'],
];
