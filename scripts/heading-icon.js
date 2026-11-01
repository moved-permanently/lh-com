/**
 * Section style heading-icon (www.airdolomiti.eu's "What to do" above a carousel, a small
 * picture before the heading): the section's first small picture, a paragraph of its own and at
 * most MAX_WIDTH wide (its width attribute), goes inline at the start of the next H2. Sections
 * without the style are left as they are.
 */
const MAX_WIDTH = 200;

/** Whether a paragraph holds one small picture and nothing else. */
function isSmallPicture(p) {
  if (p.tagName !== 'P' || p.textContent.trim()) return false;
  const pictures = p.querySelectorAll('picture');
  if (pictures.length !== 1 || p.children.length !== 1) return false;
  const img = pictures[0].querySelector('img');
  const width = Number(img && img.getAttribute('width'));
  return Boolean(img) && (!width || width <= MAX_WIDTH);
}

/** @param {Element} main */
export default function decorateHeadingIcons(main) {
  main.querySelectorAll('.section.heading-icon').forEach((section) => {
    const elements = [...section.querySelectorAll('.default-content-wrapper > *')];
    const at = elements.findIndex(isSmallPicture);
    if (at < 0) return;
    const heading = elements.slice(at + 1).find((e) => e.tagName === 'H2');
    if (!heading) return;
    const p = elements[at];
    const icon = document.createElement('span');
    icon.className = 'heading-icon-image';
    icon.append(p.querySelector('picture'));
    heading.prepend(icon);
    p.remove();
  });
}
