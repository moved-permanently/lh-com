/* eslint-disable */
/* global WebImporter */

/**
 * Section breaks for www.lufthansa.com pages, driven by payload.template.sections
 * (tools/importer/page-templates.json). Generic: templates without sections are a no-op.
 *
 * beforeTransform: walks sections in reverse and inserts <hr> before every non-first section
 *   while the source elements still exist (parsers may replace them later). Styled sections
 *   get a marked <hr data-excat-section-id>; a styled first section gets a temporary one.
 * afterTransform: walks sections in reverse, inserts a Section Metadata block (style) at the end
 *   of each styled section, removes the marker attribute, and removes the first section's
 *   temporary <hr>.
 *
 * Every inserted <hr> carries BREAK. The end of a section is the next section break in document
 * order (compareDocumentPosition), not the next sibling: later breaks are often nested deeper or
 * shallower than the styled section's own marker (app-entry, AirCore hero vs. #content).
 */

const MARKER = 'data-excat-section-id';
const BREAK = 'data-excat-section-break';
const FOLLOWING = 4; // Node.DOCUMENT_POSITION_FOLLOWING

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

export default function transform(hookName, element, payload) {
  const template = (payload && payload.template) || {};
  const sections = Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2 && !(sections.length === 1 && hasStyle(sections[0]))) return;
  const document = (payload && payload.document) || element.ownerDocument || element;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(document, section);
      if (!el) continue;
      const styled = hasStyle(section);
      if (i === 0 && !styled) continue;
      const hr = document.createElement('hr');
      hr.setAttribute(BREAK, '');
      if (styled) hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute('data-excat-section-first', 'true');
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const marker = document.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (!marker) continue;
      if (hasStyle(section)) {
        const meta = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: styleValue(section) },
        });
        // End of the section: right before the next break in document order, else end of main.
        const next = nextBreak(document, marker);
        if (next) next.parentNode.insertBefore(meta, next);
        else element.appendChild(meta);
      }
      if (marker.getAttribute('data-excat-section-first') === 'true') {
        marker.remove();
      } else {
        marker.removeAttribute(MARKER);
      }
    }
    document.querySelectorAll(`hr[${BREAK}]`).forEach((hr) => hr.removeAttribute(BREAK));
  }
}
