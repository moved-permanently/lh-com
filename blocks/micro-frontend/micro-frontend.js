import { loadCSS, loadScript } from '../../scripts/aem.js';
import { getLocale, brandEntry, portalOf } from '../../scripts/locale.js';

/*
 * Micro Frontend: one of the Lufthansa Group's micro-frontends on the page (AMS rest A4 part 2).
 * The block loads the design system (stylesheet and module script) and the app's script, then
 * renders the app's element. The page's data comes in the block's data-config (JSON; lh-edge sets
 * it when another system POSTs to <page>.mfe.html) and is handed to the element as its own
 * data-config before it is attached (the app reads it on connect). Rows after the app's name
 * ("Configuration | ...", "API gateway | ...") become the element's data- attributes
 * (data-configuration, data-api-gateway).
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
};

/**
 * The apps the block knows: name (the block's first cell) -> element, script and www's classes.
 * script: an absolute URL (www.lufthansa.com's app), or path: the app on the page's brand www
 * (www.lufthansa.com without a brand); module: a module script; attributes: the element's own;
 * portalMeta: the app reads the page's X-Portal, X-Portal-Site, X-Portal-Language meta tags.
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

/** The block's rows as [first cell text, second cell text]. */
const rowsOf = (block) => [...block.children].map((row) => [...row.children].map((c) => (c.textContent || '').trim()));

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
 * meta} for the page's brand entry and locale, or null for an unknown app.
 */
export function mountPlan(block, brand, locale) {
  const app = appOf(block);
  if (!app) return null;
  const www = app.path && brand && brand.www ? `https://${brand.www}` : WWW;
  const design = app.brandDesign && brand ? BRAND_DESIGN_SYSTEMS[brand.www] : null;
  const base = design ? `${www}/digitalhangar/design-system/releases/${design.release}/standalone` : null;
  const attributes = { ...(app.attributes || {}) };
  rowsOf(block).slice(1).forEach(([key, value]) => {
    const name = String(key || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (name) attributes[`data-${name}`] = value || '';
  });
  return {
    tag: app.tag,
    className: app.className || '',
    css: base ? `${base}/css/${design.theme}.css` : DESIGN_SYSTEM_CSS,
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

export default async function decorate(block) {
  const plan = mountPlan(block, brandEntry(), getLocale());
  block.replaceChildren();
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
  try {
    await Promise.all([
      loadCSS(plan.css),
      ...plan.scripts.map(({ src, module }) => loadScript(src, module ? { type: 'module' } : {})),
    ]);
  } catch (e) {
    // a script that does not load: the element stays empty, as on www
  }
  const element = document.createElement(plan.tag);
  if (plan.className) element.className = plan.className;
  Object.entries(plan.attributes).forEach(([name, value]) => element.setAttribute(name, value));
  if (config) element.setAttribute('data-config', JSON.stringify(config));
  block.append(element);
}
