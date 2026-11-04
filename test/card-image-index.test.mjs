/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; js-yaml is a dev dependency */
/* Card pictures in the query indexes (brief 338): Edge Delivery writes a page's `card-image`
   metadata as a relative media address (./media_<hash>.jpg?width=750&format=jpg&optimize=medium,
   the page's folder), which the index rules' match on https://<host>/... left empty: the SWISS
   magazine's 39 overview cards and lufthansa.com's article cards had no picture. The rules keep
   the address as written (an https URL's path as before, ./media_… and /… as they are); the
   readers (scripts/articles.js toArticle, loadAuthors: blog-overview, related-articles,
   carousel-cards, lh-edge's sdui-web) resolve ./media_… against the row's own folder (Edge
   Delivery answers a media file under any folder). og:image stays as it was (written absolute).
   Run: node --max-old-space-size=512 --test test/card-image-index.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import yaml from 'js-yaml';
import { toArticle, resolveRowImage } from '../scripts/articles.js';

const { indices } = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8'));
const CARD = Object.entries(indices).filter(([, d]) => Object.values(d.properties || {}).some((p) => String(p.select).includes('meta[name="card-image"]')));
// the index's match(): the first group of the pattern on the attribute's value, else empty
const evaluate = (value, content) => {
  const m = String(value).match(/^match\(attribute\(el, "content"\), "(.*)"\)$/);
  assert.ok(m, value);
  const hit = content.match(new RegExp(m[1]));
  return hit ? (hit[1] ?? hit[0]) : '';
};

test('the card-image indexes: lufthansa.com\'s articles and authors, Brussels\' articles, the SWISS magazine', () => {
  assert.deepEqual(CARD.map(([name]) => name).sort(), [
    'article-authors-at-de', 'article-authors-de-de', 'article-authors-de-en', 'article-authors-gb-en',
    'articles-at-de', 'articles-be-en', 'articles-be-fr', 'articles-be-nl', 'articles-de-de', 'articles-de-en', 'articles-gb-en',
    'magazine-de', 'magazine-en',
  ]);
});

test('the rule keeps Edge Delivery\'s relative media address, an absolute path, and an https URL\'s path as before', () => {
  CARD.forEach(([name, def]) => {
    const { value } = def.properties.image;
    assert.equal(evaluate(value, './media_19224519734344af8d0c3751689c0c542575c4788.jpg?width=750&format=jpg&optimize=medium'), './media_19224519734344af8d0c3751689c0c542575c4788.jpg?width=750&format=jpg&optimize=medium', name);
    assert.equal(evaluate(value, 'https://swiss.turnsthe.page/magazine/de/x/media_1.jpg?width=1200'), '/magazine/de/x/media_1.jpg?width=1200', name);
    assert.equal(evaluate(value, '/content/dam/lh/images/x.jpg'), '/content/dam/lh/images/x.jpg', name);
    assert.equal(evaluate(value, 'about:blank'), '', name);
  });
  // og:image rules as they were
  assert.equal(indices['search-de-en'].properties.image.value, 'match(attribute(el, "content"), "https:\\/\\/[^/]+(/.*)")');
});

test('the readers: ./media_… resolved against the row\'s folder; a path or URL as it is; none: empty', () => {
  assert.equal(resolveRowImage('./media_1.jpg?width=750&format=jpg', '/magazine/de/inside-swiss/behind-the-scenes/a350-special-livery'), '/magazine/de/inside-swiss/behind-the-scenes/media_1.jpg?width=750&format=jpg');
  assert.equal(resolveRowImage('media_1.jpg', '/de/en/articles/x/y'), '/de/en/articles/x/media_1.jpg');
  assert.equal(resolveRowImage('/de/en/articles/x/media_1.jpg', '/de/en/articles/x/y'), '/de/en/articles/x/media_1.jpg');
  assert.equal(resolveRowImage('https://www.example.com/a.jpg', '/x/y'), 'https://www.example.com/a.jpg');
  assert.equal(resolveRowImage('', '/x/y'), '');
  const article = toArticle({
    path: '/magazine/de/inside-swiss/behind-the-scenes/a350-special-livery', title: 'A350', image: './media_1.jpg?width=750&format=jpg&optimize=medium', 'image-alt': 'Livery',
  });
  assert.equal(article.image, '/magazine/de/inside-swiss/behind-the-scenes/media_1.jpg?width=750&format=jpg&optimize=medium');
  assert.equal(article.imageAlt, 'Livery');
  // a brand's share-image (og:image, absolute) as before
  assert.equal(toArticle({ path: '/articoli/x', 'share-image': '/articoli/media_2.jpg' }).image, '/articoli/media_2.jpg');
});

test('the authors\' images too (loadAuthors)', async () => {
  globalThis.window = { location: { hostname: 'lufthansa.turnsthe.page', pathname: '/de/en/articles' } };
  globalThis.fetch = async () => new Response(JSON.stringify({ data: [{ path: '/de/en/articles/authors/jane', author: 'Jane', image: './media_3.jpg?width=750' }] }), { headers: { 'content-type': 'application/json' } });
  const { loadAuthors } = await import('../scripts/articles.js');
  const [jane] = await loadAuthors({ key: 'de/en' });
  assert.equal(jane.image, '/de/en/articles/authors/media_3.jpg?width=750');
});
