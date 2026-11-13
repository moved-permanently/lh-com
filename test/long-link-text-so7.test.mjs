/* eslint-disable max-len */
/* Standing order 7 (2026-11-12), item 3: /de/en, /gb/en and /at/de besondere-befoerderungsbedingungen-bus scrolled sideways
   at 390 px (scroll width 453): a link alone in its paragraph (p.link-wrapper, display inline-flex for its arrow) whose
   text is a URL without a break opportunity ("https://www.lufthansa.com/de/de/assistenzhunde"). overflow-wrap:
   break-word (main, a:any-link) breaks such a word in running text, but in a flex container the text is an anonymous
   flex item whose minimum width is its longest word, so the link grew past the screen. www breaks link text at its
   hyphens and lets an unbreakable rest run past the edge (lh-parity-002d at 390: "barrierefrei-" / "reisen").
   overflow-wrap: anywhere on the flex text links (link-wrapper, the link lists, buttons, SWISS's aside lists,
   Austrian's em buttons) keeps those breaks and breaks only what does not fit, so no page scrolls sideways.
   Run: node --max-old-space-size=256 --test test/long-link-text-so7.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const RULE = css.match(/([^{}]*)\{ overflow-wrap: anywhere; \}/g) || [];
const selectors = RULE.join(' ').split('{')[0];

test('the flex text links break a word that does not fit: overflow-wrap anywhere', () => {
  assert.ok(RULE.length >= 1, 'a rule with overflow-wrap: anywhere');
  [
    'main p.link-wrapper > a:any-link',
    'main a.button:any-link',
    'body.brand-lufthansa main ul:is(.links-horizontal, .links-responsive, .links-vertical) > li > a:any-link',
    'body.brand-swiss main .section-aside .default-content-wrapper :is(ul, ol) > li > a:any-link',
    'body.brand-austrian main .default-content-wrapper > ul > li > em > a:any-link',
  ].forEach((s) => assert.ok(selectors.includes(s), s));
});

test('not on every link: running text keeps break-word (an inline link breaks already), tables keep their column sizing', () => {
  assert.ok(!/(^|,)\s*main a:any-link\s*(,|$)/.test(selectors), 'no blanket main link rule');
  assert.ok(!selectors.includes('table'), 'no table links');
});
