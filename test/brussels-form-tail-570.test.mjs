/* eslint-disable max-len */
/* The brief after 570c (the ranking against brussels-parity-004): a Brussels page that ends with a core form. On www the
   grey band ends 40 px under the button and the footer starts there (my-bookings/emergency-contact, contact/feedback/
   general/other, groups-and-charter/charter: button text -> footer 68 px). Ours had the band's 40 px and then the last
   section's 48 px gap (--section-gap) in white before the footer: 56 px more on each. The Brussels theme drops that gap
   under a last section that ends with a core form; a section with content after its form (/il/en/rebooking-request-
   birthright's note) as before. Measured with the rule added on the live pages (without the capture's 71 px Turnstile
   checkbox): feedback/general/other +1.0 -> +0.3 % at 1440, +1.9 -> +1.3 % at 390; charter +0.2 -> -1.3 / +0.9 -> -0.4 %;
   dsar-start -0.3 -> -1.9 / +0.7 -> -0.5 %; emergency-contact -1.4 -> -3.3 / +0.2 -> -1.3 % (its untitled bands are the
   next change); birthright unchanged.
   Run: node --max-old-space-size=256 --test test/brussels-form-tail-570.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('no section gap under a last section that ends with a core form', () => {
  assert.match(css, /body\.brand-brussels main > \.section:last-child:has\(> \.form-wrapper:last-child > \.form\.core\) \{ margin-bottom: 0; \}/);
});

test('only there: no rule for every last section', () => {
  assert.doesNotMatch(css, /body\.brand-brussels main > \.section:last-child \{[^}]*margin-bottom: 0/);
});
