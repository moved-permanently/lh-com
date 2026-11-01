/**
 * Embeds behind a site flag (scripts/flags.js): an airline's widget that sends visitors or their
 * data into its live systems (chat, vendor newsletter forms, shop widgets), built as the airline's
 * www page loads it. Its configuration (script URL, vendor ids) is the brand's
 * (scripts/brands.js embeds, keyed by the flag's name); a page loads it only when its brand has
 * that entry and the site's flag is on, never inside DA's authoring views. Otherwise nothing is
 * requested and the page shows what it showed before: the link to the airline's www page.
 */
import { brandEntry } from './locale.js';
import { isFlagOn } from './flags.js';
import { isAuthoringContext } from './consent.js';

/**
 * The brand's configuration of an embed, without reading the flags.
 * @param {string} flag e.g. 'live-chat'
 * @param {Object} [brand] the page's brand entry (scripts/locale.js brandEntry)
 * @returns {Object|null}
 */
export function embedConfig(flag, brand = brandEntry()) {
  return (brand && brand.embeds && brand.embeds[flag]) || null;
}

/**
 * The embed's configuration when the page may load it: its brand has one, the page is not an
 * authoring view and the site's flag is on; else null. Reads the flags sheet only for a brand
 * with the embed.
 * @param {string} flag
 * @param {Object} [brand]
 * @returns {Promise<Object|null>}
 */
export async function embedWanted(flag, brand = brandEntry()) {
  const config = embedConfig(flag, brand);
  if (!config || isAuthoringContext()) return null;
  return (await isFlagOn(flag)) ? config : null;
}

/** The page's script nonce (Edge Delivery replaces head.html's "aem" with a random one a page). */
export function pageNonce() {
  const script = document.querySelector('script[nonce]');
  return script ? script.nonce || script.getAttribute('nonce') || '' : '';
}

/**
 * Loads a vendor script as www does: a classic script element (vendors read document.currentScript)
 * with the page's nonce, resolved when it has loaded.
 * @param {string} src
 * @param {{parent?: Element}} [options] where it goes (the head by default)
 * @returns {Promise<HTMLScriptElement>}
 */
export function loadEmbedScript(src, { parent = document.head } = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.setAttribute('src', src);
    script.async = true;
    const nonce = pageNonce();
    if (nonce) script.setAttribute('nonce', nonce);
    script.addEventListener('load', () => resolve(script));
    script.addEventListener('error', () => reject(new Error(`${src}: not loaded`)));
    parent.append(script);
  });
}

/**
 * Waits for a vendor global (www's tags poll every 100 ms).
 * @param {Function} test returns the value once there
 * @param {number} [tries]
 * @returns {Promise<*>} the value, or null after the last try
 */
export function waitFor(test, tries = 100) {
  return new Promise((resolve) => {
    let left = tries;
    const check = () => {
      const value = test();
      if (value || left <= 0) {
        resolve(value || null);
        return;
      }
      left -= 1;
      setTimeout(check, 100);
    };
    check();
  });
}

/**
 * Splits an embed block: its key | value rows (the page's vendor settings, removed from view) and
 * its other rows, kept as they are in a fallback element (the link to the airline's www page,
 * what the page showed before the embed).
 * @param {Element} block
 * @param {string} name the block's class (its fallback: .<name>-fallback)
 * @returns {{settings: Object<string, string>, fallback: Element}}
 */
export function splitEmbedBlock(block, name) {
  const settings = {};
  const fallback = document.createElement('div');
  fallback.className = `${name}-fallback`;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells.length > 1 ? cells[0].textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '';
    if (key) {
      if (!(key in settings)) settings[key] = cells[1].textContent.trim();
      row.remove();
      return;
    }
    fallback.append(...(cells.length ? cells.flatMap((c) => [...c.childNodes]) : [row]));
    row.remove();
  });
  block.append(fallback);
  return { settings, fallback };
}
