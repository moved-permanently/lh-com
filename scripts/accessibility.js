/*
 * Accessibility settings (a brand with `accessibility` in scripts/brands.js: Air Dolomiti), as
 * www.airdolomiti.it's header "Configura accessibilità" (2026-11-01): a button in the header bar
 * opens a panel with the text size (Dimensione: Normale, Grande, Molto Grande) and Contrasto.
 * www scales its rem-based page (html font-size 67.5 / 72.5 / 77.5 %); our pages are set in px,
 * so the sizes scale the type tokens by the same factors (styles/accessibility.css). The contrast
 * mode darkens www's low-contrast colours. A change applies at once and is kept in localStorage
 * (www keeps none: lost on reload); scripts.js restores it while the body is still hidden, so the
 * page shows at the chosen size (no layout shift). Other brands never load this module.
 */
import { brandEntry } from './locale.js';

export const STORAGE_KEY = 'lh-accessibility';
export const SIZES = ['normal', 'medium', 'large'];
const DEFAULT = { size: 'normal', contrast: false };

// www's texts (its German panel writes a Greek β for ß: here ß)
export const LABELS = {
  it: {
    title: 'Configura accessibilità', size: 'Dimensione', normal: 'Normale', medium: 'Grande', large: 'Molto Grande', contrast: 'Contrasto',
  },
  en: {
    title: 'Configure accessibility', size: 'Dimensions', normal: 'Normal', medium: 'Big', large: 'Very big', contrast: 'Contrast',
  },
  de: {
    title: 'Barrierefreiheit konfigurieren', size: 'Dimension', normal: 'Normal', medium: 'Groß', large: 'Sehr groß', contrast: 'Kontrast',
  },
};

const stylesheet = () => `${window.hlx.codeBasePath}/styles/accessibility.css`;
const defaultLoad = async (href) => (await import('./aem.js')).loadCSS(href);
// localStorage itself can throw (storage blocked)
const localStore = () => {
  try {
    return window.localStorage;
  } catch (e) {
    return null;
  }
};
const isDefault = (choice) => choice.size === DEFAULT.size && choice.contrast === DEFAULT.contrast;

/**
 * The stored choice; anything unreadable is the default.
 * @param {Storage} [storage]
 * @returns {{size: string, contrast: boolean}}
 */
export function readChoice(storage = localStore()) {
  try {
    const stored = JSON.parse(storage.getItem(STORAGE_KEY));
    return {
      size: SIZES.includes(stored.size) ? stored.size : DEFAULT.size,
      contrast: stored.contrast === true,
    };
  } catch (e) {
    return { ...DEFAULT };
  }
}

function storeChoice(choice, storage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch (e) {
    // not kept: the choice holds for this page
  }
}

/**
 * The choice on <html>: data-a11y-size (none for Normale) and the class a11y-contrast.
 * @param {{size: string, contrast: boolean}} choice
 * @param {Element} [root]
 */
export function applyChoice(choice, root = document.documentElement) {
  if (choice.size === DEFAULT.size) root.removeAttribute('data-a11y-size');
  else root.setAttribute('data-a11y-size', choice.size);
  root.classList.toggle('a11y-contrast', choice.contrast);
}

// a choice made anywhere (the bar's panel, Air Dolomiti's phone menu): the other controls follow
export const CHANGE_EVENT = 'lh:accessibility-change';

/**
 * A choice made: merged with the stored one, applied, kept, and announced (CHANGE_EVENT).
 * @param {{size?: string, contrast?: boolean}} next
 * @param {Storage} [storage]
 * @returns {{size: string, contrast: boolean}}
 */
export function chooseAccessibility(next, storage = localStore()) {
  const choice = { ...readChoice(storage), ...next };
  applyChoice(choice);
  storeChoice(choice, storage);
  // (the document's own window's CustomEvent: the one its dispatchEvent takes)
  const Custom = (document.defaultView && document.defaultView.CustomEvent) || CustomEvent;
  document.dispatchEvent(new Custom(CHANGE_EVENT, { detail: choice }));
  return choice;
}

/**
 * The stored choice applied before the page shows (scripts.js loadEager), its stylesheet awaited.
 * @param {Object|null} [brand] the page's brand entry
 * @param {{storage?: Storage, loadStyles?: Function}} [options]
 * @returns {Promise<{size: string, contrast: boolean}|null>} the choice, null on a brand without
 *   the settings
 */
export async function restoreAccessibility(brand = brandEntry(), {
  storage = localStore(), loadStyles = defaultLoad,
} = {}) {
  if (!brand || !brand.accessibility) return null;
  const choice = readChoice(storage);
  if (isDefault(choice)) return choice;
  applyChoice(choice);
  try {
    await loadStyles(stylesheet());
  } catch (e) {
    // no stylesheet: the page as without a choice
  }
  return choice;
}

let instances = 0;
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  children.filter(Boolean).forEach((c) => node.append(c));
  return node;
};

/**
 * The header's button and panel. The panel follows the button (Tab from the button goes into it,
 * as on www); the size radios are one group (arrow keys), the contrast a switch; Escape or a click
 * elsewhere closes the panel (Escape returns focus to the button).
 * @param {{lang: string, icon?: Element, storage?: Storage, loadStyles?: Function}} options
 * @returns {{root: HTMLElement, button: HTMLButtonElement, panel: HTMLElement, close: Function,
 *   styles: Promise}}
 */
export function buildAccessibility({
  lang, icon = null, storage = localStore(), loadStyles = defaultLoad,
}) {
  const labels = LABELS[lang] || LABELS.en;
  instances += 1;
  const id = `nav-accessibility${instances > 1 ? `-${instances}` : ''}`;
  const styles = Promise.resolve(loadStyles(stylesheet())).catch(() => {});
  let choice = readChoice(storage);

  const button = el('button', {
    type: 'button', className: 'nav-tool nav-tool-a11y-settings', 'aria-label': labels.title, 'aria-expanded': 'false', 'aria-controls': id, title: labels.title,
  }, icon);
  const panel = el('div', {
    id, className: 'nav-accessibility', role: 'group', 'aria-label': labels.title, hidden: '',
  });
  const sizes = el('fieldset', { className: 'nav-accessibility-sizes' }, el('legend', { text: labels.size }));
  SIZES.forEach((size) => {
    const input = el('input', {
      type: 'radio', name: `${id}-size`, id: `${id}-size-${size}`, value: size,
    });
    input.checked = choice.size === size;
    sizes.append(el(
      'div',
      { className: 'nav-accessibility-size', 'data-size': size },
      input,
      el('label', { for: input.id, text: labels[size] }),
    ));
  });
  const contrast = el('input', {
    type: 'checkbox', role: 'switch', id: `${id}-contrast`, className: 'nav-accessibility-switch',
  });
  contrast.checked = choice.contrast;
  // the switch: the checkbox (transparent, over the track: it takes the clicks and the focus) and
  // the track drawn after it
  panel.append(sizes, el(
    'div',
    { className: 'nav-accessibility-contrast' },
    el('label', { for: contrast.id, text: labels.contrast }),
    el(
      'span',
      { className: 'nav-accessibility-toggle' },
      contrast,
      el('span', { className: 'nav-accessibility-track', 'aria-hidden': 'true' }),
    ),
  ));

  const update = (next) => {
    choice = chooseAccessibility({ ...choice, ...next }, storage);
  };
  // a choice made elsewhere (the phone menu): the panel shows it
  document.addEventListener(CHANGE_EVENT, (e) => {
    choice = e.detail;
    sizes.querySelectorAll('input').forEach((input) => { input.checked = input.value === choice.size; });
    contrast.checked = choice.contrast;
  });
  sizes.addEventListener('change', (e) => {
    if (e.target.checked && SIZES.includes(e.target.value)) update({ size: e.target.value });
  });
  contrast.addEventListener('change', () => update({ contrast: contrast.checked }));

  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  };
  const root = el('div', { className: 'nav-accessibility-wrapper' }, button, panel);
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || panel.hidden) return;
    setOpen(false);
    button.focus();
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !root.contains(e.target)) setOpen(false);
  });
  return {
    root, button, panel, close: () => setOpen(false), styles,
  };
}
