/**
 * The site-wide embeds behind a site flag (scripts/embeds.js), loaded by scripts.js's loadDelayed
 * on the pages of a brand with embeds (scripts/brands.js); other pages load neither this module
 * nor the flags sheet.
 * - live-chat (Air Dolomiti's digital assistant, Engagent): www.airdolomiti.it's tag manager
 *   (GTM-SH94 tag 997, 2026-11-01) loads digital-assistant.js?cid=<cid>&view.mobileMode=detect on
 *   every page but the chat page (there the live-chat block's chat), before any consent choice;
 *   Engagent's rules on the page URL pick what shows.
 * - chat-button (Austrian's floating chat button, Cognigy webchat from www.austrian.com's
 *   /digitalassistant/support, not AEM): www.austrian.com's tag manager (Tealium os-main tag 110,
 *   2026-11-01; OneTrust group C0001, strictly necessary: whatever the visitor chose) on the pages
 *   of its clean.url table, here the pages with the metadata chat-button: a start id, or "open"
 *   (the table's TRUE|FALSE rows: no start id, the chat window opened on load).
 * - brussels-payment-picker (Brussels' payment methods country picker, an iframe of
 *   webv4.brusselsairlines.com that loads the methods of the chosen country from Brussels' live
 *   systems): on the our-payment-methods pages, in place of the import's link to the same page on
 *   www (a paragraph of that one link); with the flag off the link stays (the 2026-11-01 rule for
 *   embeds into an airline's live systems).
 * - austrian-ife-carousel (Austrian's in-flight entertainment film carousel, an iframe of
 *   www.austrian-inflightentertainment.com, the vendor's live system): on the unterhaltung-an-bord
 *   pages, the same way (linkOutEmbed).
 */
import { getMetadata } from './aem.js';
import { brandEntry } from './locale.js';
import { embedConfig, embedWanted, loadEmbedScript } from './embeds.js';

async function liveChat() {
  // the chat page: its own chat (blocks/live-chat), not the site-wide script
  if (document.querySelector('.live-chat')) return;
  const config = await embedWanted('live-chat');
  if (!config) return;
  const params = new URLSearchParams({ cid: config.cid, 'view.mobileMode': 'detect' });
  // nothing waits for the vendor's script
  loadEmbedScript(`${config.script}?${params}`).catch(() => {});
}

/**
 * www.austrian.com's tag 110: webchat_init.js's URL and the webchatConfig set before it.
 * @param {string} script webchat_init.js
 * @param {string} value the page's chat-button metadata: a start id or "open"
 * @param {string} pathname
 * @param {string} lang the page's language
 * @param {Object} [embed] the brand's chat-button entry: with languages (Brussels) www's other
 *   rule: ?language=<LL> on every page in those languages, &start= with a start id (one with a
 *   space too, as www's), "button" for none (the window closed)
 * @returns {{src: string, config: Object}|null} null where www shows no chat (rule 207: en, de,
 *   es, it, fr) or for a value that is not a start id
 */
export function webchatInit(script, value, pathname, lang, embed = null) {
  if (embed && embed.languages) {
    if (!embed.languages.includes(lang) || !/^[A-Za-z0-9_-]+(?: [A-Za-z0-9_-]+)*$/.test(value)) return null;
    const start = value === 'button' ? '' : `&start=DYNAMIC_web-${encodeURIComponent(value)}`;
    return { src: `${script}?language=${lang.toUpperCase()}${start}`, config: { loadTealiumScripts: false, isInitiallyOpened: false } };
  }
  if (!/^(en|de|es|it|fr)$/.test(lang) || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const roots = [['/de/de', 'DE'], ['/fr/fr', 'fr'], ['/es/es', 'es'], ['/it/it', 'it']];
  const root = roots.find(([path]) => pathname.includes(path));
  let src = root ? `${script}?language=${root[1]}` : script;
  const opened = value === 'open';
  if (!opened) src += `${root ? '' : `?language=${lang.toUpperCase()}`}&start=DYNAMIC_web-${value}`;
  return { src, config: { loadTealiumScripts: false, isInitiallyOpened: opened } };
}

async function chatButton() {
  const value = getMetadata('chat-button');
  if (!value) return;
  const config = await embedWanted('chat-button');
  if (!config) return;
  const lang = (document.documentElement.lang || getMetadata('language')).slice(0, 2).toLowerCase();
  const init = webchatInit(config.script, value, window.location.pathname, lang, config);
  if (!init) return;
  // webchat_init.js reads (and freezes) the global config before it loads the chat
  window.webchatConfig = init.config;
  loadEmbedScript(init.src).catch(() => {});
}

/**
 * The paragraph the payment picker replaces: the one whose only content is a link to the page
 * itself on the brand's www host (the import's link-out for www's iframe), on the configured page.
 * @param {Element} main
 * @param {Object} config the brand's brussels-payment-picker entry
 * @param {{pathname: string}} location
 * @param {string} www the brand's www host
 * @returns {Element|null}
 */
export function paymentPickerTarget(main, config, location, www) {
  if (!main || !config || !www || !location.pathname.endsWith(config.path)) return null;
  return [...main.querySelectorAll('p')].find((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length !== 1 || p.textContent.trim() !== links[0].textContent.trim()) return false;
    try {
      const url = new URL(links[0].getAttribute('href'), 'https://invalid.invalid');
      return url.hostname === www && url.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '');
    } catch (e) {
      return false;
    }
  }) || null;
}

/** The embed as www draws it: an iframe of the configured page and height, the full width. */
export function paymentPickerFrame(config, title) {
  const wrap = document.createElement('div');
  wrap.className = 'link-out-embed';
  const frame = document.createElement('iframe');
  frame.setAttribute('src', config.src);
  frame.setAttribute('title', title || 'Payment methods');
  frame.setAttribute('loading', 'lazy');
  frame.setAttribute('width', '100%');
  frame.setAttribute('height', String(config.height || 750));
  frame.setAttribute('frameborder', '0');
  wrap.append(frame);
  return wrap;
}

/**
 * An embed that takes the place of the import's link-out (paymentPickerTarget) with the brand's
 * configured iframe, when its flag is on.
 * @param {string} flag
 */
async function linkOutEmbed(flag) {
  const brand = brandEntry();
  const config = embedConfig(flag, brand);
  const www = (config && config.www) || (brand && brand.www);
  const target = paymentPickerTarget(document.querySelector('main'), config, window.location, www);
  if (!target) return;
  if (!(await embedWanted(flag, brand))) return;
  target.replaceWith(paymentPickerFrame(config, target.textContent.trim()));
}

/** Loads the page's site-wide embeds whose site flag is on. */
export default async function loadSiteEmbeds() {
  await Promise.all([liveChat(), chatButton(), linkOutEmbed('brussels-payment-picker'), linkOutEmbed('austrian-ife-carousel')]);
}
