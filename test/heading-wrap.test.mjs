/* Long single words in headings on phones (styles/styles.css): a 36px h1 or 28px h2 can't hold one
   long word at 390px ("Datenschutzerklärung", "Verwerkingsverantwoordelijken" on ITA's and
   Discover's Travel ID pages, "Nutzungsbedingungen" on lufthansa.com's), and the page scrolls
   sideways (www.lufthansa.com, www.ita-airways.com and www.discover-airlines.com do too,
   2026-11-01). Headings break a word only when it doesn't fit its line (overflow-wrap:
   break-word, every width); below 768px words of 14+ characters hyphenate at a syllable (the
   page's lang) first. The sizes stay; the brand themes set none of their own.
   Run: node --max-old-space-size=512 --test test/heading-wrap.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8');
const rule = (selector) => {
  const at = css.indexOf(`${selector} {`);
  return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
};

test('headings break a word that doesn\'t fit its line, at every width', () => {
  assert.match(rule('h1,\nh2,\nh3,\nh4,\nh5,\nh6'), /overflow-wrap: break-word;/);
});

test('below 768px long words hyphenate at a syllable first; not on larger screens', () => {
  const phone = css.match(/@media \(width < 768px\) \{\s*h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6 \{([^}]*)\}/);
  assert.ok(phone, 'a phone rule for the headings');
  assert.match(phone[1], /hyphens: auto;/);
  assert.match(phone[1], /hyphenate-limit-chars: 14 6 6;/);
  const outside = css.replace(phone[0], '');
  assert.doesNotMatch(outside, /hyphens: auto/, 'no hyphenation outside the phone rule');
});

test('the heading sizes as before; no brand theme sets heading sizes or wrapping', () => {
  assert.match(css, /--heading-font-size-xxl: calc\(36px \+ 12 \* \(100vw - 375px\) \/ 1065\);/);
  assert.match(css, /--heading-font-size-xl: calc\(28px \+ 8 \* \(100vw - 375px\) \/ 1065\);/);
  fs.readdirSync('styles/themes').forEach((f) => {
    const theme = fs.readFileSync(`styles/themes/${f}`, 'utf8');
    assert.doesNotMatch(theme, /--heading-font-size|hyphens|overflow-wrap|word-break/, f);
  });
});
