/* The digital assistant's head font only on lufthansa.com (brief 427 package, Austrian parity-002):
   lh-com's cleanup gives every page whose www loads the digital assistant the metadata "Theme:
   digital-assistant" (213 lh-austrian documents, 467 lh-brussels, 22 SWISS), and styles.css then
   set --heading-font-family to the LufthansaHead face of www.lufthansa.com's lh.css on the body,
   over the brand theme's (Austrian's Portada headings drew in LufthansaHead). The rule is
   lufthansa.com's: body.brand-lufthansa only, the other brands keep their theme's heading font.
   Run: node --max-old-space-size=512 --test test/digital-assistant-brand.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('the digital assistant head font only under body.brand-lufthansa', () => {
  assert.match(css, /body\.brand-lufthansa\.digital-assistant \{\s*--heading-font-family: lufthansahead-digital-assistant, lufthansahead-fallback, arial, helvetica, sans-serif;\s*\}/);
  assert.doesNotMatch(css, /(^|\n)body\.digital-assistant \{/, 'not for every brand');
});
