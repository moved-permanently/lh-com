import { cleanText, toConfigKey, decorateExternalLinks } from '../../scripts/block-config.js';

/**
 * Expanding image panes (Lufthansa .herobanner .dcep-hero-banner): full-bleed panes side by
 * side from 768px (stacked below); the active pane is wide and shows its headline, text and
 * button, the others show their tab label only. Clicking a pane (or its tab button, or
 * hovering it with a mouse) makes it the active one.
 *
 * Rows: one per pane, cells in any order: an image, a heading for the tab label (the first
 * heading when there are two or more), a heading for the headline (the next one), paragraphs,
 * a link (the button). A pane without its own label uses its headline as the label.
 * Config row "Overlay | #6F625A": the colour multiplied onto the images.
 */

let instanceCount = 0;

const HEADING = /^H[1-6]$/;
const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i;

/**
 * Reads one pane row.
 * @param {Element} row
 * @returns {{picture: Element|null, label: Element|null, headline: Element|null,
 *   texts: Element[], link: HTMLAnchorElement|null}|null}
 */
function readPane(row) {
  const picture = row.querySelector('picture') || row.querySelector('img');
  const links = [...row.querySelectorAll('a[href]')];
  const link = links[links.length - 1] || null;
  const headings = [...row.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter((h) => cleanText(h));
  const label = headings.length > 1 ? headings[0] : null;
  const headline = headings.length > 1 ? headings[1] : headings[0] || null;
  const texts = [];
  [...row.children].forEach((cell) => {
    [...cell.children].forEach((el) => {
      if (HEADING.test(el.tagName) || !cleanText(el)) return;
      if (link && el.contains(link) && cleanText(el) === cleanText(link)) return;
      if (el.querySelector('picture, img') && !cleanText(el)) return;
      texts.push(el);
    });
    // a cell authored as plain text (no paragraphs)
    if (!cell.children.length && cleanText(cell)) {
      const p = document.createElement('p');
      p.textContent = cleanText(cell);
      texts.push(p);
    }
  });
  if (!picture && !headline && !texts.length && !link) return null;
  return {
    picture, label, headline, texts, link,
  };
}

/**
 * Keeps the full-bleed banner at the layout width (no horizontal overflow under a classic
 * scrollbar, whether or not the browser's 100vw includes it).
 * @param {Element} block
 */
function trackViewport(block) {
  const update = () => {
    block.style.setProperty('--hero-banner-viewport', `${document.documentElement.clientWidth}px`);
  };
  update();
  window.addEventListener('resize', update, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(document.body);
}

export default function decorate(block) {
  instanceCount += 1;
  const id = `hero-banner-${instanceCount}`;
  const panes = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    // config row: "Overlay | #6F625A"
    if (cells.length >= 2 && !row.querySelector('picture, img, a[href], h1, h2, h3, h4, h5, h6')
      && /^overlay(-colou?r)?$/.test(toConfigKey(cleanText(cells[0])))) {
      const value = cleanText(cells[1]);
      if (COLOR.test(value)) block.style.setProperty('--hero-banner-overlay', value);
      return;
    }
    const pane = readPane(row);
    if (pane) panes.push(pane);
  });

  const container = document.createElement('div');
  container.className = 'hero-banner-panes';

  const items = panes.map((pane, i) => {
    const item = document.createElement('div');
    item.className = 'hero-banner-pane';

    const media = document.createElement('div');
    media.className = 'hero-banner-media';
    if (pane.picture) {
      media.append(pane.picture);
      const img = pane.picture.tagName === 'IMG' ? pane.picture : pane.picture.querySelector('img');
      if (img && i === 0) img.loading = 'eager';
    }
    item.append(media);

    const labelText = cleanText(pane.label || pane.headline) || `${i + 1}`;
    const tab = document.createElement(pane.label ? pane.label.tagName.toLowerCase() : 'h2');
    tab.className = 'hero-banner-tab';
    const button = document.createElement('button');
    button.type = 'button';
    button.id = `${id}-tab-${i}`;
    button.setAttribute('aria-controls', `${id}-panel-${i}`);
    button.textContent = labelText;
    tab.append(button);

    const content = document.createElement('div');
    content.className = 'hero-banner-content';
    content.id = `${id}-panel-${i}`;
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', button.id);
    if (pane.headline) {
      pane.headline.classList.add('hero-banner-headline');
      content.append(pane.headline);
    }
    pane.texts.forEach((el) => {
      el.classList.add('hero-banner-text');
      content.append(el);
    });
    if (pane.link) {
      const a = document.createElement('a');
      a.href = pane.link.href;
      if (pane.link.target) a.target = pane.link.target;
      a.className = 'button secondary hero-banner-button';
      a.textContent = cleanText(pane.link);
      const p = document.createElement('p');
      p.className = 'hero-banner-cta';
      p.append(a);
      content.append(p);
    }

    item.append(content, tab);
    container.append(item);
    return { item, button };
  });

  const activate = (index) => {
    items.forEach(({ item, button }, i) => {
      const active = i === index;
      item.classList.toggle('hero-banner-pane-active', active);
      button.setAttribute('aria-expanded', String(active));
    });
  };

  items.forEach(({ item, button }, i) => {
    button.addEventListener('click', () => activate(i));
    // the whole pane is clickable (cursor: pointer from 768px), except its links
    item.addEventListener('click', (e) => {
      if (!e.target.closest('a')) activate(i);
    });
    item.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) activate(i);
    });
  });
  if (items.length) activate(0);

  decorateExternalLinks(container);
  block.replaceChildren(container);
  trackViewport(block);
}
