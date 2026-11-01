/*
 * message-center: the current irregularity and outage messages as collapsible items at the top
 * of the current travel information page (live .messagecenterwrapper > maui-collapsible-item),
 * from the Message Center index (scripts/message-center.js). Each item has the id
 * message-center-item-<id> and opens when the URL hash is #<id> (the flash teaser links there).
 */
import {
  messageLocale, loadIndex, selectMessages, readTypes, ICONS, loadDetails,
} from '../../scripts/message-center.js';

const DEFAULT_TYPES = ['irreg', 'tech-outage'];

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

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
  // lh-com and the sites with roots: getLocale(); the sites without: the page's language
  const locale = messageLocale();
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
