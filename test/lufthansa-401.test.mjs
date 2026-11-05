/* eslint-disable max-len */
/* Lufthansa, brief 401 (capture lufthansa-parity-001, axe on main--lh-com--moved-permanently.aem.live):
   - the digital assistant pages (metadata Theme: digital-assistant): www's lh.css adds a LufthansaHead face
     without a weight (400) on the Bold file, after the design system's 300 / 400 Light and 700 Bold faces;
     so text at 300 (the h2 / h3 heading-medium, heading-small) stays Light and 400 and 700 draw Bold
     (www's /de/en/all-check-in, /baggage, /travelling-with-children: light headings);
   - booking-lookup's login notice action ("Go to login", /de/en/online-check-in): a 24px target
     (WCAG 2.5.8) with the text and the notice where they were (20px line, 13px above, 17px below).
   Run: node --max-old-space-size=256 --test test/lufthansa-401.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const fonts = read('styles/fonts.css');
const faces = [...fonts.matchAll(/@font-face \{([^}]*)\}/g)].map((m) => m[1]).filter((f) => /font-family: lufthansahead-digital-assistant;/.test(f));

test('digital assistant head font: 100-300 Light, 400-900 Bold', () => {
  assert.equal(faces.length, 2);
  const light = faces.find((f) => /font-weight: 100 300;/.test(f));
  const bold = faces.find((f) => /font-weight: 400 900;/.test(f));
  assert.ok(light && /LufthansaHeadWeb-Light\.woff2/.test(light) && !/Bold/.test(light), 'light face');
  assert.ok(bold && /LufthansaHeadWeb-Bold\.woff2/.test(bold) && !/Light/.test(bold), 'bold face');
});

test('booking-lookup notice action: a 24px target, the layout unchanged', () => {
  const css = read('blocks/booking-lookup/booking-lookup.css');
  const rule = (sel) => { const m = css.match(new RegExp(`${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`)); return m ? m[1] : ''; };
  const link = rule('.booking-lookup .booking-lookup-notice a:any-link');
  assert.ok(/min-height: 24px;/.test(link), 'min-height 24px');
  assert.ok(/margin-top: 11px;/.test(link), '13px - 2px above');
  assert.ok(/line-height: 20px;/.test(link), 'the 20px line');
  assert.ok(/padding: 20px 18px 15px 49px;/.test(rule('.booking-lookup .booking-lookup-notice')), '17px - 2px below');
});
