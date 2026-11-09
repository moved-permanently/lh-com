/* eslint-disable max-len, import/extensions */
/* Discover's importer (the brief after 514, item 1; Discover row 40):
   (a) the German gender colon is text, not an icon token: www's "Naturliebhaber:innen: üppige
   Vegetation" (de/de/travel-inspiration/winter-destinations) reached Edge Delivery as the token
   ":innen:" (its pipeline's rewrite-icons step, the regex below, one text node at a time), so the
   page showed a broken /icons/innen.svg in place of "innen:". The importer puts a WORD JOINER
   (U+2060: no width, no break) before the closing colon of a gender suffix (":in", ":innen" right
   after a letter); the text reads as www's, and every other token (:phone:) stays an icon. Checked
   offline through aem-cli's html2md and html pipeline (6.33.2) too.
   (b) an accordion with no title text and no content (an empty block on 12 documents, 15 blocks)
   is dropped; one with a title and no body stays.
   Run: node --max-old-space-size=512 --test test/discover-import-tokens-518.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { withoutGenderTokens, withoutEmptyAccordions } from '../tools/importer/discover-import.mjs';

// @adobe/helix-html-pipeline src/steps/rewrite-icons.js (6.33.2), per text node
const REGEXP_ICON = /(?<!(?:https?|urn)[^\s]*):(#?[a-z_-]+[a-z\d]*):/gi;
const icons = (doc) => doc.split(/<[^>]*>/).flatMap((t) => [...t.matchAll(REGEXP_ICON)].map((m) => m[1]));
const visible = (doc) => doc.replace(/<[^>]*>/g, '').replace(/⁠/g, '');

const WINTER = '<div><p><strong>La Palma</strong>, auch „La Isla Bonita“ genannt, ist ein wahres Juwel für Naturliebhaber:innen: üppige Vegetation, tiefe Lorbeerwälder, Vulkankrater.</p><p>Fragen? :phone: Rufen Sie uns an. Für Pilot:in: Kund:innen.</p><p><a href="https://www.discover-airlines.com/de/de/x:innen:">Link</a></p></div>';

test('row 40 (a): the gender colon stays text, the text reads as www\'s', () => {
  assert.deepEqual(icons(WINTER), ['innen', 'phone', 'in']);
  const out = withoutGenderTokens(WINTER);
  assert.deepEqual(icons(out), ['phone']);
  assert.equal(visible(out), visible(WINTER));
  assert.ok(out.includes('Naturliebhaber:innen⁠: üppige'));
  assert.ok(out.includes('Pilot:in⁠: Kund:innen.'));
});

test('row 40 (a): an ordinary icon token and attribute values stay as they are', () => {
  const doc = '<div><p>Call us :phone: or write :mail:</p><p>(:baggage:) und :a-la-carte-menu:</p></div>';
  assert.equal(withoutGenderTokens(doc), doc);
  assert.deepEqual(icons(withoutGenderTokens(doc)), ['phone', 'mail', 'baggage', 'a-la-carte-menu']);
  assert.ok(withoutGenderTokens(WINTER).includes('href="https://www.discover-airlines.com/de/de/x:innen:"'));
});

// de/en/book/baggage/excess-baggage (our document): the empty accordion before "This might also be of interest to you"
const EXCESS = '<div><div class="accordion-columns faq spaced"><div><div>Baggage fees within the free baggage allowance</div><div><p>The excess baggage fee is charged for each route.</p></div></div></div>\n  <div class="accordion-columns">\n    <div>\n      <div></div>\n    </div>\n  </div>\n  <h4 id="this-might-also-be-of-interest-to-you-heading-small">This might also be of interest to you</h4></div>';

test('row 40 (b): an accordion with neither title text nor content is dropped, the rest stays', () => {
  const out = withoutEmptyAccordions(EXCESS);
  assert.equal((out.match(/class="accordion-columns/g) || []).length, 1);
  assert.ok(out.includes('Baggage fees within the free baggage allowance'));
  assert.ok(out.includes('<h4 id="this-might-also-be-of-interest-to-you-heading-small">'));
  assert.equal(out, EXCESS.replace('\n  <div class="accordion-columns">\n    <div>\n      <div></div>\n    </div>\n  </div>', ''));
});

test('row 40 (b): two empty accordions go; one with a title and no body, or only a picture, stays', () => {
  const titleOnly = '<div class="accordion-columns"><div><div>Sportgepäck</div><div></div></div></div>';
  const picture = '<div class="accordion-columns"><div><div><picture><img src="./media_1.png" alt=""></picture></div></div></div>';
  const blank = '<div class="accordion-columns faq"><div><div>&nbsp;</div><div> </div></div></div>';
  const doc = `<div>${blank}<p>a</p>${titleOnly}${blank}${picture}</div>`;
  assert.equal(withoutEmptyAccordions(doc), `<div><p>a</p>${titleOnly}${picture}</div>`);
  assert.equal(withoutEmptyAccordions('<div><p>no accordion</p></div>'), '<div><p>no accordion</p></div>');
});
