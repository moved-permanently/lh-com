/* eslint-disable max-len */
/* The footer's icon links (blocks/footer, scripts/lh-icons.js iconTokenImage, iconLabel): the social
   icons of the badges row (Facebook, YouTube, Instagram, LinkedIn: Lufthansa Cargo's sprite-footer.svg
   cells, 24x24) and the logos Lufthansa Group and IATA Cargo iQ (www.lufthansa-cargo.com's footer
   stylesheet images), authored as ":name:" links like :star-alliance:. Footers without them render as
   before. Run: node --test test/footer-icons.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
const { iconTokenImage, iconLabel } = await import('../scripts/lh-icons.js');

const NEW = ['facebook', 'youtube', 'instagram', 'linkedin', 'lufthansa-group', 'iata-cargo-iq'];

const link = (html) => {
  const p = document.createElement('p');
  p.innerHTML = html;
  return p.querySelector('a');
};

test('the six icons: SVG files with a viewBox, nothing but drawings (no scripts, no outside references)', () => {
  NEW.forEach((name) => {
    const file = path.join(root, 'icons', `${name}.svg`);
    assert.ok(fs.existsSync(file), name);
    const svg = fs.readFileSync(file, 'utf8');
    assert.match(svg, /^<svg [^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, name);
    assert.match(svg, /viewBox="[-\d. ]+"/, name);
    assert.doesNotMatch(svg, /<script|<foreignObject|\son[a-z]+=|href="(?!data:image\/png;base64,|#)/i, name);
  });
  ['facebook', 'youtube', 'instagram', 'linkedin'].forEach((name) => {
    assert.match(fs.readFileSync(path.join(root, 'icons', `${name}.svg`), 'utf8'), /viewBox="-?[\d.]+ -?[\d.]+ 24 24"/, `${name}: a 24x24 cell`);
  });
});

test('iconTokenImage: a ":name:" link becomes the icon\'s image; links with an image or a text stay', () => {
  const a = link('<a href="https://www.facebook.com/lufthansacargoag">:facebook:</a>');
  const img = iconTokenImage(a, '');
  assert.ok(img && img.parentElement === a, 'the image is in the link');
  assert.equal(img.getAttribute('src'), '/icons/facebook.svg');
  assert.equal(img.dataset.iconName, 'facebook');
  assert.equal(img.getAttribute('alt'), '');
  assert.equal(a.textContent, '');
  // the logos' variant table (:star-alliance: shows the horizontal graphic), the code base path
  const sa = iconTokenImage(link('<a href="https://www.staralliance.com" title="Star Alliance">:star-alliance:</a>'), '/base', { 'star-alliance': 'star-alliance-horizontal' });
  assert.deepEqual(['src', 'data-icon-name', 'alt'].map((n) => sa.getAttribute(n)), ['/base/icons/star-alliance-horizontal.svg', 'star-alliance', '']);
  assert.equal(sa.attributes.length, 3);
  // decorated on Edge Delivery (span.icon > img): that image
  const decorated = link('<a href="https://www.youtube.com/user/LHCargoAG"><span class="icon icon-youtube"><img data-icon-name="youtube" src="/icons/youtube.svg" alt=""></span></a>');
  assert.ok(iconTokenImage(decorated, '') === decorated.querySelector('img'), 'the decorated image');
  // a linked picture (ITA's payment methods, Discover's social images): that image, unchanged
  const badge = link('<a href="https://www.facebook.com/x"><img src="/media_1.png" alt="Facebook"></a>');
  assert.ok(iconTokenImage(badge, '') === badge.querySelector('img'));
  assert.equal(badge.innerHTML, '<img src="/media_1.png" alt="Facebook">');
  // a text link (Cargo's footer of today: "Facebook"): no image
  const textLink = link('<a href="https://www.facebook.com/x">Facebook</a>');
  assert.ok(iconTokenImage(textLink, '') === null, 'no image');
  assert.equal(textLink.textContent, 'Facebook');
});

test('iconLabel: the new icons\' names, other icons as before (dashes as spaces)', () => {
  assert.equal(iconLabel('facebook'), 'Facebook');
  assert.equal(iconLabel('youtube'), 'YouTube');
  assert.equal(iconLabel('instagram'), 'Instagram');
  assert.equal(iconLabel('linkedin'), 'LinkedIn');
  assert.equal(iconLabel('lufthansa-group'), 'Lufthansa Group');
  assert.equal(iconLabel('iata-cargo-iq'), 'IATA Cargo iQ');
  assert.equal(iconLabel('star-alliance'), 'star alliance', 'as before');
  assert.equal(iconLabel(''), '');
  assert.equal(iconLabel(undefined), '');
});

test('the footer uses them in both rows; the sizes of Cargo\'s www (24px icons, 160x20 and 80x20 logos)', () => {
  const js = fs.readFileSync(path.join(root, 'blocks/footer/footer.js'), 'utf8');
  assert.equal((js.match(/iconTokenImage\(a, window\.hlx\.codeBasePath/g) || []).length, 2, 'badges and logos');
  assert.equal((js.match(/iconLabel\(name\)/g) || []).length, 2, 'badges and logos');
  const css = fs.readFileSync(path.join(root, 'blocks/footer/footer.css'), 'utf8');
  const rule = (sel) => (css.match(new RegExp(`${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`)) || [])[1] || '';
  assert.match(rule('.footer .footer-badges a[class^="footer-badge-"] img'), /height: 24px;/);
  // more specific than ".footer .footer-logos li:nth-child(2) img" (160x8, lufthansa.com's member logo)
  assert.match(rule('.footer .footer-logos li a.footer-logo-lufthansa-group img'), /width: 160px;\s*height: 20px;/);
  assert.match(rule('.footer .footer-logos li a.footer-logo-iata-cargo-iq img'), /width: 80px;\s*height: 20px;/);
});
