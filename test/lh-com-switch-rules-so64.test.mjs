/* eslint-disable max-len -- selectors and figures */
/* lufthansa.com rules of standing order 64 (2026-11-20), taken from the sweeps of the switched batches and gated on their full
   reach over the live batches (no page-width further from www by more than 0.5 points, sum down, nothing new flagged):
   - Rule 1 (ema-cashub, sweep-so80-ema-cashub.txt): from 768px the Subpage Nav's section as the last section after a grey band
     keeps no pull-up margin (the pull-up drew the nav 48px over the page title).
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

test('Rule 1 comes after the pull-up it overrides', () => {
  const pull = css.indexOf('body.brand-lufthansa main > .section.grey + .section:last-child:not(:has(> .carousel-cards-wrapper)');
  const rule = css.indexOf('body.brand-lufthansa main > .section.grey + .section.subpage-nav-container:last-child');
  assert.ok(pull >= 0 && rule > pull);
});
