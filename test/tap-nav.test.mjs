/* eslint-disable import/no-extraneous-dependencies, import/extensions -- tests */
/**
 * TAP Air Portugal's nav and footer documents (tools/importer/tap-nav.mjs) from the pt-pt
 * homepage's menus (__NEXT_DATA__ headerMenu, footerMenu, siteSettings;
 * test/fixtures/tap/menus.json).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { navHtml, footerHtml } from '../tools/importer/tap-nav.mjs';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/tap');
const pp = JSON.parse(fs.readFileSync(path.join(dir, 'menus.json'), 'utf8')).props.pageProps;
const dom = (html) => parseHTML(`<html><body><main>${html}</main></body></html>`).document;
const site = {
  url: 'https://www.flytap.com/pt-pt', locale: 'pt-pt', scope: new Set(['/pt-pt', '/pt-pt/reservas', '/pt-pt/informacoes/bagagem', '/pt-pt/ajuda']), logo: '/media-da/tap/tap-logo-0a1b2c3d.svg',
};
const sections = (html) => [...dom(html).querySelectorAll('main > div')];

describe('tap-nav', () => {
  it('nav: the logo, quick actions, the mega menu, tools, in lh-com\'s four sections', () => {
    const s = sections(navHtml(pp, site));
    assert.equal(s.length, 4);
    const logo = s[0].querySelector('a img');
    assert.ok(logo && logo.getAttribute('src') === site.logo);
    assert.equal(s[0].querySelector('a').getAttribute('href'), '/pt-pt');
    // the quick actions (www's widgets: check-in, manage booking) on www
    assert.ok([...s[1].querySelectorAll('a')].some((a) => a.getAttribute('href') === 'https://www.flytap.com/pt-pt#special-anchor-check-in'));
    // the mega menu's tabs, their columns and links; site pages relative, the rest on www
    const tabs = [...s[2].querySelectorAll(':scope > ul > li > p')].map((p) => p.textContent);
    assert.deepEqual(tabs, ['Planear viagem', 'Os meus voos', 'TAP Miles&Go', 'Ajuda']);
    assert.ok(s[2].querySelector('a[href="/pt-pt/informacoes/bagagem"]'));
    assert.ok(s[2].querySelector('a[href="https://www.flytap.com/pt-pt/a-bordo"]'));
    assert.ok(s[2].querySelector('a[href="https://www.flytap.com/pt_pt/desconto-voos"]'));
    // the widget entries (check-in form, flights to check in) are left out
    assert.ok(!s[2].textContent.includes('Check In Form'));
    assert.ok(s[3].textContent.includes('Menu'));
  });

  it('nav texts in every language of the site (logo text, help, menu, the other language)', () => {
    const expect = {
      'es-es': ['TAP Air Portugal, volver a la página de inicio', 'Ayuda', '/es-es/ayuda', 'Menú', 'English'],
      'fr-fr': ['TAP Air Portugal, retour à la page d’accueil', 'Aide', '/fr-fr/aide', 'Menu', 'English'],
      'de-de': ['TAP Air Portugal, zurück zur Startseite', 'Hilfe', '/de-de/hilfe', 'Menü', 'English'],
      'it-it': ['TAP Air Portugal, torna alla homepage', 'Aiuto', '/it-it/assistenza', 'Menu', 'English'],
      'pl-pl': ['TAP Air Portugal, powrót do strony głównej', 'Pomoc', '/pl-pl/pomoc', 'Menu', 'English'],
    };
    Object.entries(expect).forEach(([locale, [alt, help, helpPath, menu, other]]) => {
      const scopeOf = new Set([`/${locale}`, `/${locale}${helpPath.slice(6)}`]);
      const s = sections(navHtml(pp, {
        ...site, url: `https://www.flytap.com/${locale}`, locale, scope: scopeOf,
      }));
      assert.equal(s[0].querySelector('img').getAttribute('alt'), alt, locale);
      const tools = s[3];
      assert.ok(tools.querySelector(`a[href="${helpPath}"]`) && tools.textContent.includes(help), `${locale} help`);
      assert.equal(tools.querySelector('p').textContent, menu, `${locale} menu`);
      // the other language (English of the market) is on www
      assert.ok([...tools.querySelectorAll('a')].some((a) => a.textContent === other && a.getAttribute('href') === `https://www.flytap.com/en-${locale.split('-')[1]}`), `${locale} other`);
    });
  });

  it('footer as www\'s: "Siga-nos" over the social icons, "TAP App" over the store badges (pictures), the copyright as a note', () => {
    const media = (k) => ({ 'https://www.flytap.com/images/download-app-store.webp': '/media-da/tap/download-app-store-1.webp', 'https://www.flytap.com/images/download-google-play.webp': '/media-da/tap/download-google-play-2.webp' }[k] || null);
    const d = dom(footerHtml(pp, { ...site, media }));
    const badges = [...d.querySelectorAll('main > div')].find((s) => /badges/.test(s.textContent));
    assert.deepEqual([...badges.querySelectorAll('h3')].map((h) => h.textContent), ['Siga-nos', 'TAP App']);
    assert.ok(badges.querySelector('a[href^="https://itunes.apple.com"] img[src="/media-da/tap/download-app-store-1.webp"]'));
    assert.ok(badges.querySelector('a[href^="https://play.google.com"] img[src="/media-da/tap/download-google-play-2.webp"]'));
    const note = [...d.querySelectorAll('main > div')].find((s) => s.querySelector('.section-metadata') && /note/.test(s.querySelector('.section-metadata').textContent));
    assert.match(note.textContent, /© \d{4}, TAP\. Todos os direitos reservados\./);
    // without the store pictures: the store names as text links, as before
    const plain = dom(footerHtml(pp, { ...site, media: () => null }));
    assert.ok(plain.body.textContent.includes('App Store'));
  });

  it('footer: the link columns, the social and app links as badges, the logo row', () => {
    const d = dom(footerHtml(pp, site));
    // the columns (the first section; the badges section has its own headings)
    assert.deepEqual([...d.querySelector('main > div').querySelectorAll('h3')].map((h) => h.textContent), ['Outros websites', 'Outros recursos importantes', 'Destinos em destaque']);
    assert.ok(d.querySelector('a[href="https://www.facebook.com/TAPAirPortugal"]'));
    assert.ok(d.body.textContent.includes(':instagram:'));
    assert.ok([...d.querySelectorAll('.section-metadata')].some((m) => m.textContent.includes('badges')));
    // www's cookie settings (its consent layer): left out
    assert.ok(!d.body.textContent.includes('Definições de Cookies'));
    assert.ok(d.querySelector(`img[src="${site.logo}"]`));
  });
});
