/*
 * Stage promotions: the homepage stage shows the one promotion of the locale that is active now.
 * The promotions live in one document per locale (/{cc}/{ll}/fragments/stage-promotions), one
 * section per promotion with a Section Metadata table holding Start and End; the homepage only
 * links that document. The choice happens in the browser at every page view, so a campaign starts
 * and ends at its time without anyone editing or publishing the homepage. See README.md.
 */
// eslint-disable-next-line import/no-cycle
import { decorateMain } from '../../scripts/scripts.js';
import { loadSections, readBlockConfig } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';

/** The time zone a Start or End without an offset is read in, per market. */
const TIME_ZONES = {
  de: 'Europe/Berlin',
  at: 'Europe/Vienna',
  gb: 'Europe/London',
};
const DEFAULT_PATH = 'fragments/stage-promotions';
// hosts where ?stage-time=... may simulate another moment (never on the live site)
const PREVIEW_HOST = /(^localhost$)|(\.aem\.page$)|(\.da\.(live|page)$)/;

/** Offset of a time zone at an instant, in ms (wall time in that zone minus UTC). */
function zoneOffset(ts, timeZone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(ts)).map((p) => [p.type, Number(p.value)]));
  const { year, month, day } = parts;
  return Date.UTC(year, month - 1, day, parts.hour, parts.minute, parts.second) - ts;
}

/**
 * Parses an authored Start or End: "2026-11-27", "2026-11-27 18:00", "2026-11-27T18:00:00+01:00",
 * "27.11.2026" or "27.11.2026 18:00". Without an offset the time is the market's local time. A
 * date without a time is the start of that day for Start and the end of that day for End.
 * @returns {number|null} ms since the epoch; null when empty; NaN when unreadable
 */
export function parseStageTime(value, timeZone, isEnd = false) {
  const text = String(value || '').trim();
  if (!text) return null;
  let m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i);
  if (!m) {
    const de = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (de) m = [de[0], de[3], de[2], de[1], de[4], de[5], de[6], undefined];
  }
  if (!m) return NaN;
  const [, y, mo, d, h, mi, s, offset] = m;
  const dateOnly = h === undefined;
  const day = Number(d) + (dateOnly && isEnd ? 1 : 0);
  const [hh, mm, ss] = [h, mi, s].map((v) => Number(v || 0));
  const wall = Date.UTC(Number(y), Number(mo) - 1, day, hh, mm, ss);
  if (offset) {
    if (/^z$/i.test(offset)) return wall;
    const [, sign, oh, om] = offset.match(/([+-])(\d{2}):?(\d{2})/);
    return wall - (sign === '-' ? -1 : 1) * (Number(oh) * 60 + Number(om)) * 60000;
  }
  // wall time in the zone: correct the guess twice (enough across a DST change)
  let ts = wall - zoneOffset(wall, timeZone);
  ts = wall - zoneOffset(ts, timeZone);
  return ts;
}

/**
 * Picks the active promotion: Start <= now < End (an empty Start or End is open). Of several
 * active ones the one that started last wins; on a tie the earlier one in the document.
 * @param {{start: number|null, end: number|null}[]} promotions
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

function currentTime() {
  if (PREVIEW_HOST.test(window.location.hostname)) {
    const simulated = new URLSearchParams(window.location.search).get('stage-time');
    if (simulated) {
      const ts = parseStageTime(simulated, TIME_ZONES[getLocale().country] || TIME_ZONES.de);
      if (Number.isFinite(ts)) return ts;
    }
  }
  return Date.now();
}

export default async function decorate(block) {
  const locale = getLocale();
  const timeZone = TIME_ZONES[locale.country] || TIME_ZONES.de;
  const link = block.querySelector('a');
  let path = link ? new URL(link.href, window.location).pathname : `${locale.base}/${DEFAULT_PATH}`;
  // the local dev server serves the documents under /content/
  if (locale.base.startsWith('/content/') && !path.startsWith('/content/')) path = `/content${path}`;
  const host = block.closest('.section');
  block.textContent = '';

  const resp = await fetch(`${path.replace(/\.(plain\.)?html$/, '')}.plain.html`).catch(() => null);
  if (!resp || !resp.ok) {
    if (host) host.dataset.stagePromotion = 'none';
    block.closest('.stage-promotions-wrapper')?.remove();
    return;
  }
  const main = document.createElement('main');
  main.innerHTML = await resp.text();
  const sections = [...main.querySelectorAll(':scope > div')];
  const promotions = sections.map((section) => {
    // the Edge Delivery pipeline turns Section Metadata into data attributes of the section
    // (data-promotion, data-start, data-end); the local dev server keeps the table
    const meta = section.querySelector(':scope > .section-metadata');
    const config = meta ? readBlockConfig(meta) : { ...section.dataset };
    return {
      section,
      name: config.promotion || config.name || '',
      start: parseStageTime(config.start, timeZone),
      end: parseStageTime(config.end, timeZone, true),
    };
  });
  const index = pickActive(promotions, currentTime());
  if (index < 0) {
    if (host) host.dataset.stagePromotion = 'none';
    block.closest('.stage-promotions-wrapper')?.remove();
    return;
  }

  // only the active promotion is decorated, so the others load no images
  sections.forEach((s, i) => { if (i !== index) s.remove(); });
  // media of the document are relative to it (./media_…), as in fragment.js
  [['img', 'src'], ['source', 'srcset']].forEach(([tag, attr]) => {
    main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
      elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
    });
  });
  decorateMain(main);
  await loadSections(main);
  const chosen = main.querySelector(':scope > .section');
  if (!chosen) return;
  if (host) {
    host.dataset.stagePromotion = promotions[index].name || String(index + 1);
    [...chosen.classList].filter((c) => c !== 'section').forEach((c) => host.classList.add(c));
  }
  block.closest('.stage-promotions-wrapper').replaceWith(...chosen.childNodes);
}
