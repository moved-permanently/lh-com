/* eslint-disable max-len -- selectors and figures */
/* lufthansa.com rules of standing order 65 (2026-11-20), the sweeps' proposals gated on their full reach over the live
   switched batches (no page-width further from www by more than 0.5 points, sum down, nothing new flagged):
   - P3 (ema-lufthansa, sweep-so52): a divider-below section that ends with a Columns Media keeps its closing divider under
     the block (no take-back above the closing wrapper; ITA's 666f7906).
   - Rule 3 (ema-cashub, sweep-so81), the narrower second try: the teaser text beside an icon heading in a padded Columns
     Media at www's 16px / 1.5 (the first try, every Columns Media, moved carry-on-baggage's allowance list further).
   Run: node --test test/lh-com-switch-rules-so65.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The body of the first rule whose selector is exactly the given one, and the @media block around it. */
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

test('P3: a divider-below section ending with a Columns Media takes nothing back above its closing divider', () => {
  const r = ruleOf('body.brand-lufthansa main > .section.divider-below > .columns-media-wrapper + .default-content-wrapper:last-child:not(:has(> :not(p.spacer)))');
  assert.ok(r, 'the rule is in styles.css');
  assert.equal(r.media, '');
  assert.match(r.body, /^margin-top: 0;$/);
  const takeBack = css.indexOf('main > .section > .default-content-wrapper:last-child:not(:has(> :not(p.spacer))) {');
  assert.ok(takeBack >= 0 && takeBack < css.indexOf('body.brand-lufthansa main > .section.divider-below > .columns-media-wrapper'), 'after the take-back it overrides');
});

test('Rule 3: the teaser text beside an icon heading in a padded Columns Media at 16px / 1.5, not in every Columns Media', () => {
  const r = ruleOf('body.brand-lufthansa .columns-media.padded .columns-media-row > .columns-media-text :is(h3, h4):has(> picture) ~ p:not(.link-wrapper, .button-wrapper)');
  assert.ok(r, 'the rule is in styles.css');
  assert.equal(r.media, '');
  assert.match(r.body, /font-size: var\(--body-font-size-s\);\s*line-height: 1\.5;/);
  assert.equal(ruleOf('body.brand-lufthansa .columns-media .columns-media-row > .columns-media-text :is(h3, h4):has(> picture) ~ p:not(.link-wrapper, .button-wrapper)'), null, 'not the first try (every block)');
});
