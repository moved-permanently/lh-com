/*
 * message-center: the current irregularity and outage messages as collapsible items at the top
 * of the current travel information page (live .messagecenterwrapper > maui-collapsible-item),
 * from the Message Center index (scripts/message-center.js). Each item has the id
 * message-center-item-<id> and opens when the URL hash is #<id> (the flash teaser links there).
 */
import { getLocale } from '../../scripts/locale.js';
import {
  loadIndex, selectMessages, readTypes, ICONS,
} from '../../scripts/message-center.js';

const DEFAULT_TYPES = ['irreg', 'tech-outage'];

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/** The long text of a message: the content of its details page (no metadata). */
async function loadDetails(path) {
  if (!path || !path.startsWith('/')) return null;
  try {
    const resp = await fetch(`${path.replace(/\.(plain\.)?html$/, '')}.plain.html`, { cache: 'no-cache' });
    if (!resp.ok) return null;
    const doc = document.createElement('div');
    doc.innerHTML = await resp.text();
    doc.querySelectorAll('.metadata, .section-metadata').forEach((m) => m.remove());
    // media of the details page are relative to it (./media_…)
    [['img', 'src'], ['source', 'srcset']].forEach(([tag, attr]) => {
      doc.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((node) => {
        node[attr] = new URL(node.getAttribute(attr), new URL(path, window.location)).href;
      });
    });
    const nodes = [...doc.children].flatMap((section) => [...section.childNodes]);
    return nodes.some((n) => n.textContent.trim() || n.querySelector?.('img')) ? nodes : null;
  } catch (e) {
    return null;
  }
}

function openFromHash(block) {
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  if (!id) return;
  const item = block.querySelector(`#${CSS.escape(`message-center-item-${id}`)}`);
  if (!item) return;
  if (item.tagName === 'DETAILS') item.open = true;
  item.scrollIntoView({ block: 'start' });
  item.querySelector('summary, .message-center-title')?.focus({ preventScroll: true });
}

export default async function decorate(block) {
  const locale = getLocale();
  const types = readTypes(block, DEFAULT_TYPES);
  block.textContent = '';
  const rows = await loadIndex();
  const messages = selectMessages(rows, { market: locale.country, lang: locale.lang, types });
  if (!messages.length) {
    block.closest('.message-center-wrapper')?.classList.add('message-center-empty');
    block.dataset.messages = '0';
    return;
  }
  block.dataset.messages = String(messages.length);
  const details = await Promise.all(messages.map((m) => loadDetails(m.details)));
  messages.forEach((msg, i) => {
    const high = msg.criticality === 'high';
    const body = details[i];
    const item = el(body ? 'details' : 'div', `message-center-item${high ? ' is-high' : ''}`);
    item.id = `message-center-item-${msg.id}`;
    item.dataset.type = msg.type;
    const title = el(body ? 'summary' : 'div', 'message-center-title');
    if (high) {
      const icon = el('span', 'message-center-icon');
      icon.innerHTML = ICONS.warning;
      title.append(icon);
    }
    title.append(el('span', 'message-center-headline', msg.headline));
    item.append(title);
    if (body) {
      const panel = el('div', 'message-center-panel');
      panel.append(...body);
      item.append(panel);
    }
    block.append(item);
  });
  openFromHash(block);
  window.addEventListener('hashchange', () => openFromHash(block));
}
