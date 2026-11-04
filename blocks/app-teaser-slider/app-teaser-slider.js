/*
 * app-teaser-slider: the app's teaser slider (tools/workers/lh-edge/SDUI.md: teaserSlider with
 * cardItem_v2 cards, the home screen's "Discover further topics") as authors see it on an app
 * screen document: its Title over a row of cards (picture, headline, text), each linked to its
 * target, its tracking label as a caption.
 */
import {
  el, cellText, cellImage, trackingCaption,
} from '../../scripts/app-screen.js';

export default function decorate(block) {
  const rows = [...block.children];
  const titleRow = rows.find((r) => r.children.length === 2 && cellText(r.children[0]).toLowerCase() === 'title');
  const cards = el('ul', 'app-teaser-slider-cards');
  rows.filter((r) => r.children.length >= 4).forEach((r) => {
    const [c1, c2, c3, c4] = r.children;
    const h = c1.querySelector('h1, h2, h3, h4, h5, h6');
    const p = c1.querySelector('p');
    const link = c3.querySelector('a[href]');
    const li = el('li', 'app-card');
    const a = el('a', 'app-card-link');
    a.href = link ? link.getAttribute('href') : '#';
    if (link) a.title = link.textContent.trim();
    const image = cellImage(c2);
    if (image) {
      const img = el('img', 'app-card-image');
      img.src = image;
      const srcImg = c2.querySelector('img');
      img.alt = srcImg ? srcImg.getAttribute('alt') || '' : '';
      img.loading = 'lazy';
      a.append(img);
    }
    a.append(el('p', 'app-card-headline', h ? h.textContent.trim() : ''));
    if (p) a.append(el('p', 'app-card-text', p.textContent.trim()));
    li.append(a);
    const caption = trackingCaption(cellText(c4));
    if (caption) li.append(caption);
    cards.append(li);
  });
  const parts = [];
  if (titleRow) parts.push(el('p', 'app-teaser-slider-title', cellText(titleRow.children[1])));
  parts.push(cards);
  block.replaceChildren(...parts);
}
