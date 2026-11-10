/* eslint-disable max-len */
/* Air Dolomiti's post cards as www's CardPost at every width (the sweep after 556; airdolomiti-parity-001 /articles at 390:
   ours 5457 px against www's 6159). www's card is 470 px high with its picture at 60 % (282 px) at every width; the grid
   option's picture keeps 443 / 282, which is that only three to the row: on phones 223 px, the cards 419 px (www's posts
   490 px apart, ours 439). Below 930 px www's GridBlog box starts 170 px under the hub's categories (none from 930 px),
   ours 50.
   Run: node --test test/airdolomiti-post-cards-557.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const base = css.replace(/@media[^{]*\{[\s\S]*?\n\}\n/g, '');
// the declarations of the rules whose selector list holds sel (in scope), merged
const decls = (scope, sel) => Object.fromEntries([...scope.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter((m) => m[1].replace(/@media[^{]*$/, '').split(/,\s*\n/).map((s) => s.replace(/^[\s\S]*\{/, '').trim()).includes(sel))
  .flatMap((m) => m[2].split(';').map((d) => d.trim()).filter(Boolean))
  .map((d) => { const [k, ...v] = d.split(':'); return [k.trim(), v.join(':').trim()]; }));
const media = (q) => css.split(`@media (${q}) {`).slice(1).map((p) => p.slice(0, p.indexOf('\n}\n'))).join('\n}\n');

test('the card 470 px high, its picture 60 % of it, at every width', () => {
  assert.equal(decls(base, 'body.brand-airdolomiti .blog-overview.grid .blog-overview-card').height, '470px');
  const img = decls(base, 'body.brand-airdolomiti .blog-overview.grid .blog-overview-image');
  assert.deepEqual([img.height, img['aspect-ratio'], img.flex], ['60%', 'auto', 'none']);
});

test('below 930 px the posts 170 px under the hub\'s categories; 50 from 930 px as before', () => {
  const sel = 'body.brand-airdolomiti main .default-content-wrapper:has(> h1:first-child + ul):has(+ .blog-overview-wrapper) > ul';
  assert.equal(decls(media('width < 930px'), sel)['margin-bottom'], '170px');
  assert.equal(decls(base, sel).margin, '0 0 50px');
});
