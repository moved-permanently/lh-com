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

  it('footer: the link columns, the social and app links as badges, the logo row', () => {
    const d = dom(footerHtml(pp, site));
    assert.deepEqual([...d.querySelectorAll('h3')].map((h) => h.textContent), ['Outros websites', 'Outros recursos importantes', 'Destinos em destaque']);
    assert.ok(d.querySelector('a[href="https://www.facebook.com/TAPAirPortugal"]'));
    assert.ok(d.body.textContent.includes(':instagram:'));
    assert.ok([...d.querySelectorAll('.section-metadata')].some((m) => m.textContent.includes('badges')));
    // www's cookie settings (its consent layer): left out
    assert.ok(!d.body.textContent.includes('Definições de Cookies'));
    assert.ok(d.querySelector(`img[src="${site.logo}"]`));
  });
});
