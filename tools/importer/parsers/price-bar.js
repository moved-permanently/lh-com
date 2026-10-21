/* eslint-disable */
/* global WebImporter */

/**
 * Parser for price-bar (Lufthansa Insights ".dcep-sticky-price" destination bar).
 *
 * Output (blocks/price-bar README): 2 columns, label | value config rows:
 *   Title        | ".sticky-price-title"
 *   Destination  | IATA code from the component config (data-dcep destinationCode), else the
 *                  link's BpsDestination parameter, else the page's .dcep-blog-cookie config
 *   Origin       | the link's OriginCode parameter, only when the source sets one
 *   Price label  | maui-price-display[label] (or the component config priceLabel)
 *   Link         | first "Find flights" maui-button-link (the second one is the mobile copy),
 *                  empty query parameters dropped
 * The live price (maui-price-display[price]) is not authored content and is not imported.
 *
 * The component sits at the end of the source DOM; its table is moved to just after the
 * Article Header table (with the section break the sections transformer put before it), so the
 * bar is the page's second section as in the source layout.
 */
export default function parse(element, { document }) {
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
  const clean = (s) => (s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const config = (el) => {
    if (!el) return {};
    try { return JSON.parse(el.getAttribute('data-dcep') || '{}') || {}; } catch (e) { return {}; }
  };
  const iata = (v) => (/^[A-Z]{3}$/.test(clean(v).toUpperCase()) ? clean(v).toUpperCase() : '');

  const root = element.matches('[data-dcep]') ? element : (element.querySelector('[data-dcep]') || element);
  const cfg = config(root);

  const title = visibleText(element.querySelector('.sticky-price-title'));
  const priceDisplay = element.querySelector('maui-price-display');
  const priceLabel = clean(priceDisplay && priceDisplay.getAttribute('label')) || clean(cfg.priceLabel);

  const links = [...element.querySelectorAll('maui-button-link[href], maui-navigation-link[href], a[href]')];
  const linkEl = links.find((l) => !l.closest('.d-md-none, .hidden-lg-up')) || links[0];
  let href = linkEl ? linkEl.getAttribute('href') : '';
  let params = null;
  if (href) {
    try {
      const u = new URL(href, 'https://www.lufthansa.com');
      params = u.searchParams;
      [...u.searchParams.keys()].forEach((k) => { if (!u.searchParams.get(k)) u.searchParams.delete(k); });
      const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');
      href = isAbsolute ? u.href : `${u.pathname}${u.search}${u.hash}`;
    } catch (e) { /* keep the href as authored */ }
  }

  const cookie = config(document.querySelector('.dcep-blog-cookie[data-dcep]'));
  const destination = iata(cfg.destinationCode) || iata(params && params.get('BpsDestination')) || iata(cookie.destinationCode);
  const origin = iata(cfg.originCode) || iata(params && params.get('OriginCode'));

  const cells = [];
  if (title) cells.push(['Title', title]);
  if (destination) cells.push(['Destination', destination]);
  if (origin) cells.push(['Origin', origin]);
  if (priceLabel) cells.push(['Price label', priceLabel]);
  if (href) {
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = visibleText(linkEl) || clean(linkEl.getAttribute('label')) || href;
    cells.push(['Link', a]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'price-bar', cells });

  // --- move next to the article header (second section)
  const headerText = (t) => clean((t.querySelector('tr') || t).textContent).toLowerCase();
  const articleHeader = [...document.querySelectorAll('table')]
    .find((t) => !element.contains(t) && headerText(t) === 'article header');
  let prev = element.previousSibling;
  while (prev && prev.nodeType === 3 && !clean(prev.nodeValue)) prev = prev.previousSibling;
  const sectionBreak = prev && prev.nodeType === 1 && prev.tagName === 'HR' ? prev : null;

  if (articleHeader && articleHeader.parentNode) {
    element.remove();
    if (sectionBreak) {
      articleHeader.after(sectionBreak, block);
    } else {
      articleHeader.after(block);
    }
  } else {
    element.replaceWith(block);
  }
}
