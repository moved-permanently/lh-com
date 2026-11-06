/* eslint-disable max-len, import/extensions -- dev tooling */
/* Austrian's Star Alliance partner page (/<market>/<lang>/lhg-staralliance-partner, 10 documents; brief 438
   item 2): www gives some airlines' logo links an alt text ("Logo of Aegean.") and others none, so those links
   had no accessible name (axe link-name). tools/importer/austrian-partner-logos.mjs names each logo by its
   image file (the 26 logos www shows: the 25 airlines and Lufthansa, whose logo links to www's
   /gc/fr/homepage) where the alt is empty; www's own alt texts stay. The import applies it.
   Run: node --max-old-space-size=512 --test test/austrian-partner-logos.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { LOGO_NAMES, withPartnerLogoAlts } from '../tools/importer/austrian-partner-logos.mjs';

const link = (href, file, alt) => `<a href="${href}"><picture><img src="https://www.austrian.com/content/dam/lh/images/logo/${file}.transform/lh-dcep-transform-width-2560/img.jpg" alt="${alt}"></picture></a>`;

test('an empty alt gets the airline\'s name from the logo file; www\'s alt texts stay', () => {
  assert.equal(withPartnerLogoAlts(link('https://www.aircanada.com', 'air-canada.jpg', '')), link('https://www.aircanada.com', 'air-canada.jpg', 'Air Canada'));
  assert.equal(withPartnerLogoAlts(link('https://www.austrian.com/gc/fr/homepage', 'logo-lufthansa-blue.jpg', '')), link('https://www.austrian.com/gc/fr/homepage', 'logo-lufthansa-blue.jpg', 'Lufthansa'));
  assert.equal(withPartnerLogoAlts(link('https://www.croatiaairlines.com', 'StarAlliance%20Logo%20Croatia.jpg', ' ')), link('https://www.croatiaairlines.com', 'StarAlliance%20Logo%20Croatia.jpg', 'Croatia Airlines'));
  const kept = link('https://www.aegeanair.com', 'logo-aegean-airlines.jpg', 'Logo of Aegean.');
  assert.equal(withPartnerLogoAlts(kept), kept);
  const other = link('https://example.com', 'something-else.jpg', '');
  assert.equal(withPartnerLogoAlts(other), other, 'an unknown picture as it was');
});

test('the 26 logos of the page, each with a name', () => {
  assert.equal(Object.keys(LOGO_NAMES).length, 26);
  Object.values(LOGO_NAMES).forEach((n) => assert.ok(n.trim().length > 2, n));
});

test('every lhg-staralliance-partner document: no logo link without a name', () => {
  const docs = ['at/de', 'at/en', 'cn/zh', 'es/es', 'fr/fr', 'gr/el', 'it/it', 'jp/ja', 'pl/pl', 'ru/ru']
    .map((l) => new URL(`../content-sites/lh-austrian/content/${l}/lhg-staralliance-partner.plain.html`, import.meta.url))
    .filter((u) => fs.existsSync(u));
  docs.forEach((u) => {
    const s = fs.readFileSync(u, 'utf8');
    const empty = [...s.matchAll(/<a href="[^"]*"><picture><img [^>]*alt="\s*"/g)].length;
    assert.equal(empty, 0, u.pathname);
  });
});

test('the import names them', () => {
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /import \{ withPartnerLogoAlts \} from '\.\/austrian-partner-logos\.mjs';/);
  assert.match(src, /const next = withPartnerLogoAlts\(/);
});
