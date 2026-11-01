/*
 * notifications: the notification overview of a brand's Message Center (Lufthansa Cargo's
 * /<ll>/notification-overview, as www.lufthansa-cargo.com showed it, 2026-11-01): "Filter by
 * category" (All categories and the categories of the current notifications), then per
 * notification "16 Sep 26, 11:07 | Services & Support", its headline and its full text (the
 * details page, else its teaser), collapsed with Read more. The notifications of the site's tenant
 * in the page's language (scripts/message-center.js). Without any: the block's authored text.
 * Each item has the id notification-<id> and opens when the URL hash is #<id>.
 */
import {
  messageLocale, loadNotifications, selectNotifications, notificationCategories, notificationDate,
  notificationTime, loadDetails,
} from '../../scripts/message-center.js';

// www's texts (its filter is English in both languages)
const LABELS = {
  en: { filter: 'Filter by category', all: 'All categories', more: 'Read more' },
  de: { filter: 'Filter by category', all: 'All categories', more: 'Lesen Sie mehr' },
};

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function buildFilter(categories, labels, onChange) {
  const wrap = el('div', 'notifications-filter');
  const label = el('label', '', labels.filter);
  label.setAttribute('for', 'notifications-category');
  const select = el('select');
  select.id = 'notifications-category';
  const all = el('option', '', labels.all);
  all.value = '';
  select.append(all, ...categories.map((c) => {
    const option = el('option', '', c);
    option.value = c;
    return option;
  }));
  select.addEventListener('change', () => onChange(select.value));
  wrap.append(label, select);
  return wrap;
}

function buildItem(n, body, lang, labels) {
  const li = el('li', 'notifications-item');
  li.id = `notification-${n.id}`;
  li.dataset.category = n.category;
  const { date, time } = notificationDate(notificationTime(n), lang);
  // www writes the date in capitals, not the category
  const when = el('p', 'notifications-date');
  when.append(el('span', 'notifications-when', `${date}, ${time}`), n.category ? ` | ${n.category}` : '');
  li.append(when);
  li.append(el('h2', 'notifications-headline', n.headline));
  const detail = el('div', 'notifications-detail');
  detail.id = `notification-${n.id}-text`;
  if (body) detail.append(...body);
  else if (n.teaser) detail.append(el('p', '', n.teaser));
  if (detail.childNodes.length) li.append(detail);
  if (body) {
    const more = el('button', 'notifications-more', labels.more);
    more.type = 'button';
    more.setAttribute('aria-expanded', 'false');
    more.setAttribute('aria-controls', detail.id);
    more.addEventListener('click', () => {
      const open = !li.classList.contains('is-open');
      li.classList.toggle('is-open', open);
      more.setAttribute('aria-expanded', String(open));
    });
    li.append(more);
  }
  return li;
}

function openFromHash(block) {
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  if (!id) return;
  const item = block.querySelector(`#${CSS.escape(`notification-${id}`)}`);
  if (!item) return;
  const more = item.querySelector('.notifications-more');
  if (more && more.getAttribute('aria-expanded') !== 'true') more.click();
  item.scrollIntoView({ block: 'start' });
}

/** @param {Element} block */
export default async function decorate(block) {
  const { lang } = messageLocale();
  const labels = LABELS[lang] || LABELS.en;
  const authored = [...block.children]
    .flatMap((row) => [...row.children].flatMap((c) => [...c.childNodes]));
  const list = selectNotifications(await loadNotifications(), { lang });
  block.textContent = '';
  if (!list.length) {
    // nothing current: the block's authored text (e.g. "There are no notifications at the moment.")
    block.append(...authored);
    block.dataset.notifications = '0';
    return;
  }
  block.dataset.notifications = String(list.length);
  const bodies = await Promise.all(list.map((n) => loadDetails(n.details)));
  const items = list.map((n, i) => buildItem(n, bodies[i], lang, labels));
  const ul = el('ul', 'notifications-list');
  ul.append(...items);
  const filter = buildFilter(notificationCategories(list), labels, (category) => {
    items.forEach((li) => li.toggleAttribute('hidden', Boolean(category) && li.dataset.category !== category));
  });
  block.append(filter, ul);
  if (typeof CSS !== 'undefined' && CSS.escape) {
    openFromHash(block);
    window.addEventListener('hashchange', () => openFromHash(block));
  }
}
