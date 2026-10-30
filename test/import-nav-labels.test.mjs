/* The nav importer's labels for what a homepage shows as icons only or as a skeleton
   (tools/importer/import-nav.js): Discover's French roots (brief 157, the fr nav and footer from
   www's ca/fr homepage) get www's French words (its footer's "Rechercher", its login's
   "Connexion") and ca/fr's country label "Canada | Français" instead of English and "CA/FR";
   German and English roots as before. A linkedom page, no network.
   Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = { DOMUtils: { remove: () => {} }, Blocks: {} };
const { default: nav } = await import('../tools/importer/import-nav.js');

const page = () => parseHTML(`<!DOCTYPE html><html><body>
  <header><div class="dcep-header-quick-action-links"></div></header>
  <footer><div class="footer-container"><div class="link-list"><h3>À propos de nous</h3><ul class="vertical"><li><a href="/ca/fr/about-us/company">Notre entreprise</a></li></ul></div></div></footer>
</body></html>`).document;
const run = (url, only) => {
  const document = page();
  const [out] = nav.transform({ document, url: `${url}#${only}`, params: { originalURL: `${url}#${only}` } });
  return out.element.textContent.replace(/\s+/g, ' ');
};

test('a French footer: www\'s "Rechercher" for the search field, ca/fr\'s country label', () => {
  const text = run('https://www.discover-airlines.com/ca/fr/homepage', 'footer');
  assert.match(text, /:search: Rechercher/);
  assert.match(text, /:globe: Canada \| Français/);
  assert.doesNotMatch(text, /Enter search term|CA\/FR/);
});

test('German and English footers keep their labels', () => {
  assert.match(run('https://www.discover-airlines.com/de/de/homepage', 'footer'), /:search: Suchbegriff eingeben\s*:globe: Deutschland \| Deutsch/);
  assert.match(run('https://www.discover-airlines.com/de/en/homepage', 'footer'), /:search: Enter search term\s*:globe: Germany \| English/);
});
