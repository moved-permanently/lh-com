/* eslint-disable */
/* global WebImporter */

/**
 * Parser for poi-map: the live points-of-interest map (`.poimapping > .dcep-poi-mapping`,
 * blocks/poi-map README "Import"): 13 maps per market on 12 pages (100-years/destinations, the
 * three stopover partner pages, first-class (two tabs), the explore-the-world overview and seven
 * explore-the-world articles).
 *
 * Everything rendered inside `.dcep-poi-mapping` is dropped (Google's map as text: "Zoom inZoom
 * out", the keyboard shortcut table, "Kurzbefehle", "Kartendaten ©2026 Google", the tile images
 * with the API key, "Loading..."). The block is written from the data-dcep id:
 *   Source | {atob(id)}   the component's JCR path; the block re-encodes it (= the live id)
 * No point rows: the titles exist only in the pointsOfInterest answer (recorded, or live).
 *
 * Element forms (template instances):
 *  - a `.twocolumn` whose column holds the map (explore-the-world articles): the whole two-column
 *    component becomes the block, `Caption | {the rest of the map's column}` and
 *    `Aside | {the other column}` (no Columns block for it).
 *  - a `.poimapping` anywhere else: the block in the flow; inside a `.sidebar` (stopover pages,
 *    whose sidebar is a columns-media block) the block goes right after the sidebar, as blocks
 *    cannot nest.
 */
function decodeId(id) {
  const raw = String(id || '').trim();
  if (!raw) return '';
  try {
    const s = typeof atob === 'function' ? atob(decodeURIComponent(raw)) : Buffer.from(decodeURIComponent(raw), 'base64').toString('utf8');
    return /^\/content\//.test(s) ? s : raw;
  } catch (e) {
    return raw;
  }
}

function idOf(poimapping) {
  const host = poimapping.matches('.dcep-poi-mapping') ? poimapping : poimapping.querySelector('.dcep-poi-mapping');
  if (!host) return '';
  try {
    const cfg = JSON.parse(host.getAttribute('data-dcep') || '{}') || {};
    return decodeId(cfg.id);
  } catch (e) {
    return '';
  }
}

/** Child nodes worth keeping (elements with text or media, non-blank text). */
function contentOf(container, skip) {
  return [...container.childNodes].filter((n) => {
    if (skip && (n === skip || (n.nodeType === 1 && n.contains(skip)))) return false;
    if (n.nodeType === 3) return n.textContent.trim();
    if (n.nodeType !== 1) return false;
    return n.textContent.replace(/[\s\u00A0\u200B]/g, '') || n.querySelector('img, picture, a[href], maui-navigation-link, maui-link');
  });
}

export default function parse(element, { document }) {
  const isTwoColumn = element.matches('.twocolumn');
  const poimapping = element.matches('.poimapping') ? element : element.querySelector('.poimapping');
  if (!poimapping) return;
  const source = idOf(poimapping);
  const cells = [];
  if (source) cells.push(['Source', source]);

  if (isTwoColumn) {
    const columns = [...element.querySelectorAll('.column-view-item')].filter((c) => !c.parentElement.closest('.column-view-item'));
    const mapCol = columns.find((c) => c.contains(poimapping));
    const other = columns.filter((c) => c !== mapCol);
    if (mapCol) {
      // the map's column may hold the map inside a wrapper: keep everything but that wrapper
      let wrapper = poimapping;
      while (wrapper.parentElement && wrapper.parentElement !== mapCol) wrapper = wrapper.parentElement;
      const caption = contentOf(mapCol, wrapper);
      if (caption.length) cells.push(['Caption', caption]);
    }
    const aside = other.flatMap((c) => contentOf(c));
    if (aside.length) cells.push(['Aside', aside]);
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'poi-map', cells }));
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'poi-map', cells });
  const sidebar = poimapping.parentElement && poimapping.parentElement.closest('.sidebar');
  if (sidebar) {
    poimapping.remove();
    sidebar.after(block);
    return;
  }
  poimapping.replaceWith(block);
}
