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
 */
import { getMetadata } from './aem.js';
import { embedWanted, loadEmbedScript } from './embeds.js';

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
 * @returns {{src: string, config: Object}|null} null where www shows no chat (rule 207: en, de,
 *   es, it, fr) or for a value that is not a start id
 */
export function webchatInit(script, value, pathname, lang) {
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
  const init = webchatInit(config.script, value, window.location.pathname, lang);
  if (!init) return;
  // webchat_init.js reads (and freezes) the global config before it loads the chat
  window.webchatConfig = init.config;
  loadEmbedScript(init.src).catch(() => {});
}

/** Loads the page's site-wide embeds whose site flag is on. */
export default async function loadSiteEmbeds() {
  await Promise.all([liveChat(), chatButton()]);
}
