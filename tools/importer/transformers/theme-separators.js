/* eslint-disable */
/* global WebImporter */

/**
 * The theme's separators as purpose blocks (a template's own transformer, page-templates.json
 * "transformers"; hub since brief 497): token-free styling step 1 carries the theme's M and L
 * spaces and its Divider as the purpose blocks Spacer, Spacer (l) and Divider, drawn as the
 * separator paragraphs "{spacer-60}", "{spacer-120}" and "{divider-25}" make (scripts/token-free.js
 * decoratePurposeBlocks; the sizes are scripts/style-markers.js SPACE and DIVIDER_SPACE, mirrored:
 * transformers can't import). afterTransform, after the cleanup has written its separators: such a
 * paragraph of the page's default content becomes the block; every other size and "from-768" keeps
 * its marker (no carrier yet), and a separator inside a block's cell stays.
 */
const SEPARATOR = /^\{(spacer|divider)-(\d{1,3})( from-768)?\}$/;
const SPACER = { 60: 'Spacer', 120: 'Spacer (l)' };
const DIVIDER = { 25: 'Divider' };

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const document = (payload && payload.document) || element.ownerDocument || element;
  [...element.querySelectorAll('p')].forEach((p) => {
    if (p.closest('table') || p.children.length) return;
    const m = p.textContent.trim().match(SEPARATOR);
    if (!m || m[3]) return;
    const name = (m[1] === 'divider' ? DIVIDER : SPACER)[Number(m[2])];
    if (!name) return;
    p.replaceWith(WebImporter.Blocks.createBlock(document, { name, cells: [['']] }));
  });
}
