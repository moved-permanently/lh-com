/* eslint-disable max-len -- the measurements in the header */
/* The carousel-images import parser and a slide's own heading (the brief after 517, item 3: Austrian against the recordings).
   www.austrian.com's single-slide carousels (premium-economy-class's Services: "Luxurious extras", "Culinary highlights", ...)
   hold per slide an image, a headline component (div.headline.section > h3) and a text component (.text > .richtext): the
   parser took the rich text alone, so every slide lost its title (www's h3 above the text). Now the slide's headings outside
   the rich text come along, in the slide's order; headings inside the rich text once; a figcaption caption as before.
   Markup: the snapshot of www.austrian.com/at/en/premium-economy-class, a slide trimmed.
   Run: node --max-old-space-size=256 --test test/carousel-images-slide-heading-519.test.mjs */
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

const slide = (title, text) => `<div class="swiper-slide section" role="group"><div>
  <div class="image parbase section"><div class="image-wrapper"><figure><img src="/content/dam/aua/${title.length}.jpg" alt="A picture"></figure></div></div>
  <div class="headline section"><h3 class="headline heading-small   ">
        ${title}</h3></div>
  <div class="text section"><div class="richtext  "><p>${text}</p></div></div>
</div></div>`;

test('a slide\'s headline component above its text: the heading, then the text', () => {
  const rows = run(slide('Luxurious extras', 'You don\'t have to restrict yourself with luggage.') + slide('Culinary highlights', 'Before departure, you have the opportunity.'));
  assert.equal(rows.length, 2);
  const [, caption] = rows[0];
  assert.deepEqual([...caption.children].map((n) => n.tagName), ['H3', 'P']);
  assert.equal(caption.querySelector('h3').textContent.trim(), 'Luxurious extras');
  assert.equal(rows[1][1].querySelector('h3').textContent.trim(), 'Culinary highlights');
});

test('a heading inside the rich text once; a slide without a headline component as before', () => {
  const rows = run(`<div class="swiper-slide section"><div>
    <figure><img src="/content/dam/c.jpg" alt="c"></figure>
    <div class="text section"><div class="richtext"><h3>Inside</h3><p>Body.</p></div></div>
  </div></div>`);
  assert.deepEqual([...rows[0][1].children].map((n) => `${n.tagName} ${n.textContent}`), ['H3 Inside', 'P Body.']);
});

test('a figcaption caption stays the caption (the slide\'s headline not added)', () => {
  const rows = run(`<div class="swiper-slide"><figure><img src="/content/dam/b.jpg" alt="1926"><figcaption class="caption"><maui-caption>Die erste Ju 52</maui-caption></figcaption></figure>
    <div class="headline section"><h3 class="headline">Not a caption</h3></div></div>`);
  assert.equal(rows[0][1].innerHTML, '<p>Die erste Ju 52</p>');
});
