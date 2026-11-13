/* eslint-disable max-len */
/* lufthansa.com's Insights articles: the "Back to overview" link at the article's end is www's maui-navigation-link
   variant back (lh-arrow-left; data-identifier link_back-to-overview, href /<root>/articles, every article snapshot
   that has one: 110 in bd-snapshots); ours drew the standalone link's right arrow (brief 558, rule 6,
   /de/en/articles/explore-flying/essentials-future-of-flying at 390). On an article page (main with an Article Header)
   a standalone link to the root's /articles draws the left arrow. Links to /articles on other pages (flights,
   unterhaltung-an-bord, take-off) keep the right arrow.
   Run: node --max-old-space-size=256 --test test/article-back-link-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('an article\'s link back to the articles overview: the left arrow', () => {
  const sel = 'body.brand-lufthansa main:has(.article-header) .default-content-wrapper p.link-wrapper a:any-link[href$="/articles"]::before';
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, 'rule');
  const body = css.slice(i, css.indexOf('}', i));
  assert.match(body, /mask-image: url\("data:image\/svg\+xml,[^"]*M10\.7 4\.3/);
});
