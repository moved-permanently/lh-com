import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import {
  getLocale, LOCALE_TABLE, getCounterpartPath, getHomepageUrl,
  isMigratedLocale, portalOf, ownRoots, siteLocales, siteOrigin, brandEntry,
} from '../../scripts/locale.js';
import { messageLocale, notificationsPage } from '../../scripts/message-center.js';
import { languageSwitch, switchTarget, switchAlternates } from '../../scripts/site-languages.js';
import { uiIcon, inlineIcon, takeIconName } from '../../scripts/lh-icons.js';
import { getChannel, isFlynetHiddenLink, FLYNET_LOCALES } from '../../scripts/channel.js';
import { isDemoHost } from '../../scripts/demo.js';
import { isOwnWwwHost } from '../../scripts/brand.js';
import { panelTabOrder, nextInOrder } from './header-focus.js';

/*
 * Lufthansa header. Nav document (/{cc}/{ll}/nav), one section each:
 *  1. brand: linked logo image
 *  2. quick actions: list of links (Book, My flights, Check-in, Flight status)
 *  3. mega menu: nested list "top item > column heading > links", optional flyout image
 *  4. tools: list of ":icon: link" items (wheelchair, help, search, cart, login; search is
 *     not shown, live has none in the header) and
 *     ":globe: Country | Language" with an optional sub-list of countries; a paragraph
 *     with the menu button label
 * Sections are recognised by their content, the order above is the fallback.
 * FlyNet channel (scripts/channel.js): no booking, login or flight search links and tools, a
 * sample flight bar from the site's /flight sheet (columns flight, from, to, departure,
 * arrival) below the brand bar, and only the locales the FlyNet site holds.
 */

const DESKTOP = window.matchMedia('(width >= 1025px)');
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
const TRANSITION_MS = 800;

/** Names of the locales in their own language (country | language), from the locale table. */
const LOCALE_NAMES = Object.fromEntries(Object.entries(LOCALE_TABLE)
  .map(([key, row]) => [key, row.name]));

const LABELS = {
  en: {
    nav: 'Navigation',
    menu: 'Menu',
    close: 'Close',
    back: 'Back',
    localeTitle: 'Location and Language',
    flight: 'Your flight',
    sample: 'Sample data',
    to: 'to',
    localeCurrent: 'Country and language selection; currently:',
    otherCountries: 'Other countries',
    location: 'Location',
    continue: 'Continue',
    newTab: 'opens in a new tab',
    // the bar's language list (a sub-site: www.swiss.com's corporate site, its text)
    languageCurrent: 'language selection; currently:',
  },
  de: {
    nav: 'Navigation',
    menu: 'Menü',
    close: 'Schließen',
    back: 'Zurück',
    localeTitle: 'Land und Sprache',
    flight: 'Ihr Flug',
    sample: 'Beispieldaten',
    to: 'nach',
    localeCurrent: 'Auswahl von Land und Sprache; aktuell:',
    otherCountries: 'Andere Länder',
    location: 'Land',
    continue: 'Weiter',
    newTab: 'öffnet in einem neuen Tab',
    languageCurrent: 'Derzeit ausgewählte Sprache:',
  },
  it: {
    nav: 'Navigazione',
    menu: 'Menu',
    close: 'Chiudi',
    back: 'Indietro',
    localeTitle: 'Paese e lingua',
    flight: 'Il tuo volo',
    sample: 'Dati di esempio',
    to: 'a',
    localeCurrent: 'Selezione di paese e lingua; attuale:',
    otherCountries: 'Altri paesi',
    location: 'Paese',
    continue: 'Continua',
    newTab: 'si apre in una nuova scheda',
    languageCurrent: 'selezione della lingua; attuale:',
  },
  fr: {
    nav: 'Navigation',
    menu: 'Menu',
    close: 'Fermer',
    back: 'Retour',
    localeTitle: 'Pays et langue',
    flight: 'Votre vol',
    sample: 'Données d’exemple',
    to: 'à',
    localeCurrent: 'Choix du pays et de la langue ; actuellement :',
    otherCountries: 'Autres pays',
    location: 'Pays',
    continue: 'Continuer',
    newTab: 's’ouvre dans un nouvel onglet',
    // the language list of the corporate site of www.swiss.com in French (the wording of www)
    languageCurrent: 'sélection de la langue ; actuellement :',
  },
  es: {
    nav: 'Navegación',
    menu: 'Menú',
    close: 'Cerrar',
    back: 'Atrás',
    localeTitle: 'País e idioma',
    flight: 'Su vuelo',
    sample: 'Datos de ejemplo',
    to: 'a',
    localeCurrent: 'Selección de país e idioma; actual:',
    otherCountries: 'Otros países',
    location: 'País',
    continue: 'Continuar',
    newTab: 'se abre en una pestaña nueva',
    languageCurrent: 'selección de idioma; actual:',
  },
  nl: {
    nav: 'Navigatie',
    menu: 'Menu',
    close: 'Sluiten',
    back: 'Terug',
    localeTitle: 'Land en taal',
    flight: 'Uw vlucht',
    sample: 'Voorbeeldgegevens',
    to: 'naar',
    localeCurrent: 'Keuze van land en taal; huidig:',
    otherCountries: 'Andere landen',
    location: 'Land',
    continue: 'Doorgaan',
    newTab: 'opent in een nieuw tabblad',
    languageCurrent: 'taalkeuze; momenteel:',
  },
  pt: {
    nav: 'Navegação',
    menu: 'Menu',
    close: 'Fechar',
    back: 'Voltar',
    localeTitle: 'País e idioma',
    flight: 'Seu voo',
    sample: 'Dados de exemplo',
    to: 'para',
    localeCurrent: 'Seleção de país e idioma; atual:',
    otherCountries: 'Outros países',
    location: 'País',
    continue: 'Continuar',
    newTab: 'abre em uma nova aba',
    languageCurrent: 'seleção de idioma; atual:',
  },
  el: {
    nav: 'Πλοήγηση',
    menu: 'Μενού',
    close: 'Κλείσιμο',
    back: 'Πίσω',
    localeTitle: 'Χώρα και γλώσσα',
    flight: 'Η πτήση σας',
    sample: 'Δείγμα δεδομένων',
    to: 'προς',
    localeCurrent: 'Επιλογή χώρας και γλώσσας· τρέχουσα:',
    otherCountries: 'Άλλες χώρες',
    location: 'Χώρα',
    continue: 'Συνέχεια',
    newTab: 'ανοίγει σε νέα καρτέλα',
    languageCurrent: 'επιλογή γλώσσας· τρέχουσα:',
  },
  ja: {
    nav: 'ナビゲーション',
    menu: 'メニュー',
    close: '閉じる',
    back: '戻る',
    localeTitle: '国と言語',
    flight: 'お客様のフライト',
    sample: 'サンプルデータ',
    to: '→',
    localeCurrent: '国と言語の選択、現在:',
    otherCountries: 'その他の国',
    location: '国',
    continue: '続ける',
    newTab: '新しいタブで開きます',
    languageCurrent: '言語の選択、現在:',
  },
  ru: {
    nav: 'Навигация',
    menu: 'Меню',
    close: 'Закрыть',
    back: 'Назад',
    localeTitle: 'Страна и язык',
    flight: 'Ваш рейс',
    sample: 'Пример данных',
    to: 'в',
    localeCurrent: 'Выбор страны и языка; текущий выбор:',
    otherCountries: 'Другие страны',
    location: 'Страна',
    continue: 'Продолжить',
    newTab: 'откроется в новой вкладке',
    languageCurrent: 'выбор языка; сейчас:',
  },
  zh: {
    nav: '导航',
    menu: '菜单',
    close: '关闭',
    back: '返回',
    localeTitle: '国家/地区和语言',
    flight: '您的航班',
    sample: '示例数据',
    to: '至',
    localeCurrent: '国家/地区和语言选择；当前：',
    otherCountries: '其他国家/地区',
    location: '国家/地区',
    continue: '继续',
    newTab: '在新标签页中打开',
    languageCurrent: '语言选择；当前：',
  },
  pl: {
    nav: 'Nawigacja',
    menu: 'Menu',
    close: 'Zamknij',
    back: 'Wstecz',
    localeTitle: 'Kraj i język',
    flight: 'Twój lot',
    sample: 'Przykładowe dane',
    to: 'do',
    localeCurrent: 'Wybór kraju i języka; obecnie:',
    otherCountries: 'Inne kraje',
    location: 'Kraj',
    continue: 'Dalej',
    newTab: 'otwiera się w nowej karcie',
    languageCurrent: 'wybór języka; obecnie:',
  },
  // Korean (kr/ko; the wording of www where it has one, the capture of 2026-11-03)
  ko: {
    nav: '내비게이션',
    menu: '메뉴',
    close: '닫기',
    back: '뒤로',
    localeTitle: '위치/언어',
    flight: '내 항공편',
    sample: '샘플 데이터',
    to: '-',
    localeCurrent: '국가/언어 선택, 현재:',
    otherCountries: '기타 국가',
    location: '위치',
    continue: '계속',
    newTab: '링크가 새 브라우저 탭에서 열립니다',
    languageCurrent: '언어 선택, 현재:',
  },
};

const TOOL_ROLES = {
  wheelchair: 'accessibility',
  accessibility: 'accessibility',
  help: 'help',
  question: 'help',
  search: 'search',
  cart: 'cart',
  'shopping-cart': 'cart',
  login: 'login',
  profile: 'login',
  user: 'login',
  globe: 'locale',
  earth: 'locale',
  // the notifications bell (a brand with notifications: the panel, ./header-notifications.js)
  bell: 'notifications',
  notification: 'notifications',
  notifications: 'notifications',
};

/* ------------------------------------------------------------------ content ---------- */

function text(node) {
  return (node ? node.textContent : '').replace(/\s+/g, ' ').trim();
}

/** Label of a list item without its nested lists. */
function ownLabel(li) {
  const clone = li.cloneNode(true);
  clone.querySelectorAll('ul, ol').forEach((l) => l.remove());
  return text(clone);
}

function ownLink(li) {
  return [...li.querySelectorAll('a[href]')].find((a) => a.closest('li') === li) || null;
}

function subList(li) {
  return li.querySelector(':scope > ul, :scope > ol');
}

function topItems(section) {
  if (!section) return [];
  const list = section.querySelector('ul, ol');
  return list ? [...list.children].filter((c) => c.tagName === 'LI') : [];
}

function hasIconTokens(section) {
  return Boolean(section.querySelector('span.icon')) || /(^|\s):[a-z0-9-]+:/.test(section.textContent);
}

/** Finds the nav sections by content; the authored order is the fallback. */
function classifySections(fragment) {
  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const tools = sections.find(hasIconTokens) || sections[3];
  const menu = sections.find((s) => s !== tools && s.querySelector('li > ul, li > ol')) || sections[2];
  const brand = sections.find((s) => s !== tools && s !== menu && s.querySelector('img'))
    || sections[0];
  // a nav without quick actions (e.g. FlyNet) must not show the menu as quick actions
  const quick = sections.find((s) => ![tools, menu, brand].includes(s) && s.querySelector('a[href]'))
    || (![tools, menu, brand].includes(sections[1]) ? sections[1] : null);
  return {
    brand, quick, menu, tools,
  };
}

function readMenu(section) {
  return topItems(section).map((li) => {
    const groups = [];
    const loose = [];
    const cols = subList(li);
    if (cols) {
      [...cols.children].forEach((col) => {
        const links = subList(col);
        if (links) {
          groups.push({
            label: ownLabel(col),
            links: [...links.querySelectorAll('a[href]')],
          });
        } else {
          const a = ownLink(col);
          if (a) loose.push(a);
        }
      });
    }
    if (loose.length) groups.push({ label: '', links: loose });
    return { label: ownLabel(li), link: cols ? null : ownLink(li), groups };
  }).filter((item) => item.label);
}

function readTools(section) {
  return topItems(section).map((li) => {
    const sub = subList(li);
    if (sub) sub.remove();
    const icon = takeIconName(li);
    const a = ownLink(li);
    let role = TOOL_ROLES[icon] || null;
    if (!role && a && /travelid|login/i.test(a.href)) role = 'login';
    return {
      icon,
      role,
      href: a ? a.getAttribute('href') : null,
      label: text(li),
      countries: sub ? [...sub.querySelectorAll('a[href]')].map((c) => ({ name: text(c), href: c.getAttribute('href') })) : [],
      // (a cart item's sub-list: its dialog's texts, header-cart.js)
      list: sub,
    };
  }).filter((t) => t.label);
}

/* ---------------------------------------------------------------- elements ----------- */

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

function isExternal(href) {
  try {
    const u = new URL(href, window.location.href);
    return u.origin !== window.location.origin && !isOwnWwwHost(u.hostname);
  } catch (e) {
    return false;
  }
}

function navLink(href, label, className, labels) {
  const a = el('a', { href, className }, label);
  if (isExternal(href)) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.append(el('span', { className: 'nav-sr-only' }, ` (${labels.newTab})`));
  }
  return a;
}

/* ---------------------------------------------------------------- login -------------- */

const LOGIN_URL = '/service/secured/api/core/authenticate/loginPageUrl';

/**
 * The login link asks for www's login URL (GET .../loginPageUrl?state=<this page>, answered by
 * lh-edge as www) and follows it; where nothing answers (an Edge Delivery host without lh-edge)
 * or it fails, the link's own URL from the nav document.
 */
function useLoginUrl(a) {
  // the login opens in this tab, as on www
  a.removeAttribute('target');
  a.removeAttribute('rel');
  a.addEventListener('click', async (e) => {
    // a new tab or window (modifier keys) keeps the link as it is
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const fallback = a.href;
    const locale = getLocale();
    try {
      const state = window.location.pathname.replace(/^\/content(?=\/)/, '');
      const resp = await fetch(`${LOGIN_URL}?state=${encodeURIComponent(state)}`, {
        headers: {
          'X-Portal': portalOf(locale), 'X-Portal-Site': locale.country.toUpperCase(), 'X-Portal-Language': locale.lang,
        },
        signal: AbortSignal.timeout(3000),
      });
      const json = resp.ok ? await resp.json() : null;
      const next = json && typeof json.loginPageUrl === 'string' ? json.loginPageUrl : '';
      window.location.href = /^https:\/\//.test(next) ? next : fallback;
    } catch (err) {
      window.location.href = fallback;
    }
  });
  return a;
}

/* ---------------------------------------------------------------- locale ------------- */

/** Target of an authored country link: the counterpart page for migrated locales. */
async function countryTarget(href) {
  const u = new URL(href, window.location.href);
  const m = u.pathname.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
  if (!m) return u.href;
  const [, country, lang] = m;
  if (isMigratedLocale(country, lang)) return getCounterpartPath(`${country}/${lang}`);
  return getHomepageUrl(country, lang);
}

function buildLocaleDialog(locale, currentLabel, countries, labels, {
  localeKeys = ownRoots(), otherCountries = true,
} = {}) {
  const titleId = 'nav-locale-title';
  const dialog = el('dialog', { className: 'nav-locale', 'aria-labelledby': titleId });
  const close = el('button', { type: 'button', className: 'nav-locale-close', 'aria-label': labels.close }, uiIcon('close'));
  close.addEventListener('click', () => dialog.close());

  const list = el('ul', { className: 'nav-locale-list' });
  // the site's roots: lh-com's migrated locales, a brand site's own (scripts/locale.js)
  const locales = siteLocales();
  localeKeys.forEach((key) => {
    const current = key === locale.key;
    const row = locales[key];
    const a = el('a', {
      href: `/${key}/homepage`,
      hreflang: `${row.lang}-${row.country.toUpperCase()}`,
      lang: row.lang,
      'data-locale': key,
      'aria-current': current ? 'true' : false,
    }, el('span', {}, row.name || LOCALE_NAMES[key] || key), current ? uiIcon('check') : null);
    list.append(el('li', {}, a));
  });

  let other;
  if (countries.length) {
    const selectId = 'nav-locale-country';
    const select = el('select', { id: selectId, name: 'country' });
    countries.forEach((c) => select.append(el('option', { value: c.href }, c.name)));
    other = el(
      'form',
      { className: 'nav-locale-other' },
      el('label', { for: selectId }, labels.otherCountries),
      el('div', { className: 'nav-locale-select' }, select, uiIcon('chevron-down')),
      el('button', { type: 'submit', className: 'nav-locale-continue' }, labels.continue),
    );
    other.addEventListener('submit', async (e) => {
      e.preventDefault();
      window.location.href = await countryTarget(select.value);
    });
  } else if (otherCountries) {
    other = el('p', { className: 'nav-locale-other' }, el('a', { href: `${siteOrigin()}/` }, labels.otherCountries, uiIcon('arrow-right')));
  }

  dialog.append(
    el(
      'div',
      { className: 'nav-locale-head' },
      el('h2', { id: titleId }, labels.localeTitle),
      close,
    ),
    el('p', { className: 'nav-locale-current' }, `${labels.localeCurrent} `, el('strong', {}, currentLabel)),
    list,
    ...(other ? [other] : []),
  );
  // click on the backdrop closes the dialog
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  let trigger = null;
  dialog.addEventListener('close', () => {
    if (trigger && trigger.isConnected) trigger.focus();
    trigger = null;
  });

  const open = async (from) => {
    trigger = from || document.activeElement;
    if (!dialog.open) dialog.showModal();
    // counterpart of the current page in every migrated locale (homepage until resolved)
    await Promise.all([...list.querySelectorAll('a[data-locale]')].map(async (a) => {
      a.href = await getCounterpartPath(a.dataset.locale);
    }));
  };
  return { dialog, open };
}

/* ---------------------------------------------------------------- flyout ------------- */

function focusables(root) {
  return [...root.querySelectorAll('a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])')]
    .filter((n) => !n.closest('[hidden]') && n.getClientRects().length);
}

function buildFlyout({
  items, image, extras, login, labels, menuLabel,
}) {
  const flyout = el('div', { className: 'nav-flyout', id: 'nav-flyout', hidden: true });
  const fog = el('div', { className: 'nav-flyout-fog' });
  const imageWrap = el('div', { className: 'nav-flyout-image' });
  if (image) imageWrap.append(image);

  const back = el('button', {
    type: 'button', className: 'nav-flyout-back', 'aria-label': labels.back, hidden: true,
  }, uiIcon('arrow-left'));
  const title = el('p', { className: 'nav-flyout-title', 'aria-hidden': 'true' });
  const close = el('button', { type: 'button', className: 'nav-flyout-close', 'aria-label': labels.close }, uiIcon('close'));
  const top = el('div', { className: 'nav-flyout-top' }, back, title, close);

  const menu = el('ul', { className: 'nav-flyout-menu' });
  const subs = [];
  const buttons = [];
  items.forEach((item, i) => {
    if (!item.groups.length) {
      // a top item without columns is a plain link
      const href = item.link ? item.link.getAttribute('href') : null;
      if (href) menu.append(el('li', {}, navLink(href, item.label, 'nav-flyout-item', labels)));
      return;
    }
    const subId = `nav-flyout-sub-${i}`;
    const button = el(
      'button',
      {
        type: 'button', className: 'nav-flyout-item', 'aria-expanded': 'false', 'aria-controls': subId,
      },
      el('span', {}, item.label),
      uiIcon('chevron-right'),
    );
    const sub = el('div', {
      className: 'nav-flyout-sub', id: subId, role: 'region', 'aria-label': item.label, hidden: true,
    });
    item.groups.forEach((group, g) => {
      const groupEl = el('div', { className: 'nav-flyout-group' });
      const headingId = `${subId}-${g}`;
      if (group.label) groupEl.append(el('h3', { id: headingId }, group.label));
      const ul = el('ul', { 'aria-labelledby': group.label ? headingId : false });
      group.links.forEach((a) => ul.append(el('li', {}, navLink(a.getAttribute('href'), text(a), 'nav-flyout-link', labels))));
      groupEl.append(ul);
      sub.append(groupEl);
    });
    buttons.push(button);
    subs.push(sub);
    menu.append(el('li', {}, button));
  });

  const extraList = el('ul', {}, extras);
  const main = el(
    'div',
    { className: 'nav-flyout-main' },
    menu,
    el('div', { className: 'nav-flyout-extras' }, extraList),
    login ? el('div', { className: 'nav-flyout-login' }, login) : null,
  );
  const columns = el('div', { className: 'nav-flyout-columns' }, main, subs);
  const panel = el('div', {
    className: 'nav-flyout-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': menuLabel,
  }, top, columns);
  flyout.append(fog, imageWrap, panel);

  let menuButton;
  let active = -1;
  let closeTimer;

  const collapse = (focusItem = true) => {
    const previous = active;
    active = -1;
    panel.classList.remove('is-expanded');
    buttons.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    subs.forEach((s) => { s.hidden = true; });
    back.hidden = true;
    title.textContent = '';
    if (focusItem && previous >= 0) buttons[previous].focus();
  };

  const expand = (index) => {
    if (active === index) {
      collapse();
      return;
    }
    active = index;
    panel.classList.add('is-expanded');
    buttons.forEach((b, i) => b.setAttribute('aria-expanded', i === index ? 'true' : 'false'));
    subs.forEach((s, i) => { s.hidden = i !== index; });
    back.hidden = false;
    title.textContent = text(buttons[index]);
    columns.scrollTop = 0;
    panel.scrollTop = 0;
    // on small screens the sub menu replaces the main menu: move focus into it
    if (!DESKTOP.matches) {
      const first = subs[index].querySelector('a[href]');
      if (first) first.focus();
    }
  };

  const onKeydown = (e) => {
    // the locale dialog on top handles its own keys
    if (document.querySelector('dialog.nav-locale[open]')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      // an open panel first, the focus back on its tab; then the menu, the focus on its button
      if (active >= 0) {
        collapse();
        return;
      }
      // eslint-disable-next-line no-use-before-define
      closeFlyout();
      return;
    }
    if (e.key === 'Tab') {
      // the open panel's links right after its tab (./header-focus.js), wrapping inside the menu
      const [tab, sub] = active >= 0 ? [buttons[active], subs[active]] : [null, null];
      const order = panelTabOrder(focusables(panel), tab, sub);
      const next = nextInOrder(order, document.activeElement, e.shiftKey);
      if (!next) return;
      e.preventDefault();
      next.focus();
      return;
    }
    const at = buttons.indexOf(document.activeElement);
    if (at >= 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const next = (at + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
    }
  };

  const openFlyout = () => {
    window.clearTimeout(closeTimer);
    flyout.classList.remove('is-closing');
    flyout.hidden = false;
    flyout.inert = false;
    // next frame so the slide-in transition runs
    requestAnimationFrame(() => requestAnimationFrame(() => flyout.classList.add('is-open')));
    menuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);
    const first = buttons[0] || focusables(panel)[0];
    if (first) first.focus({ preventScroll: true });
  };

  const closeFlyout = (restoreFocus = true) => {
    if (flyout.hidden) return;
    flyout.classList.remove('is-open');
    flyout.classList.add('is-closing');
    // out of the Tab order at once: hidden only follows the 0.8 s slide-out
    flyout.inert = true;
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    closeTimer = window.setTimeout(() => {
      flyout.classList.remove('is-closing');
      flyout.hidden = true;
      collapse(false);
    }, REDUCED_MOTION.matches ? 0 : TRANSITION_MS);
    if (restoreFocus) menuButton.focus();
  };

  buttons.forEach((b, i) => b.addEventListener('click', () => expand(i)));
  back.addEventListener('click', () => collapse());
  close.addEventListener('click', () => closeFlyout());
  fog.addEventListener('click', () => closeFlyout());
  imageWrap.addEventListener('click', () => closeFlyout());
  // a link inside the flyout navigates: close without moving focus back
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a[href]')) closeFlyout(false);
  });

  return {
    flyout,
    bind(button) {
      menuButton = button;
      button.addEventListener('click', () => (flyout.hidden ? openFlyout() : closeFlyout()));
    },
    close: closeFlyout,
  };
}

/* ---------------------------------------------------------------- flynet ------------- */

/** FlyNet channel: drops the links that book, log in or search flights from the nav. */
function dropHiddenLinks(fragment) {
  fragment.querySelectorAll('a[href]').forEach((a) => {
    if (!isFlynetHiddenLink(a.getAttribute('href'))) return;
    const li = a.closest('li');
    if (li) li.remove();
    else a.remove();
  });
  // menu columns and top items left without links
  fragment.querySelectorAll('li').forEach((li) => {
    if (subList(li) && !li.querySelector('a[href]')) li.remove();
  });
}

/**
 * The sample flight of the FlyNet channel from the site's /flight sheet (first row), as a bar:
 * "Your flight · Sample data · LH 400 · Frankfurt (FRA) → New York (JFK) · 10:55 → 13:40".
 * @returns {Promise<HTMLElement|null>} null when the sheet is missing or empty
 */
async function buildFlightBar(labels) {
  let row;
  try {
    const resp = await fetch('/flight.json');
    if (!resp.ok) return null;
    const json = await resp.json();
    const rows = json.data || (json.flight && json.flight.data) || [];
    row = rows.find((r) => r && (r.flight || r.Flight));
  } catch (e) {
    return null;
  }
  if (!row) return null;
  const value = (name) => String(row[name] || row[name[0].toUpperCase() + name.slice(1)] || '').trim();
  const arrow = () => el('span', { className: 'nav-flight-arrow', 'aria-hidden': 'true' }, '\u2192');
  const sr = (t) => el('span', { className: 'nav-sr-only' }, ` ${t} `);
  const titleId = 'nav-flight-title';
  return el(
    'section',
    { className: 'nav-flight', 'aria-labelledby': titleId },
    el(
      'div',
      { className: 'nav-flight-inner' },
      el(
        'p',
        { className: 'nav-flight-head' },
        el('span', { id: titleId, className: 'nav-flight-title' }, labels.flight),
        el('span', { className: 'nav-flight-sample' }, labels.sample),
        el('strong', { className: 'nav-flight-number' }, value('flight')),
      ),
      el(
        'p',
        { className: 'nav-flight-route' },
        el('span', {}, value('from')),
        arrow(),
        sr(labels.to),
        el('span', {}, value('to')),
      ),
      el(
        'p',
        { className: 'nav-flight-times' },
        el('time', {}, value('departure')),
        arrow(),
        sr('–'),
        el('time', {}, value('arrival')),
      ),
    ),
  );
}

/* ---------------------------------------------------------------- decorate ----------- */

async function toolLink(tool, className, withLabel) {
  const icon = tool.icon ? await inlineIcon(tool.icon) : null;
  const a = el('a', { href: tool.href, className }, icon);
  if (withLabel) a.append(el('span', { className: 'nav-tool-label' }, tool.label));
  else a.setAttribute('aria-label', tool.label);
  if (!withLabel) a.title = tool.label;
  if (isExternal(tool.href)) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  return a;
}

async function localeButton(tool, className, labels) {
  const icon = await inlineIcon(tool.icon || 'globe');
  return el(
    'button',
    { type: 'button', className, 'aria-haspopup': 'dialog' },
    icon,
    el('span', { className: 'nav-sr-only' }, `${labels.localeCurrent} `),
    el('span', { className: 'nav-tool-label' }, tool.label),
  );
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const locale = getLocale();
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : `${locale.base}/nav`;
  // a root answered from its language version without a nav of its own on this host: the
  // language version's (as before the root had a row)
  const fragment = await loadFragment(navPath)
    || (!navMeta && locale.versionBase ? await loadFragment(`${locale.versionBase}/nav`) : null);
  if (!fragment) return;

  const labels = LABELS[locale.lang] || LABELS.en;
  const flynet = getChannel() === 'flynet';
  if (flynet) dropHiddenLinks(fragment);
  // the sample flight ("Sample data"): demo hosts only
  const flightBar = flynet && isDemoHost() ? buildFlightBar(labels) : null;
  const {
    brand, quick, menu, tools,
  } = classifySections(fragment);
  // a brand's own header (scripts/brands.js header: Lufthansa Group for Business): the menu in the
  // bar, the logo without a link, a search button; a sub-site's before its brand's
  // (scripts/site-languages.js SUB_SITES: SWISS's corporate site); every other brand as before
  const pageBrand = brandEntry();
  const subSiteHeader = locale.subSite && locale.subSite.header;
  const headerStyle = subSiteHeader || (pageBrand && pageBrand.header) || {};
  // TAP's layout (scripts/brands.js tap: header.layout 'tap', ./header-tap.js): www.flytap.com's
  // top-level menu, search and account linked to www, the bar inside the homepage's stage
  const tap = headerStyle.layout === 'tap' ? await import('./header-tap.js') : null;
  // Air Dolomiti (the page's brand airdolomiti, ./header-airdolomiti.js): www.airdolomiti.it's
  // menu in the bar with its panels from 1025px, the search button and the language list in the
  // bar, no quick actions; every other brand as before
  const airdolomiti = /^airdolomiti$/i.test(getMetadata('brand')) ? await import('./header-airdolomiti.js') : null;

  // brand
  const brandEl = el('div', { className: 'nav-brand' });
  const brandLink = brand && brand.querySelector('a[href]');
  const logo = brand && brand.querySelector('picture, img');
  if (logo && headerStyle.logoLink === false) {
    // the logo alone, as www's (not a link)
    const span = el('span', { className: 'nav-brand-logo' }, logo);
    const img = span.querySelector('img');
    img.loading = 'eager';
    brandEl.append(span);
  } else if (brandLink || logo) {
    const a = el('a', { href: brandLink ? brandLink.getAttribute('href') : `${locale.base}/homepage` });
    if (logo) {
      a.append(logo);
      const img = a.querySelector('img');
      img.loading = 'eager';
      a.setAttribute('aria-label', img.alt || 'Lufthansa');
    } else {
      a.textContent = text(brandLink);
    }
    brandEl.append(a);
  }

  // quick actions
  const quickEl = el('div', { className: 'nav-quick' });
  const quickList = el('ul');
  // (TAP's bar has no quick actions: www's top-level menu takes its Check-in, tapMenuItems)
  if (quick && !tap && !airdolomiti) {
    quick.querySelectorAll('a[href]').forEach((a) => {
      quickList.append(el('li', {}, navLink(a.getAttribute('href'), text(a), 'nav-quick-link', labels)));
    });
  }
  if (quickList.children.length) quickEl.append(quickList);

  // tools
  // FlyNet: no login and no shopping cart
  const navTools = (tools ? readTools(tools) : [])
    .filter((t) => !flynet || !['login', 'cart', 'search'].includes(t.role));
  // a brand site without <cc>/<ll> roots (scripts/site-languages.js): a switch between its
  // languages (the nav's links to their homepages become it) instead of the country selector;
  // the page's own counterparts from its metadata (Alternate en | /en/newsletter-subscription;
  // on TAP's roots also Alternate pt-br, parity.md F4)
  const alternates = switchAlternates(locale.siteLanguages || [], getMetadata);
  const { pathname } = window.location;
  const siteSwitch = locale.siteLanguages
    ? languageSwitch(navTools, pathname, locale.lang, locale.siteLanguages, alternates) : null;
  const toolItems = siteSwitch ? siteSwitch.tools : navTools;
  const menuLabel = text(tools && tools.querySelector('.default-content-wrapper > p')) || labels.menu;
  const byRole = (role) => toolItems.find((t) => t.role === role);
  const localeTool = byRole('locale') || {
    icon: 'globe', label: (siteLocales()[locale.key] || {}).name || LOCALE_NAMES[locale.key] || locale.key, countries: [],
  };
  const { dialog, open: openLocale } = buildLocaleDialog(
    locale,
    localeTool.label,
    flynet ? [] : localeTool.countries,
    labels,
    flynet ? { localeKeys: FLYNET_LOCALES, otherCountries: false } : {},
  );

  const toolsEl = el('div', { className: 'nav-tools' });
  // the shopping cart: a cart item with a sub-list is a button and its dialog (www.swiss.com's
  // empty cart, header-cart.js, loaded then only); without one its link as before
  const cartTool = byRole('cart');
  let cart = null;
  if (cartTool && cartTool.list) {
    const { default: buildCart, cartItems } = await import('./header-cart.js');
    const items = cartItems(cartTool.list);
    if (items.length) {
      const icon = cartTool.icon ? await inlineIcon(cartTool.icon) : null;
      cart = buildCart({
        label: cartTool.label, items, close: labels.close, icon,
      });
    }
  }
  // live has no search button in the bar (search lives in the footer)
  const barTools = [
    ['accessibility', 'nav-tool nav-tool-accessibility'],
    ['help', 'nav-tool nav-tool-help'],
    ['cart', 'nav-tool nav-tool-cart'],
  ];
  const barLinks = await Promise.all(barTools.map(async ([role, className]) => {
    const tool = byRole(role);
    if (role === 'cart' && cart) return cart.button;
    return tool && tool.href ? toolLink(tool, className, false) : null;
  }));
  barLinks.filter(Boolean).forEach((a) => toolsEl.append(a));
  // accessibility settings: on a brand with them (scripts/brands.js: Air Dolomiti) www's button and
  // panel (text size, contrast; scripts/accessibility.js) after the bar's links; other brands none
  let a11y = null;
  if (pageBrand && pageBrand.accessibility) {
    const { buildAccessibility } = await import('../../scripts/accessibility.js');
    a11y = buildAccessibility({ lang: locale.lang, icon: await inlineIcon('accessibility-settings') });
    await a11y.styles;
    toolsEl.append(a11y.root);
  }
  // notifications: on a brand with notifications (scripts/brands.js: Cargo) the nav's bell tool is
  // www's bell and panel; any other brand's bell tool stays what it was (a link in the menu)
  const bellTool = byRole('notifications');
  const bellLang = messageLocale({ locale }).lang;
  const bellPage = bellTool ? notificationsPage(brandEntry(), bellLang) : '';
  let bell = null;
  if (bellPage) {
    const { default: buildNotifications } = await import('./header-notifications.js');
    bell = buildNotifications({
      label: bellTool.label, lang: bellLang, page: bellPage, icon: await inlineIcon(bellTool.icon),
    });
    toolsEl.append(bell.button);
  }
  const loginTool = byRole('login');
  if (loginTool && loginTool.href) {
    toolsEl.append(el('span', { className: 'nav-divider', 'aria-hidden': 'true' }));
    toolsEl.append(useLoginUrl(await toolLink(loginTool, 'nav-tool nav-tool-login', true)));
  }
  // each other language of a site switch: its homepage at once, the page's counterpart once it is
  // known to exist (one probe for the bar's list and the menu's links)
  const exists = (p) => fetch(p, { method: 'HEAD' }).then((r) => r.ok);
  const switchTargets = siteSwitch
    ? siteSwitch.links.map((link) => switchTarget(link, exists)) : [];
  // the language list in the bar (a sub-site's header.languages 'bar': www's "EN" with the globe)
  let languages = null;
  // TAP: search and account (links to www's same root) before the market button, as www's bar
  if (tap) {
    const base = tap.tapRoot(window.location.pathname, locale.base);
    const tapTools = await Promise.all(tap.tapBarTools({ ...locale, base })
      .map((t) => toolLink(t, `nav-tool nav-tool-${t.role}`, false)));
    tapTools.forEach((a) => toolsEl.append(a));
  }
  if ((siteSwitch && headerStyle.languages === 'bar') || (siteSwitch && airdolomiti)) {
    const { default: buildLanguages } = await import('./header-languages.js');
    languages = buildLanguages({
      // TAP's button names the market (www's "PT"), the others the language
      current: tap && locale.country ? locale.country : locale.lang,
      label: labels.languageCurrent || LABELS.en.languageCurrent,
      links: siteSwitch.links,
      icon: await inlineIcon('globe'),
    });
    switchTargets.forEach((target, i) => target.then((href) => {
      languages.anchors[i].href = href;
    }));
    toolsEl.append(languages.root);
  }
  // the search button (header.search 'button': www's boxed search icon to the search page)
  const searchTool = headerStyle.search === 'button' || airdolomiti ? byRole('search') : null;
  if (searchTool && searchTool.href) toolsEl.append(await toolLink(searchTool, 'nav-tool nav-tool-search', false));
  if (toolsEl.children.length) toolsEl.append(el('span', { className: 'nav-divider', 'aria-hidden': 'true' }));
  const menuButton = el(
    'button',
    {
      type: 'button', className: 'nav-menu-button', 'aria-expanded': 'false', 'aria-controls': 'nav-flyout', 'aria-label': menuLabel,
    },
    // burger left of the label, as live (lh-iconfont "list-menu")
    await inlineIcon('list-menu'),
    el('span', { className: 'nav-tool-label', 'aria-hidden': 'true' }, menuLabel),
  );
  toolsEl.append(menuButton);
  // (Air Dolomiti: its tools in the order they show, ./header-airdolomiti.js)
  if (airdolomiti) airdolomiti.arrangeTools(toolsEl);

  // flyout: mega menu, accessibility/help/cart/other tools, locale selector, login
  // (live additional links: wheelchair, question, shopping cart, country/language)
  const extras = [];
  await Promise.all(toolItems.map(async (tool) => {
    if (['login', 'locale'].includes(tool.role) || (tool.role === 'search' && headerStyle.search !== 'button')) return null;
    if (!tool.href) return null;
    if (tool.role === 'cart' && cart) {
      const icon = tool.icon ? await inlineIcon(tool.icon) : null;
      const button = el(
        'button',
        { type: 'button', className: 'nav-flyout-extra' },
        icon,
        el('span', { className: 'nav-tool-label' }, tool.label),
      );
      cart.bind(button);
      return button;
    }
    return toolLink(tool, 'nav-flyout-extra', true);
  })).then((links) => links.filter(Boolean).forEach((a) => extras.push(el('li', {}, a))));
  if (siteSwitch) {
    siteSwitch.links.forEach((link, i) => {
      const a = el(
        'a',
        {
          href: link.home, className: 'nav-flyout-extra nav-flyout-language', lang: link.lang, hreflang: link.lang,
        },
        el('span', { className: 'nav-tool-label' }, link.label),
      );
      switchTargets[i].then((href) => { a.href = href; });
      extras.push(el('li', {}, a));
    });
  } else if (headerStyle.locale !== false) {
    // (header.locale false: no country button in the menu, the footer's opens the dialog)
    const flyoutLocale = await localeButton(localeTool, 'nav-flyout-extra nav-flyout-locale', labels);
    flyoutLocale.addEventListener('click', () => openLocale(flyoutLocale));
    extras.push(el('li', {}, flyoutLocale));
  }
  const flyoutLogin = loginTool && loginTool.href ? useLoginUrl(await toolLink(loginTool, 'nav-flyout-extra', true)) : null;

  const menuImage = menu && [...menu.querySelectorAll('picture, img')].find((p) => !p.closest('li') && !(p.tagName === 'IMG' && p.closest('picture')));
  if (menuImage) {
    const img = menuImage.tagName === 'IMG' ? menuImage : menuImage.querySelector('img');
    if (img) {
      img.loading = 'lazy';
      img.alt = '';
    }
  }
  // the menu's items (TAP: www's top level, Check-in from the quick action while the menu lacks it)
  const menuItems = tap
    ? tap.tapMenuItems(readMenu(menu), quick ? [...quick.querySelectorAll('a[href]')] : [])
    : readMenu(menu);
  const flyout = buildFlyout({
    items: menuItems,
    image: menuImage || null,
    extras,
    login: flyoutLogin,
    labels,
    menuLabel,
  });
  // (TAP: the menu button opens its own menu, below)
  if (!tap) flyout.bind(menuButton);

  // the footer's country/language button opens the same dialog (a brand site without roots: the
  // menu with its language switch)
  document.addEventListener('lh:locale-selector', (e) => {
    e.preventDefault();
    if (siteSwitch) {
      // the bar's language list where it shows (a sub-site), else the menu
      if (languages && languages.root.offsetParent !== null) {
        languages.open();
        languages.button.focus();
      } else if (menuButton.getAttribute('aria-expanded') !== 'true') menuButton.click();
      return;
    }
    flyout.close(false);
    openLocale(e.detail && e.detail.trigger);
  });

  // the menu in the bar (header.menu 'bar'): the top items with their drop-downs from 1025px
  let barMenu = null;
  if (tap) {
    // TAP's own menu (./header-tap.js): www's panels in the bar, its accordion on phones
    barMenu = tap.buildTapMenu(menu, {
      link: (href, label, className) => navLink(href, label, className, labels),
      menuButton,
      quickLinks: quick ? [...quick.querySelectorAll('a[href]')] : [],
    });
  } else if (airdolomiti) {
    barMenu = airdolomiti.buildAirDolomitiMenu(menu, {
      link: (href, label, className) => navLink(href, label, className, labels),
    });
    menuButton.addEventListener('click', () => barMenu.close());
  } else if (headerStyle.menu === 'bar') {
    const { default: buildBarMenu } = await import('./header-bar-menu.js');
    barMenu = buildBarMenu(menuItems, {
      link: (href, label, className) => navLink(href, label, className, labels),
    });
    menuButton.addEventListener('click', () => barMenu.close());
  }
  const bar = el('div', { className: 'nav-bar' }, brandEl, barMenu ? barMenu.root : null, quickEl, toolsEl);
  const nav = el('nav', { id: 'nav', 'aria-label': labels.nav }, bar, bell ? bell.panel : null, flyout.flyout);
  // the menu and the notifications panel: one at a time
  if (bell) menuButton.addEventListener('click', () => bell.close());
  if (a11y) menuButton.addEventListener('click', () => a11y.close());
  const navWrapper = el('div', { className: ['nav-wrapper', barMenu ? 'nav-has-bar-menu' : '', locale.subSite ? 'nav-sub-site' : '', tap ? 'nav-tap' : '', airdolomiti ? 'nav-airdolomiti' : ''].filter(Boolean).join(' ') }, nav);
  // TAP's homepage: the bar inside the top of the stage (styles/themes/tap.css body.tap-home)
  if (tap && tap.isTapHome(window.location.pathname, locale.base)) tap.floatInStage(document);
  const flight = flightBar ? await flightBar : null;
  if (flight) navWrapper.append(flight);

  // sticky header: hides while scrolling down, comes back when scrolling up
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (flyout.flyout.hidden && !(a11y && !a11y.panel.hidden)
      && !navWrapper.contains(document.activeElement)) {
      navWrapper.classList.toggle('is-hidden', y > lastY && y > navWrapper.offsetHeight);
      navWrapper.classList.toggle('is-scrolled', y > 0);
    }
    lastY = y;
  }, { passive: true });
  navWrapper.addEventListener('focusin', () => navWrapper.classList.remove('is-hidden'));

  block.textContent = '';
  block.append(navWrapper);
  if (!siteSwitch) block.append(dialog);
  if (cart) block.append(cart.dialog);
}
