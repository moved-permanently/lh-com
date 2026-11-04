/**
 * The app screen blocks (blocks/app-*): shared parts. They show authors what the Lufthansa app
 * shows for an app screen document (tools/workers/lh-edge/SDUI.md); lh-edge reads the
 * documents' .plain.html for the app itself, so nothing here changes the app's JSON.
 * Each item's tracking label is a small grey caption: authors maintain it, the app doesn't show it.
 */

export const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
};

const keyOf = (k) => String(k || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** A key/value block's rows by key (title, link-text, …): their value cells. */
export function keyValues(block) {
  const out = {};
  [...block.children].forEach((row) => {
    const [k, v] = row.children;
    if (k && v) out[keyOf(k.textContent)] = v;
  });
  return out;
}

export const cellText = (c) => (c ? c.textContent.trim() : '');

/** A cell's link target (its first link), else its text. */
export function cellHref(c) {
  const a = c && c.querySelector('a[href]');
  return a ? a.getAttribute('href') : cellText(c);
}

/** A cell's picture URL as the app gets it: the link around it (the DAM URL), else its src. */
export function cellImage(c) {
  if (!c) return '';
  const a = c.querySelector('a[href]');
  if (a) return a.getAttribute('href');
  const img = c.querySelector('img');
  return img ? img.getAttribute('src') : cellText(c);
}

/** The tracking label's caption (none without a label). */
export function trackingCaption(label) {
  if (!label) return null;
  const p = el('p', 'app-tracking', `Tracking: ${label}`);
  p.title = 'Tracking label (not shown in the app)';
  return p;
}

/**
 * The app's offer box: the picture, the title, the description, the link text as its button.
 * @param {{title, description, textLink, image, alt, href, label}} o
 */
export function offerBox({
  title, description, textLink, image, alt = '', href, label,
}) {
  const box = el('div', 'app-offer-box');
  if (image) {
    const img = el('img', 'app-offer-image');
    img.src = image;
    img.alt = alt;
    img.loading = 'lazy';
    box.append(img);
  }
  const body = el('div', 'app-offer-body');
  if (title) body.append(el('p', 'app-offer-title', title));
  if (description) body.append(el('p', 'app-offer-description', description));
  if (textLink || href) {
    const a = el('a', 'app-offer-button', textLink || href);
    a.href = href || '#';
    body.append(a);
  }
  box.append(body);
  const caption = trackingCaption(label);
  if (caption) box.append(caption);
  return box;
}

/** A screen's path (the index's form): no host, no .sdui / .v2.sdui / .html, no trailing slash. */
export function screenPath(href) {
  let p = String(href || '').trim();
  if (!p) return '';
  try { p = new URL(p, window.location.href).pathname; } catch (e) { /* as it is */ }
  return p.replace(/(\.v2)?\.sdui$|\.html$/, '').replace(/\/+$/, '');
}

/** A category's articles from the app screens' index: newest date first, then order (lh-edge). */
export function articlesOf(rows, category) {
  const cat = screenPath(category);
  return rows.filter((r) => cat && screenPath(r.category) === cat && r.path !== cat)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))
      || (Number(a.order) || 0) - (Number(b.order) || 0)
      || String(a.path).localeCompare(String(b.path)));
}

/** The app screens' index (/content/mobile/lh/query-index.json), all its rows. */
export async function loadScreenIndex() {
  const resp = await fetch('/content/mobile/lh/query-index.json?limit=5000');
  if (!resp.ok) return [];
  const json = await resp.json();
  return json.data || [];
}
