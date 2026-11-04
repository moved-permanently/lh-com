/*
 * How far the booking box comes up over the stage above it (booking-box.js placeOverHero), as
 * www.flytap.com: the card's bottom 18 px above the stage's bottom (www at 1440: a 204 px card,
 * 222 px of overlap), the tab bar above it kept 16 px below anything of the stage in its own
 * width (the stage's dots, CTA or buttons; www's previous / dots / next and pause sit level
 * with the tab bar, beside it). Without a tab bar the card's width counts. Pure: rectangles in,
 * pixels out.
 */

/** The card's bottom this far above the stage's bottom. */
export const CARD_MARGIN = 18;

/** The tab bar this far below the lowest of the stage's parts in its way. */
export const CLEARANCE = 16;

/**
 * @param {{hero: DOMRect, card: DOMRect, tabs: DOMRect|null, top: number, blockers: DOMRect[]}} o
 *   the stage, the card, the tab bar (or none), the box's top, the stage's dots, CTA and buttons;
 *   all measured with the box in its own place (no pull)
 * @returns {number} the pull in px (the section's negative top margin), 0 for none
 */
export function overHeroPull({
  hero, card, tabs, top, blockers = [],
}) {
  if (!hero || !card || !hero.height || !card.height) return 0;
  const range = tabs && tabs.width ? tabs : card;
  const inTheWay = blockers
    .filter((r) => r.height && r.right > range.left && r.left < range.right)
    .filter((r) => r.bottom > hero.top && r.top < hero.bottom);
  const above = card.top - top;
  const lowest = Math.max(...inTheWay.map((r) => r.bottom));
  const free = inTheWay.length ? hero.bottom - lowest - CLEARANCE - above : Infinity;
  const overlap = Math.min(card.height + CARD_MARGIN, free);
  const pull = card.top - (hero.bottom - overlap);
  return overlap > 0 && pull > 0 ? Math.round(pull) : 0;
}
