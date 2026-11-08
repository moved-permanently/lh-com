/* eslint-disable */
/* global WebImporter */

/**
 * Column views on hub pages (the template's own transformer, page-templates.json hub
 * "transformers"; brief 497): www pads a column view of its own 3.2rem above and below in an AEM
 * section (2rem / 4rem outside one), as on info pages. The cleanup marks them only for its
 * COLUMN_MARK_TEMPLATES (info, fleet), together with "Theme: flow-spacing", which hub documents
 * don't have. This sets the cleanup's data-lh-column attribute ("sc", "sc-spaced", "cc") with the
 * cleanup's rule (lufthansa-cleanup markColumnViews, mirrored: transformers can't import); the
 * columns-media parser moves it, the cleanup's placeColumnMarks writes "{column-start}" /
 * "{column-end}" in afterTransform. /de/en and /de/de miles-and-more: DA's three marks.
 */
const COLUMN_ATTR = 'data-lh-column';
const COLUMN_KINDS = '.onecolumn, .twocolumn, .threecolumn, .fourcolumn';
const HEADING = 'h1, h2, h3, h4, h5, h6';
const MEDIA = 'img, picture, video, iframe, svg, table, input, select, textarea, button';
// the templates whose column views the cleanup marks itself
const CLEANUP_TEMPLATES = ['info', 'fleet'];

const cleanText = (el) => el.textContent.replace(/[\u200B\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
const isEmpty = (el) => !el.textContent.replace(/\u00A0/g, ' ').trim() && !el.querySelector(MEDIA);

function isOwnColumnView(el) {
  return !!el && el.matches(`:is(${COLUMN_KINDS}).column`) && el.children.length === 1
    && el.firstElementChild.classList.contains('column-view');
}

function markColumnViews(document, template) {
  const instances = (template.blocks || []).flatMap((b) => (b.instances || []).map((sel) => [b.name, sel]));
  const blockOf = (el) => {
    const hit = instances.find(([, sel]) => {
      try { return el.matches(sel); } catch (e) { return false; }
    });
    return hit ? hit[0] : null;
  };
  const titled = (view) => [...view.children]
    .some((d) => !d.matches('.row, .carousel') && d.querySelector(HEADING) && cleanText(d));
  // returns whether the column view is flattened (its nested column views are marked too)
  const mark = (root, kind, nested) => {
    if (!isOwnColumnView(root) || root.closest('.article-details-page') || root.hasAttribute(COLUMN_ATTR)) return false;
    const view = root.firstElementChild;
    if (view.classList.contains('container-gray')) return false;
    const parent = root.parentElement;
    if (!nested && root.closest('.container-gray') && parent.matches('.section-content')
      && [...parent.children].filter((c) => !isEmpty(c)).length === 1) return false;
    const block = blockOf(root);
    if (block && block !== 'columns-media') return false;
    if (block && kind === 'sc' && !nested && !titled(view)) return false;
    root.setAttribute(COLUMN_ATTR, kind);
    return !block;
  };
  // the last AEM section with content (not the sub-page navigation)
  const aemSections = [...document.querySelectorAll('.container-content > .section')]
    .filter((s) => !isEmpty(s) && !s.querySelector('.container-subnav'));
  const lastAem = aemSections[aemSections.length - 1];
  const endsSpacedPage = (root) => {
    const aem = root.closest('.container-content > .section');
    if (!aem || aem !== lastAem || !aem.querySelector(':scope > .mb-default')) return false;
    let next = root.nextElementSibling;
    while (next && isEmpty(next)) next = next.nextElementSibling;
    return !next;
  };
  document.querySelectorAll(`:is(.section-content, .container-content) > :is(${COLUMN_KINDS})`).forEach((root) => {
    const kind = root.parentElement.matches('.section-content') ? 'sc' : 'cc';
    const flattened = mark(root, kind, false);
    if (kind === 'sc' && root.getAttribute(COLUMN_ATTR) === 'sc' && endsSpacedPage(root)) root.setAttribute(COLUMN_ATTR, 'sc-spaced');
    if (!flattened) return;
    root.querySelectorAll(`.column-view-item > :is(${COLUMN_KINDS})`).forEach((inner) => {
      if (inner.parentElement.closest('.column-view') === root.firstElementChild) mark(inner, kind, true);
    });
  });
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  const template = (payload && payload.template) || {};
  if (CLEANUP_TEMPLATES.includes(template.name) || CLEANUP_TEMPLATES.includes(template.base)) return;
  const document = (payload && payload.document) || element.ownerDocument || element;
  markColumnViews(document, template);
}
