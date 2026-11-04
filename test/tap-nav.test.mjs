/* eslint-disable import/no-extraneous-dependencies, import/extensions, no-underscore-dangle */
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
    // the quick actions (www's widgets: check-in, manage booking): the homepage's booking box
    assert.ok([...s[1].querySelectorAll('a')].some((a) => a.getAttribute('href') === '/pt-pt#check-in'));
    // the mega menu's tabs (www's top level, Check-in third), their columns and links; site pages
    // relative, the rest on www
    const tabs = [...s[2].querySelectorAll(':scope > ul > li > p')].map((p) => p.textContent);
    assert.deepEqual(tabs, ['Planear viagem', 'Os meus voos', 'Check-in', 'TAP Miles&Go', 'Ajuda']);
    assert.ok(s[2].querySelector('a[href="/pt-pt/informacoes/bagagem"]'));
    assert.ok(s[2].querySelector('a[href="https://www.flytap.com/pt-pt/a-bordo"]'));
    assert.ok(s[2].querySelector('a[href="https://www.flytap.com/pt_pt/desconto-voos"]'));
    // the widget entries (check-in form, flights to check in) are left out
    assert.ok(!s[2].textContent.includes('Check In Form'));
    assert.ok(s[3].textContent.includes('Menu'));
  });

  it('menu as www\'s: every column with its heading link and links, "See all" where www shows it', () => {
    const s = sections(navHtml(pp, site));
    const items = [...s[2].querySelectorAll(':scope > ul > li')];
    const cols = (li) => [...li.querySelectorAll(':scope > ul > li')].filter((c) => !c.querySelector(':scope > p > strong'));
    const heads = (li) => cols(li).map((c) => c.querySelector(':scope > p').textContent);
    assert.deepEqual(heads(items[0]), ['Reservar', 'Informações de viagem', 'A bordo']);
    // the heading is the column's page
    assert.equal(cols(items[0])[0].querySelector(':scope > p > a').getAttribute('href'), '/pt-pt/reservas');
    assert.equal(cols(items[0])[0].querySelectorAll(':scope > ul > li > a').length, 6);
    // "See all" (www's showSeeAll) under Reservar and Informações de viagem, not under A bordo
    const seeAll = (c) => c.querySelector(':scope > ul + p > a');
    assert.deepEqual(cols(items[0]).map((c) => (seeAll(c) ? [seeAll(c).textContent, seeAll(c).getAttribute('href')] : null)), [['Ver todos', '/pt-pt/reservas'], ['Ver todos', 'https://www.flytap.com/pt-pt/informacoes'], null]);
    // Os meus voos: "Gerir reserva" (a column with www's check-in form widget and links) and Extras
    assert.deepEqual(heads(items[1]), ['Gerir reserva', 'Extras']);
    assert.deepEqual([...cols(items[1])[0].querySelectorAll(':scope > ul > li > a')].map((a) => a.textContent), ['Gestão da Reserva', 'Extras e Upgrades', 'Fatura online', 'TAP Vouchers']);
    // the manage-booking anchor: the root homepage's booking box
    assert.equal(cols(items[1])[0].querySelector(':scope > ul > li > a').getAttribute('href'), '/pt-pt#my-travels');
  });

  it('Check-in: a top item linking the booking box, its form column to the box, its information page; sign-in widgets left out', () => {
    const s = sections(navHtml(pp, site));
    const checkIn = [...s[2].querySelectorAll(':scope > ul > li')][2];
    assert.equal(checkIn.querySelector(':scope > p > a').getAttribute('href'), '/pt-pt#check-in');
    const cols = [...checkIn.querySelectorAll(':scope > ul > li')];
    assert.deepEqual(cols.map((c) => [c.querySelector(':scope > p').textContent, c.querySelector(':scope > p > a').getAttribute('href')]), [
      ['Efetuar Check-in', '/pt-pt#check-in'],
      ['Informações de Check-in', 'https://www.flytap.com/pt-pt/informacoes-check-in'],
    ]);
    assert.ok(!checkIn.textContent.includes('Voos para Check-in'), 'the signed-in flights list (requireLogin) is left out');
  });

  it('the banner (www\'s bannerMenu): a row of its own with the picture, title, line and link', () => {
    const withPic = JSON.parse(JSON.stringify(pp));
    withPic.headerMenu[0].bannerMenu.image._dynamicUrl = '/adobe/dynamicmedia/deliver/dm-aid--1/ees.jpg';
    const media = (k) => (k === '/adobe/dynamicmedia/deliver/dm-aid--1/ees.jpg' ? '/media-da/tap/ees-1.jpg' : null);
    const s = sections(navHtml(withPic, { ...site, media }));
    const plan = s[2].querySelector(':scope > ul > li');
    const banner = [...plan.querySelectorAll(':scope > ul > li')].pop();
    assert.equal(banner.querySelector('img').getAttribute('src'), '/media-da/tap/ees-1.jpg');
    assert.deepEqual([...banner.querySelectorAll(':scope > p')].map((p) => p.textContent), ['', 'Novo sistema EES', 'Demoras no controlo de passaportes em Lisboa.', 'Saiba mais']);
    assert.ok(banner.querySelector(':scope > p > strong'));
    assert.equal(banner.querySelector(':scope > p > a').getAttribute('href'), 'https://www.flytap.com/pt-pt/informacoes/documentacao/vistos-schengen');
    // without its picture the banner is still a row (title, line, link)
    const plain = sections(navHtml(pp, site))[2].querySelector(':scope > ul > li');
    assert.match([...plain.querySelectorAll(':scope > ul > li')].pop().textContent, /Novo sistema EES.*Saiba mais/);
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

  it('the language switch per root: a market\'s other language is English of the same market (pt-br: en-br), en-pt\'s Português', () => {
    const other = (locale) => {
      const s = sections(navHtml(pp, {
        ...site, url: `https://www.flytap.com/${locale}`, locale, scope: new Set([`/${locale}`]),
      }));
      const a = [...s[3].querySelectorAll('a')].pop();
      return [a.textContent, a.getAttribute('href')];
    };
    assert.deepEqual(other('pt-br'), ['English', 'https://www.flytap.com/en-br']);
    assert.deepEqual(other('en-pt'), ['Português', 'https://www.flytap.com/pt-pt']);
    assert.deepEqual(other('de-de'), ['English', 'https://www.flytap.com/en-de']);
    // an English root of a market without a language of its own in the table: the market's
    // Portuguese (www's markets all have it), never the root itself
    assert.deepEqual(other('en-us'), ['Português', 'https://www.flytap.com/pt-us']);
    assert.deepEqual(other('en-ch'), ['Português', 'https://www.flytap.com/pt-ch']);
    assert.deepEqual(other('en-gb'), ['Português', 'https://www.flytap.com/pt-gb']);
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
