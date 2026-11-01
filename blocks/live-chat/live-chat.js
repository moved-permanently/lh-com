/*
 * Live Chat: Air Dolomiti's digital assistant (Engagent) on the chat page, behind the site flag
 * live-chat (scripts/embeds.js). The block's content is the page's link to www's chat page; it is
 * all the page shows with the flag off. Flag on: as www.airdolomiti.it's chat page tag
 * (GTM-SH94, hai-bisogno-di-aiuto/live-chat-supporto, 2026-11-01): the plain digital-assistant.js,
 * then, once DA is there, DA.init with the brand's cid and base URL (scripts/brands.js embeds)
 * into the chat container, mobile mode enabled; the chat is shown 200 ms after the player is
 * ready (www's onReady) and replaces the link once the player has content (on a host its rules
 * don't know Engagent gets ready and renders nothing). Opening hours and the out-of-hours message
 * are Engagent's. A script that fails to load or a player that never renders leaves the link.
 */
import {
  embedWanted, loadEmbedScript, splitEmbedBlock, waitFor,
} from '../../scripts/embeds.js';

async function mountChat(block, fallback, config) {
  const frame = document.createElement('div');
  frame.className = 'live-chat-frame';
  frame.setAttribute('hidden', '');
  const player = document.createElement('div');
  player.id = config.htmlId;
  frame.append(player);
  block.append(frame);
  try {
    await loadEmbedScript(config.script);
  } catch (e) {
    frame.remove();
    return;
  }
  const da = await waitFor(() => window.DA);
  if (!da) {
    frame.remove();
    return;
  }
  da.init({
    cid: config.cid,
    baseUrl: config.baseUrl,
    view: { mobileMode: 'enabled', htmlId: config.htmlId, adaptiveParentScroll: false },
    hooks: {
      onReady() {
        const show = () => {
          frame.removeAttribute('hidden');
          fallback.setAttribute('hidden', '');
        };
        setTimeout(() => {
          // Engagent also gets ready on a host its rules don't know, and renders nothing there:
          // the chat replaces the link only once the player has content
          if (player.children.length) {
            show();
            return;
          }
          const observer = new MutationObserver(() => {
            if (!player.children.length) return;
            observer.disconnect();
            show();
          });
          observer.observe(player, { childList: true });
        }, 200);
      },
    },
  });
}

/** @param {Element} block */
export default function decorate(block) {
  const { fallback } = splitEmbedBlock(block, 'live-chat');
  // the flag is read after the block shows its link: the page never waits for it
  embedWanted('live-chat').then((config) => {
    if (config) mountChat(block, fallback, config);
  });
}
