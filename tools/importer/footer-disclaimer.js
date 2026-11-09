/**
 * www's footer disclaimer (.footerdisclaimer > .footer-disclaimer, the DESY component at the end
 * of the de/en homepage since 2026-11): the price note and a "General Conditions" link button that
 * opens a maui-modal with the conditions. Here the note is small print and the button a link to
 * the locale's dialog document /{cc}/{ll}/fragments/modals/{label} (scripts/fragment-dialog.js
 * opens links under /modals/ as a dialog; under /fragments/ the document stays out of the
 * indexes). The page's side is transformers/lufthansa-cleanup.js (convertFooterDisclaimer, inlined
 * there as transformers run as plain scripts: the same path rule); the modal's text leaves the page
 * and tools/importer/general-conditions-dialogs.mjs writes the dialog document from the same
 * snapshot after the import, with this module.
 */

/** "General Conditions" -> "general-conditions" (accents dropped, as document names). */
export function slugify(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The locale root of a page path (/de/en/homepage -> /de/en), or null. */
export function localeBase(pagePath) {
  const m = String(pagePath || '').match(/^\/([a-z]{2})\/([a-z]{2})(?=\/|$)/);
  return m ? `/${m[1]}/${m[2]}` : null;
}

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();

/**
 * The disclaimer of a page: its note, the modal's label and the modal, or null.
 * @param {Document|Element} root
 */
export function readFooterDisclaimer(root) {
  const box = root.querySelector('.footer-disclaimer');
  if (!box) return null;
  const note = clean(box.querySelector('.disclaimer-text')?.textContent);
  const modal = box.querySelector('maui-modal');
  const label = clean(modal?.getAttribute('label') || box.querySelector('maui-link-button')?.textContent);
  return {
    box, note, label, modal: modal && label ? modal : null,
  };
}

/**
 * The dialog document's path for a page (null without a modal or a locale): its name the label's
 * slug, or the root's language for a label without Latin letters or digits (SWISS's el, ja, ru,
 * zh: "一般ご利用条件" -> /ch/ja/fragments/modals/ja; the brief after 518). The same rule as
 * transformers/lufthansa-cleanup.js convertFooterDisclaimer.
 */
export function dialogPath(disclaimer, pagePath) {
  const base = localeBase(pagePath);
  if (!disclaimer || !disclaimer.modal || !base) return null;
  return `${base}/fragments/modals/${slugify(disclaimer.label) || base.split('/')[2]}`;
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** The modal's text as plain markup: paragraphs and lists, links kept (href only). */
function modalBody(modal) {
  const inline = (node) => [...node.childNodes].map((n) => {
    if (n.nodeType === 3) return escapeHtml(n.nodeValue.replace(/\s+/g, ' '));
    if (n.nodeType !== 1) return '';
    const tag = n.tagName.toLowerCase();
    const inner = inline(n);
    if (tag === 'a' && n.getAttribute('href')) return `<a href="${escapeHtml(n.getAttribute('href'))}">${inner}</a>`;
    if (['strong', 'b'].includes(tag)) return `<strong>${inner}</strong>`;
    if (['em', 'i'].includes(tag)) return `<em>${inner}</em>`;
    if (tag === 'br') return '<br>';
    return inner;
  }).join('');
  const blocks = [];
  modal.querySelectorAll(':scope > p, :scope > ul, :scope > ol').forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'p') {
      const html = inline(el).trim();
      if (html) blocks.push(`<p>${html}</p>`);
    } else {
      const items = [...el.children].filter((li) => li.tagName === 'LI').map((li) => `<li>${inline(li).trim()}</li>`).join('');
      if (items) blocks.push(`<${tag}>${items}</${tag}>`);
    }
  });
  if (!blocks.length && clean(modal.textContent)) blocks.push(`<p>${escapeHtml(clean(modal.textContent))}</p>`);
  return blocks.join('');
}

/**
 * The dialog document (.plain.html) of a page's footer disclaimer: the label as the H2 (the
 * dialog's name), then the modal's text; null without a modal.
 * @param {Document|Element} root
 */
export function dialogDocument(root) {
  const d = readFooterDisclaimer(root);
  if (!d || !d.modal) return null;
  return `<div><h2>${escapeHtml(d.label)}</h2>${modalBody(d.modal)}</div>\n`;
}
