/* eslint-disable */
/* global WebImporter */

/**
 * Parser for table-price-months: the "Lowest available fares" chart of the AirCore route pages
 * (`section.best-price-per-month`, blocks/table-price-months README "Import").
 *
 * Table structure (EDS table convention: the first row holds only the block name, written by
 * createBlock; every further row is one row of the table, no header row):
 *   - one data row per month, 4 cells: Year | Month | Date | Price
 *     Year only on `.has-year` columns; Price = `<a href="https://www.lufthansa.com{deep link}">
 *     from 672 €</a>` followed by `<strong>Best price</strong>` on an `.is-best` card; an empty
 *     Price cell for `.bppm-card--empty` (grey month)
 *   - the block's 2-cell label rows (label | value): Heading, Subhead first; Best price label /
 *     Previous label / Next label only when they differ from the block defaults
 * The bar heights (--bppm-anti / --bppm-pct), the templates, the loader and the arrows are not
 * written: the block computes them.
 */
const LIVE = 'https://www.lufthansa.com';

export default function parse(element, { document, params, url }) {
  const section = element.matches('section.best-price-per-month') ? element : element.querySelector('section.best-price-per-month');
  if (!section) return;
  const clean = (s) => String(s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const text = (root, sel) => {
    const n = root && root.querySelector(sel);
    return n ? clean(n.textContent) : '';
  };
  let lang = 'en';
  try {
    const m = new URL((params && params.originalURL) || url).pathname.match(/^\/(?:lhg\/)?[a-z]{2}\/([a-z]{2})\//);
    if (m) lang = m[1];
  } catch (e) { /* default */ }

  const rows = [];
  const heading = text(section, '.bppm-headline');
  const subhead = text(section, '.bppm-subhead');
  if (heading) rows.push(['Heading', heading]);
  if (subhead) rows.push(['Subhead', subhead]);

  const track = section.querySelector('.bppm-track');
  const columns = track ? [...track.children].filter((c) => c.matches('.bppm-column')) : [];
  columns.forEach((col) => {
    const year = col.classList.contains('has-year') ? text(col, '.bppm-year') : '';
    const card = col.querySelector('.bppm-card');
    const month = text(col, '.bppm-month');
    const date = text(col, '.bppm-date');
    let price = '';
    if (card && !card.classList.contains('bppm-card--empty') && card.getAttribute('href')) {
      const a = document.createElement('a');
      const href = card.getAttribute('href');
      a.setAttribute('href', /^https?:/.test(href) ? href : `${LIVE}${href}`);
      a.textContent = clean(`${text(card, '.bppm-from')} ${text(card, '.bppm-price')}`);
      price = [a];
      if (card.classList.contains('is-best')) {
        const badge = text(card, '.bppm-badge-inner, .bppm-badge') || clean(section.getAttribute('data-best-price-label'));
        if (badge) {
          const strong = document.createElement('strong');
          strong.textContent = badge;
          price.push(document.createTextNode(' '), strong);
        }
      }
    }
    if (!month && !date && !price) return;
    rows.push([year, month, date, price]);
  });

  const bestLabel = clean(section.getAttribute('data-best-price-label'));
  if (bestLabel && bestLabel !== (lang === 'de' ? 'Bestpreis' : 'Best price')) rows.push(['Best price label', bestLabel]);
  const arrow = (sel) => {
    const b = section.querySelector(sel);
    return b ? clean(b.getAttribute('aria-label')) : '';
  };
  const prev = arrow('.bppm-arrow-prev');
  const next = arrow('.bppm-arrow-next');
  if (prev && prev !== 'Previous slide') rows.push(['Previous label', prev]);
  if (next && next !== 'Next slide') rows.push(['Next label', next]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-price-months', cells: rows });
  const wrapper = section.closest('.best-price-per-month-wrapper') || section;
  wrapper.replaceWith(block);
}
