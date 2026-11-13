/**
 * Later changes to helix-query.yaml that the "every other index as before" tests accept: each
 * function gives the indexes as they were before that change, so a test comparing with an older
 * commit (or with another index's columns) reads the rest unchanged.
 *
 * - standing order 11 of 2026-11-13 (ema-lufthansa, test/swiss-language-index-rows-595.test.mjs):
 *   SWISS's ch/el and ch/ru language indexes keep the first 5,500 words of a page's running text
 *   (Greek and Cyrillic rows of long pages went past the index's row size and the pages left it).
 */
const CAPPED = ['language-ch-el', 'language-ch-ru'];
const CAP = 'words(textContent(el), 0, 5500)';

/** @param {Object} indices helix-query.yaml's indices @returns {Object} without the cap */
export function withoutSwissContentCap(indices) {
  if (!indices) return indices;
  const out = { ...indices };
  CAPPED.forEach((name) => {
    const ix = out[name];
    const content = ix && ix.properties && ix.properties.content;
    if (!content || content.values !== CAP) return;
    out[name] = { ...ix, properties: { ...ix.properties, content: { ...content, values: 'textContent(el)' } } };
  });
  return out;
}

export default withoutSwissContentCap;
