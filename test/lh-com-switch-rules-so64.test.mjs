/* eslint-disable max-len -- selectors and figures */
/* lufthansa.com rules of standing order 64 (2026-11-20), taken from the sweeps of the switched batches and gated on their full
   reach over the live batches (no page-width further from www by more than 0.5 points, sum down, nothing new flagged):
   - Rule 1 (ema-cashub, sweep-so80-ema-cashub.txt): from 768px the Subpage Nav's section as the last section after a grey band
     keeps no pull-up margin (the pull-up drew the nav 48px over the page title).
   - Rule 2 (ema-cashub): on phones a German H1's word longer than the column breaks at its edge (overflow-wrap, no hyphens:
     no www recording of a reached page tells www's breaks, so the narrow form).
   Run: node --test test/lh-com-switch-rules-so64.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The body of the first rule whose selector is exactly the given one, and the @media blocks around it. */
function ruleOf(selector) {
  const at = css.indexOf(`${selector} {`);
  if (at < 0) return null;
  const body = css.slice(at + selector.length + 2, css.indexOf('}', at)).trim();
  const before = css.slice(0, at);
  const open = before.lastIndexOf('@media');
  const media = open >= 0 && before.slice(open).split('{').length - before.slice(open).split('}').length === 1
    ? before.slice(open, before.indexOf('{', open)).trim() : '';
  return { body, media };
}

test('Rule 1: the Subpage Nav section after a grey band keeps no pull-up, from 768px', () => {
  const r = ruleOf('body.brand-lufthansa main > .section.grey + .section.subpage-nav-container:last-child:is(.subpage-nav-container, :has(> .subpage-nav-wrapper > .subpage-nav))');
  assert.ok(r, 'the rule is in styles.css');
  assert.equal(r.media, '@media (width >= 768px)');
  assert.match(r.body, /^margin-top: 0;$/);
});

test('Rule 2: on phones a German page title or H2 breaks a word longer than the column, without hyphens (the narrow form; H2 since standing order 65)', () => {
  const r = ruleOf('body.brand-lufthansa main :is(h1, h2):lang(de)');
  assert.ok(r, 'the rule is in styles.css');
  assert.equal(r.media, '@media (width < 768px)');
  assert.match(r.body, /^overflow-wrap: break-word;$/);
  assert.doesNotMatch(r.body, /hyphens/);
});

test('Dive Deeper: an H2, one paragraph, then a four-up Carousel Cards draws as heading-large (not in an h2-small section)', () => {
  const r = ruleOf('body.brand-lufthansa main > .section:not(.h2-small) > .default-content-wrapper:has(+ .carousel-cards-wrapper > .carousel-cards.four-up):has(> p:last-child) > h2:nth-last-child(2)');
  assert.ok(r, 'the rule is in styles.css');
  assert.equal(r.media, '');
  const large = css.match(/main :is\(h1, h2, h3, h4, h5, h6\)\.heading-large \{([^}]*)\}/)[1].trim().replace(/\s+/g, ' ');
  assert.equal(r.body.replace(/\s+/g, ' '), large, 'the same declarations as .heading-large');
});

test('Explore more: an H2 right before an overlay Cards Teaser draws as heading-small', () => {
  const r = ruleOf('body.brand-lufthansa main .default-content-wrapper:has(+ .cards-teaser-wrapper > .cards-teaser.overlay) > h2:last-child');
  assert.ok(r, 'the rule is in styles.css');
  assert.equal(r.media, '');
  const small = css.match(/main :is\(h1, h2, h3, h4, h5, h6\)\.heading-small \{([^}]*)\}/)[1].trim().replace(/\s+/g, ' ');
  assert.equal(r.body.replace(/\s+/g, ' '), small, 'the same declarations as .heading-small');
});

test('Rule 1 comes after the pull-up it overrides', () => {
  const pull = css.indexOf('body.brand-lufthansa main > .section.grey + .section:last-child:not(:has(> .carousel-cards-wrapper)');
  const rule = css.indexOf('body.brand-lufthansa main > .section.grey + .section.subpage-nav-container:last-child');
  assert.ok(pull >= 0 && rule > pull);
});
