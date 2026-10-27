/*
 * Stage promotions: the homepage stage shows the one promotion of the locale that is active now.
 * The promotions live in one document per locale (/{cc}/{ll}/fragments/stage-promotions), one
 * section per promotion with a Section Metadata table holding Start and End; the homepage only
 * links that document. The choice happens in the browser at every page view, so a campaign starts
 * and ends at its time without anyone editing or publishing the homepage. See README.md; the
 * time comes from scripts/clock.js (time travel on preview hosts).
 */
// eslint-disable-next-line import/no-cycle
import { decorateMain } from '../../scripts/scripts.js';
import { loadSections, readBlockConfig } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import { now, MARKET_TIME_ZONES, DEFAULT_TIME_ZONE } from '../../scripts/clock.js';
import { parseStageTime, pickActive } from './schedule.js';

export { parseStageTime, pickActive };

const DEFAULT_PATH = 'fragments/stage-promotions';

export default async function decorate(block) {
  const locale = getLocale();
  const timeZone = MARKET_TIME_ZONES[locale.country] || DEFAULT_TIME_ZONE;
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
  // the page's clock: the real time, or the time travelled to on a preview host (?time-travel=)
  const index = pickActive(promotions, now());
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
