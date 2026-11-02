/*
 * The language list in the bar (scripts/site-languages.js SUB_SITES header.languages 'bar': SWISS's
 * corporate site and medical services), as www.swiss.com's sub-site header: a button with the globe
 * and the current language's code ("EN", its screen-reader text before it: "language selection;
 * currently:"), opening a list of the other languages below it. One click opens it; a second
 * click, Escape (the focus back on the button) or a click outside closes it. The links go to the
 * other language's homepage until the header knows the page's counterpart (header.js
 * switchTarget sets their href).
 */

let count = 0;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === false || v === null || v === undefined) return;
    if (k === 'className') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  children.flat().forEach((c) => {
    if (c === null || c === undefined || c === '') return;
    node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

/**
 * The bar's language list.
 * @param {{current: string, label: string, links: Array<{lang: string, label: string,
 *   home: string}>, icon: Element|null}} opts the current language, the button's screen-reader
 *   text, the other languages (site-languages.js languageSwitch links), the globe
 * @returns {{root: HTMLElement, button: HTMLButtonElement, anchors: HTMLAnchorElement[],
 *   open: Function, close: Function}}
 */
export default function buildLanguages({
  current, label, links, icon,
}) {
  count += 1;
  const id = `nav-languages-${count}`;
  const anchors = links.map((l) => el('a', {
    href: l.home, lang: l.lang, hreflang: l.lang, className: 'nav-languages-link',
  }, l.label));
  const panel = el('ul', { id, className: 'nav-languages-list', hidden: true }, anchors.map((a) => el('li', {}, a)));
  const button = el(
    'button',
    {
      type: 'button', className: 'nav-tool nav-languages-button', 'aria-expanded': 'false', 'aria-controls': id,
    },
    icon,
    el('span', { className: 'nav-languages-label' }, label),
    el('span', { className: 'nav-languages-current' }, String(current || '').toUpperCase()),
  );
  const root = el('div', { className: 'nav-languages' }, button, panel);
  const close = (focus = false) => {
    button.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    if (focus) button.focus();
  };
  const open = () => {
    button.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
  };
  button.addEventListener('click', () => (panel.hidden ? open() : close()));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) close(true);
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !root.contains(e.target)) close();
  });
  return {
    root, button, anchors, open, close,
  };
}
