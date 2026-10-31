/**
 * Inline SVG icons for the header and footer (colour follows currentColor).
 * - authored icons (:wheelchair:, :search:, ...) come from /icons/{name}.svg and are inlined
 * - interface icons (menu, close, arrows) are defined here; they are never authored
 */

const UI_ICONS = {
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="M5 5l14 14M19 5L5 19"/>',
  'arrow-left': '<path d="M20 12H4M10 6l-6 6 6 6"/>',
  'arrow-right': '<path d="M4 12h16M14 6l6 6-6 6"/>',
  'chevron-right': '<path d="M9 5l7 7-7 7"/>',
  'chevron-down': '<path d="M5 9l7 7 7-7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const cache = new Map();

function finish(svg, name) {
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.classList.add('lh-icon', `lh-icon-${name}`);
  return svg;
}

/**
 * An interface icon (stroke drawing, 24x24 viewBox).
 * @param {string} name key of UI_ICONS
 * @returns {SVGElement}
 */
export function uiIcon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.6');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.innerHTML = UI_ICONS[name] || '';
  return finish(svg, name);
}

/**
 * An authored icon from /icons/{name}.svg, inlined so it takes the text colour.
 * Falls back to an empty span when the icon file is missing.
 * @param {string} name icon name
 * @returns {Promise<Element>}
 */
export async function inlineIcon(name) {
  if (!cache.has(name)) {
    cache.set(name, fetch(`${window.hlx.codeBasePath}/icons/${name}.svg`)
      .then((resp) => (resp.ok ? resp.text() : ''))
      .catch(() => ''));
  }
  const text = await cache.get(name);
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const svg = doc.documentElement;
  if (!svg || svg.nodeName.toLowerCase() !== 'svg') {
    const span = document.createElement('span');
    span.className = `lh-icon lh-icon-${name}`;
    return span;
  }
  // fill drawings without their own colour use the text colour
  if (!svg.getAttribute('stroke') && !svg.getAttribute('fill')) svg.setAttribute('fill', 'currentColor');
  return finish(document.importNode(svg, true), name);
}

/**
 * The authored icon name of an element: a decorated span.icon-{name}, or a leading
 * ":name:" text token (undecorated content). The token/span is removed from the element.
 * @param {Element} el element holding the icon
 * @returns {string|null}
 */
export function takeIconName(el) {
  if (!el) return null;
  const span = el.querySelector('span.icon');
  if (span) {
    const cls = [...span.classList].find((c) => c.startsWith('icon-'));
    span.remove();
    if (cls) return cls.substring(5);
  }
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const m = node.nodeValue.match(/^\s*:([a-z0-9-]+):\s*/);
    if (m) {
      node.nodeValue = node.nodeValue.slice(m[0].length);
      return m[1];
    }
    if (node.nodeValue.trim()) break;
  }
  return null;
}

/** Alt texts of the logos and social icons authored as icon links (footer: Lufthansa Cargo). */
const ICON_LABELS = {
  facebook: 'Facebook',
  youtube: 'YouTube',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  x: 'X',
  tiktok: 'TikTok',
  'lufthansa-group': 'Lufthansa Group',
  'iata-cargo-iq': 'IATA Cargo iQ',
};

/**
 * The alt text of an icon link without a text or title: the icon's label, else its name.
 * @param {string} [name] icon name
 * @returns {string}
 */
export function iconLabel(name) {
  if (!name) return '';
  return Object.hasOwn(ICON_LABELS, name) ? ICON_LABELS[name] : name.replace(/-/g, ' ');
}

/**
 * The image of a link: an undecorated ":name:" link text becomes the image of
 * /icons/{name}.svg (data-icon-name: the name; variants: another file for a name).
 * @param {HTMLAnchorElement} a
 * @param {string} codeBasePath
 * @param {Object<string, string>} [variants]
 * @returns {HTMLImageElement|null}
 */
export function iconTokenImage(a, codeBasePath, variants = {}) {
  const token = a.textContent.replace(/\s+/g, ' ').trim().match(/^:([a-z0-9-]+):$/);
  if (token && !a.querySelector('img')) {
    const img = document.createElement('img');
    img.setAttribute('src', `${codeBasePath}/icons/${Object.hasOwn(variants, token[1]) ? variants[token[1]] : token[1]}.svg`);
    img.setAttribute('data-icon-name', token[1]);
    img.setAttribute('alt', '');
    a.textContent = '';
    a.append(img);
  }
  return a.querySelector('img');
}
