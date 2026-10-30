/* The brand fonts at www's own /digitalhangar/ paths (styles/fonts.css, styles/themes/ita.css):
   per face the path on the page's host (lh-edge's digitalhangar route) and, for hosts without
   lh-edge, the brand www's absolute URL of the same file; font-display swap; the size-adjusted
   fallbacks in styles.css stay. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const FONTS = '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/';

/** The @font-face rules of a stylesheet: family, weight, display, src URLs and formats. */
const faces = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, body]) => {
  const prop = (name) => ((body.match(new RegExp(`(?:^|;)\\s*${name}:\\s*([^;]+)`)) || [])[1] || '').trim();
  return {
    family: prop('font-family'),
    weight: prop('font-weight'),
    display: prop('font-display'),
    range: prop('unicode-range'),
    urls: [...prop('src').matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]),
    formats: [...prop('src').matchAll(/format\('([^']+)'\)/g)].map((m) => m[1]),
  };
});

const check = (file, www, expected, format) => {
  const list = faces(read(file));
  assert.deepEqual(list.map((f) => [f.family, f.weight, f.urls[0] && f.urls[0].slice(FONTS.length)]), expected, `${file}: the faces and their files`);
  list.forEach((f) => {
    const name = `${file} ${f.family} ${f.weight}`;
    assert.equal(f.display, 'swap', name);
    assert.equal(f.range, '', `${name}: one full file, no unicode-range`);
    assert.equal(f.urls.length, 2, name);
    assert.ok(f.urls[0].startsWith(FONTS), `${name}: www's path on the page's host`);
    assert.equal(f.urls[1], `https://${www}${f.urls[0]}`, `${name}: then the same file on ${www}`);
    assert.deepEqual(f.formats, [format, format], name);
  });
};

test('fonts.css: the Lufthansa faces from /digitalhangar/, then www.lufthansa.com', () => {
  check('styles/fonts.css', 'www.lufthansa.com', [
    ['LufthansaHead', '400', 'lufthansa/LufthansaHeadWeb-Light.woff2'],
    ['LufthansaHead', '700', 'lufthansa/LufthansaHeadWeb-Bold.woff2'],
    ['LufthansaText', '300', 'lufthansa/LufthansaTextWeb-Light.woff2'],
    ['LufthansaText', '400', 'lufthansa/LufthansaTextWeb-Regular.woff2'],
    ['LufthansaText', '700', 'lufthansa/LufthansaTextWeb-Bold.woff2'],
    ['lufthansahead-digital-assistant', '100 900', 'lufthansa/LufthansaHeadWeb-Bold.woff2'],
  ], 'woff2');
});

test('the ita theme: Open Sans (woff only) from /digitalhangar/, then www.ita-airways.com', () => {
  check('styles/themes/ita.css', 'www.ita-airways.com', [
    ['OpenSans', '300', 'ita/OpenSans-Regular.woff'],
    ['OpenSans', '400', 'ita/OpenSans-Regular.woff'],
    ['OpenSans', '700', 'ita/OpenSans-Bold.woff'],
  ], 'woff');
});

test('the discover theme declares no faces (Lufthansa\'s from fonts.css); the size-adjusted fallbacks stay', () => {
  assert.deepEqual(faces(read('styles/themes/discover.css')), []);
  const fallbacks = faces(read('styles/styles.css')).map((f) => f.family);
  assert.ok(fallbacks.includes('lufthansahead-fallback') && fallbacks.includes('lufthansatext-fallback'), fallbacks.join());
  assert.match(read('styles/styles.css'), /size-adjust/);
});
