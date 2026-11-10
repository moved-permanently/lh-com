/* eslint-disable max-len, import/extensions, import/prefer-default-export -- tooling */
/* eslint-disable import/no-extraneous-dependencies -- linkedom: a dev dependency */
/**
 * ITA's info pages whose sidebar box is a heading over links (www.ita-airways.com's airem-sidebar:
 * sidebar-content beside a sidebar-aside of a headline and maui-navigation-links, no cards;
 * ita-parity-004's /it/en/profile/miles-and-more, "More about Miles & More"). The import writes the
 * heading and its links at the end of the section; ita-quick-links.mjs takes card boxes only. This
 * step makes them a section with the section style sidebar-aside (beside the section before it:
 * scripts/section-aside.js), and the sidebar's content a section of its own from where www's
 * sidebar-content starts (its first text, read from the snapshot): the title and the stage picture
 * above it stay a section of their own. A snapshot without such a box, a heading not found or not
 * followed by link lines only, or a document this step made already: the document as it is.
 */
import { parseHTML } from 'linkedom';

const norm = (t) => (t || '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
// a paragraph that is one link and nothing else
const isLinkLine = (el) => Boolean(el) && el.tagName === 'P' && el.children.length === 1
  && el.firstElementChild.tagName === 'A' && norm(el.textContent) === norm(el.firstElementChild.textContent);

/**
 * @param {string} doc a document (<body><header></header><main>…</main>…) or its sections (.plain.html)
 * @param {string} html the page's snapshot
 * @returns {string} the document with the sidebar, or doc itself
 */
export function withLinkListSidebar(doc, html) {
  if (!html || /<div>sidebar-aside<\/div>/.test(doc)) return doc;
  const { document: snap } = parseHTML(html);
  const box = snap.querySelector('.airem-sidebar .sidebar-aside');
  if (!box || box.querySelector('img, picture, .teaser')) return doc;
  const title = norm((box.querySelector('h2, h3, h4') || {}).textContent);
  if (!title || !box.querySelector('maui-navigation-link[href], a[href]')) return doc;
  const start = snap.querySelector('.airem-sidebar .sidebar-content p');
  const startText = norm(start && start.textContent).slice(0, 40);
  // a whole document (<main>…</main>) or the import's .plain.html (the sections only)
  const isPlain = !/<main>/.test(doc);
  const inner = isPlain ? doc : doc.match(/<main>([\s\S]*)<\/main>/)[1];
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${inner}</main></body></html>`);
  const main = document.querySelector('main');
  const heading = [...main.querySelectorAll(':scope > div > :is(h2, h3, h4)')].find((h) => norm(h.textContent) === title);
  if (!heading) return doc;
  const section = heading.parentElement;
  const lines = [];
  let n = heading.nextElementSibling;
  while (isLinkLine(n)) { lines.push(n); n = n.nextElementSibling; }
  const rest = [];
  while (n) { rest.push(n); n = n.nextElementSibling; }
  // the box ends the section (only the section's own metadata after it)
  if (!lines.length || rest.some((el) => !el.classList.contains('section-metadata'))) return doc;
  const aside = document.createElement('div');
  const meta = document.createElement('div');
  meta.className = 'section-metadata';
  meta.innerHTML = '<div><div>Style</div><div>sidebar-aside</div></div>';
  aside.append(heading, ...lines, meta);
  const first = startText && [...section.children].find((el) => norm(el.textContent).startsWith(startText));
  if (first && first !== section.firstElementChild) {
    // the sidebar's content: from www's sidebar-content's first text, the section's own metadata with it
    const content = document.createElement('div');
    let m = first;
    while (m) { const next = m.nextElementSibling; content.append(m); m = next; }
    section.after(content, aside);
  } else {
    section.after(aside);
  }
  return isPlain ? main.innerHTML : doc.replace(/<main>[\s\S]*<\/main>/, () => `<main>${main.innerHTML}</main>`);
}
