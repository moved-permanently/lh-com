import { cleanText } from '../../scripts/block-config.js';

/*
 * Sub-page navigation (live: nav.subpage in .container-subnav on .has-subnav pages): an eyebrow
 * ("More information around this topic"), the title of the parent page and its pages; the
 * current page is bold, without a link. Below 768px the nav follows the content. From 768px it
 * sits at the top right of the content, 25% of the column, its top 20px above the first element
 * after the page title (live .container-subnav { inset: -20px 0 auto auto } on .content-wrapper,
 * which starts with the first component); styles.css keeps the rest of the page to 75%.
 */

const DESKTOP = '(width >= 768px)';
const normalize = (path) => path.replace(/\.html$/, '').replace(/\/$/, '');

let count = 0;

/** The element that follows the page title (its top is the live .content-wrapper top). */
function afterTitle(main, section) {
  const h1 = main.querySelector('h1');
  if (!h1 || section.contains(h1)) return { h1: null, next: null };
  const owner = h1.closest('main > .section');
  const next = h1.nextElementSibling
    || (h1.parentElement && h1.parentElement.nextElementSibling)
    || (owner && owner.nextElementSibling);
  return { h1, next: next && next !== section && !next.contains(section) ? next : null };
}

function place(block) {
  const main = block.closest('main');
  const section = block.closest('main > .section');
  if (!main || !section) return;
  if (!window.matchMedia(DESKTOP).matches) {
    section.style.removeProperty('--subpage-nav-top');
    main.style.removeProperty('min-height');
    return;
  }
  const mainTop = main.getBoundingClientRect().top;
  const { h1, next } = afterTitle(main, section);
  let top = 0;
  if (next) top = next.getBoundingClientRect().top - mainTop - 20;
  else if (h1) top = h1.getBoundingClientRect().bottom - mainTop;
  top = Math.max(0, Math.round(top));
  const value = `${top}px`;
  if (section.style.getPropertyValue('--subpage-nav-top') !== value) {
    section.style.setProperty('--subpage-nav-top', value);
  }
  // the nav is out of the flow: the page is at least as long as the nav
  const min = `${top + block.offsetHeight}px`;
  if (main.style.minHeight !== min) main.style.minHeight = min;
}

export default function decorate(block) {
  count += 1;
  const cell = block.querySelector(':scope > div > div') || block;
  const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  const eyebrow = [...cell.children].find((el) => el.tagName === 'P' && cleanText(el));
  const here = normalize(window.location.pathname);

  const nav = document.createElement('nav');
  nav.className = 'subpage-nav-box';
  if (eyebrow) {
    const p = document.createElement('p');
    p.className = 'subpage-nav-eyebrow';
    p.textContent = cleanText(eyebrow);
    nav.append(p);
  }
  if (heading && cleanText(heading)) {
    const h = document.createElement('h2');
    h.className = 'subpage-nav-title';
    h.id = `subpage-nav-title-${count}`;
    h.textContent = cleanText(heading);
    nav.append(h);
    nav.setAttribute('aria-labelledby', h.id);
  } else {
    nav.setAttribute('aria-label', cleanText(eyebrow) || 'Subpages');
  }

  const list = document.createElement('ul');
  list.className = 'subpage-nav-list';
  cell.querySelectorAll('li').forEach((item) => {
    const label = cleanText(item);
    if (!label) return;
    const li = document.createElement('li');
    const a = item.querySelector('a[href]');
    const current = !a || normalize(new URL(a.href, window.location).pathname) === here;
    if (current) {
      const span = document.createElement('span');
      span.className = 'subpage-nav-current';
      span.setAttribute('aria-current', 'page');
      span.textContent = label;
      li.append(span);
    } else {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = label;
      li.append(link);
    }
    list.append(li);
  });
  nav.append(list);
  block.replaceChildren(nav);

  const main = block.closest('main');
  if (!main) return;
  const update = () => place(block);
  if (window.ResizeObserver) new ResizeObserver(update).observe(main);
  window.matchMedia(DESKTOP).addEventListener('change', update);
  update();
}
