import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { keepImageSize } from '../../scripts/block-config.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(keepImageSize(img, createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]))));
  block.replaceChildren(ul);
  // brand tap: the Miles&Go tier cards' swiper controls on phones (./cards-tap.js, brief 483)
  if (getMetadata('brand').trim().toLowerCase() === 'tap' && !block.matches('.three-up, .four-up') && ul.querySelector(':scope > li > .cards-card-image')) {
    import('./cards-tap.js').then((m) => m.default(block));
  }
}
