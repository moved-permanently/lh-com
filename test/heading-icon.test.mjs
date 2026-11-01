/* The section style heading-icon (scripts/heading-icon.js decorateHeadingIcons): the section's
   first small picture (a paragraph of its own, at most 200px wide) goes inline before the next H2,
   as www.airdolomiti.eu's "What to do" (destinations/bari); sections without the style, large
   pictures and a picture without an H2 after it stay as they are.
   Run: node --max-old-space-size=512 --test test/heading-icon.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.document = document;
const { default: decorateHeadingIcons } = await import('../scripts/heading-icon.js');

const pic = (w) => `<picture><img src="./media_1.png" alt="" width="${w}" height="${w}"></picture>`;
const mainOf = (sections) => {
  const main = document.createElement('main');
  main.innerHTML = sections.map(([cls, html]) => `<div class="section ${cls}"><div class="default-content-wrapper">${html}</div></div>`).join('');
  return main;
};

test('heading-icon: the first small picture inline at the start of the next H2', () => {
  const main = mainOf([['heading-icon', `<p>${pic(48)}</p><h2 id="what-to-do">What to do</h2><p>Text</p>`]]);
  decorateHeadingIcons(main);
  const h2 = main.querySelector('h2');
  assert.equal(h2.firstElementChild.className, 'heading-icon-image');
  assert.ok(h2.firstElementChild.querySelector('picture img') !== null);
  assert.equal(h2.textContent.trim(), 'What to do');
  assert.equal(main.querySelectorAll('.default-content-wrapper > p').length, 1, 'the picture paragraph is gone');
});

test('without the style, a large picture or no H2 after it: as before', () => {
  const html = `<p>${pic(48)}</p><h2>What to do</h2>`;
  const plain = mainOf([['', html]]);
  const before = plain.innerHTML;
  decorateHeadingIcons(plain);
  assert.equal(plain.innerHTML, before);
  const large = mainOf([['heading-icon', `<p>${pic(1200)}</p><h2>What to do</h2>`]]);
  const largeBefore = large.innerHTML;
  decorateHeadingIcons(large);
  assert.equal(large.innerHTML, largeBefore);
  const noHeading = mainOf([['heading-icon', `<h2>Earlier</h2><p>${pic(48)}</p><p>Text</p>`]]);
  const noHeadingBefore = noHeading.innerHTML;
  decorateHeadingIcons(noHeading);
  assert.equal(noHeading.innerHTML, noHeadingBefore);
});

test('scripts.js decorates the style after the sections; styles.css sizes the icon', () => {
  const src = fs.readFileSync('scripts/scripts.js', 'utf8');
  const body = src.slice(src.indexOf('export function decorateMain'), src.indexOf('\n}\n', src.indexOf('export function decorateMain')));
  assert.ok(body.indexOf('decorateHeadingIcons(main)') > body.indexOf('decorateSections(main)'));
  assert.match(fs.readFileSync('styles/styles.css', 'utf8'), /\.section\.heading-icon h2 \.heading-icon-image img \{[^}]*height: 1\.25em;/);
});
