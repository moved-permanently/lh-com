/* eslint-disable max-len, import/extensions, import/prefer-default-export -- tooling */
/* eslint-disable import/no-extraneous-dependencies -- linkedom: a dev dependency */
/**
 * ITA's info pages with www's "Quick Links" sidebar (www.ita-airways.com's airem-sidebar:
 * sidebar-content beside sidebar-aside; capture ita-parity-001, the carry-on baggage page). The
 * import writes the box flattened after the content: an H4, then per card a linked picture, a
 * linked H3, a linked text, a link. This step makes it www's: the sidebar's content (from the
 * section's first H2 to the box; the whole section when it starts with the H1, as on online
 * check-in: www's component holds the H1 there, ita-parity-002) a section of its own, then the
 * box a section with the section style sidebar-aside (shown beside the section before it:
 * scripts/section-aside.js), its heading and a cards-teaser of the cards (picture | title, text,
 * the link); online check-in's seat teaser www's grey two-column view (withGreyTeaser). A
 * document without the box, or one this step made already, stays as it is.
 */
import { parseHTML } from 'linkedom';

const linkOf = (el) => (el && el.querySelector('a[href]')) || null;
const only = (el, tag) => el && el.children.length === 1 && el.firstElementChild.tagName === tag;
// "<p><a><picture>": a card's linked picture
const isCardPicture = (el) => el && el.tagName === 'P' && only(el, 'A') && el.querySelector('a > picture') && !el.textContent.trim();

/** The cards after the box's heading: [{picture, title, text, link}] and the nodes they take. */
function readCards(heading) {
  const cards = [];
  const taken = [];
  let n = heading.nextElementSibling;
  while (isCardPicture(n)) {
    const title = n.nextElementSibling;
    if (!title || !/^H[2-6]$/.test(title.tagName)) break;
    const card = {
      picture: n.querySelector('picture'), title: title.textContent.trim(), texts: [], link: null,
    };
    taken.push(n, title);
    let m = title.nextElementSibling;
    while (m && m.tagName === 'P' && !isCardPicture(m)) {
      taken.push(m);
      card.texts.push(m);
      m = m.nextElementSibling;
    }
    // the last line is the card's link, the others its text
    const last = card.texts.pop();
    card.link = linkOf(last);
    if (!card.link) return { cards: [], taken: [] };
    cards.push(card);
    n = m;
  }
  return { cards, taken };
}

/**
 * Online check-in's seat teaser (ita-parity-002): www's grey is a two-column view of its own
 * (container-gray: the picture | the heading, text and link) inside the sidebar's content, where
 * the import gave the whole section the style grey. The teaser (the section's last unlinked
 * picture, then an H2 and its paragraphs) becomes a columns-media (grey) of one row and the
 * section's style loses grey. Only when the section's style has grey and the teaser ends it.
 * @param {Document} document
 * @param {Element} section the sidebar's content
 * @param {Element[]} ownMeta the section's own section metadata
 */
function withGreyTeaser(document, section, ownMeta) {
  const style = ownMeta.flatMap((m) => [...m.children]).find((r) => /^style$/i.test(r.firstElementChild?.textContent.trim() || ''));
  const value = style && style.children[1];
  if (!value || !/(^|,)\s*grey\s*(,|$)/i.test(value.textContent)) return;
  const kids = [...section.children].filter((el) => !ownMeta.includes(el));
  const at = kids.findLastIndex((el) => el.tagName === 'P' && only(el, 'PICTURE') && !el.textContent.trim());
  const rest = kids.slice(at + 1);
  if (at < 0 || !rest.length || rest[0].tagName !== 'H2' || rest.slice(1).some((el) => el.tagName !== 'P')) return;
  const block = document.createElement('div');
  block.className = 'columns-media grey';
  const row = document.createElement('div');
  const media = document.createElement('div');
  const body = document.createElement('div');
  media.append(kids[at].firstElementChild);
  kids[at].remove();
  body.append(...rest);
  row.append(media, body);
  block.append(row);
  section.append(block);
  value.textContent = value.textContent.split(',').map((s) => s.trim()).filter((s) => s && !/^grey$/i.test(s)).join(', ');
}

/**
 * @param {string} doc a document (<body><header></header><main>…</main>…) or its sections (.plain.html)
 * @returns {string} the document with the sidebar, or doc itself
 */
export function withQuickLinksSidebar(doc) {
  if (/<div>sidebar-aside<\/div>/.test(doc)) return doc;
  // a whole document (<main>…</main>) or the import's .plain.html (the sections only)
  const isPlain = !/<main>/.test(doc);
  const inner = isPlain ? doc : doc.match(/<main>([\s\S]*)<\/main>/)[1];
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${inner}</main></body></html>`);
  const main = document.querySelector('main');
  const heading = [...main.querySelectorAll(':scope > div > h4')].find((h) => isCardPicture(h.nextElementSibling));
  if (!heading) return doc;
  const { cards, taken } = readCards(heading);
  if (cards.length < 1) return doc;
  const section = heading.parentElement;
  // the box: its heading and the cards
  const aside = document.createElement('div');
  const block = document.createElement('div');
  block.className = 'cards-teaser';
  cards.forEach((card) => {
    const row = document.createElement('div');
    const media = document.createElement('div');
    media.append(card.picture);
    const body = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = card.title;
    body.append(h3);
    card.texts.forEach((p) => {
      const plain = document.createElement('p');
      plain.textContent = p.textContent.trim();
      body.append(plain);
    });
    const cta = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', card.link.getAttribute('href'));
    a.textContent = card.link.textContent.trim();
    cta.append(a);
    body.append(cta);
    row.append(media, body);
    block.append(row);
  });
  const meta = document.createElement('div');
  meta.className = 'section-metadata';
  meta.innerHTML = '<div><div>Style</div><div>sidebar-aside</div></div>';
  // what follows the cards in the section stays after the box (the page's metadata); the
  // section's own section metadata (its style) stays with the section's content
  const after = [];
  let n = taken[taken.length - 1].nextElementSibling;
  while (n) { after.push(n); n = n.nextElementSibling; }
  const ownMeta = after.filter((el) => el.classList.contains('section-metadata'));
  taken.forEach((el) => el.remove());
  aside.append(heading, block, meta, ...after.filter((el) => !ownMeta.includes(el)));
  // the sidebar's content: from the section's first H2 to the box (carry-on: the H1 and intro
  // above www's component), the whole section when it starts with the H1 (online check-in)
  const firstH2 = section.querySelector(':scope > h2');
  if (firstH2 && firstH2 !== section.firstElementChild && section.firstElementChild.tagName !== 'H1') {
    const content = document.createElement('div');
    let m = firstH2;
    while (m) { const next = m.nextElementSibling; content.append(m); m = next; }
    content.append(...ownMeta);
    section.after(content, aside);
  } else {
    withGreyTeaser(document, section, ownMeta);
    section.append(...ownMeta);
    section.after(aside);
  }
  return isPlain ? main.innerHTML : doc.replace(/<main>[\s\S]*<\/main>/, () => `<main>${main.innerHTML}</main>`);
}
