/* eslint-disable max-len */
/* The help app's section to the footer as www's (the brief after 531, item 1 left over): under the FAQs card www has
   24 px to ITA's footer (ita-parity-003 /it/en/help-and-contact, at 1440 and 390) and 30 px to SWISS's
   (swiss-parity-003 /ch/en/help-center); ours the section's 48 px. By the body's theme class the help app's design
   system sets (maui-theme-az ITA, maui-theme-lx SWISS); other brands as before.
   Run: node --max-old-space-size=512 --test test/micro-frontend-help-footer-gap-536.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/micro-frontend/micro-frontend.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (selector) => {
  const i = css.indexOf(`${selector} {`);
  assert.ok(i >= 0, selector);
  return css.slice(i + selector.length + 2, css.indexOf('}', i)).trim();
};

test('ITA: 24 px from the help app\'s section to the footer', () => {
  assert.equal(rule('body.maui-theme-az main > .section:last-child:has(.micro-frontend help-center-web)'), 'margin-bottom: 24px;');
});

test('SWISS: 30 px', () => {
  assert.equal(rule('body.maui-theme-lx main > .section:last-child:has(.micro-frontend help-center-web)'), 'margin-bottom: 30px;');
});
