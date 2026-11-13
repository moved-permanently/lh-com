/* eslint-disable max-len, import/extensions */
/* Standing order 16 (2026-11-13), item 2: the header's locale dialog, its "Other countries" select (blocks/header/header.js
   buildLocaleDialog, built from the nav's ":globe:" sub-list), preselected nothing, so every root showed its list's first
   country: "Afryka Południowa" on pl/pl and xx/pl (the register-animal-cabin form page included; the form has no select).
   www's selector preselects the page's own country (maui-select "Location" selected="DE" on de/en, lh-snapshots-115), its
   list ends with XX "Other countries", the language versions' entry. Ours now preselects the option of the page's country
   (the same language first), on a language version the own-root "Other countries" link (/xx/pl/homepage), every locale and
   brand; a list without the country keeps its first option.
   Run: node --max-old-space-size=256 --test test/header-country-so16.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { currentCountry } = await import('../blocks/header/header-tools.js');

const PL = [
  { name: 'Afryka Południowa', href: 'https://www.lufthansa.com/za/pl/homepage' },
  { name: 'Polska', href: 'https://www.lufthansa.com/pl/pl/homepage' },
  { name: 'Szwajcaria', href: 'https://www.lufthansa.com/ch/en/homepage' },
  { name: 'Inne kraje', href: '/pl/pl/homepage' },
];
const XX = [...PL.slice(0, 3), { name: 'Inne kraje', href: '/xx/pl/homepage' }];

test('a country root preselects its country, not the list\'s first', () => {
  assert.equal(currentCountry(PL, { country: 'pl', lang: 'pl', key: 'pl/pl' }), 1);
});

test('a language version preselects "Other countries" (its own root)', () => {
  assert.equal(currentCountry(XX, { country: 'xx', lang: 'pl', key: 'xx/pl' }), 3);
});

test('the same language first, then the country in another language; else none', () => {
  const CH = [
    { name: 'Deutschland', href: '/de/de/homepage' },
    { name: 'Schweiz (English)', href: 'https://www.lufthansa.com/ch/en/homepage' },
    { name: 'Schweiz', href: '/ch/de/homepage' },
  ];
  assert.equal(currentCountry(CH, { country: 'ch', lang: 'de', key: 'ch/de' }), 2);
  assert.equal(currentCountry(CH, { country: 'ch', lang: 'fr', key: 'ch/fr' }), 1);
  assert.equal(currentCountry(CH, { country: 'at', lang: 'de', key: 'at/de' }), -1);
  assert.equal(currentCountry([{ name: 'x', href: '/fragments/x' }, { name: 'y', href: 'mailto:a' }], { country: 'pl', lang: 'pl' }), -1);
});

test('the pl/pl and xx/pl navs: Polska and Inne kraje', () => {
  const nav = (p) => {
    const html = fs.readFileSync(new URL(`./fixtures/header-country-so16/${p}`, import.meta.url), 'utf8');
    return [...html.matchAll(/<a href="([^"]+)">([^<]*)<\/a>/g)].map(([, href, name]) => ({ href, name }));
  };
  const pl = nav('pl-pl-countries.html');
  assert.equal(pl[0].name, 'Afryka Południowa');
  assert.equal(pl[currentCountry(pl, { country: 'pl', lang: 'pl', key: 'pl/pl' })].name, 'Polska');
  const xx = nav('xx-pl-countries.html');
  assert.equal(xx[currentCountry(xx, { country: 'xx', lang: 'pl', key: 'xx/pl' })].name, 'Inne kraje');
});

test('the dialog marks the option selected', () => {
  const js = fs.readFileSync(new URL('../blocks/header/header.js', import.meta.url), 'utf8');
  assert.ok(js.includes('currentCountry(countries, locale)'), 'header.js preselects with currentCountry');
});
