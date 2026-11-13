/**
 * The request block of tools/parity/capture.js for the other tools that open our pages in a browser (standing order 13
 * of 2026-11-13): our pages' scripts call www.lufthansa.com directly and lh-proxy, and their web fonts load from the
 * airline's www after our own path 404s. guardContext(context) lets a context reach only our hosts (lib.js
 * ownHostFilter: aem.live, aem.page, turnsthe.page, localhost), OneTrust's consent hosts, data: and blob:; a web font
 * comes from PARITY_FONTS (":"-separated directories holding www's paths, the recording drops' fonts/; lib.js
 * mirroredFont); everything else is aborted, whatever the tool opens (a URL of www's is aborted too). Create the
 * context with GUARD_CONTEXT (service workers blocked: their requests are not routed).
 *
 *   const context = await browser.newContext({ ...GUARD_CONTEXT, viewport });
 *   await guardContext(context);
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ownHostFilter, mirroredFont } = require('./lib.js');

export const GUARD_CONTEXT = Object.freeze({ serviceWorkers: 'block' });

// any of our hosts gives the same test of the request URLs
const allowed = ownHostFilter('http://localhost/');

/**
 * @param {import('playwright-core').BrowserContext} context
 * @param {{ fontDirs?: string[], log?: { fonts: string[], aborted: string[] } }} [options]
 */
export async function guardContext(context, { fontDirs, log } = {}) {
  const dirs = fontDirs || (process.env.PARITY_FONTS || '').split(':').filter(Boolean);
  await context.route((u) => !allowed(u), (route) => {
    const url = route.request().url();
    const font = mirroredFont(new URL(url), dirs);
    if (log) (font ? log.fonts : log.aborted).push(url);
    return font ? route.fulfill({ path: font, headers: { 'Access-Control-Allow-Origin': '*' } })
      : route.abort('blockedbyclient');
  });
}
