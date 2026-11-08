/*
 * columns-media on brand tap (TAP Air Portugal): the homepage's Miles&Go cards (option stack) as
 * www.flytap.com pins them (brief 480, tools/reports/tap/parity.md row 115). From 1280 px www holds
 * every card but the last in a GSAP pin of 1000 px of scroll, the next card sliding over the one
 * before, and the last card follows the pin. Here every row but the last goes into
 * .columns-media-pin, with the step between the cards' starts (1000 px over the steps); the pin
 * itself is styles/themes/tap.css (sticky cards in a box of 580 + 1000 px). Loaded by
 * columns-media.js on brand tap only.
 */

/** www's scroll length of the pin (its pin-spacer's padding) and a card's height from 1024 px. */
export const PIN_SCROLL = 1000;

/**
 * Wraps every row but the last in the pin (three cards or more: two cards have nothing to pin).
 * @param {Element} block a decorated columns-media stack
 */
export function pinStack(block) {
  const rows = [...block.querySelectorAll(':scope > .columns-media-row')];
  if (rows.length < 3) return;
  // each card's tone by its place (the theme's nth-child(4n + …) before the pin moves them)
  rows.forEach((r, i) => r.classList.add(`columns-media-tone-${(i % 4) + 1}`));
  const pinned = rows.slice(0, -1);
  const pin = document.createElement('div');
  pin.className = 'columns-media-pin';
  pin.style.setProperty('--columns-media-pin-step', `${Math.round(PIN_SCROLL / (pinned.length - 1))}px`);
  rows[0].before(pin);
  pin.append(...pinned);
}
