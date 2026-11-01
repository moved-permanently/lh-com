/*
 * table-striped (matrix): wide comparison tables (the functions table on
 * /migration-status/functions). The first column's cells stay in place while the table scrolls
 * sideways (class table-striped-sticky; the CSS gives them their row's stripe as an opaque
 * background). Every link with a title shows it in a styled tooltip: on hover, on keyboard focus
 * and on a first tap (a second tap on the same link follows it; a tap elsewhere and Escape close
 * it). The title moves into the tooltip so the browser shows no tooltip of its own; a link without
 * text keeps it as its name (aria-label). One tooltip per block, inside the block's scrolling
 * area, kept inside it and inside the viewport.
 */

let instances = 0;
const GAP = 8;

/** Whether a link has a name of its own (text or an image's alt), without its title. */
function hasOwnName(a) {
  if (a.getAttribute('aria-label') || a.textContent.trim()) return true;
  return [...a.querySelectorAll('img[alt]')].some((img) => img.getAttribute('alt').trim());
}

/**
 * Places the tooltip next to its link, inside the block's scrolling area and the viewport:
 * below the link, above it when there is no room below, shifted sideways at the edges.
 */
function place(block, tip, link) {
  // its own width up to 28rem or the table area: measured at the area's left edge, then placed
  tip.style.maxWidth = `${Math.min(448, block.clientWidth - 2 * GAP)}px`;
  tip.style.left = `${block.scrollLeft}px`;
  const area = block.getBoundingClientRect();
  const r = link.getBoundingClientRect();
  const box = tip.getBoundingClientRect();
  const view = {
    width: window.innerWidth || area.right,
    height: window.innerHeight || area.bottom,
  };
  // the visible part of the scrolling area, in viewport coordinates
  const visible = {
    left: Math.max(area.left, 0),
    right: Math.min(area.left + block.clientWidth, view.width),
    top: Math.max(area.top, 0),
    bottom: Math.min(area.top + block.clientHeight, view.height),
  };
  let top = r.bottom + GAP;
  let below = true;
  if (top + box.height > visible.bottom && r.top - GAP - box.height >= visible.top) {
    top = r.top - GAP - box.height;
    below = false;
  }
  let left = r.left + r.width / 2 - box.width / 2;
  left = Math.min(left, visible.right - box.width - GAP);
  left = Math.max(left, visible.left + GAP);
  // block coordinates (the tooltip scrolls with the table)
  tip.style.top = `${top - area.top + block.scrollTop}px`;
  tip.style.left = `${left - area.left + block.scrollLeft}px`;
  tip.classList.toggle('table-striped-tooltip-above', !below);
  const arrow = Math.min(Math.max(r.left + r.width / 2 - left, 12), Math.max(box.width - 12, 12));
  tip.style.setProperty('--arrow-x', `${arrow}px`);
}

/** The matrix behaviour on a decorated table-striped block. */
export default function decorateMatrix(block) {
  const table = block.querySelector('table');
  if (!table) return;
  let columns = 1;
  table.querySelectorAll('tr').forEach((tr) => {
    if (tr.firstElementChild) tr.firstElementChild.classList.add('table-striped-sticky');
    columns = Math.max(columns, [...tr.children].reduce((n, c) => n + (c.colSpan || 1), 0));
  });
  // the table's least width (the CSS: the first column 9.5rem or 14rem, every other 7.5rem)
  table.style.setProperty('--matrix-columns', String(columns));

  const links = [...table.querySelectorAll('a[title]')].filter((a) => a.getAttribute('title').trim());
  if (!links.length) return;
  instances += 1;
  const tip = document.createElement('div');
  tip.className = 'table-striped-tooltip';
  tip.id = `table-striped-tooltip-${instances}`;
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  const text = document.createElement('span');
  text.className = 'table-striped-tooltip-text';
  tip.append(text);
  block.append(tip);

  links.forEach((a) => {
    const title = a.getAttribute('title').trim();
    if (!hasOwnName(a)) a.setAttribute('aria-label', title);
    a.dataset.tooltip = title;
    a.removeAttribute('title');
  });

  let current = null;
  let armed = null;
  let pointer = 'mouse';
  // a phone emulates hover when the table scrolls under the finger: hover counts where it exists
  const canHover = () => !(window.matchMedia && window.matchMedia('(hover: none)').matches);
  const hide = () => {
    if (current) current.removeAttribute('aria-describedby');
    current = null;
    tip.hidden = true;
  };
  const show = (a) => {
    if (current && current !== a) current.removeAttribute('aria-describedby');
    current = a;
    text.textContent = a.dataset.tooltip;
    tip.hidden = false;
    a.setAttribute('aria-describedby', tip.id);
    place(block, tip, a);
  };

  links.forEach((a) => {
    a.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch' && canHover()) show(a); });
    a.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'touch' && current === a && document.activeElement !== a) hide();
    });
    a.addEventListener('focusin', () => show(a));
    a.addEventListener('focusout', () => { if (current === a) hide(); });
    a.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current === a) hide(); });
    a.addEventListener('pointerdown', (e) => { pointer = e.pointerType || 'mouse'; });
    // touch: the first tap shows the note, a second tap on the same link follows it
    a.addEventListener('click', (e) => {
      if (pointer !== 'touch' && pointer !== 'pen') return;
      if (armed === a && current === a) {
        armed = null;
        return;
      }
      e.preventDefault();
      armed = a;
      show(a);
    });
  });
  // a tap or click elsewhere closes it (the links' own taps are handled above)
  document.addEventListener('pointerdown', (e) => {
    if (!current) return;
    const own = e.target && e.target.closest && e.target.closest('a[data-tooltip]');
    if (own && links.includes(own)) return;
    armed = null;
    hide();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) hide(); });
  block.addEventListener('scroll', () => { if (current) place(block, tip, current); }, { passive: true });
  window.addEventListener('resize', () => { if (current) place(block, tip, current); });
}
