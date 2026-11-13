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
 *    A grey band of column views only also gets column-band or column-view (their 3.2rem
 *    padding), flush when its AEM section has no .mb-default, spaced / before-column for the
 *    space live has below it (greyStyles).
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
 * shallower than the styled section's own marker (app-entry).
 */

const MARKER = 'data-excat-section-id';
const BREAK = 'data-excat-section-break';
const FIRST = 'data-excat-section-first';
const SOURCE_STYLE = 'data-excat-section-source-style';
// a tab panel's section: its name, the section metadata Tab (scripts/section-tabs.js)
const TAB = 'data-excat-section-tab';
// a marked tab set's number (SWISS's and Austrian's tab markers: the section metadata Tabs)
const TABS = 'data-excat-section-tabs';
// the tab markers SWISS's and Austrian's import write (swiss-import.mjs withTabMarkers)
const TAB_MARK = /^@@tab@@(\d+)@@(.*?)@@/;
const END_MARK = /^@@tabs-end@@/;
const FOLLOWING = 4; // Node.DOCUMENT_POSITION_FOLLOWING
// a tab panel that holds column views (pictures and text side by side) is a section of its own;
// text-only panels are profile-tabs' (a template block)
const TAB_PANEL = 'maui-tab-control-panel-responsive';
// what makes a tab control's panels sections of their own: column views (lufthansa.com's travel
// classes) or accordions (Brussels' /be/fr/extra-services/baggage/problems-with-your-baggage, P36)
const TAB_COLUMNS = '.twocolumn, .threecolumn, .fourcolumn, .accordion';
// ... or a sidebar or a video (lufthansa parity row 35: /de/en/passengers-using-wheelchairs' sidebars,
// /de/en/lufthansa-terminal-muenchen's video panel beside a text one), which profile-tabs does not take
const TAB_CONTENT = `${TAB_COLUMNS}, .sidebar, .videoViewer, .video`;

/** Source backgrounds that become a section style: [selector, style]. */
const SOURCE_STYLES = [['.container-gray', 'grey'], ['.image-wrapper.full-width-bg', 'full-bleed']];
const STYLE_SKIP = '.sticky-price-wrapper, .dcep-sticky-price';
// .author-details-page: only the author banner (.author-feature-image) is full-bleed, not the page;
// a tab panel: a band inside it, not the whole tab control (Austrian parity row 43)
const REGION_STOP = '.section-content, .container-content, .author-details-page, .column-view-item, [class*="col-"], .contentpage, maui-tab-control-panel-responsive, main, body';
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

/** A column view with a title of its own (default content before the block in the replica). */
function titledColumnView(el) {
  if (!ownColumnView(el) || el.firstElementChild.classList.contains('container-gray')) return false;
  return [...el.firstElementChild.children].some((d) => !d.matches('.row, .carousel')
    && d.querySelector('h1, h2, h3, h4, h5, h6') && meaningful(d));
}

// the cleanup (first transformer) has replaced the separators it keeps by comment placeholders
const SEPARATOR_NODE = (n) => n.nodeType === 8 && /^lh-separator /.test(n.nodeValue || '');

/** The first node from `node` on (siblings) that is a component with content or a kept separator. */
function firstComponent(node) {
  for (let n = node; n; n = n.nextSibling) {
    if (SEPARATOR_NODE(n) || (n.nodeType === 1 && (meaningful(n) || n.matches('.separator')))) return n;
  }
  return null;
}

/**
 * Extra styles of a grey region. Live pads a column view 3.2rem above and below
 * (.section-content .column > .column-view:only-child) inside the band:
 *  - column-band: the band is the column view itself (.column-view.container-gray): 32px, no
 *    section padding (/de/en/doctor-on-board "Doctor on Board courses");
 *  - column-view: the band is a padded AEM section (.section-padding-y-regular) whose components
 *    are column views only: the section padding + 32px (teaser bands "This may also be of
 *    interest to you", /de/en/flying-with-small-children; /de/en/economy-class image | text;
 *    onboard-delights "New: Hot meals" + Oktoberfest, two views: title 79px of ink below the band
 *    top, the last button 73px above its end);
 *  - flush: the band's AEM section has no .mb-default, so a band that ends the page touches the
 *    footer.
 * Below the band live has what follows it, the replica the section gap (48px); two cases where
 * that is the whole space below are written (templates without column markers for the second):
 *  - spaced: the band is a whole AEM section with .mb-default and the next AEM section (unpadded,
 *    not grey) starts with a headline or text: 2.4rem (onboard-delights band -> "Fresh on board"
 *    32px of ink live, 56 in the replica);
 *  - before-column: the band is a component of an AEM section whose next component is a titled
 *    column view: that view's 3.2rem padding (flight-search SIXT band -> "This might also be of
 *    interest to you" 38px of ink live, 56 in the replica). On info pages the title's
 *    "{column-start}" marker has that padding already.
 */
function greyStyles(region, template) {
  const grey = region.matches('.container-gray') ? region : region.querySelector('.container-gray');
  const styles = [];
  if (!grey) return styles;
  if (grey.classList.contains('column-view')) {
    const column = grey.parentElement;
    if (ownColumnView(column) && column.parentElement && column.parentElement.classList.contains('section-content')) styles.push('column-band');
    // in-column: the grey column view is nested in another view's item (Austrian's
    // doctor-on-board-news: the contact box and the card band); themes give it the band padding
    else if (ownColumnView(column) && column.parentElement && column.parentElement.matches('.column-view-item, [class*="col-"]')) styles.push('in-column');
  } else {
    const content = grey.querySelector('.section-content');
    const parts = content ? [...content.children].filter(meaningful) : [];
    if (parts.length && parts.every(ownColumnView)) {
      styles.push(content.classList.contains('section-padding-y-regular') ? 'column-view' : 'column-band');
    }
  }
  const aem = region.closest('.container-content > .section');
  if (aem && !aem.querySelector(':scope > .mb-default')) styles.push('flush');
  const whole = !!aem && (region === aem || grey.parentElement === aem);
  if (whole && aem.querySelector(':scope > .mb-default')) {
    let next = aem.nextElementSibling;
    while (next && !meaningful(next)) next = next.nextElementSibling;
    const inner = next && next.matches('.section') ? next.firstElementChild : null;
    const content = inner && inner.querySelector(':scope > .section-content');
    const first = content && firstComponent(content.firstChild);
    if (first && first.nodeType === 1 && !inner.matches('.container-gray')
      && !content.classList.contains('section-padding-y-regular')
      && first.matches('.headline, .text') && !first.querySelector('.container-gray')) styles.push('spaced');
  } else if (!whole && region.parentElement && region.parentElement.matches('.section-content')
    && template.name !== 'info') {
    const next = firstComponent(region.nextSibling);
    if (next && next.nodeType === 1 && titledColumnView(next)) styles.push('before-column');
  }
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

/** Whether separator paragraphs ("{spacer-70}") lie between two breaks. */
function spacersBetween(document, from, to) {
  const range = document.createRange();
  range.setStartAfter(from);
  range.setEndBefore(to);
  return [...range.cloneContents().querySelectorAll('p')].some((p) => /^\{(?:spacer|divider)-\d/.test(p.textContent.trim()));
}

const isGrey = (hr) => !!hr && (hr.getAttribute(SOURCE_STYLE) || '').split(' ').includes('grey');

/**
 * Removes breaks that would open an empty section; the kept break inherits their styles. Only
 * separators between two grey bands (www: the doctor-on-board-news contact box, a 70 px
 * separator, the card band) stay a section of their own, style gap, so their space is white.
 */
function dropEmptyBreaks(document, root) {
  const breaks = [...document.querySelectorAll(`hr[${BREAK}]`)].filter((hr) => !hr.closest('table'));
  let prev = null;
  let before = null; // the break that opened the section prev ends
  breaks.forEach((hr) => {
    if (contentBetween(document, root, prev, hr)) {
      before = prev;
      prev = hr;
      return;
    }
    if (prev && isGrey(before) && isGrey(hr) && !prev.hasAttribute(SOURCE_STYLE) && !prev.hasAttribute(MARKER)
      && spacersBetween(document, prev, hr)) {
      prev.setAttribute(SOURCE_STYLE, 'gap');
      before = prev;
      prev = hr;
      return;
    }
    if (!prev) {
      // nothing before it: this break starts the first section
      hr.setAttribute(FIRST, 'true');
      prev = hr;
      return;
    }
    // prev and hr enclose nothing: keep prev, with the styles of both (and the tab of the later)
    [MARKER, SOURCE_STYLE].forEach((attr) => {
      if (!hr.hasAttribute(attr)) return;
      const merged = [prev.getAttribute(attr), hr.getAttribute(attr)].filter(Boolean).join(' ');
      prev.setAttribute(attr, merged);
    });
    if (hr.hasAttribute(TAB)) prev.setAttribute(TAB, hr.getAttribute(TAB));
    if (hr.hasAttribute(TABS)) prev.setAttribute(TABS, hr.getAttribute(TABS));
    hr.remove();
  });
}

/**
 * A break inside a tab panel (a grey band's, before it and after it: Austrian's missing-baggage,
 * parity row 43) carries the panel's Tab, else its section showed under every tab: lh-com's own
 * panels (a Tab break before the panel), and the panels SWISS's and Austrian's import mark with
 * paragraphs (@@tab@@<set>@@<label>@@ ... @@tabs-end@@, split by splitTabSections after the
 * import), there with the set as Tabs. A break that has a Tab keeps it.
 */
function markPanelBreaks(document) {
  document.querySelectorAll(TAB_PANEL).forEach((panel) => {
    const own = panel.previousElementSibling;
    if (!own || !own.matches(`hr[${TAB}]`)) return;
    panel.querySelectorAll(`hr[${BREAK}]`).forEach((hr) => {
      if (!hr.hasAttribute(TAB)) hr.setAttribute(TAB, own.getAttribute(TAB));
    });
  });
  let set = null;
  document.querySelectorAll(`hr[${BREAK}], p`).forEach((node) => {
    if (node.tagName === 'P') {
      const line = (node.textContent || '').trim();
      const m = line.match(TAB_MARK);
      if (!m && !END_MARK.test(line)) return;
      // a panel that holds a break ends at the next marker: its last section's rows go right
      // before it (else at the next break after the set, which splitTabSections gives to what
      // follows the set)
      if (set && set.broken) (node.closest('.text') || node).before(createBreak(document));
      set = m ? { tabs: m[1], tab: m[2].trim() } : null;
      return;
    }
    if (!set) return;
    set.broken = true;
    if (node.hasAttribute(TAB)) return;
    node.setAttribute(TAB, set.tab);
    node.setAttribute(TABS, set.tabs);
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
        start.setAttribute(SOURCE_STYLE, [style, ...(style === 'grey' ? greyStyles(region, template) : [])].join(' '));
        region.before(start);
        region.after(createBreak(document));
      });
    });
    // AEM sections (.container-content > .section): live pads most of them 20px (40px from
    // 768px) above and below (.section-padding-y-regular), so the space between two of them is
    // larger than between the components of one. Such a section after another one opens a
    // section with style padded (not after an unpadded stage or grey band, whose own spacing
    // covers it; not when grey, the grey style has the padding). Unpadded AEM sections (section-regular
    // only, /additional-services) are spaced like components on live and stay together.
    const padded = (s) => !!s.querySelector(':scope > div > .section-padding-y-regular');
    const grey = (s) => !!s.querySelector(':scope > .container-gray');
    const aemSections = [...document.querySelectorAll('.container-content > .section')]
      .filter((s) => (s.textContent || '').replace(/[\s\u00a0\u200b]/g, '') || s.querySelector(MEDIA));
    // Two of them in a row: live has only the earlier one's .mb-default (2.4rem) between their
    // paddings, or nothing, not our section gap: the earlier one (a padded section of its own,
    // in one piece) gets style spaced (a 24 px gap) or flush (none); first-class-terminal +48 px
    const paddedBreaks = new Map();
    // the brief after 479 (ANA FAQ, ema-lufthansa's row 42): also right after an unpadded AEM
    // section, as www pads every one with .section-padding-y-regular (a stage too, unless a padded
    // AEM section follows it: the brief after 523); not after a stage or a grey band (their own
    // spacing covers it), nor after an author quote alone in its AEM
    // section (the cleanup's quote spacers stand for this padding: first-class-terminal)
    // (lufthansa.com's pages only: measured there; the brand sites' imports as before)
    const pageUrl = (payload && ((payload.params && payload.params.originalURL) || payload.url)) || '';
    const lufthansa = /^https?:\/\/([^/]+\.)?lufthansa\.com(\/|$)/.test(pageUrl);
    const isStage = (s) => !!s.querySelector(':scope > div > .section-content > .inspirationteaser');
    const loneQuote = (s) => {
      const content = s.querySelector(':scope > div > .section-content');
      const kids = content ? [...content.children] : [];
      const empty = (c) => !(c.textContent || '').replace(/\{spacer-[^}]*\}/g, '').trim();
      return kids.some((c) => c.matches('.authorquote')) && kids.every((c) => c.matches('.authorquote') || empty(c));
    };
    aemSections.forEach((s, i) => {
      if (!i || !padded(s) || grey(s)) return;
      const before = aemSections[i - 1];
      // a stage after an unpadded AEM section is padded on www too; not when the AEM section after it is padded
      // (style before-padded holds that space already: economy-class's Allegris stage measured worse padded)
      // (the brief after 523, ema-adobe's hub-campaign-521.md: destinations' New York and Cape Town)
      const next = aemSections[i + 1];
      const stageBeforePadded = isStage(s) && !!next && padded(next) && !grey(next);
      if (!padded(before) && (!lufthansa || stageBeforePadded || isStage(before) || grey(before) || loneQuote(before))) return;
      const hr = createBreak(document);
      hr.setAttribute(SOURCE_STYLE, 'padded');
      s.before(hr);
      paddedBreaks.set(s, hr);
      const prev = aemSections[i - 1];
      const own = paddedBreaks.get(prev);
      if (!own || prev.querySelector(`hr[${BREAK}]`)) return;
      const gap = prev.querySelector(':scope > .mb-default') ? 'spaced' : 'flush';
      own.setAttribute(SOURCE_STYLE, `${own.getAttribute(SOURCE_STYLE)} ${gap}`);
    });
    // fleet (standing order 6): an unpadded AEM section right after a padded one is not that one's content; www draws the
    // padded section's bottom padding and its .mb-default between them (/de/en/32n: "The quietest cabin" 62px higher
    // than www's, the space back under it). It starts a section of its own; the padded one keeps spaced or flush
    if (template.name === 'fleet' || template.base === 'fleet') {
      aemSections.forEach((s, i) => {
        const prev = aemSections[i - 1];
        const own = prev && paddedBreaks.get(prev);
        if (!own || padded(s) || grey(s) || isStage(s) || s.querySelector(`hr[${BREAK}]`) || prev.querySelector(`hr[${BREAK}]`)) return;
        s.before(createBreak(document));
        const gap = prev.querySelector(':scope > .mb-default') ? 'spaced' : 'flush';
        if (!/ (spaced|flush)$/.test(own.getAttribute(SOURCE_STYLE))) own.setAttribute(SOURCE_STYLE, `${own.getAttribute(SOURCE_STYLE)} ${gap}`);
      });
    }
    // info (standing order 18): an unpadded AEM section with .mb-default between two padded ones (none grey, neither a
    // stage): www draws the earlier one's bottom padding above it and only its own .mb-default (2.4rem) under it, not the
    // padding after it plus our section gap (/de/en/passengers-with-sensory-impairment "Travelling with a companion": the
    // next section 66px lower than www's). It starts a section of its own with style spaced (lufthansa.com's pages); the
    // padded one before keeps spaced or flush
    if (lufthansa && template.name === 'info') {
      aemSections.forEach((s, i) => {
        const prev = aemSections[i - 1];
        const next = aemSections[i + 1];
        // (standing order 19) a padded AEM section with .mb-default right before a grey AEM section without one: its
        // .mb-default between its padding and the band, not our section gap (sensory-impairment's assistance-dog
        // section, then "Please tell us in advance": 29px lower than www's). Before a grey section with .mb-default our
        // gap is right already (cognitive-impairment: +8px, 24px too high with the token)
        if (prev && grey(s) && !s.querySelector(':scope > .mb-default') && padded(prev) && !grey(prev) && !isStage(prev) && prev.querySelector(':scope > .mb-default')) {
          const own = paddedBreaks.get(prev);
          if (own && !/ (spaced|flush)$/.test(own.getAttribute(SOURCE_STYLE))) own.setAttribute(SOURCE_STYLE, `${own.getAttribute(SOURCE_STYLE)} spaced`);
          return;
        }
        // (not an author quote alone in its AEM section: the cleanup's quote spacers stand for that spacing,
        // first-class-terminal 25.2 -> 27.1 % off www with the split)
        if (!prev || !next || padded(s) || grey(s) || isStage(s) || loneQuote(s) || !s.querySelector(':scope > .mb-default')) return;
        // (not after a stage: its own spacing rules, tips-senior-travellers unmeasured)
        if (!padded(prev) || grey(prev) || isStage(prev) || !padded(next) || grey(next)) return;
        const own = paddedBreaks.get(prev);
        // (standing order 19) the padded one right after the stage has no break of this loop: the stage rules below
        // give it one and its gap (sensory-impairment's "Invisible – but real", then "Assistance on your trip")
        const stageNeighbour = !own && i >= 2 && isStage(aemSections[i - 2]);
        if ((!own && !stageNeighbour) || s.querySelector(`hr[${BREAK}]`) || prev.querySelector(`hr[${BREAK}]`)) return;
        const hr = createBreak(document);
        hr.setAttribute(SOURCE_STYLE, 'spaced');
        s.before(hr);
        if (!own) return;
        const gap = prev.querySelector(':scope > .mb-default') ? 'spaced' : 'flush';
        if (!/ (spaced|flush)$/.test(own.getAttribute(SOURCE_STYLE))) own.setAttribute(SOURCE_STYLE, `${own.getAttribute(SOURCE_STYLE)} ${gap}`);
      });
    }
    // the page title in a padded first AEM section (info: /book-and-manage/pax-receipt, whose
    // passenger receipt form is an app widget that is not imported): style padded there too, the
    // title 2rem / 4rem lower as on live (styles.css keeps the breadcrumb at the top)
    const first = aemSections[0];
    if ((template.name === 'info' || template.base === 'info') && first && padded(first) && !grey(first) && first.querySelector('h1')
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
    // lufthansa.com info and fleet pages (standing order 7): a padded AEM section right after a stage, then an unpadded
    // one. The stage's before-padded holds the padded section's top padding, but its bottom padding and .mb-default
    // went missing, since the unpadded AEM section stayed in its section (premium-economy-class: "Your personal space"
    // 40 px higher than www's). The padded one becomes style padded spaced, the stage loses before-padded (the padding
    // above is the padded section's own now), and the unpadded one starts a section of its own.
    if (lufthansa && (['fleet', 'info'].includes(template.name) || ['fleet', 'info'].includes(template.base))) {
      aemSections.forEach((s, i) => {
        const next = aemSections[i + 1];
        const after = aemSections[i + 2];
        // only a padded section with .mb-default (spaced): without it the measured pages read better as before
        // (first-class-terminal +6.7 at 1440)
        if (!stage(s) || !next || !after || !padded(next) || grey(next) || stage(next) || padded(after) || grey(after) || stage(after)) return;
        if (!next.querySelector(':scope > .mb-default')) return;
        const hr = next.previousElementSibling;
        if (!hr || !hr.hasAttribute(BREAK) || hr.getAttribute(SOURCE_STYLE)) return;
        hr.setAttribute(SOURCE_STYLE, 'padded spaced');
        // its top padding is its own now: the stage keeps only its own gap (before-padded off, the same space above)
        const own = s.previousElementSibling;
        if (own && own.hasAttribute(BREAK)) own.setAttribute(SOURCE_STYLE, own.getAttribute(SOURCE_STYLE).split(' ').filter((x) => x !== 'before-padded').join(' '));
        if (!(after.previousElementSibling && after.previousElementSibling.hasAttribute(BREAK)) && !after.querySelector(`hr[${BREAK}]`)) after.before(createBreak(document));
      });
    }
    // tabs whose panels hold column views (www's maui-tab-control-responsive, e.g. a panel per
    // travel class on /advance-seat-reservation), accordions, a sidebar or a video: a section per
    // panel, Tab its name, and a break after the control; scripts/section-tabs.js makes the tab
    // list. Not a control a template block takes (profile-tabs) nor one of text only.
    const blockSelectors = (template.blocks || []).flatMap((b) => b.instances || []);
    const taken = (el) => blockSelectors.some((sel) => {
      try {
        return !!el.closest(sel);
      } catch (e) {
        return false;
      }
    });
    document.querySelectorAll('maui-tab-control-responsive').forEach((control) => {
      const panels = [...control.querySelectorAll(TAB_PANEL)].filter((p) => p.closest('maui-tab-control-responsive') === control);
      // Brussels: a panel with a table too (/extra-services/baggage/checked-baggage's Europe /
      // Intercontinental: profile-tabs takes no tables, so they stacked; the standing order after 570)
      const tabUrl = (payload && ((payload.params && payload.params.originalURL) || payload.url)) || '';
      const content = /^https?:\/\/www\.brusselsairlines\.com\//.test(tabUrl) ? `${TAB_CONTENT}, .table` : TAB_CONTENT;
      if (!panels.length || taken(control) || !panels.some((p) => p.querySelector(content))) return;
      panels.forEach((panel, i) => {
        const hr = createBreak(document);
        hr.setAttribute(TAB, (panel.getAttribute('name') || '').trim() || `Tab ${i + 1}`);
        panel.before(hr);
      });
      control.after(createBreak(document));
    });
    markPanelBreaks(document);
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
    const marked = [...document.querySelectorAll(`hr[${MARKER}], hr[${SOURCE_STYLE}], hr[${TAB}]`)].filter((hr) => !hr.closest('table'));
    marked.reverse().forEach((marker) => {
      const style = styleOf(marker);
      const tab = marker.getAttribute(TAB);
      const tabs = marker.getAttribute(TABS);
      if (style || tab) {
        const meta = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { ...(style ? { style } : {}), ...(tab ? { Tab: tab } : {}), ...(tab && tabs ? { Tabs: tabs } : {}) },
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
      [MARKER, SOURCE_STYLE, TAB, TABS, BREAK].forEach((attr) => hr.removeAttribute(attr));
    });
  }
}
