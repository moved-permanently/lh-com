/* eslint-disable max-len */
/* Brief 500 item 1, /de/en/lufthansa-travel-classes (hub): www's first AEM section (the title and the intro) is padded
   and follows the class tabs (profile nav); campaign-sections takes a first section only when it is unpadded, so ours is
   a plain section. Against lh-parity-002: the title 40 px higher at 1440 (65 px under the tabs on www, ours 25), 21 at
   390 (46, ours 25); the banner after the intro 8 px lower at 1440 (40 px on www, ours the 48 px section gap), 28 at
   390 (20). On a page of campaign sections: the tabs' section 45 / 65 px above such a title, the title and intro
   section 20 / 40 px before the next campaign-section. Under the banner (Hero Banner, www's dcep web component: its own
   space below is not in the saved CSS) live has 82 px to the next column view's picture at 1440, ours 56; 19 px short
   at 390: a spaced campaign-section ending with the banner keeps 43 / 50 px under it.
   Run: node --test test/hub-travel-classes-500.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const TABS = 'body.brand-lufthansa main:has(> .section.campaign-section) > .section.profile-nav-container:has(+ .section > .default-content-wrapper:first-child > h1:first-child)';
const INTRO = 'body.brand-lufthansa main > .section:not(.campaign-section):has(> .default-content-wrapper:last-child > h1:first-child + *):has(+ .section.campaign-section)';

test('the tabs above a title on a page of campaign sections: 45 px, 65 from 768 px', () => {
  assert.ok(css.includes(`${TABS} { margin-bottom: 45px; }`));
  assert.ok(css.includes(`${TABS} { margin-bottom: 65px; }`) && css.indexOf(`${TABS} { margin-bottom: 65px; }`) > css.indexOf('@media (width >= 768px)'));
});

test('a title and intro section before a campaign-section: 20 px, 40 from 768 px', () => {
  assert.ok(css.includes(`${INTRO} { margin-bottom: 20px; }`));
  assert.ok(css.includes(`${INTRO} { margin-bottom: 40px; }`));
});

test('a spaced campaign-section ending with a Hero Banner: 43 px under it, 50 from 768 px', () => {
  const SEL = 'body.brand-lufthansa main > .section.campaign-section.spaced:has(> .hero-banner-wrapper:last-child)';
  assert.ok(css.includes(`${SEL} { margin-bottom: 43px; }`));
  assert.ok(css.includes(`${SEL} { margin-bottom: 50px; }`));
});
