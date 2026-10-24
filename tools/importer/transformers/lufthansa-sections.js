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
 *    A grey band that is one column view also gets column-band or column-view (its 3.2rem
 *    padding), and flush when its AEM section has no .mb-default (greyStyles).
 *  - full-bleed: a full-width image component (.image-wrapper.full-width-bg, the Lufthansa
 *    Insights category stage) is a section of its own with style full-bleed, the same way.
 *  - padded: an AEM section (.container-content > .section) that is padded on live
 *    (.section-padding-y-regular), not grey, right after another padded one starts a section
 *    with style padded; info: also a padded first AEM section that holds the page title.
 *  - stage: an AEM section holding a stage (.inspirationteaser) is a section of its own with
 *    style stage (+ flush without .mb-default, + before-padded before a padded AEM section).
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
// .author-details-page: only the author banner (.author-feature-image) is full-bleed, not the page
const REGION_STOP = '.section-content, .container-content, .author-details-page, .column-view-item, [class*="col-"], .contentpage, main, body';
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

/** A Lufthansa column view of its own (.column > .column-view:only-child). */
function ownColumnView(el) {
  return !!el && el.classList.contains('column') && el.children.length === 1
    && el.firstElementChild.classList.contains('column-view');
}

function meaningful(el) {
  return !!((el.textContent || '').replace(/[\s\u00a0\u200b]/g, '') || el.querySelector(MEDIA));
}

/**
 * Extra styles of a grey region. Live pads a column view 3.2rem above and below
 * (.section-content .column > .column-view:only-child) inside the band:
 *  - column-band: the band is the column view itself (.column-view.container-gray): 32px, no
 *    section padding (/de/en/doctor-on-board "Doctor on Board courses");
 *  - column-view: the band is a padded AEM section (.section-padding-y-regular) whose only
 *    component is one column view: the section padding + 32px (teaser bands "This may also be of
 *    interest to you", /de/en/flying-with-small-children; /de/en/economy-class image | text);
 *  - flush: the band's AEM section has no .mb-default, so a band that ends the page touches the
 *    footer.
 */
function greyStyles(region) {
  const grey = region.matches('.container-gray') ? region : region.querySelector('.container-gray');
  const styles = [];
  if (!grey) return styles;
  if (grey.classList.contains('column-view')) {
    const column = grey.parentElement;
    if (ownColumnView(column) && column.parentElement && column.parentElement.classList.contains('section-content')) styles.push('column-band');
  } else {
    const content = grey.querySelector('.section-content');
    const parts = content ? [...content.children].filter(meaningful) : [];
    if (parts.length === 1 && ownColumnView(parts[0])) {
      styles.push(content.classList.contains('section-padding-y-regular') ? 'column-view' : 'column-band');
    }
  }
  const aem = region.closest('.container-content > .section');
  if (aem && !aem.querySelector(':scope > .mb-default')) styles.push('flush');
  return styles;
}

/** "{spacer-40}" paragraphs (lufthansa-cleanup separators) and the column-view markers of a
 * paragraph of their own ("{column-end}") do not make a section of their own. */
const SPACER = /^\{(?:(spacer|divider)-\d{1,3}( from-768)?|column-(?:start|end)(?:-outer)?)\}$/;

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
        start.setAttribute(SOURCE_STYLE, [style, ...(style === 'grey' ? greyStyles(region) : [])].join(' '));
        region.before(start);
        region.after(createBreak(document));
      });
    });
    // AEM sections (.container-content > .section): live pads most of them 20px (40px from
    // 768px) above and below (.section-padding-y-regular), so the space between two of them is
    // larger than between the components of one. Such a section after another padded one opens
    // a section with style padded (not after an unpadded stage, whose own spacing covers it;
    // not when grey, the grey style has the padding). Unpadded AEM sections (section-regular
    // only, /additional-services) are spaced like components on live and stay together.
    const padded = (s) => !!s.querySelector(':scope > div > .section-padding-y-regular');
    const grey = (s) => !!s.querySelector(':scope > .container-gray');
    const aemSections = [...document.querySelectorAll('.container-content > .section')]
      .filter((s) => (s.textContent || '').replace(/[\s\u00a0\u200b]/g, '') || s.querySelector(MEDIA));
    aemSections.forEach((s, i) => {
      if (!i || !padded(s) || grey(s) || !padded(aemSections[i - 1])) return;
      const hr = createBreak(document);
      hr.setAttribute(SOURCE_STYLE, 'padded');
      s.before(hr);
    });
    // the page title in a padded first AEM section (info: /book-and-manage/pax-receipt, whose
    // passenger receipt form is an app widget that is not imported): style padded there too, the
    // title 2rem / 4rem lower as on live (styles.css keeps the breadcrumb at the top)
    const first = aemSections[0];
    if (template.name === 'info' && first && padded(first) && !grey(first) && first.querySelector('h1')
      && !first.querySelector('.inspirationteaser, .stage')) {
      const hr = createBreak(document);
      hr.setAttribute(SOURCE_STYLE, 'padded');
      first.before(hr);
    }
    // a stage (.inspirationteaser) is an AEM section of its own, style stage: the space under
    // it is what live adds up (hero-campaign.css): .mb-default (24px; style flush when the
    // wrapper has none), separators in the stage section ({spacer-N} right after the hero) and,
    // style before-padded, the top padding of the next AEM section when that one is padded
    // (.section-padding-y-regular) and not grey. A break after it, so the next AEM section
    // never shares the stage's section.
    const stage = (s) => !!s.querySelector(':scope > div > .section-content > .inspirationteaser');
    aemSections.forEach((s, i) => {
      if (!stage(s)) return;
      const next = aemSections[i + 1];
      const styles = ['stage'];
      if (!s.querySelector(':scope > .mb-default')) styles.push('flush');
      if (next && padded(next) && !grey(next)) styles.push('before-padded');
      const start = createBreak(document);
      start.setAttribute(SOURCE_STYLE, styles.join(' '));
      s.before(start);
      if (next) next.before(createBreak(document));
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
