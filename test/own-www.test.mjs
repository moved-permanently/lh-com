/* eslint-disable max-len */
/* Links to the brand's own www (scripts/brand.js brandWwwHost, isOwnWwwHost; blocks/header,
   blocks/footer isExternal, carousel-cards' same-tab rule, cards-teaser's arrow): treated as
   lufthansa.com's links are on lh-com (same tab, no "opens in a new tab"; cards-teaser: the plain
   arrow of www.lufthansa.com's links). lufthansa.com stays exempt everywhere, as before.
   Run: node --max-old-space-size=512 --test test/own-www.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { brandWwwHost, isOwnWwwHost, BRANDS } from '../scripts/brand.js';

const meta = (brand) => (name) => (name === 'brand' ? brand : '');
const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');

test('brandWwwHost: each brand\'s www host, none for lh-com', () => {
  assert.equal(brandWwwHost(meta('ita')), 'www.ita-airways.com');
  assert.equal(brandWwwHost(meta('discover')), 'www.discover-airlines.com');
  assert.equal(brandWwwHost(meta('cargo')), 'www.lufthansa-cargo.com');
  assert.equal(brandWwwHost(meta('airdolomiti')), 'www.airdolomiti.it');
  assert.equal(brandWwwHost(meta('')), '');
  assert.equal(brandWwwHost(), '', 'no page');
  Object.entries(BRANDS).forEach(([key, b]) => assert.match(b.www, /^www\.[a-z0-9.-]+$/, key));
});

test('isOwnWwwHost: lufthansa.com everywhere (as before); the brand\'s domain on its site only', () => {
  ['www.lufthansa.com', 'lufthansa.com', 'shop.lufthansa.com', 'api.travelid.lufthansa.com'].forEach((h) => {
    ['', 'ita', 'discover', 'cargo'].forEach((b) => assert.equal(isOwnWwwHost(h, meta(b)), true, `${h} on ${b || 'lh-com'}`));
  });
  assert.equal(isOwnWwwHost('www.ita-airways.com', meta('ita')), true);
  assert.equal(isOwnWwwHost('shop.ita-airways.com', meta('ita')), true, 'its subdomains, as lufthansa.com\'s');
  assert.equal(isOwnWwwHost('www.ita-airways.com', meta('')), false, 'on lh-com ITA is another site');
  assert.equal(isOwnWwwHost('www.ita-airways.com', meta('discover')), false);
  assert.equal(isOwnWwwHost('www.discover-airlines.com', meta('discover')), true);
  assert.equal(isOwnWwwHost('www.lufthansa-cargo.com', meta('cargo')), true);
  assert.equal(isOwnWwwHost('notita-airways.com', meta('ita')), false);
  assert.equal(isOwnWwwHost('www.ita-airways.com.example.org', meta('ita')), false);
  assert.equal(isOwnWwwHost('www.example.org', meta('ita')), false);
});

test('the blocks use them; cards-teaser keeps www.lufthansa.com\'s rule and adds the brand\'s', () => {
  ['blocks/header/header.js', 'blocks/footer/footer.js'].forEach((f) => {
    assert.match(read(f), /return u\.origin !== window\.location\.origin && !isOwnWwwHost\(u\.hostname\);/, f);
    assert.doesNotMatch(read(f), /lufthansa\\\.com\$/, f);
  });
  assert.match(read('blocks/carousel-cards/carousel-cards.js'), /if \(isOwnWwwHost\(new URL\(a\.href\)\.hostname\)\) a\.removeAttribute\('target'\);/);
  assert.match(read('blocks/cards-teaser/cards-teaser.js'), /new URL\(a\.href\)\.hostname === own\) a\.classList\.add\('cards-teaser-cta-own'\)/);
  assert.match(read('blocks/cards-teaser/cards-teaser.css'), /\.cards-teaser \.cards-teaser-cta-link\[target="_blank"\]:not\(\[href\*="\/\/www\.lufthansa\.com"\]\):not\(\.cards-teaser-cta-own\)::before \{/);
});
