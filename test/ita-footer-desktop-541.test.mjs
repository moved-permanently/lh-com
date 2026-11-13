/* eslint-disable max-len */
/* ITA's footer from 768 px as www's (the brief after 540, item 1; ita-parity-004's 14 /it/en pages at 1440, every one
   with the footer 796 px high on www and 820 on ours): the payment and social row 27 px under the link columns (ours
   30), its headings' ink 28 px under the rule (ours 30), the icons' ink 38 px over the next rule (ours 45); the logo
   bar 70 px, the logos' ink 25 px from its top and 26 from its bottom (ours 79: 31 and 28). The phone footer's 46 px
   are the measuring machine's (no Arial there: the legal links, www's Arial, wrap into one more row in DejaVu Sans),
   not the site's; its logo bar 25 px top and bottom as www's (ours 26 and 28).
   Run: node --max-old-space-size=512 --test test/ita-footer-desktop-541.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

// the last rule for a selector inside the media blocks of a query (brace matched)
const inMedia = (media, selector) => {
  let found = null;
  let at = css.indexOf(`@media ${media} {`);
  while (at >= 0) {
    let depth = 0;
    let end = css.indexOf('{', at);
    for (; end < css.length; end += 1) {
      if (css[end] === '{') depth += 1;
      if (css[end] === '}') { depth -= 1; if (!depth) break; }
    }
    const body = css.slice(at, end);
    const i = body.lastIndexOf(`\n  ${selector} {`);
    if (i >= 0) {
      found = Object.fromEntries(body.slice(i + selector.length + 5, body.indexOf('}', i)).split(';').map((d) => d.trim()).filter(Boolean)
        .map((d) => d.split(/:\s*/)));
    }
    at = css.indexOf(`@media ${media} {`, end);
  }
  assert.ok(found, `${selector} in @media ${media}`);
  return found;
};

test('from 768 px: the payment and social row as www\'s', () => {
  const b = inMedia('(width >= 768px)', 'body.brand-ita .footer .footer-badges');
  assert.deepEqual([b['margin-top'], b['padding-top'], b['padding-bottom']], ['27px', '24px', '31px']);
});

test('from 768 px: the logo bar 70 px, 25 px above the logos\' ink, 26 under it', () => {
  const b = inMedia('(width >= 768px)', 'body.brand-ita .footer .footer-logos-inner');
  assert.deepEqual([b['padding-top'], b['padding-bottom']], ['19px', '25px']);
});

test('phones: the logo bar 25 px above and under the stack', () => {
  const b = inMedia('(width < 768px)', 'body.brand-ita .footer .footer-logos-inner');
  assert.deepEqual([b['padding-top'], b['padding-bottom']], ['25px', '24px']);
});
