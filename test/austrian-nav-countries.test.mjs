/* eslint-disable max-len, import/extensions */
/* The country list of Austrian's nav documents (tools/importer/austrian-nav.mjs countryLinks):
   www's country and language selector has two selects, countries then languages; only the
   countries are listed (the languages had become countries: "English" /en/en/homepage, and a
   language whose code is a country's, Deutsch/de, was lost), each to the site's homepage in the
   page's language, else in English, else the country's first root, else www's page.
   Run: node --max-old-space-size=512 --test test/austrian-nav-countries.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { countryLinks, navDocument } from '../tools/importer/austrian-nav.mjs';

const selector = `<maui-modal class="country-language-selector-modal">
  <maui-select buttontriggerlabel="Country"><maui-option optionvalue="AT">Österreich</maui-option><maui-option optionvalue="AL">Albanien</maui-option><maui-option optionvalue="CN">China</maui-option><maui-option optionvalue="ZZ">Nirgendwo</maui-option></maui-select>
  <maui-select buttontriggerlabel="Language"><maui-option optionvalue="en">English</maui-option><maui-option optionvalue="de">Deutsch</maui-option></maui-select>
</maui-modal>`;
const { document } = parseHTML(`<!DOCTYPE html><html><body>${selector}</body></html>`);
const sitePaths = new Set(['/at/de/homepage', '/at/en/homepage', '/al/en/homepage', '/cn/zh/homepage', '/at/de/anmeldung']);

test('countries only, each to the site\'s root for it', () => {
  assert.deepEqual(countryLinks(document, 'de', sitePaths), [
    { code: 'at', name: 'Österreich', href: '/at/de/homepage' },
    { code: 'al', name: 'Albanien', href: '/al/en/homepage' },
    { code: 'cn', name: 'China', href: '/cn/zh/homepage' },
    { code: 'zz', name: 'Nirgendwo', href: 'https://www.austrian.com/zz/de/homepage' },
  ]);
});

test('the nav document lists no language as a country', () => {
  const nav = navDocument(document, 'at/de', sitePaths);
  assert.ok(!nav.includes('/en/de/homepage'));
  assert.ok(!nav.includes('>English<'));
  assert.ok(nav.includes('<a href="/al/en/homepage">Albanien</a>'));
});
