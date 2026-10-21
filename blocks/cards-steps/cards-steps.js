import { cleanText, decorateExternalLinks } from '../../scripts/block-config.js';

/** An authored step number: "1", "01", "1." or "1)". */
const STEP_NUMBER = /^\d{1,3}[.)]?$/;

/**
 * Body elements of a row (all cells merged). Cells authored without paragraphs become
 * a paragraph.
 * @param {Element} row
 * @returns {Element[]}
 */
function bodyElements(row) {
  const elements = [];
  [...row.children].forEach((cell) => {
    if (!cleanText(cell) && !cell.querySelector('picture, img, span.icon')) return;
    const hasBlocks = [...cell.children].some((el) => /^(P|H[1-6]|UL|OL|DIV)$/.test(el.tagName));
    if (hasBlocks) {
      [...cell.children].forEach((el) => {
        if (cleanText(el) || el.querySelector('picture, img, span.icon')) elements.push(el);
      });
    } else {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      elements.push(p);
    }
  });
  return elements;
}

/**
 * Numbered steps: number, title, description and an optional CTA link.
 * One row per step (cells may be merged or split): step number as the first paragraph
 * (generated from the position when omitted), H3 title, description, optional last link.
 * @param {Element} block
 */
export default function decorate(block) {
  const ol = document.createElement('ol');

  [...block.children].forEach((row) => {
    const elements = bodyElements(row);
    if (!elements.length) return;

    let number = '';
    const first = elements[0];
    if (first.tagName !== 'UL' && first.tagName !== 'OL' && STEP_NUMBER.test(cleanText(first))) {
      number = cleanText(first).replace(/[.)]$/, '');
      elements.shift();
    }
    if (!number) number = String(ol.children.length + 1);

    const li = document.createElement('li');
    li.className = 'cards-steps-step';

    const numberEl = document.createElement('span');
    numberEl.className = 'cards-steps-number';
    // the list already announces the position
    numberEl.setAttribute('aria-hidden', 'true');
    numberEl.textContent = number;
    li.append(numberEl);

    const body = document.createElement('div');
    body.className = 'cards-steps-body';
    elements.forEach((el, i) => {
      if (/^H[1-6]$/.test(el.tagName) && !body.querySelector('.cards-steps-title')) {
        el.classList.add('cards-steps-title');
      }
      const links = el.querySelectorAll('a[href]');
      const isLast = i === elements.length - 1;
      if (isLast && el.tagName === 'P' && links.length === 1
        && cleanText(el) === cleanText(links[0])) {
        const a = links[0];
        el.className = 'cards-steps-cta';
        a.classList.remove('button', 'primary', 'secondary', 'accent');
        a.classList.add('cards-steps-cta-link');
      }
      body.append(el);
    });
    li.append(body);
    ol.append(li);
  });

  decorateExternalLinks(ol);
  block.replaceChildren(ol);
}
