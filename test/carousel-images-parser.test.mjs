/* The carousel-images import parser (tools/importer/parsers/carousel-images.js): a slide's own
   text (Discover's /about-us/career values carousel: image + .text .richtext, no figcaption) is
   its caption; a figcaption caption stays as before. A linkedom page and a createBlock stand-in,
   no network. Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import parse from '../tools/importer/parsers/carousel-images.js';

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { name, cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', name);
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) c.forEach((n) => td.append(n)); else if (c) td.append(c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

const run = (slides) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="carousel"><div class="new-carousel"><div class="swiper swiper-single-slide"><div class="swiper-wrapper">${slides}</div></div></div></div></main></body></html>`);
  parse(document.querySelector('.carousel'), { document });
  return [...document.querySelectorAll('table[data-name] tr')].map((tr) => [...tr.children]);
};

test('a slide whose text sits next to its image (no figcaption) keeps the text as its caption', () => {
  const rows = run(`
    <div class="swiper-slide section"><div>
      <div class="image parbase section"><div class="image-wrapper"><figure><img src="/content/dam/a.jpg" alt="Cabin Manager"></figure></div></div>
      <div class="text section"><div class="richtext"><p><strong>Approachable – Wir sind aufgeschlossen</strong>&nbsp;<br> Wir begegnen Kolleg:innen mit Hilfsbereitschaft.</p></div></div>
    </div></div>
    <div class="swiper-slide section swiper-slide-duplicate"><div><figure><img src="/content/dam/a.jpg" alt="copy"></figure></div></div>`);
  assert.equal(rows.length, 1);
  const [image, caption] = rows[0];
  assert.equal(image.querySelector('img').getAttribute('alt'), 'Cabin Manager');
  assert.equal(caption.querySelector('strong').textContent, 'Approachable – Wir sind aufgeschlossen');
  assert.match(caption.textContent, /Wir begegnen Kolleg:innen mit Hilfsbereitschaft\./);
  assert.ok(caption.querySelector('br'), 'the line break stays');
});

test('a figcaption caption stays as before', () => {
  const rows = run('<div class="swiper-slide"><figure><img src="/content/dam/b.jpg" alt="1926"><figcaption class="caption"><maui-caption>Die erste Ju 52</maui-caption></figcaption></figure></div>');
  assert.equal(rows.length, 1);
  assert.equal(rows[0][1].innerHTML, '<p>Die erste Ju 52</p>');
});
