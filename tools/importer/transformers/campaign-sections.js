/* eslint-disable */
/* global WebImporter */

/**
 * Campaign pages (page-templates.json campaign, "transformers": ["campaign-sections"]): every AEM
 * section of the source (.container-content > .section) is a section of ours, so the space live
 * has between two of them is the same on ours (brief 484, 100-years/campaigns and the other
 * campaign pages at 20-33 %). Live pads an AEM section 2rem (4rem from 768px) above and below
 * when it has .section-padding-y-regular and adds 2.4rem under it when its wrapper has
 * .mb-default; lufthansa-sections keeps unpadded AEM sections with the one before them, which
 * loses the padding of the padded one next to them (an author quote between two padded column
 * views: 128 px on ours, 152 on live).
 *
 * beforeTransform, after lufthansa-sections (whose breaks at the same places merge with these,
 * styles of both): a break before every AEM section with content (the first only when it is
 * unpadded and not alone; it then needs no break, its styles go on the page's first section), style
 * campaign-section, + padded (.section-padding-y-regular), + spaced (.mb-default) or flush (none).
 * Not before a stage (.inspirationteaser: lufthansa-sections' style stage) nor a grey one (style
 * grey has the padding and the gap). styles.css: campaign-section has no section gap of its own.
 * With these, two stand-ins go: the template's own section breaks inside an AEM section
 * (unstyled, page-templates.json sections: "twocolumn + twocolumn" split one AEM section in two,
 * with our section gap between) and the cleanup's spacers for a padded neighbour's padding
 * around a quote alone in its AEM section and after a one-slide carousel (lufthansa-cleanup
 * QUOTE_SPACERS, padCarouselSections): that padding is now the neighbour's own.
 * onLoad: an empty paragraph with a line break that ends a text component of such a section (<p><br></p>, the intro of
 * 100-years/campaigns: its line and the paragraph margin, 51px at 1440 and 390) becomes
 * "{spacer-50}" (50 + 1 px), and each empty separator among its components (sectionSeparators) a
 * text component with "{spacer-N}" (lufthansa-cleanup would drop those under 50px).
 */

const BREAK = 'data-excat-section-break';
const SOURCE_STYLE = 'data-excat-section-source-style';
const MEDIA = 'img, picture, video, iframe, svg, table, input, select, textarea, button';
// lufthansa-cleanup's stand-ins for a padded neighbour: [element, tokens before it, tokens after it]
const STAND_INS = [['blockquote.authorquote', ['spacer-0', 'spacer-14 from-768'], ['spacer-53', 'spacer-17 from-768']],
  ['.carousel', [], ['spacer-43', 'spacer-17 from-768']]];

function firstMatch(document, selectors) {
  for (const sel of [].concat(selectors || [])) {
    if (!sel) continue;
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // unsupported selector in this environment
    }
  }
  return null;
}

/** The spacer paragraphs `tokens` right before (dir previousElementSibling) or after `el`. */
function standIns(el, tokens, dir) {
  const found = [];
  let n = el[dir];
  const want = dir === 'previousElementSibling' ? [...tokens].reverse() : tokens;
  for (const t of want) {
    if (!n || n.tagName !== 'P' || (n.textContent || '').trim() !== `{${t}}`) return [];
    found.push(n);
    n = n[dir];
  }
  return found;
}

const padded = (s) => !!s.querySelector(':scope > div > .section-padding-y-regular');
const grey = (s) => !!s.querySelector(':scope > .container-gray');
const stage = (s) => !!s.querySelector(':scope > div > .section-content > .inspirationteaser');
const isAem = (el) => el.matches('.container-content > .section');

/**
 * The AEM sections that become a campaign-section: with content, not a stage or grey; the first
 * one only when it is unpadded and more follow (discover-lufthansa/new-onboard-experience's intro
 * text: no gap on www before the next section, ours had the 48px section gap).
 */
function campaignSections(document) {
  const all = [...document.querySelectorAll('.container-content > .section')]
    .filter((s) => (s.textContent || '').replace(/[\s\u00a0\u200b]/g, '') || s.querySelector(MEDIA));
  return all.filter((s, i) => !stage(s) && !grey(s) && (i || (all.length > 1 && !padded(s))));
}

/**
 * A text component of one spacer paragraph ("{spacer-N}"), limited-width so that the cleanup's
 * width marker ("{full-width}") does not follow the spacer's.
 */
function spacerComponent(document, n) {
  const text = document.createElement('div');
  text.className = 'text section';
  text.innerHTML = `<div class="richtext limited-width"><p>{spacer-${n}}</p></div>`;
  return text;
}

/**
 * The empty separators (.separator > .hr.hr-no-layout, no line) among an AEM section's components:
 * lufthansa-cleanup drops those under 50px (the section gap and the wrapper gaps stood for them);
 * live keeps maui-divider's 1px and the .hr's margin (2.5rem unless inline) at the section's start,
 * between components and at its end (crane: 26px over "New beginnings and new designs"; cabin-design:
 * 41px under the last column view of five sections). .hidden-sm-down ones only from 768px.
 */
function sectionSeparators(s) {
  const content = s.querySelector(':scope > div > .section-content');
  return [...(content ? content.children : [])].filter((c) => {
    if (!c.matches('.separator')) return false;
    const hr = c.querySelector('.hr');
    return !!hr && hr.classList.contains('hr-no-layout');
  });
}

/*
 * A spacer or divider paragraph with a marker after its own ("{spacer-50} {limited-width}",
 * brief 496): the cleanup's paragraph styles (afterTransform, before this one) read "{spacer-50}"
 * as no marker (digits) and append the width of the text component it stands in; scripts.js makes
 * a paragraph a spacer or divider only when its marker stands alone, so the pair showed as text.
 * The paragraph keeps its own marker (its words too: {spacer-17 from-768}); a paragraph with
 * markup or other text is left as it is.
 */
const NOT_ALONE = /^\s*(\{(?:spacer|divider)-[^{}]*\})(?:\s*\{[a-z0-9 -]+\})+\s*$/;

function aloneMarkers(document) {
  let fixed = 0;
  document.querySelectorAll('p').forEach((p) => {
    if (p.children.length) return;
    const m = NOT_ALONE.exec(p.textContent || '');
    if (!m) return;
    p.textContent = m[1];
    fixed += 1;
  });
  return fixed;
}

export default function transform(hookName, element, payload) {
  const document = (payload && payload.document) || element.ownerDocument || element;
  if (hookName === 'onLoad') {
    // before helix-importer's preprocessing drops empty paragraphs
    campaignSections(document).forEach((s) => {
      s.querySelectorAll('.text > .richtext > p:last-child').forEach((p) => {
        // only a line break draws a line on www (<p><br></p>); an empty <p></p> draws nothing (brief 555)
        if ((p.textContent || '').replace(/[\s\u00a0\u200b]/g, '') || p.querySelector(MEDIA) || !p.previousElementSibling || !p.querySelector('br')) return;
        p.closest('.text').after(spacerComponent(document, 50));
        p.remove();
      });
      sectionSeparators(s).forEach((sep) => {
        const hr = sep.querySelector('.hr');
        const m = (hr.getAttribute('style') || '').match(/margin-bottom:\s*([\d.]+)px\s*(?:;|!|$)/i);
        const n = m ? Math.max(0, Math.round(parseFloat(m[1]))) : 25;
        sep.replaceWith(spacerComponent(document, hr.classList.contains('hidden-sm-down') ? `${n} from-768` : n));
      });
    });
    return;
  }
  if (hookName === 'afterTransform') {
    aloneMarkers(document);
    return;
  }
  if (hookName !== 'beforeTransform') return;
  // the template's unstyled breaks inside an AEM section: its selectors read the source without
  // the breaks lufthansa-sections inserted ("twocolumn + twocolumn" no longer matches with one)
  const template = (payload && payload.template) || {};
  const breaks = [...document.querySelectorAll(`hr[${BREAK}]`)].map((hr) => [hr, hr.parentNode, hr.nextSibling]);
  breaks.forEach(([hr]) => hr.remove());
  const targets = (template.sections || []).map((section, i) => (!i || section.style ? null : firstMatch(document, section.selector)));
  breaks.reverse().forEach(([hr, parent, next]) => parent.insertBefore(hr, next));
  targets.forEach((el) => {
    const hr = el && el.previousElementSibling;
    if (!hr || isAem(el) || !hr.matches(`hr[${BREAK}]`) || hr.attributes.length !== 1) return;
    hr.remove();
  });
  campaignSections(document).forEach((s) => {
    const styles = ['campaign-section'];
    if (padded(s)) styles.push('padded');
    styles.push(s.querySelector(':scope > .mb-default') ? 'spaced' : 'flush');
    const hr = document.createElement('hr');
    hr.setAttribute(BREAK, '');
    hr.setAttribute(SOURCE_STYLE, styles.join(' '));
    s.before(hr);
  });
  STAND_INS.forEach(([sel, before, after]) => {
    document.querySelectorAll(`.container-content > .section ${sel}`).forEach((el) => {
      [...standIns(el, before, 'previousElementSibling'), ...standIns(el, after, 'nextElementSibling')].forEach((p) => p.remove());
    });
  });
}
