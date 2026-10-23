import { cleanText } from '../../scripts/block-config.js';
import { buildEmbed, embedFor, loadMediaStyles } from '../../scripts/media.js';

/**
 * Embed: a YouTube video (youtube-nocookie.com player, 16:9 over the content width) or a
 * Lufthansa in-flight entertainment widget (520px high, at most 1240px wide).
 * Content: one row, one cell with the link (watch, share or embed URL for YouTube; the widget
 * URL with id, type and lang). A link text other than the URL is the player's title.
 * @param {Element} block
 */
export default async function decorate(block) {
  const link = [...block.querySelectorAll('a[href]')].find((a) => embedFor(a.href));
  if (!link) {
    // nothing to embed: keep any authored text, drop the empty table
    if (!cleanText(block)) block.closest('.embed-wrapper')?.remove();
    return;
  }
  const player = buildEmbed(link);
  block.replaceChildren(player);
  await loadMediaStyles();
}
