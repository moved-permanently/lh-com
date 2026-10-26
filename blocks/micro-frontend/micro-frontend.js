import { loadCSS, loadScript } from '../../scripts/aem.js';

/*
 * Micro Frontend: one of www.lufthansa.com's micro-frontends on the page (AMS rest A4 part 2).
 * The block loads www's design system (stylesheet and module script) and the app's classic
 * script from www, then renders the app's element. The page's data comes in the block's
 * data-config (JSON; lh-edge sets it when another system POSTs to <page>.mfe.html) and is handed
 * to the element as its own data-config before it is attached (the app reads it on connect).
 */

/** www's design system release the apps are built against: change it here only. */
export const DESIGN_SYSTEM_VERSION = 'v1.38.0';
const WWW = 'https://www.lufthansa.com';
const DESIGN_SYSTEM = `${WWW}/digitalhangar/design-system/releases/${DESIGN_SYSTEM_VERSION}/standalone`;
export const DESIGN_SYSTEM_CSS = `${DESIGN_SYSTEM}/css/lufthansa.css`;
export const DESIGN_SYSTEM_JS = `${DESIGN_SYSTEM}/packages/maui-design-system.js`;

/** The apps the block knows: name (the block's text) -> element, script and www's classes. */
export const APPS = {
  'trip-management': {
    tag: 'trip-management',
    script: `${WWW}/digitalhangar/trip-management/trip-management/trip-management-latest.js`,
    className: 'full-width-bg px-0 pb-5',
  },
};
const DEFAULT_APP = 'trip-management';

/** The app named in the block (its first cell), else the default; null for an unknown name. */
export function appOf(block) {
  const name = (block.textContent || '').trim().toLowerCase() || DEFAULT_APP;
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

export default async function decorate(block) {
  const app = appOf(block);
  block.replaceChildren();
  if (!app) return;
  const config = configOf(block);
  try {
    await Promise.all([
      loadCSS(DESIGN_SYSTEM_CSS),
      loadScript(DESIGN_SYSTEM_JS, { type: 'module' }),
      loadScript(app.script),
    ]);
  } catch (e) {
    // a script that does not load: the element stays empty, as on www
  }
  const element = document.createElement(app.tag);
  element.className = app.className;
  if (config) element.setAttribute('data-config', JSON.stringify(config));
  block.append(element);
}
