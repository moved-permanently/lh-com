import {
  loadCSS, loadScript, decorateBlock, loadBlock,
} from '../../scripts/aem.js';
import { getLocale, brandEntry, portalOf } from '../../scripts/locale.js';
import { isDemoHost, isTurnsThePageHost } from '../../scripts/demo.js';

/*
 * Micro Frontend: one of the Lufthansa Group's micro-frontends on the page (AMS rest A4 part 2).
 * The block loads the design system (stylesheet and module script) and the app's script, then
 * renders the app's element. The page's data comes in the block's data-config (JSON; lh-edge sets
 * it when another system POSTs to <page>.mfe.html) and is handed to the element as its own
 * data-config before it is attached (the app reads it on connect). Rows after the app's name
 * ("Configuration | ...", "API gateway | ...") become the element's data- attributes
 * (data-configuration, data-api-gateway).
 * Row Fallback (optional): its cell's content (www's text around the app: headings, text, lists,
 * links, a nested block such as an accordion) is shown at once and the app is mounted next to it,
 * hidden; once the app's element shows something (a height and text, in its shadow root or light
 * DOM: hasRendered) it replaces the fallback, else after FALLBACK_TIMING.wait the fallback stays
 * and the element is removed. ITA's and Austrian's help-center-web renders nothing on our hosts
 * (its data come from the airline's Travel ID service, which refuses them).
 */

/** www's design system release the apps are built against: change it here only. */
export const DESIGN_SYSTEM_VERSION = 'v1.38.0';
const WWW = 'https://www.lufthansa.com';
const DESIGN_SYSTEM = `${WWW}/digitalhangar/design-system/releases/${DESIGN_SYSTEM_VERSION}/standalone`;
export const DESIGN_SYSTEM_CSS = `${DESIGN_SYSTEM}/css/lufthansa.css`;
export const DESIGN_SYSTEM_JS = `${DESIGN_SYSTEM}/packages/maui-design-system.js`;

/**
 * A brand's own design system, by its www host (scripts/brands.js www): www.austrian.com's pages
 * load mausy-v1.40.1 with austrian.css (capture of 2026-10-30); www.ita-airways.com serves the same
 * release with ita.css. The brand apps load from there.
 */
const BRAND_DESIGN_SYSTEMS = {
  'www.austrian.com': { release: 'mausy-v1.40.1', theme: 'austrian' },
  'www.ita-airways.com': { release: 'mausy-v1.40.1', theme: 'ita' },
  // www's culinaryjourney pages (2026-10-27): v1.38.0, discover.css
  'www.discover-airlines.com': { release: 'v1.38.0', theme: 'discover' },
  // www's help center and culinary journey pages (the snapshots): mausy-v1.40.1, swiss.css
  'www.swiss.com': { release: 'mausy-v1.40.1', theme: 'swiss' },
};

// the brands whose apps and design system load from the page's own /digitalhangar/ where the host
// serves it (lh-edge answers it from the brand's www): no visitor's browser asks their www
const OWN_HOST_BRANDS = ['www.swiss.com'];

/**
 * The apps the block knows: name (the block's first cell) -> element, script and www's classes.
 * script: an absolute URL (www.lufthansa.com's app), or path: the app on the page's brand www
 * (www.lufthansa.com without a brand); module: a module script; attributes: the element's own;
 * portalMeta: the app reads the page's X-Portal, X-Portal-Site, X-Portal-Language meta tags;
 * release: www's design system release the app's page loads (else DESIGN_SYSTEM_VERSION).
 * shows: blocks after the app in its section that show what the app shows itself (a fallback the
 * importer writes outside the block): removed once the app renders, kept where it does not.
 */
export const APPS = {
  'trip-management': {
    tag: 'trip-management',
    script: `${WWW}/digitalhangar/trip-management/trip-management/trip-management-latest.js`,
    className: 'full-width-bg px-0 pb-5',
  },
  // ITA's and Austrian's contact pages (its tenant from X-Portal: LH, LX, OS, SN, ITA)
  'help-center-web': {
    tag: 'help-center-web',
    path: '/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.1.js',
    module: true,
    attributes: { 'data-public-endpoint': '' },
    portalMeta: true,
    brandDesign: true,
    // www's topic list is the app's own; the importer writes it after the block as the fallback
    shows: ['accordion-columns'],
  },
  // lufthansa.com's compensation claim (support/fast-compensation/compensation-flight-disruptions,
  // 2026-11-01): a module with chunks next to it, on www's mausy-v1.40.1; its APIs
  // (api.travelid.lufthansa.com, api.miles-and-more.com/claim) allow www.lufthansa.com only
  'claim-form-entry': {
    tag: 'claim-form-entry',
    path: '/digitalhangar/claim-automation/production/claim-form-entry/claim-form-entry-0.11.16.js',
    module: true,
    attributes: { 'data-public-endpoint': '' },
    release: 'mausy-v1.40.1',
  },
  // Austrian's culinary journey (rows: Configuration, API gateway); its theme from X-Portal
  // (without it the app's class is maui-theme-undefined, its inputs unstyled), www's classes
  'culinary-hub': {
    tag: 'culinary-hub',
    path: '/digitalhangar/onecatering/culinary-hub/culinary-hub-latest.js',
    className: 'full-width-bg px-0',
    attributes: { 'data-public-endpoint': '' },
    portalMeta: true,
    brandDesign: true,
  },
};
const DEFAULT_APP = 'trip-management';

/** How long an app has to render before its fallback stays, and how often it is looked at (ms). */
export const FALLBACK_TIMING = { wait: 8000, every: 250 };

/**
 * A cell's text; an icon span is its :name: text again (DA writes ":https:" of a value such as
 * "dmc:https://www…" as <span class="icon icon-https">).
 */
function cellText(cell) {
  const copy = cell.cloneNode(true);
  copy.querySelectorAll('span.icon').forEach((icon) => {
    const name = [...icon.classList].find((c) => c.startsWith('icon-'));
    icon.replaceWith(name ? `:${name.slice(5)}:` : '');
  });
  return (copy.textContent || '').trim();
}

/**
 * Whether a host serves www's /digitalhangar/ itself: the airline's own host (www) and the
 * turnsthe.page hosts (lh-edge's route); not aem.page, aem.live or localhost.
 */
const servesDigitalHangar = (hostname) => isTurnsThePageHost(hostname) || !isDemoHost(hostname);

/** The block's rows as [first cell text, second cell text]. */
const rowsOf = (block) => [...block.children].map((row) => [...row.children].map(cellText));

/** The app named in the block (its first cell), else the default; null for an unknown name. */
export function appOf(block) {
  const [first = []] = rowsOf(block);
  const name = (first[0] || (block.children.length ? '' : block.textContent) || '').trim().toLowerCase() || DEFAULT_APP;
  return Object.prototype.hasOwnProperty.call(APPS, name) ? APPS[name] : null;
}

/** The block's data-config when it is a JSON object, else null. */
export function configOf(block) {
  const raw = block.dataset.config;
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch (e) {
    return null;
  }
}

/**
 * What the block loads and renders: {tag, className, css, scripts: [{src, module}], attributes,
 * meta} for the page's brand entry, locale and host, or null for an unknown app. A lufthansa.com
 * page's module app (www.lufthansa.com sends its scripts without Access-Control-Allow-Origin, so
 * a module from there is refused on our hosts) loads from the page's own /digitalhangar/ where the
 * host serves it; the brands' apps from their www (SWISS's, OWN_HOST_BRANDS, from the page's own
 * /digitalhangar/ where the host serves it), the classic scripts from www, as before.
 */
export function mountPlan(block, brand, locale, hostname = window.location.hostname) {
  const app = appOf(block);
  if (!app) return null;
  const ownHost = app.path && app.module && !brand && servesDigitalHangar(hostname);
  const brandOwn = Boolean(brand && OWN_HOST_BRANDS.includes(brand.www))
    && servesDigitalHangar(hostname);
  let brandWww = app.path && brand && brand.www ? `https://${brand.www}` : WWW;
  if (app.path && brandOwn) brandWww = `https://${hostname}`;
  const www = ownHost ? `https://${hostname}` : brandWww;
  const design = app.brandDesign && brand ? BRAND_DESIGN_SYSTEMS[brand.www] : null;
  // the brand's design system from its www; a lufthansa.com app's own release from www
  const releases = (origin) => `${origin}/digitalhangar/design-system/releases`;
  let base = null;
  if (design) base = `${releases(brandWww)}/${design.release}/standalone`;
  else if (app.release) base = `${releases(WWW)}/${app.release}/standalone`;
  const theme = design ? design.theme : 'lufthansa';
  const attributes = { ...(app.attributes || {}) };
  rowsOf(block).slice(1).forEach(([key, value]) => {
    const name = String(key || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    // the Fallback row is the block's content, not the app's
    if (name && name !== 'fallback') attributes[`data-${name}`] = value || '';
  });
  return {
    tag: app.tag,
    className: app.className || '',
    css: base ? `${base}/css/${theme}.css` : DESIGN_SYSTEM_CSS,
    scripts: [
      { src: base ? `${base}/packages/maui-design-system.js` : DESIGN_SYSTEM_JS, module: true },
      { src: app.script || `${www}${app.path}`, module: Boolean(app.module) },
    ],
    attributes,
    meta: app.portalMeta ? {
      'X-Portal': portalOf(locale),
      'X-Portal-Site': String(locale.country || '').toUpperCase(),
      'X-Portal-Language': locale.lang,
    } : {},
  };
}

/** The text a node shows: its text nodes, its shadow roots', not styles or scripts. */
function shownText(node, depth = 0) {
  if (!node || depth > 30) return '';
  if (node.nodeType === 3) return node.nodeValue.trim();
  if (node.nodeType === 1 && /^(STYLE|SCRIPT|TEMPLATE|NOSCRIPT)$/.test(node.tagName)) return '';
  const parts = [];
  if (node.shadowRoot) parts.push(node.shadowRoot);
  parts.push(...node.childNodes);
  let text = '';
  parts.some((child) => {
    text = shownText(child, depth + 1);
    return Boolean(text);
  });
  return text;
}

/**
 * Whether an app's element shows something: on the page, a height, and text in its shadow root
 * (or one nested in it) or its light DOM.
 * @param {Element} element
 * @returns {boolean}
 */
export function hasRendered(element) {
  if (!element || !element.isConnected) return false;
  const { height } = element.getBoundingClientRect();
  return height > 0 && Boolean(shownText(element));
}

/** The Fallback row's content (its second cell), taken out of the block; null without one. */
function takeFallback(block) {
  const row = [...block.children].find((r) => /^fallback$/i.test((r.children[0]?.textContent || '').trim()));
  if (!row) return null;
  const fallback = document.createElement('div');
  fallback.className = 'micro-frontend-fallback';
  if (row.children[1]) fallback.append(...row.children[1].childNodes);
  // nested blocks (an accordion): each in its own wrapper, decorated and loaded as a block
  [...fallback.children].filter((c) => c.tagName === 'DIV' && c.classList.length).forEach((nested) => {
    const wrapper = document.createElement('div');
    nested.replaceWith(wrapper);
    wrapper.append(nested);
    decorateBlock(nested);
    loadBlock(nested);
  });
  return fallback;
}

/** The blocks after the block in its section named in shows (their wrappers). */
function shownAfter(block, shows = []) {
  const wrapper = block.parentElement;
  const section = wrapper && wrapper.parentElement;
  if (!section || !shows.length) return [];
  const after = [...section.children].slice([...section.children].indexOf(wrapper) + 1);
  return after.filter((w) => shows.some((name) => w.querySelector(`:scope > .${name}`)));
}

/**
 * Shows the app in place of the fallback once it renders (and removes the blocks after it that
 * show the same, shows), else removes it at the deadline.
 */
function watchApp(element, fallback, deadline, shows) {
  const check = () => {
    if (!element.isConnected) return;
    if (hasRendered(element)) {
      element.classList.remove('micro-frontend-pending');
      element.removeAttribute('aria-hidden');
      element.removeAttribute('inert');
      shownAfter(fallback.parentElement, shows).forEach((w) => w.remove());
      fallback.remove();
      return;
    }
    if (Date.now() >= deadline) {
      element.remove();
      return;
    }
    setTimeout(check, FALLBACK_TIMING.every);
  };
  check();
}

export default async function decorate(block) {
  const deadline = Date.now() + FALLBACK_TIMING.wait;
  const fallback = takeFallback(block);
  const plan = mountPlan(block, brandEntry(), getLocale());
  const { shows } = appOf(block) || {};
  block.replaceChildren();
  if (fallback) block.append(fallback);
  if (!plan) return;
  // the meta tags the app reads, where the page has none
  Object.entries(plan.meta).forEach(([name, content]) => {
    if (document.head.querySelector(`meta[name="${name}"]`)) return;
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    document.head.append(meta);
  });
  const config = configOf(block);
  const mount = async () => {
    try {
      await Promise.all([
        loadCSS(plan.css),
        ...plan.scripts.map(({ src, module }) => loadScript(src, module ? { type: 'module' } : {})),
      ]);
    } catch (e) {
      // a script that does not load: the element stays empty, as on www
    }
    // with a fallback: too late, the fallback stays
    if (fallback && Date.now() >= deadline) return;
    const element = document.createElement(plan.tag);
    if (plan.className) element.className = plan.className;
    Object.entries(plan.attributes).forEach(([name, value]) => element.setAttribute(name, value));
    if (config) element.setAttribute('data-config', JSON.stringify(config));
    if (fallback) {
      // mounted out of sight (laid out, so its height counts) until it shows something
      element.classList.add('micro-frontend-pending');
      element.setAttribute('aria-hidden', 'true');
      element.setAttribute('inert', '');
    }
    block.append(element);
    if (fallback) watchApp(element, fallback, deadline, shows);
  };
  // without a fallback as before: the block waits for the app; with one the fallback shows at once
  if (fallback) mount();
  else await mount();
}
