/* The footer's ":x:" and ":tiktok:" icon links (scripts/lh-icons.js iconTokenImage, iconLabel):
   icons/x.svg and icons/tiktok.svg, X's and TikTok's own marks in the badges row's 24x24 cell,
   in the color of the other social icons (#EBEBEB, as icons/facebook.svg).
   Run: node --max-old-space-size=512 --test test/footer-icons-x-tiktok.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
const { iconTokenImage, iconLabel } = await import('../scripts/lh-icons.js');

test('icons/x.svg and icons/tiktok.svg: 24x24 cells, one color, nothing but drawings', () => {
  ['x', 'tiktok'].forEach((name) => {
    const file = `icons/${name}.svg`;
    assert.ok(fs.existsSync(file), name);
    const svg = fs.readFileSync(file, 'utf8');
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="24" height="24" viewBox="[-\d. ]+"/, name);
    assert.match(svg, /<path [^>]*d="M/, name);
    assert.deepEqual([...new Set(svg.match(/fill="#[0-9A-F]{6}"/gi))], ['fill="#EBEBEB"'], `${name}: the other icons' color`);
    assert.doesNotMatch(svg, /<script|<foreignObject|<image|\son[a-z]+=|href=/i, name);
  });
});

test('":x:" and ":tiktok:" links become the icons, named X and TikTok', () => {
  ['x', 'tiktok'].forEach((name) => {
    const p = document.createElement('p');
    p.innerHTML = `<a href="https://example.com/${name}">:${name}:</a>`;
    const img = iconTokenImage(p.querySelector('a'), '');
    assert.equal(img.getAttribute('src'), `/icons/${name}.svg`);
    assert.equal(img.dataset.iconName, name);
  });
  assert.equal(iconLabel('x'), 'X');
  assert.equal(iconLabel('tiktok'), 'TikTok');
});
