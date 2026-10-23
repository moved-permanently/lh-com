import { getLocale } from '../../scripts/locale.js';
import {
  toConfigKey, cleanText, resolveLabels, stripZeroWidth,
} from '../../scripts/block-config.js';

/* ---------------------------------------------------------------------------------------------
 * "Lowest available fares" of the AirCore route pages (section.best-price-per-month): twelve
 * month cards, frozen at import as authored rows. Each card links to the AirCore deep link of
 * the month's cheapest date; its height follows the price like the live script sets it
 * (--bppm-anti: 6rem at the cheapest month, 0 at the dearest; --bppm-pct 65 % … 100 % below
 * 768px), the cheapest month(s) carry the "Best price" badge. Slider with arrows from 768px, a
 * list with bars below.
 * ------------------------------------------------------------------------------------------- */

const DEFAULT_LABELS = {
  en: {
    'best price label': 'Best price', 'previous label': 'Previous slide', 'next label': 'Next slide',
  },
  de: {
    'best price label': 'Bestpreis', 'previous label': 'Previous slide', 'next label': 'Next slide',
  },
};
const CONFIG_KEYS = ['heading', 'subhead', ...Object.keys(DEFAULT_LABELS.en).map(toConfigKey)];

/** Live bar scale: anti-height 6rem (60px) … 0, width 65 % … 100 %; empty months 82 %. */
const MAX_ANTI = 60;
const MIN_PCT = 65;
const EMPTY_SHARE = (82 - MIN_PCT) / (100 - MIN_PCT);

let instanceCount = 0;

/** Whole amount of a price text ("672 €", "€ 1,234", "1.234 €") or NaN. */
export function priceValue(text) {
  const match = String(text || '').match(/\d[\d.,\s\u00a0\u202f]*/);
  if (!match) return NaN;
  const digits = match[0].trim().replace(/[.,\s\u00a0\u202f](\d{1,2})$/, '').replace(/\D/g, '');
  return digits ? Number(digits) : NaN;
}

/**
 * Splits the authored rows into options (2 cells, known key) and months
 * (Year | Month | Date | Price link).
 */
export function readMonths(block) {
  const config = {};
  const months = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells.length === 2 ? toConfigKey(cleanText(cells[0])) : '';
    if (CONFIG_KEYS.includes(key)) {
      if (!config[key]) config[key] = { text: cleanText(cells[1]), cell: cells[1] };
      return;
    }
    if (cells.length < 3) return;
    const [yearCell, monthCell, dateCell, priceCell] = cells;
    const link = priceCell && priceCell.querySelector('a[href]');
    // a bold "Best price" after the link marks a best month
    const strong = priceCell && [...priceCell.querySelectorAll('strong, b')]
      .find((s) => !s.closest('a') && cleanText(s));
    const priceText = link ? cleanText(link) : cleanText(priceCell);
    const [, from = '', amount = ''] = priceText.match(/^(\D*?)\s*(\d.*)$/) || [];
    months.push({
      year: cleanText(yearCell).replace(/\u00a0/g, '').trim(),
      month: cleanText(monthCell),
      date: cleanText(dateCell),
      href: link ? link.getAttribute('href') : '',
      from: stripZeroWidth(from).trim(),
      price: stripZeroWidth(amount).trim(),
      value: priceValue(amount),
      best: Boolean(strong),
      badge: strong ? cleanText(strong) : '',
    });
  });
  return { config, months: months.filter((m) => m.month || m.date || m.price) };
}

/** Bar geometry of every month (live script): anti-height (px) and width (%). */
export function barScale(months) {
  const values = months.map((m) => m.value).filter(Number.isFinite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return months.map((m) => {
    let share;
    if (!Number.isFinite(m.value)) share = EMPTY_SHARE;
    else share = max > min ? (m.value - min) / (max - min) : 0;
    return {
      anti: Math.round(MAX_ANTI * (1 - share) * 10) / 10,
      pct: Math.round(MIN_PCT + (100 - MIN_PCT) * share),
    };
  });
}

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined && content !== '') node.append(content);
  return node;
}

function buildColumn(m, bar, best, labels) {
  const column = el('li', `table-price-months-column${m.year ? ' has-year' : ''}`);
  column.setAttribute('style', `--bppm-anti:${bar.anti / 10}rem;--bppm-pct:${bar.pct}%`);
  const year = el('div', 'table-price-months-year', m.year || '\u00a0');
  if (!m.year) year.setAttribute('aria-hidden', 'true');
  const inner = el('div', 'table-price-months-inner');
  const anti = el('div', 'table-price-months-anti');
  anti.setAttribute('aria-hidden', 'true');
  const empty = !m.price || !m.href;
  const card = el(empty ? 'div' : 'a', `table-price-months-card${empty ? ' is-empty' : ''}${best ? ' is-best' : ''}`);
  if (!empty) {
    card.href = m.href;
    card.rel = 'nofollow';
    const group = el('span', 'table-price-months-price-group');
    group.append(el('span', 'table-price-months-from', m.from), el('span', 'table-price-months-price', m.price));
    if (best) {
      const badge = el('span', 'table-price-months-badge');
      badge.append(el('span', 'table-price-months-badge-inner', m.badge || labels['best price label']));
      group.append(badge);
    }
    card.append(group);
  }
  card.append(
    el('span', 'table-price-months-spacer'),
    el('span', 'table-price-months-month', m.month),
    el('span', 'table-price-months-date', m.date),
  );
  inner.append(anti, card);
  column.append(year, inner);
  return column;
}

/**
 * Monthly fare chart from frozen rows.
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const { config, months } = readMonths(block);
  const labels = resolveLabels(DEFAULT_LABELS, config, getLocale().lang);
  const bars = barScale(months);
  const authoredBest = months.some((m) => m.best);
  const values = months.map((m) => m.value).filter(Number.isFinite);
  const min = Math.min(...values);
  const isBest = (m) => (authoredBest ? m.best : m.value === min);

  const parts = [];
  if (config.heading || config.subhead) {
    const header = el('div', 'table-price-months-header');
    if (config.heading) header.append(el('h2', 'table-price-months-headline', config.heading.text));
    if (config.subhead) header.append(el('p', 'table-price-months-subhead', config.subhead.text));
    parts.push(header);
  }

  const slider = el('div', 'table-price-months-slider');
  const track = el('ul', 'table-price-months-track');
  track.id = `table-price-months-${instanceCount}`;
  track.append(...months.map((m, i) => buildColumn(m, bars[i], isBest(m), labels)));
  const arrow = (dir) => {
    const button = el('button', `table-price-months-arrow table-price-months-arrow-${dir}`);
    button.type = 'button';
    button.setAttribute('aria-label', labels[`${dir === 'prev' ? 'previous' : 'next'} label`]);
    button.setAttribute('aria-controls', track.id);
    return button;
  };
  const prev = arrow('prev');
  const next = arrow('next');
  prev.hidden = true;
  slider.append(prev, track, next);
  parts.push(slider);
  block.replaceChildren(...parts);

  // arrows: hidden at the ends (live), one step = the visible width
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.hidden = !(track.scrollLeft > 1);
    next.hidden = !(max > 1 && track.scrollLeft < max - 1);
  };
  const step = (dir) => {
    if (typeof track.scrollBy === 'function') {
      track.scrollBy({ left: dir * Math.max(track.clientWidth - 106, 106), behavior: 'smooth' });
    }
  };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('scroll', update, { passive: true });
  if (typeof window.ResizeObserver === 'function') new window.ResizeObserver(update).observe(track);
  else window.addEventListener('resize', update);
  update();
}
