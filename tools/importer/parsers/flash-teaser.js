/* eslint-disable */
/* global WebImporter */

/**
 * Parser for flash-teaser: the Message Center strip at the top of the market homepages
 * (`.flashteasercore > .dcep-flash-teaser`, messages in its data-dcep JSON at render time).
 * The messages are not page content: they come from the Message Center index
 * (/message-center/index.json), so the component becomes one `flash-teaser` block
 * (blocks/flash-teaser README: all three types; an optional "Types" row limits them).
 * The strip's own setting comes from www's page (brief 455): www writes the strip's messages into
 * the page on the server; a list with promotions and no irregularity or outage is a promotions
 * strip (www.lufthansa.com/my/en, 2026-10-29 and 2026-11-06: the MYR 450 promo while every other
 * homepage showed the Dubai notice), the block gets "Types | promo". Any other list, or none:
 * the empty block (all three types).
 */
const ALERTS = ['irreg', 'tech-outage'];

function wwwMessages(element) {
  const el = element.querySelector('.dcep-flash-teaser[data-dcep]');
  if (!el) return [];
  try {
    const data = JSON.parse(el.getAttribute('data-dcep'));
    return Array.isArray(data.flashTeaserMessages) ? data.flashTeaserMessages : [];
  } catch (e) {
    return [];
  }
}

export default function parse(element, { document }) {
  const types = wwwMessages(element).map((m) => String((m && m.type) || '').trim().toLowerCase());
  const promotionsOnly = types.length > 0 && types.includes('promo') && !types.some((t) => ALERTS.includes(t));
  const cells = promotionsOnly ? [['Types', 'promo']] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'flash-teaser', cells });
  element.replaceWith(block);
}
