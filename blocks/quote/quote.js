/**
 * Quote: a quotation and the name of the person quoted (www's author quote: .quote-text and
 * .subline-text). Authoring: the quote in the first cell with text, the name in the next one (one
 * row of two cells, or two rows); further cells are left out. A quote without a name has no
 * caption; a block without text is removed with its wrapper.
 * @param {Element} block The quote block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')].filter((c) => c.textContent.trim());
  if (!cells.length) {
    (block.closest('.quote-wrapper') || block).remove();
    return;
  }
  const [quote, name] = cells;
  const figure = document.createElement('figure');
  const text = document.createElement('blockquote');
  text.className = 'quote-text';
  const paragraphs = [...quote.querySelectorAll(':scope > p')].filter((p) => p.textContent.trim());
  if (paragraphs.length) {
    text.append(...paragraphs);
  } else {
    const p = document.createElement('p');
    p.append(...quote.childNodes);
    text.append(p);
  }
  figure.append(text);
  if (name) {
    const caption = document.createElement('figcaption');
    caption.className = 'quote-name';
    const only = name.children.length === 1 && name.firstElementChild.tagName === 'P' ? name.firstElementChild : name;
    caption.append(...only.childNodes);
    figure.append(caption);
  }
  block.replaceChildren(figure);
}
