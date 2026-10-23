/* eslint-disable */
/* global WebImporter */

/**
 * Parser for car-rental: the Meili car rental search of the Lufthansa partner pages
 * (`.meilicarrental > .dcep-meili-car-rental`): /{cc}/{ll}/{sixt,hertz,europcar} and
 * /{de/de,at/de}/mietwagenangebote, /{de/en,gb/en}/lh-rentalcar.
 *
 * Everything rendered inside `.meilicarrental` is Meili's app of the capture day (the
 * "Meili Suche" / "Search" h1, the promo heading, texts and banner, "[ ]" / "[x]", the field
 * texts, the capture-day dates, the disclaimer, the feature list, the partner texts): none of it
 * is authored content, so it is all dropped. The block mounts the same app at run time
 * (blocks/car-rental README).
 *
 * Output: `car-rental` with `Partner ID | {data-dcep ptid}` and `Fallback link | <a>` to the
 * live page of the same path (marked data-live-link, so the cleanup keeps it on
 * www.lufthansa.com); `Script | {meiliUrl}` only when it differs from the default loader.
 */
const DEFAULT_SCRIPT = 'https://direct-ux.meili.travel/index.js';

export default function parse(element, { document, params, url }) {
  const host = element.matches('.dcep-meili-car-rental') ? element : element.querySelector('.dcep-meili-car-rental');
  let config = {};
  try {
    config = JSON.parse((host && host.getAttribute('data-dcep')) || '{}') || {};
  } catch (e) {
    config = {};
  }
  const ptid = typeof config.ptid === 'string' || typeof config.ptid === 'number' ? String(config.ptid).trim() : '';
  const script = typeof config.meiliUrl === 'string' ? config.meiliUrl.trim() : '';

  const cells = [];
  if (ptid) cells.push(['Partner ID', ptid]);
  if (script && script !== DEFAULT_SCRIPT) cells.push(['Script', script]);

  let pagePath = '';
  try {
    pagePath = new URL((params && params.originalURL) || url).pathname.replace(/\.html?$/, '').replace(/\/$/, '');
  } catch (e) {
    pagePath = '';
  }
  if (pagePath) {
    const live = `https://www.lufthansa.com${pagePath}`;
    const a = document.createElement('a');
    a.setAttribute('href', live);
    a.setAttribute('data-live-link', 'true');
    a.textContent = live;
    cells.push(['Fallback link', a]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'car-rental', cells });
  const outer = element.closest('.meilicarrental') || element;
  outer.replaceWith(block);
}
