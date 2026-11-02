/* A linkedom page that decorates hero-card-overlay blocks from fixtures (test/fixtures/heroes/:
   the brands' heroes on preview, 2026-11-02), no network. heroOf(file, { reducedMotion }) returns
   the decorated block; hashOf its markup (the heading id's counter masked). Used by
   test/hero-card-overlay-video.test.mjs. */
/* global globalThis */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const HOST = 'main--lh-com--moved-permanently.aem.page';
window.location = {
  hostname: HOST, pathname: '/de/en/homepage', search: '', hash: '', replace: () => {}, href: `https://${HOST}/de/en/homepage`, origin: `https://${HOST}`,
};
window.origin = `https://${HOST}`;
let reduced = false;
window.matchMedia = (q) => ({
  matches: /prefers-reduced-motion/.test(q) ? reduced : true, addEventListener: () => {}, addListener: () => {},
});
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.matchMedia = window.matchMedia;
globalThis.fetch = async () => new Response('{}', { status: 404 });

const { default: decorate } = await import('../blocks/hero-card-overlay/hero-card-overlay.js');

export const FIXTURES = fs.readdirSync(new URL('./fixtures/heroes/', import.meta.url)).filter((f) => f.endsWith('.html')).sort();

/** A fixture's hero, decorated in a section of a main. */
export function heroOf(file, { reducedMotion = false } = {}) {
  reduced = reducedMotion;
  const html = typeof file === 'string' && file.endsWith('.html') && !file.startsWith('<')
    ? fs.readFileSync(new URL(`./fixtures/heroes/${file}`, import.meta.url), 'utf8') : file;
  document.body.innerHTML = `<main><div class="section">${html}</div></main>`;
  const block = document.querySelector('.hero-card-overlay');
  decorate(block);
  return block;
}

export const hashOf = (el) => crypto.createHash('sha256')
  .update(el.outerHTML.replace(/hero-card-overlay-heading-\d+/g, 'hero-card-overlay-heading-N')).digest('hex').slice(0, 16);
