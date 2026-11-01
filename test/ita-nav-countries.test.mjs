/* eslint-disable max-len, import/extensions */
/* The country list of ITA's nav documents (tools/importer/ita-nav.mjs countryLinks), as Austrian's
   (test/austrian-nav-countries.test.mjs): www's country and language selector has two selects,
   countries then languages; only the countries are listed (the languages had become countries:
   "English" https://www.ita-airways.com/en/en/homepage), each to the site's homepage in the page's
   language, else in English, else the country's first root, else www's page.
   Run: node --max-old-space-size=512 --test test/ita-nav-countries.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { countryLinks, navDocument } from '../tools/importer/ita-nav.mjs';

const selector = `<maui-modal class="country-language-selector-modal">
  <maui-select buttontriggerlabel="Country"><maui-option optionvalue="IT">Italia</maui-option><maui-option optionvalue="AL">Albania</maui-option><maui-option optionvalue="JP">Giappone</maui-option><maui-option optionvalue="ZZ">Altrove</maui-option></maui-select>
  <maui-select buttontriggerlabel="Language"><maui-option optionvalue="en">English</maui-option><maui-option optionvalue="it">Italiano</maui-option></maui-select>
</maui-modal>`;
const { document } = parseHTML(`<!DOCTYPE html><html><body>${selector}</body></html>`);
const sitePaths = new Set(['/it/it/homepage', '/it/en/homepage', '/al/en/homepage', '/al/it/homepage', '/jp/ja/homepage', '/it/it/help-and-contact']);

test('countries only, each to the site\'s root for it', () => {
  assert.deepEqual(countryLinks(document, 'it', sitePaths), [
    { code: 'it', name: 'Italia', href: '/it/it/homepage' },
    { code: 'al', name: 'Albania', href: '/al/it/homepage' },
    { code: 'jp', name: 'Giappone', href: '/jp/ja/homepage' },
    { code: 'zz', name: 'Altrove', href: 'https://www.ita-airways.com/zz/it/homepage' },
  ]);
  assert.equal(countryLinks(document, 'fr', sitePaths)[1].href, '/al/en/homepage', 'no al/fr: English');
});

test('the nav document lists no language as a country', () => {
  const nav = navDocument(document, 'it/it', sitePaths);
  assert.ok(!nav.includes('/en/it/homepage'));
  assert.ok(!nav.includes('>English<'));
  assert.ok(nav.includes('<a href="/al/it/homepage">Albania</a>'));
});
