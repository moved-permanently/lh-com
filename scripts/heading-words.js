/**
 * lufthansa.com headings on phones keep their words whole, as www's (styles.css: no automatic
 * hyphenation and overflow-wrap normal below 768px). A word a little wider than its line runs into
 * the page margin as it does on www (/de/de/entryprocesses "Reisebestimmungen", 350px on a 346px
 * line). Only a heading whose text would reach past the viewport, so that the page would scroll
 * sideways, gets class heading-break-words (overflow-wrap: break-word: the overlong word breaks as
 * a last resort). Measured once the fonts are ready and again on resize (standing order 24).
 */
export const BREAK_CLASS = 'heading-break-words';
const HEADINGS = 'main :is(h1, h2, h3, h4, h5, h6)';

/** Marks the headings in root whose text reaches past the viewport; clears the others. */
export function checkHeadings(root = document) {
  const headings = [...root.querySelectorAll(HEADINGS)];
  // measure every heading with its words whole first, then set the class (one layout pass)
  headings.forEach((h) => h.classList.remove(BREAK_CLASS));
  const limit = document.documentElement.clientWidth;
  const over = headings.filter((h) => {
    const box = h.getBoundingClientRect();
    return box.width > 0 && box.left + h.scrollWidth > limit + 0.5;
  });
  over.forEach((h) => h.classList.add(BREAK_CLASS));
  return over.length;
}

/** Checks the headings now, when the fonts are ready and after a resize (phones only). */
export default function keepHeadingWords(doc = document) {
  const phones = window.matchMedia('(width < 768px)');
  const run = () => {
    if (phones.matches) checkHeadings(doc);
    else doc.querySelectorAll(`.${BREAK_CLASS}`).forEach((h) => h.classList.remove(BREAK_CLASS));
  };
  run();
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(run);
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(run, 150);
  });
}
