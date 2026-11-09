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

function markColumnViews(document, template, onlyDrawnViews = false) {
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
    // campaign pages (brief 507): only the views drawn as views, a one-column view or one a block
    // takes; a multi-column text view the import stacks as default content keeps no padding
    // (munich-fair's two text columns: 13.2 -> 20.9 % with it)
    if (onlyDrawnViews && !block && !root.matches('.onecolumn')) return false;
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

/*
 * The column view carrier (brief 506): after the marker collapse nothing marks a column view, so
 * afterTransform (after the cleanup wrote the marks, lufthansa-sections and campaign-sections the
 * sections) makes each one a section of its own, its section's styles plus column-view: a view
 * in an AEM section ("{column-start}" ... "{column-end}"; styles.css: 32px above and below, 64
 * between two, its headings two thirds wide) and one in the page's container ("-outer"; column-view
 * and padded: www's 20 / 40px); flush where more of its AEM section
 * follows (no gap to the next piece). Separators right before a view open its section. The
 * marks stay (they work until the collapse has run). A nested view stays in its outer view's
 * section; a view across a section break or in a block is left alone.
 */
const MARK_HOLDERS = 'p, h1, h2, h3, h4, h5, h6, li';
const LEAVES = 'p, h1, h2, h3, h4, h5, h6, ul, ol, table, picture, img, video, iframe, blockquote';
const META = 'section metadata';
const SEPARATOR_P = /^\{(spacer|divider)-[^}]*\}$/;

// document order from one walk (compareDocumentPosition isn't reliable in every DOM the importer runs in)
let order = new Map();
const before = (a, b) => order.get(a) < order.get(b);
const inTable = (el) => !!(el.parentElement && el.parentElement.closest('table'));
const tableName = (table) => {
  const row = table.querySelector('tr');
  return row ? cleanText(row).toLowerCase() : '';
};
const styleRow = (table) => [...table.querySelectorAll('tr')].slice(1)
  .find((tr) => tr.firstElementChild && cleanText(tr.firstElementChild).toLowerCase() === 'style');

function columnMarks(main) {
  return [...main.querySelectorAll(MARK_HOLDERS)].filter((el) => !el.closest('table')).map((el) => {
    const m = cleanText(el).match(/\{([a-z0-9 -]+)\}$/);
    const tokens = m ? m[1].split(' ') : [];
    const at = el.tagName === 'LI' ? el.closest('ul, ol') : el;
    return {
      el: at,
      start: tokens.includes('column-start'),
      end: tokens.includes('column-end'),
      startOuter: tokens.includes('column-start-outer'),
      endOuter: tokens.includes('column-end-outer'),
    };
  }).filter((k) => k.start || k.end || k.startOuter || k.endOuter);
}

// the outermost start / end pairs of one kind, in document order
function pairs(marks, start, end, kind) {
  const out = [];
  let depth = 0;
  let open = null;
  marks.forEach((k) => {
    if (k[start]) {
      if (!depth) open = k.el;
      depth += 1;
    }
    if (k[end] && depth) {
      depth -= 1;
      if (!depth && open) out.push({ from: open, to: k.el, kind });
    }
  });
  return out;
}

// the innermost www column wrapper holding both marks (no break, no table in it)
function viewBox(from, to, main, breaks) {
  for (let el = from.parentElement; el && el !== main; el = el.parentElement) {
    if (el.matches(`:is(${COLUMN_KINDS}).column`) && el.contains(to)) {
      return el.closest('table') || breaks.some((hr) => el.contains(hr)) ? null : el;
    }
  }
  return null;
}

function splitColumnViews(main, document) {
  const marks = columnMarks(main);
  const outer = pairs(marks, 'startOuter', 'endOuter', 'cc');
  order = new Map([...main.querySelectorAll('*')].map((el, i) => [el, i]));
  const inside = (p, q) => (p.from === q.from || before(q.from, p.from)) && (p.to === q.to || before(p.to, q.to));
  const inner = pairs(marks, 'start', 'end', 'sc').filter((p) => !outer.some((q) => inside(p, q)));
  [...outer, ...inner].sort((p, q) => (before(p.from, q.from) ? -1 : 1)).forEach(({ from, to, kind }) => {
    order = new Map([...main.querySelectorAll('*')].map((el, i) => [el, i]));
    const breaks = [...main.querySelectorAll('hr')].filter((hr) => !inTable(hr));
    if (breaks.some((hr) => before(from, hr) && before(hr, to))) return;
    // www's column wrapper, where it is still there, is the view (a link after the marked text
    // is in it); else the marked elements
    const box = viewBox(from, to, main, breaks);
    const first = box || from;
    const last = box || to;
    const prev = breaks.filter((hr) => before(hr, first)).pop();
    const next = breaks.find((hr) => before(last, hr) && !last.contains(hr));
    const within = (el) => (!prev || before(prev, el)) && (!next || before(el, next));
    const leaves = [...main.querySelectorAll(LEAVES)].filter((el) => !inTable(el) && within(el));
    const meta = leaves.find((el) => el.tagName === 'TABLE' && tableName(el) === META);
    const row = meta && styleRow(meta);
    const styles = row ? cleanText(row.lastElementChild) : '';
    // separator paragraphs aren't content: between two views they open the next view's section
    const content = (el) => el !== meta && !el.contains(first) && !el.contains(last)
      && (el.tagName === 'TABLE' || (!isEmpty(el) && !SEPARATOR_P.test(cleanText(el))));
    const contentBefore = leaves.some((el) => before(el, first) && content(el));
    const contentAfter = leaves.some((el) => before(last, el) && !last.contains(el) && content(el));
    // an outer view: www's outer padding too (a separator that opens it would keep the collapse from it)
    const view = kind === 'cc' ? ['column-view', 'padded'] : ['column-view'];
    const own = [styles, ...view].filter(Boolean).join(', ');
    const metaBlock = (style) => WebImporter.Blocks.createBlock(document, { name: 'Section Metadata', cells: { style } });
    // the view's metadata at its end (in the wrapper), then the break
    const endWith = (meta2) => (box ? box.append(meta2) : last.after(meta2));
    if (contentAfter) {
      // not the AEM section's last piece: no gap to the next one (its spaced belongs to the last)
      const list = styles.split(',').map((x) => x.trim()).filter((x) => x && x !== 'spaced');
      if (!list.includes('flush')) list.push('flush');
      const hr = document.createElement('hr');
      last.after(hr);
      endWith(metaBlock([...list, ...view].join(', ')));
    } else {
      if (row) row.lastElementChild.textContent = own;
      else endWith(metaBlock(own));
    }
    if (contentBefore) {
      // the separators right before the view open its section (their space is its edge)
      const lastContent = leaves.filter((el) => before(el, first) && content(el)).pop();
      const lead = leaves.find((el) => el.tagName === 'P' && SEPARATOR_P.test(cleanText(el))
        && before(lastContent, el) && !el.contains(lastContent) && before(el, first));
      const hr = document.createElement('hr');
      (lead || first).before(hr);
      if (styles) hr.before(metaBlock(styles));
    }
  });
}

// campaign-sections' section breaks (lufthansa-sections' attributes): a campaign page that has them
// keeps its own spacing; one that is a single AEM section of column views (frankfurt-fair, take-off,
// the stopover partner pages; brief 507) gets the hub's column views
const CAMPAIGN_SECTION_BREAK = 'hr[data-excat-section-source-style*="campaign-section"]';

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform' && hookName !== 'afterTransform') return;
  const template = (payload && payload.template) || {};
  if (CLEANUP_TEMPLATES.includes(template.name) || CLEANUP_TEMPLATES.includes(template.base)) return;
  const document = (payload && payload.document) || element.ownerDocument || element;
  const campaign = template.name === 'campaign' || template.base === 'campaign';
  if (campaign && hookName === 'beforeTransform' && document.querySelector(CAMPAIGN_SECTION_BREAK)) return;
  // afterTransform: only where beforeTransform marked (the breaks are gone by then); the marks tell
  if (campaign && hookName === 'afterTransform' && !/\{[a-z0-9 -]*column-(start|end)/.test(element.textContent || '')) return;
  if (hookName === 'beforeTransform') markColumnViews(document, template, campaign);
  else splitColumnViews(element, document);
}
