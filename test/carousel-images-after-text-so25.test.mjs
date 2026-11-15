/* eslint-disable max-len */
/* Standing order 25 (2026-11-14), item 2: the xx business-class pages at 1440 (lh-snapshots-117). www has 70 px between
   the intro text and the picture carousel; ours had 29. From 768 px a lufthansa.com carousel right after a text
   paragraph (not a spacer mark) in a plain section, outside articles, has 40 px above it, and 40 px under it when it
   ends its section. Census (the published copies): 75 documents outside articles (economy-class, business-class,
   100-years/campaigns, cabin-design, menu-on-board, it/it/fox, us/en the-art-of-slowing-down) and the eleven moved xx
   business-class documents. tools/parity/gate.mjs (injected trial): the 11 xx pages at 1440 better by 1.4 to 4.1
   points, at 390 the same; de/en economy-class 13.5 -> 11.3 at 1440; the 100-years pages, first-class-terminal, stopover,
   new-onboard-experience the same. Articles stay out: stop-over-tokyo and allegris-premium-economy-san-diego were worse
   (their carousels sit inside the body text). All carousels at 40 px made 9 de/en pages worse.
   Run: node --test test/carousel-images-after-text-so25.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/carousel-images/carousel-images.css', import.meta.url), 'utf8');
const SCOPE = 'body.brand-lufthansa main:not(:has(.article-header)) > .section:not(.campaign-section) > .default-content-wrapper:has(> p:not(.spacer):last-child) + .carousel-images-wrapper';

const rule = (selector) => {
  const at = css.indexOf(`${selector} {`);
  assert.ok(at > 0, selector);
  const media = css.slice(css.lastIndexOf('@media', at), css.indexOf('{', css.lastIndexOf('@media', at))).trim();
  return { media, body: css.slice(at, css.indexOf('}', at)) };
};

test('from 768px: 40px above a carousel after a text paragraph, 40px under it when it ends the section', () => {
  const top = rule(`${SCOPE} > .carousel-images`);
  assert.equal(top.media, '@media (width >= 768px)');
  assert.match(top.body, /margin-top: 40px;/);
  const end = rule(`${SCOPE}:last-child > .carousel-images`);
  assert.equal(end.media, '@media (width >= 768px)');
  assert.match(end.body, /margin-bottom: 40px;/);
});

test('the base rule as before: 24px under every carousel', () => {
  assert.match(css, /\.carousel-images \{\n {2}position: relative;\n {2}container-type: inline-size;\n {2}margin-bottom: 24px;\n\}/);
});

// standing order 26: before a section without padded (the business-class intros since their split), 65px above, 24px under
test('from 768px before a section that is not padded: 65px above the carousel, 24px under it', () => {
  const next = rule('body.brand-lufthansa main:not(:has(.article-header)) > .section:not(.campaign-section):has(+ .section:not(.padded)) > .default-content-wrapper:has(> p:not(.spacer):last-child) + .carousel-images-wrapper:last-child > .carousel-images');
  assert.equal(next.media, '@media (width >= 768px)');
  assert.match(next.body, /margin-top: 65px;/);
  assert.match(next.body, /margin-bottom: 24px;/);
});

// standing order 27: before a padded section that a spaced grey column view follows, 65px above as well
test('from 768px before a padded section and a spaced grey view: 65px above the carousel', () => {
  const pad = rule('body.brand-lufthansa main:not(:has(.article-header)) > .section:not(.campaign-section):has(+ .section.padded + .section.column-view.grey.spaced) > .default-content-wrapper:has(> p:not(.spacer):last-child) + .carousel-images-wrapper:last-child > .carousel-images');
  assert.equal(pad.media, '@media (width >= 768px)');
  assert.match(pad.body, /margin-top: 65px;/);
});
