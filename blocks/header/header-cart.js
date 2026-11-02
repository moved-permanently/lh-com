/*
 * The header's shopping cart as www.swiss.com's (brief 264): the cart icon is a button that opens a
 * dialog. A visitor without a shop session (all the replica can show) gets www's empty cart: its
 * title, its text and its link to the offers ("Your cart is empty", "Explore all offers"). The nav
 * document's cart item carries them in a sub-list (title, text, link); a cart item without one
 * stays the link it was (blocks/header/header.js).
 */
import { uiIcon } from '../../scripts/lh-icons.js';

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/**
 * A nav sub-list's items: their text and link ({text, href}; href null for a text).
 * @param {Element|null} list the cart item's sub-list
 * @returns {Array<{text: string, href: string|null}>}
 */
export function cartItems(list) {
  if (!list) return [];
  return [...list.children].map((li) => {
    const a = li.querySelector('a[href]');
    return { text: li.textContent.replace(/\s+/g, ' ').trim(), href: a ? a.getAttribute('href') : null };
  }).filter((item) => item.text);
}

/**
 * The cart button and its dialog.
 * @param {{label: string, items: Array, close: string, icon?: Element}} options the tool's label
 *   (the button's name), the dialog's items (the first text its title, the other texts its copy,
 *   a link its call to action), the close button's label, the cart icon
 * @returns {{button: HTMLButtonElement, dialog: HTMLDialogElement, bind: Function}}
 */
export default function buildCart({
  label, items, close, icon = null,
}) {
  const texts = items.filter((i) => !i.href);
  const link = items.find((i) => i.href);
  const titleId = 'nav-cart-title';
  const dialog = el('dialog', 'nav-cart');
  dialog.setAttribute('aria-labelledby', titleId);
  const head = el('div', 'nav-cart-head');
  const title = el('h2', '', texts[0] ? texts[0].text : label);
  title.id = titleId;
  const closeButton = el('button', 'nav-cart-close');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', close);
  closeButton.append(uiIcon('close'));
  closeButton.addEventListener('click', () => dialog.close());
  head.append(title, closeButton);
  dialog.append(head);
  texts.slice(1).forEach((t) => dialog.append(el('p', 'nav-cart-text', t.text)));
  if (link) {
    const a = el('a', 'nav-cart-link button secondary', link.text);
    a.href = link.href;
    dialog.append(a);
  }
  // a click on the backdrop closes it, as the locale dialog
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  const bind = (trigger) => {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', () => { if (!dialog.open) dialog.showModal(); });
  };
  const button = el('button', 'nav-tool nav-tool-cart');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.title = label;
  if (icon) button.append(icon);
  bind(button);
  return { button, dialog, bind };
}
