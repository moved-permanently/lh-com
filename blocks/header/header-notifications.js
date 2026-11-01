/*
 * The header's notifications (a brand with notifications in scripts/brands.js: Lufthansa Cargo),
 * as www.lufthansa-cargo.com's bell (2026-11-01): a bell button in the bar opens a panel under the
 * header with "Notifications" and the current notifications (date | time - category, headline,
 * short text, Read more to the overview page), Read all (the overview page; on small screens) and
 * Close. The notifications come from the site's Message Center (scripts/message-center.js
 * loadNotifications), loaded when the panel first opens. Anonymous visitors on www get no unread
 * count (it comes from the signed-in portal), so neither here.
 */
import {
  loadNotifications, selectNotifications, notificationDate, notificationTime, clip,
} from '../../scripts/message-center.js';

// www's texts (its German panel keeps "Read more")
const LABELS = {
  en: {
    title: 'Notifications', more: 'Read more', all: 'Read all', close: 'Close',
  },
  de: {
    title: 'Benachrichtigungen', more: 'Read more', all: 'Alles lesen', close: 'Schließen',
  },
};

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function item(n, lang, labels, page) {
  const li = el('li', 'nav-notifications-item');
  const { date, time } = notificationDate(notificationTime(n), lang);
  // www writes the date in capitals, not the category
  const when = el('p', 'nav-notifications-date');
  when.append(el('span', 'nav-notifications-when', `${date} | ${time}`), n.category ? ` - ${n.category}` : '');
  li.append(when);
  li.append(el('h3', 'nav-notifications-headline', clip(n.headline, 70)));
  if (n.teaser) li.append(el('p', 'nav-notifications-teaser', clip(n.teaser, 190)));
  const more = el('a', 'nav-notifications-more', labels.more);
  more.href = page;
  li.append(more);
  return li;
}

/**
 * The bell button and its panel.
 * @param {{label: string, lang: string, page: string, icon?: Element}} options the tool's label
 *   (the button's name), the page's language, the overview page, the bell icon
 * @returns {{button: HTMLButtonElement, panel: HTMLElement, close: Function}}
 */
export default function buildNotifications({
  label, lang, page, icon = null,
}) {
  const labels = LABELS[lang] || LABELS.en;
  const button = el('button', 'nav-tool nav-tool-notifications');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'nav-notifications');
  button.title = label;
  if (icon) button.append(icon);

  const panel = el('div', 'nav-notifications');
  panel.id = 'nav-notifications';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', labels.title);
  panel.setAttribute('hidden', '');
  const close = el('button', 'nav-notifications-close', labels.close);
  close.type = 'button';
  const list = el('ul', 'nav-notifications-list');
  const all = el('a', 'nav-notifications-all', labels.all);
  all.href = page;
  panel.append(close, el('h2', 'nav-notifications-title', labels.title), list, all);

  let loaded = null;
  const fill = () => {
    if (!loaded) {
      loaded = loadNotifications().then((rows) => {
        const shown = selectNotifications(rows, { lang });
        list.replaceChildren(...shown.map((n) => item(n, lang, labels, page)));
      });
    }
    return loaded;
  };
  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    panel.toggleAttribute('hidden', !open);
    if (open) fill();
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  // the list starts loading as soon as the visitor points at the bell
  button.addEventListener('pointerenter', fill, { once: true });
  button.addEventListener('focus', fill, { once: true });
  close.addEventListener('click', () => {
    setOpen(false);
    button.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || panel.hasAttribute('hidden')) return;
    setOpen(false);
    button.focus();
  });
  return { button, panel, close: () => setOpen(false) };
}
