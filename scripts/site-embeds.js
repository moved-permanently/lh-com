/**
 * The site-wide embeds behind a site flag (scripts/embeds.js), loaded by scripts.js's loadDelayed
 * on the pages of a brand with embeds (scripts/brands.js); other pages load neither this module
 * nor the flags sheet.
 * - live-chat (Air Dolomiti's digital assistant, Engagent): www.airdolomiti.it's tag manager
 *   (GTM-SH94 tag 997, 2026-11-01) loads digital-assistant.js?cid=<cid>&view.mobileMode=detect on
 *   every page but the chat page (there the live-chat block's chat), before any consent choice;
 *   Engagent's rules on the page URL pick what shows.
 */
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

/** Loads the page's site-wide embeds whose site flag is on. */
export default async function loadSiteEmbeds() {
  await Promise.all([liveChat()]);
}
