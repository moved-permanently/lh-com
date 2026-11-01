/* Air Dolomiti's accessibility settings, as www.airdolomiti.it's header "Configura accessibilità"
   (2026-11-01): text size (Dimensione: Normale, Grande, Molto Grande) and Contrasto, opt-in per
   brand (scripts/brands.js accessibility: Air Dolomiti only). The choice is kept in localStorage
   (www keeps none) and restored before the page shows (scripts.js loadEager, while the body is
   still hidden); labels in Italian, English and German. A brand without the option: no button,
   no panel, no module, nothing applied.
   Run: node --max-old-space-size=512 --test test/accessibility-settings.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const HOST = 'main--lh-airdolomiti--moved-permanently.aem.page';
const at = (pathname, meta = { brand: 'airdolomiti' }) => {
  window.location = {
    hostname: HOST, pathname, search: '', hash: '', replace: () => {}, href: `https://${HOST}${pathname}`, origin: `https://${HOST}`,
  };
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
};
at('/');
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
// linkedom has no KeyboardEvent; an Event with a key does
const key = (target, k) => {
  const e = new window.Event('keydown', { bubbles: true });
  e.key = k;
  target.dispatchEvent(e);
};
class MemoryStorage {
  constructor(items = {}) { this.items = { ...items }; }

  getItem(k) { return Object.prototype.hasOwnProperty.call(this.items, k) ? this.items[k] : null; }

  setItem(k, v) { this.items[k] = String(v); }

  removeItem(k) { delete this.items[k]; }
}
// linkedom keeps no focus: the element last focused
let focused = null;
window.HTMLElement.prototype.focus = function focus() { focused = this; };
globalThis.window = window;
globalThis.document = document;

const {
  STORAGE_KEY, LABELS, readChoice, applyChoice, restoreAccessibility, buildAccessibility,
} = await import('../scripts/accessibility.js');
const { BRANDS } = await import('../scripts/brands.js');

const root = document.documentElement;
beforeEach(() => {
  root.removeAttribute('data-a11y-size');
  root.classList.remove('a11y-contrast');
  document.body.textContent = '';
  at('/');
});

test('brands.js: the accessibility settings on Air Dolomiti only', () => {
  const on = Object.keys(BRANDS).filter((k) => BRANDS[k].accessibility);
  assert.deepEqual(on, ['airdolomiti']);
});

test('an option applied: Grande, Molto Grande, Normale and Contrasto on <html>, kept in localStorage', () => {
  const storage = new MemoryStorage();
  const loads = [];
  const { button, panel } = buildAccessibility({ lang: 'it', storage, loadStyles: (href) => { loads.push(href); return Promise.resolve(); } });
  document.body.append(button, panel);
  // the panel's own styles and the options' rules: one stylesheet, loaded with the button
  assert.deepEqual(loads, ['/styles/accessibility.css']);
  const radios = [...panel.querySelectorAll('input[type="radio"]')];
  assert.deepEqual(radios.map((r) => r.value), ['normal', 'medium', 'large']);
  assert.ok(radios[0].checked);

  radios[2].checked = true;
  radios[2].dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(root.getAttribute('data-a11y-size'), 'large');
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), { size: 'large', contrast: false });

  radios[1].checked = true;
  radios[1].dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(root.getAttribute('data-a11y-size'), 'medium');

  const contrast = panel.querySelector('input[type="checkbox"]');
  assert.equal(contrast.getAttribute('role'), 'switch');
  contrast.checked = true;
  contrast.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.ok(root.classList.contains('a11y-contrast'));
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), { size: 'medium', contrast: true });

  // back to Normale and contrast off: nothing left on <html>
  radios[0].checked = true;
  radios[0].dispatchEvent(new window.Event('change', { bubbles: true }));
  contrast.checked = false;
  contrast.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(root.hasAttribute('data-a11y-size'), false);
  assert.equal(root.classList.contains('a11y-contrast'), false);
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), { size: 'normal', contrast: false });
  assert.deepEqual(loads, ['/styles/accessibility.css']);
});

test('the choice restored: applied before the page shows (with the stylesheet awaited), the panel shows it', async () => {
  const storage = new MemoryStorage({ [STORAGE_KEY]: JSON.stringify({ size: 'medium', contrast: true }) });
  const loads = [];
  let loaded = false;
  const loadStyles = (href) => {
    loads.push(href);
    return new Promise((resolve) => { setTimeout(() => { loaded = true; resolve(); }, 5); });
  };
  const choice = await restoreAccessibility(BRANDS.airdolomiti, { storage, loadStyles });
  assert.deepEqual(choice, { size: 'medium', contrast: true });
  assert.ok(loaded, 'the stylesheet is in before the page shows');
  assert.deepEqual(loads, ['/styles/accessibility.css']);
  assert.equal(root.getAttribute('data-a11y-size'), 'medium');
  assert.ok(root.classList.contains('a11y-contrast'));

  const { panel } = buildAccessibility({ lang: 'it', storage, loadStyles });
  assert.ok(panel.querySelector('input[value="medium"]').checked);
  assert.equal(panel.querySelector('input[value="normal"]').checked, false);
  assert.ok(panel.querySelector('input[type="checkbox"]').checked);
});

test('restore: nothing stored or the defaults: nothing applied, no stylesheet; unreadable values are the defaults', async () => {
  const loads = [];
  const loadStyles = (href) => { loads.push(href); return Promise.resolve(); };
  assert.deepEqual(await restoreAccessibility(BRANDS.airdolomiti, { storage: new MemoryStorage(), loadStyles }), { size: 'normal', contrast: false });
  assert.deepEqual(await restoreAccessibility(BRANDS.airdolomiti, { storage: new MemoryStorage({ [STORAGE_KEY]: '{"size":"normal","contrast":false}' }), loadStyles }), { size: 'normal', contrast: false });
  assert.deepEqual(loads, []);
  assert.equal(root.hasAttribute('data-a11y-size'), false);
  assert.deepEqual(readChoice(new MemoryStorage({ [STORAGE_KEY]: 'not json' })), { size: 'normal', contrast: false });
  assert.deepEqual(readChoice(new MemoryStorage({ [STORAGE_KEY]: '{"size":"huge","contrast":"yes"}' })), { size: 'normal', contrast: false });
  // storage that throws (blocked): the defaults, no error
  const blocked = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
  assert.deepEqual(readChoice(blocked), { size: 'normal', contrast: false });
  applyChoice({ size: 'large', contrast: false }, root);
  assert.equal(root.getAttribute('data-a11y-size'), 'large');
});

test('brand off: nothing restored or applied, even with a stored choice; scripts.js and header.js load the module only for a brand with the option', async () => {
  const storage = new MemoryStorage({ [STORAGE_KEY]: JSON.stringify({ size: 'large', contrast: true }) });
  const loads = [];
  const loadStyles = (href) => { loads.push(href); return Promise.resolve(); };
  const results = await Promise.all([null, BRANDS.discover, BRANDS.cargo, BRANDS.austrian]
    .map((brand) => restoreAccessibility(brand, { storage, loadStyles })));
  assert.deepEqual(results, [null, null, null, null]);
  assert.deepEqual(loads, []);
  assert.equal(root.hasAttribute('data-a11y-size'), false);
  assert.equal(root.classList.contains('a11y-contrast'), false);

  const scripts = fs.readFileSync('scripts/scripts.js', 'utf8');
  assert.equal(/^import .*accessibility\.js/m.test(scripts), false, 'no static import: other brands fetch nothing');
  assert.match(scripts, /\.accessibility\s*\?\s*import\('\.\/accessibility\.js'\)/);
  const header = fs.readFileSync('blocks/header/header.js', 'utf8');
  assert.equal(/^import .*accessibility\.js/m.test(header), false);
  assert.match(header, /\.accessibility\b[^\n]*\n?[^\n]*import\('\.\.\/\.\.\/scripts\/accessibility\.js'\)/);
});

test('keyboard and screen reader: a named button that says whether it is open, the panel next to it, Escape closes and returns focus', () => {
  const { button, panel, root: wrap } = buildAccessibility({
    lang: 'it', storage: new MemoryStorage(), loadStyles: () => Promise.resolve(),
  });
  document.body.append(wrap);
  assert.equal(button.tagName, 'BUTTON');
  assert.equal(button.getAttribute('type'), 'button');
  assert.equal(button.getAttribute('aria-label'), 'Configura accessibilità');
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(button.getAttribute('aria-controls'), panel.id);
  assert.ok(panel.hidden);
  // the panel follows the button (Tab from the button goes into it, as on www)
  assert.ok(button.nextElementSibling === panel);
  assert.equal(panel.getAttribute('aria-label'), 'Configura accessibilità');
  const legend = panel.querySelector('fieldset > legend');
  assert.equal(legend.textContent, 'Dimensione');
  // every control has its own label
  [...panel.querySelectorAll('input')].forEach((input) => {
    assert.ok(panel.querySelector(`label[for="${input.id}"]`), `label for ${input.id}`);
  });
  // one radio group
  assert.equal(new Set([...panel.querySelectorAll('input[type="radio"]')].map((r) => r.name)).size, 1);

  button.click();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(panel.hidden, false);
  const radio = panel.querySelector('input[value="medium"]');
  radio.focus();
  key(radio, 'Escape');
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.ok(panel.hidden);
  assert.ok(focused === button);

  // a click elsewhere closes it, a click inside does not
  button.click();
  panel.querySelector('legend').dispatchEvent(new window.Event('click', { bubbles: true }));
  assert.equal(panel.hidden, false);
  document.body.dispatchEvent(new window.Event('click', { bubbles: true }));
  assert.ok(panel.hidden);
});

test('labels in Italian, English and German as www (German with ß, www writes a Greek β); other languages English', () => {
  const texts = (lang) => {
    const { button, panel } = buildAccessibility({
      lang, storage: new MemoryStorage(), loadStyles: () => Promise.resolve(),
    });
    return [button.getAttribute('aria-label'), ...[...panel.querySelectorAll('legend, label')].map((l) => l.textContent)];
  };
  assert.deepEqual(texts('it'), ['Configura accessibilità', 'Dimensione', 'Normale', 'Grande', 'Molto Grande', 'Contrasto']);
  assert.deepEqual(texts('en'), ['Configure accessibility', 'Dimensions', 'Normal', 'Big', 'Very big', 'Contrast']);
  assert.deepEqual(texts('de'), ['Barrierefreiheit konfigurieren', 'Dimension', 'Normal', 'Groß', 'Sehr groß', 'Kontrast']);
  assert.deepEqual(texts('fr'), texts('en'));
  assert.deepEqual(Object.keys(LABELS), ['it', 'en', 'de']);
});

test('two panels on one page (none expected) keep their ids apart', () => {
  const a = buildAccessibility({ lang: 'it', storage: new MemoryStorage(), loadStyles: () => Promise.resolve() });
  const b = buildAccessibility({ lang: 'it', storage: new MemoryStorage(), loadStyles: () => Promise.resolve() });
  const ids = [a, b].flatMap((x) => [x.panel.id, ...[...x.panel.querySelectorAll('input')].map((i) => i.id)]);
  assert.equal(new Set(ids).size, ids.length);
});

test('accessibility.css: a rule per size and the contrast class, all keyed on <html>, nothing else global', () => {
  const css = fs.readFileSync('styles/accessibility.css', 'utf8');
  assert.match(css, /html\[data-a11y-size="medium"\]/);
  assert.match(css, /html\[data-a11y-size="large"\]/);
  assert.match(css, /html\.a11y-contrast/);
  // every rule outside the header panel's is keyed on the option (no effect without a choice)
  const selectors = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim())
    .filter((s) => !s.startsWith('@'));
  // the selector list's own commas (not those inside :not(), :is())
  const parts = (s) => s.split(/,(?![^(]*\))/).map((x) => x.trim());
  selectors.forEach((s) => parts(s).forEach((x) => {
    assert.ok(/^html(\[data-a11y-size|\.a11y-contrast)/.test(x) || /\.nav-accessibility/.test(x), x);
  }));
});
