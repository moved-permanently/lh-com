/* eslint-disable */
/* global WebImporter */

/**
 * Section breaks for www.lufthansa.com pages, driven by payload.template.sections
 * (tools/importer/page-templates.json) and by the source's grey backgrounds.
 *
 * beforeTransform:
 *  - walks the template sections in reverse and inserts <hr> before every non-first section
 *    while the source elements still exist (parsers may replace them later). Styled sections
 *    get a marked <hr data-excat-section-id>; a styled first section gets a temporary one.
 *  - grey: every outermost .container-gray of the source (live: #f5f5f5 full-width background)
 *    is a section of its own, style grey: a marked <hr> before the component that holds it
 *    (the element whose parent is .container-content, .section-content, a column item or a grid
 *    column) and a plain <hr> after it, so the grey ends where the live grey ends. Not for grey
 *    boxes inside a block of the template (the parser renders them) or the sticky price bar.
 *  - full-bleed: a full-width image component (.image-wrapper.full-width-bg, the Lufthansa
 *    Insights category stage) is a section of its own with style full-bleed, the same way.
 *  - padded: every AEM section (.container-content > .section) after the first starts a
 *    section; style padded (live .section-padding-y-regular) when it and the one before it
 *    are padded on live and it is not grey.
 * afterTransform: drops breaks with no content since the previous break (or the page start),
 *   keeping their styles, then inserts a Section Metadata block (styles of the break) at the end
 *   of each styled section, removes the marker attributes, and removes the first section's
 *   temporary <hr>.
 *
 * Every inserted <hr> carries BREAK. The end of a section is the next section break in document
 * order (compareDocumentPosition), not the next sibling: later breaks are often nested deeper or
 * shallower than the styled section's own marker (app-entry, AirCore hero vs. #content).
 */

const MARKER = 'data-excat-section-id';
const BREAK = 'data-excat-section-break';
const FIRST = 'data-excat-section-first';
const SOURCE_STYLE = 'data-excat-section-source-style';
const FOLLOWING = 4; // Node.DOCUMENT_POSITION_FOLLOWING

/** Source backgrounds that become a section style: [selector, style]. */
const SOURCE_STYLES = [['.container-gray', 'grey'], ['.image-wrapper.full-width-bg', 'full-bleed']];
const STYLE_SKIP = '.sticky-price-wrapper, .dcep-sticky-price';
const REGION_STOP = '.section-content, .container-content, .column-view-item, [class*="col-"], .contentpage, main, body';
const MEDIA = 'img, picture, video, iframe, svg, table, input, select, textarea, button';

/** First section break after `marker` in document order (inserted <hr>, else any <hr> outside a block table). */
function nextBreak(document, marker) {
  const after = (list) => [...list].find((hr) => hr !== marker
    && (marker.compareDocumentPosition(hr) & FOLLOWING) && !hr.closest('table'));
  return after(document.querySelectorAll(`hr[${BREAK}]`)) || after(document.querySelectorAll('hr'));
}

function findSectionElement(document, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // unsupported selector in this environment; try the next one
    }
  }
  return null;
}

function hasStyle(section) {
  const { style } = section;
  if (Array.isArray(style)) return style.filter(Boolean).length > 0;
  return typeof style === 'string' && style.trim() !== '';
}

function styleValue(section) {
  return Array.isArray(section.style) ? section.style.filter(Boolean).join(', ') : section.style.trim();
}

function createBreak(document) {
  const hr = document.createElement('hr');
  hr.setAttribute(BREAK, '');
  return hr;
}

/** The components that carry a source style (outermost match of `source`, see above). */
function styledRegions(document, template, source) {
  const blockSelectors = (template.blocks || []).flatMap((b) => b.instances || []);
  const insideBlock = (el) => blockSelectors.some((sel) => {
    try {
      return !!(el.parentElement && el.parentElement.closest(sel));
    } catch (e) {
      return false;
    }
  });
  const regions = [];
  document.querySelectorAll(source).forEach((match) => {
    if (match.closest(STYLE_SKIP) || (match.parentElement && match.parentElement.closest(source))) return;
    let region = match;
    while (region.parentElement && !region.parentElement.matches(REGION_STOP)) region = region.parentElement;
    if (!region.parentElement || region.matches('main, body') || insideBlock(region)) return;
    if (regions.some((r) => r.contains(region) || region.contains(r))) return;
    regions.push(region);
  });
  return regions;
}

/** "{spacer-40}" paragraphs (lufthansa-cleanup separators) do not make a section of their own. */
const SPACER = /^\{(spacer|divider)-\d{1,3}( from-768)?\}$/;

/** Whether anything visible lies between two nodes (from the start of `root` when `from` is null). */
function contentBetween(document, root, from, to) {
  const range = document.createRange();
  if (from) range.setStartAfter(from); else range.setStart(root, 0);
  range.setEndBefore(to);
  const frag = range.cloneContents();
  frag.querySelectorAll('p').forEach((p) => { if (SPACER.test(p.textContent.trim())) p.remove(); });
  if ((frag.textContent || '').replace(/[\s ​]/g, '')) return true;
  return !!frag.querySelector(MEDIA);
}

/** Removes breaks that would open an empty section; the kept break inherits their styles. */
function dropEmptyBreaks(document, root) {
  const breaks = [...document.querySelectorAll(`hr[${BREAK}]`)].filter((hr) => !hr.closest('table'));
  let prev = null;
  breaks.forEach((hr) => {
    if (contentBetween(document, root, prev, hr)) {
      prev = hr;
      return;
    }
    if (!prev) {
      // nothing before it: this break starts the first section
      hr.setAttribute(FIRST, 'true');
      prev = hr;
      return;
    }
    // prev and hr enclose nothing: keep prev, with the styles of both
    [MARKER, SOURCE_STYLE].forEach((attr) => {
      if (!hr.hasAttribute(attr)) return;
      const merged = [prev.getAttribute(attr), hr.getAttribute(attr)].filter(Boolean).join(' ');
      prev.setAttribute(attr, merged);
    });
    hr.remove();
  });
}

export default function transform(hookName, element, payload) {
  const template = (payload && payload.template) || {};
  const sections = Array.isArray(template.sections) ? template.sections : [];
  const useSections = sections.length >= 2 || (sections.length === 1 && hasStyle(sections[0]));
  const document = (payload && payload.document) || element.ownerDocument || element;

  if (hookName === 'beforeTransform') {
    if (useSections) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(document, section);
        if (!el) continue;
        const styled = hasStyle(section);
        if (i === 0 && !styled) continue;
        const hr = createBreak(document);
        if (styled) hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute(FIRST, 'true');
        el.parentNode.insertBefore(hr, el);
      }
    }
    SOURCE_STYLES.forEach(([source, style]) => {
      styledRegions(document, template, source).forEach((region) => {
        const start = createBreak(document);
        start.setAttribute(SOURCE_STYLE, style);
        region.before(start);
        region.after(createBreak(document));
      });
    });
    // AEM sections (.container-content > .section): live pads each one 20px (40px from 768px)
    // above and below (.section-padding-y-regular), so the space between two of them is larger
    // than between the components of one. Every one after the first opens a section; style
    // padded when it and the one before it are padded on live (after an unpadded stage the
    // stage's own spacing already covers it) and it is not grey (the grey style has the padding)
    const padded = (s) => !!s.querySelector(':scope > div > .section-padding-y-regular');
    const grey = (s) => !!s.querySelector(':scope > .container-gray');
    const aemSections = [...document.querySelectorAll('.container-content > .section')]
      .filter((s) => (s.textContent || '').replace(/[\s\u00a0\u200b]/g, '') || s.querySelector(MEDIA));
    aemSections.forEach((s, i) => {
      if (!i) return;
      const hr = createBreak(document);
      if (padded(s) && !grey(s) && padded(aemSections[i - 1])) hr.setAttribute(SOURCE_STYLE, 'padded');
      s.before(hr);
    });
  }

  if (hookName === 'afterTransform') {
    dropEmptyBreaks(document, element);
    const styleOf = (hr) => {
      const styles = [];
      (hr.getAttribute(MARKER) || '').split(' ').filter(Boolean).forEach((id) => {
        const section = sections.find((s) => s.id === id);
        if (section && hasStyle(section)) styles.push(styleValue(section));
      });
      (hr.getAttribute(SOURCE_STYLE) || '').split(' ').filter(Boolean).forEach((style) => {
        if (!styles.some((s) => s.split(/,\s*/).includes(style))) styles.unshift(style);
      });
      return styles.join(', ');
    };
    const marked = [...document.querySelectorAll(`hr[${MARKER}], hr[${SOURCE_STYLE}]`)].filter((hr) => !hr.closest('table'));
    marked.reverse().forEach((marker) => {
      const style = styleOf(marker);
      if (style) {
        const meta = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style },
        });
        // End of the section: right before the next break in document order, else end of main.
        const next = nextBreak(document, marker);
        if (next) next.parentNode.insertBefore(meta, next);
        else element.appendChild(meta);
      }
    });
    document.querySelectorAll(`hr[${BREAK}]`).forEach((hr) => {
      if (hr.getAttribute(FIRST) === 'true') {
        hr.remove();
        return;
      }
      [MARKER, SOURCE_STYLE, BREAK].forEach((attr) => hr.removeAttribute(attr));
    });
  }
}
