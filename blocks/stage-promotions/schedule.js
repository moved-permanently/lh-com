/*
 * The stage promotions' schedule (no DOM, so tests can load it): Start and End as the authors
 * write them, and the promotion active at a moment.
 */
import { parseLocalTime } from '../../scripts/clock.js';

/**
 * Parses an authored Start or End (scripts/clock.js parseLocalTime): without an offset the time
 * is the market's local time; a date without a time is the start of that day for Start and the
 * end of that day for End.
 * @returns {number|null} ms since the epoch; null when empty; NaN when unreadable
 */
export const parseStageTime = (value, timeZone, isEnd = false) => parseLocalTime(
  value,
  timeZone,
  isEnd,
);

/**
 * Picks the active promotion: Start <= now < End (an empty Start or End is open). Of several
 * active ones the one that started last wins; on a tie the earlier one in the document.
 * @param {{start: number|null, end: number|null}[]} promotions
 * @param {number} now ms since the epoch (the page's clock)
 * @returns {number} index, or -1
 */
export function pickActive(promotions, now) {
  let best = -1;
  promotions.forEach((p, i) => {
    if (Number.isNaN(p.start) || Number.isNaN(p.end)) return;
    if ((p.start ?? -Infinity) > now || (p.end ?? Infinity) <= now) return;
    if (best < 0 || (p.start ?? -Infinity) > (promotions[best].start ?? -Infinity)) best = i;
  });
  return best;
}
