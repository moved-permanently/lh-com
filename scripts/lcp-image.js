/**
 * The largest image of a page whose first section has none (PageSpeed 2026-10-29, /de/en/baggage:
 * the first cards-teaser image of section 2). That image is in the HTML, but loading="lazy" inside
 * a section that stays hidden until loadLazy, so it started 1.45 s late. Before the first section
 * loads, loadEager marks it loading="eager" and fetchpriority="high": the browser fetches an eager
 * image in a hidden section as well. Its <picture> sources are the pipeline's default breakpoints,
 * the URLs the blocks' createOptimizedPicture builds again, so the block's picture finds the file
 * already loaded. Every brand. Tests: test/lcp-image.test.mjs.
 */

/**
 * @param {Element} main the decorated main (its sections: div.section)
 * @returns {HTMLImageElement|null} the image marked, null when the first section has an image (its
 *   own first image is the candidate, waitForFirstImage) or the second has none
 */
export default function prioritizeSecondSectionImage(main) {
  const [first, second] = main ? main.querySelectorAll(':scope > div.section') : [];
  if (!first || !second || first.querySelector('img')) return null;
  const img = second.querySelector('img');
  if (!img) return null;
  img.setAttribute('loading', 'eager');
  img.setAttribute('fetchpriority', 'high');
  return img;
}
