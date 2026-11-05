/* eslint-disable max-len, import/extensions -- dev tooling */
/* Air Dolomiti's offers (www's mini-card-slider, "Scopri le nostre offerte": CardPromo cards,
   tools/importer/airdolomiti-import.mjs promoCards) as carousel-cards (promo): per card its
   picture, the route as the title, the price and the fare as two paragraphs (www: 112€, then
   "A/R in Economy light" in small capitals), the card's link last (the whole card links on
   www; styles/themes/airdolomiti.css stretches it over the card). A card without a price keeps
   its fare alone; without a link no link.
   Run: node --max-old-space-size=512 --test test/airdolomiti-promo-cards.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { promoCards, showMoreLink, destinationCards } from '../tools/importer/airdolomiti-import.mjs';

const page = {
  img: (x) => (x && x.url ? `<picture><img src="${x.url}" alt=""></picture>` : ''),
  heading: (tag, t) => `<${tag}>${t}</${tag}>`,
  link: (url, label) => `<p><a href="${url.replace('https://www.airdolomiti.it', '')}">${label}</a></p>`,
};

test('the cards: picture, route, price, fare and the link; the block carousel-cards (promo)', () => {
  const { name, rows } = promoCards({
    tagCard: 'h3',
    cardList: [
      {
        image: { url: 'https://cms.airdolomiti.it/f.jpg' }, title: 'Milano Malpensa - Francoforte', price: ' <span>112€</span>', bottomText: 'A/R in Economy light ', url: 'https://www.airdolomiti.it/tratte/volo-milano-malpensa-francoforte',
      },
      { image: null, title: 'Firenze - Monaco', bottomText: 'A/R in Economy Basic' },
    ],
  }, page);
  assert.equal(name, 'carousel-cards (promo)');
  assert.deepEqual(rows, [
    ['<picture><img src="https://cms.airdolomiti.it/f.jpg" alt=""></picture>', '<h3>Milano Malpensa - Francoforte</h3><p>112€</p><p>A/R in Economy light</p><p><a href="/tratte/volo-milano-malpensa-francoforte">Milano Malpensa - Francoforte</a></p>'],
    ['', '<h3>Firenze - Monaco</h3><p>A/R in Economy Basic</p>'],
  ]);
});

test('the slider\'s "see all" link with the number of cards, as www writes it ("Vedi tutto (3)", "vedi tutte (2)")', () => {
  const a = { showMoreText: 'Vedi tutto', showMoreTextUrl: 'https://www.airdolomiti.it/prenotazioni', cardList: [{}, {}, {}] };
  assert.equal(showMoreLink(a, page), '<p><a href="/prenotazioni">Vedi tutto (3)</a></p>');
  assert.equal(showMoreLink({ ...a, showMoreText: 'vedi tutte', cardList: [{}, {}] }, page), '<p><a href="/prenotazioni">vedi tutte (2)</a></p>');
  assert.equal(showMoreLink({ ...a, showMoreTextUrl: '' }, page), '', 'no link: none');
  assert.equal(showMoreLink({ ...a, cardList: [] }, page), '<p><a href="/prenotazioni">Vedi tutto</a></p>', 'no cards: no number');
});

test('the destinations (www\'s story-card-slider, "Le nostre destinazioni") as carousel-cards (destinations): the picture, the city, the card\'s link', () => {
  const { name, rows } = destinationCards({
    tagCard: 'h3',
    cardList: [{ gallery: { url: 'https://cms.airdolomiti.it/fra.jpg' }, title: 'Francoforte', url: 'https://www.airdolomiti.it/destinazioni/francoforte' }],
  }, page);
  assert.equal(name, 'carousel-cards (destinations)');
  assert.deepEqual(rows, [['<picture><img src="https://cms.airdolomiti.it/fra.jpg" alt=""></picture>', '<h3>Francoforte</h3><p><a href="/destinazioni/francoforte">Francoforte</a></p>']]);
});
