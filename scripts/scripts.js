import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
  getMetadata,
  readBlockConfig,
  toCamelCase,
  toClassName,
} from './aem.js';
import { getLocale } from './locale.js';
import { initConsent, isAuthoringContext } from './consent.js';
import { applyChannel } from './channel.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) {
      // a plain link alone in its paragraph renders as a standalone navigation link
      if (p.querySelectorAll('a').length === 1) p.classList.add('link-wrapper');
      return;
    }

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Applies section metadata (the vendored aem.js does not): "style" values become section
 * classes, other keys data attributes. The metadata block itself is removed.
 * @param {Element} main The main element
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll(':scope > div > div.section-metadata').forEach((sectionMeta) => {
    const section = sectionMeta.parentElement;
    const meta = readBlockConfig(sectionMeta);
    Object.entries(meta).forEach(([key, value]) => {
      if (key === 'style') {
        String(value).split(',').map((style) => toClassName(style.trim()))
          .filter(Boolean)
          .forEach((style) => section.classList.add(style));
      } else {
        section.dataset[toCamelCase(key)] = value;
      }
    });
    sectionMeta.remove();
  });
}

const HEADING_STYLE = /\s*\{((?:heading-(?:large|medium|small|copytext-large|copytext-medium))|copytext-large)\}\s*$/;
const PARAGRAPH_STYLE = /\s*\{((?:copytext-(?:small|medium|large)|full-width)(?: (?:copytext-(?:small|medium|large)|full-width))*)\}\s*$/;
const LIST_STYLE = /\s*\{(full-width)\}\s*$/;

/**
 * Removes a trailing style marker from the last text of an element; returns the style or null.
 * @param {Element} el
 * @param {RegExp} pattern
 */
function takeStyleMarker(el, pattern) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let last = null;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue.trim()) last = n;
  const match = last && last.nodeValue.match(pattern);
  if (!match) return null;
  last.nodeValue = last.nodeValue.slice(0, match.index);
  return match[1];
}

/**
 * Text style markers (see README "Authoring conventions"): "Ticket refunds {heading-medium}"
 * renders as <h3 class="heading-medium">Ticket refunds</h3> (Lufthansa sizes headings by class,
 * not by level), "Small print {copytext-small}" as <p class="copytext-small">, a list whose last
 * item ends with "{full-width}" as <ul class="full-width">. The marker is
 * removed from the text and from the heading id the backend derived from it.
 * @param {Element} main The container element
 */
function decorateTextStyles(main) {
  main.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    const style = takeStyleMarker(h, HEADING_STYLE);
    if (!style) return;
    h.classList.add(style);
    if (h.id.endsWith(`-${style}`)) h.id = h.id.slice(0, -style.length - 1);
  });
  main.querySelectorAll('p').forEach((p) => {
    const style = takeStyleMarker(p, PARAGRAPH_STYLE);
    if (style) p.classList.add(...style.split(' '));
  });
  main.querySelectorAll('ul, ol').forEach((list) => {
    const last = [...list.children].filter((li) => li.tagName === 'LI').pop();
    const style = last && takeStyleMarker(last, LIST_STYLE);
    if (style) list.classList.add(style);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  decorateTextStyles(main);
  buildAutoBlocks(main);
  decorateSectionMetadata(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  const locale = getLocale();
  // pages outside the locale trees (e.g. /demo/channels) may name their language in metadata
  document.documentElement.lang = getMetadata('language') || locale.lang;
  // AirCore pages (/lhg/...) keep the AirCore look of shared blocks (body.aircore scoped rules)
  if (locale.aircore) document.body.classList.add('aircore');
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  // channel (website, flynet by page metadata, app by ?channel=app): see scripts/channel.js
  let channel = 'website';
  if (main) {
    decorateMain(main);
    channel = applyChannel(main);
    if (channel !== 'website') await loadCSS(`${window.hlx.codeBasePath}/styles/channels.css`);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }

  // cookie banner (OneTrust as on lufthansa.com) right after the first section;
  // runs once per page and never inside DA authoring; the app view leaves consent to the app
  if (channel !== 'app') initConsent();
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  // the app view has no header and footer (removed by applyChannel)
  const header = doc.querySelector('body > header');
  if (header) loadHeader(header);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  const footer = doc.querySelector('body > footer');
  if (footer) loadFooter(footer);

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // showcase notice ("not an official Lufthansa website"), well after LCP
  window.setTimeout(() => {
    import('./showcase-notice.js').then(({ default: showShowcaseNotice }) => showShowcaseNotice());
  }, 3500);
}

async function loadPage() {
  // the live site sends / to the German homepage for a visitor in Germany (not inside DA)
  // (keeps the query, e.g. ?channel=app; on lh-flynet this lands on the FlyNet start page)
  if (window.location.pathname === '/' && !isAuthoringContext()) {
    window.location.replace(`/de/de/homepage${window.location.search}`);
    return;
  }
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

// DA live preview: re-renders the page while the author edits
(async function loadDa() {
  if (!new URL(window.location.href).searchParams.get('dapreview')) return;
  // eslint-disable-next-line import/no-unresolved
  import('https://da.live/scripts/dapreview.js').then(({ default: daPreview }) => daPreview(loadPage));
}());
