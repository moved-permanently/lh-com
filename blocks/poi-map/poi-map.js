import { getLocale, LIVE_ORIGIN } from '../../scripts/locale.js';
import {
  pick, resolveLabels, toConfigKey, cleanText,
} from '../../scripts/block-config.js';
import {
  poiMapId, pointsOfInterestRequest, mapPointsOfInterest, fetchRequest, fetchLabels, pickLabels,
} from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';

/* ---------------------------------------------------------------------------------------------
 * The live POI map (.poimapping > .dcep-poi-mapping, PointsOfInterest of 1ad93a8d.chunk.js, map
 * view 5e1bfdb4.chunk.js) loads its points from GET /service/api/pointsOfInterest/{data-dcep id}
 * and draws them on a styled Google map (500px high, own zoom buttons bottom right, location
 * pins, a bubble with the title and an optional "Visit website" link on hover or focus,
 * fitBounds over all points). Lufthansa's Maps key only works on lufthansa.com, so this block
 * draws a small tile map of its own (no library, no key): OpenStreetMap raster tiles, or CARTO's
 * light OpenStreetMap tiles with "Tiles | carto", with the required attribution.
 * Points: authored rows (Title | Lat, Lng | Link) if any, else the live answer (direct call
 * with the market's X-Portal-* headers, the recordings as fallback). No points: no block.
 * ------------------------------------------------------------------------------------------- */

const TILE = 256;
const MIN_ZOOM = 2;
/** Space kept around the points by the first view (the pins rise 32px above their point). */
const FIT_PADDING = {
  top: 48, right: 24, bottom: 24, left: 24,
};
const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 500;

export const TILE_SOURCES = {
  osm: {
    url: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
    maxZoom: 19,
    attribution: [['OpenStreetMap', 'https://www.openstreetmap.org/copyright']],
  },
  carto: {
    url: (z, x, y) => `https://basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`,
    maxZoom: 20,
    attribution: [['OpenStreetMap', 'https://www.openstreetmap.org/copyright'], ['CARTO', 'https://carto.com/attributions']],
  },
};

const DEFAULT_LABELS = {
  en: {
    'zoom in label': 'Zoom in',
    'zoom out label': 'Zoom out',
    'visit website label': 'Visit website',
    'map label': 'Map',
    'attribution label': 'contributors',
  },
  de: {
    'zoom in label': 'Zoom in',
    'zoom out label': 'Zoom out',
    'visit website label': 'Website besuchen',
    'map label': 'Karte',
    'attribution label': 'Mitwirkende',
  },
};

/** Live label keys (labels/common) of the strings above. */
const LIVE_LABEL_KEYS = {
  'zoom in label': 'common.sr.mapview.zoomIn',
  'zoom out label': 'common.sr.mapview.zoomOut',
  'visit website label': 'common.misc.cms.visitWebsite',
};

const COORDINATES = /^\s*(-?\d+(?:\.\d+)?)\s*[,;/ ]\s*(-?\d+(?:\.\d+)?)\s*$/;

let instanceCount = 0;

/**
 * Splits the authored rows into settings (label | value) and points (Title | Lat, Lng | Link).
 * @param {Element} block
 * @returns {{config: Object, points: Array}}
 */
export function readPoiMapRows(block) {
  const config = {};
  const points = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const coords = cleanText(cells[1]).match(COORDINATES);
    if (coords) {
      const linkCell = cells[2];
      const a = linkCell && linkCell.querySelector('a[href]');
      const link = (a && a.getAttribute('href')) || (linkCell ? cleanText(linkCell) : '');
      points.push({
        title: cleanText(cells[0]),
        lat: Number(coords[1]),
        lng: Number(coords[2]),
        link: /^(https?:\/\/|\/)/.test(link) ? link : '',
        linkLabel: a && cleanText(a) !== link ? cleanText(a) : '',
        linkExternal: false,
      });
      return;
    }
    const key = toConfigKey(cleanText(cells[0]));
    if (key && !config[key]) {
      config[key] = {
        cell: cells[1], row, text: cleanText(cells[1]), link: cells[1].querySelector('a[href]'),
      };
    }
  });
  return { config, points: mapPointsOfInterest({ pointsOfInterest: points }) };
}

/** Settings of an authored block: the live id and the tile source. */
export function readPoiMapSettings(config) {
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';
  const tiles = text('tiles').toLowerCase();
  return {
    id: poiMapId(text('source', 'id', 'poi-id')),
    tiles: TILE_SOURCES[tiles] ? tiles : 'osm',
  };
}

/** Whether a link leaves lufthansa.com and this site (new tab, like linkExternal). */
function isForeign(href) {
  try {
    const url = new URL(href, window.location.href);
    return url.origin !== window.location.origin && url.origin !== LIVE_ORIGIN;
  } catch (e) {
    return false;
  }
}

/**
 * Points and labels of a map: the authored points, else GET pointsOfInterest/{id} (direct,
 * else the exact recording), and labels/common.
 * @returns {Promise<{points: Array, labels: Object, sources: Object<string, string>,
 *   primary: string[]}>}
 */
export async function loadPoiMap(settings, authored, locale) {
  const sources = {};
  const labelsPromise = fetchLabels(['common'], locale);
  let points = authored;
  if (authored.length) {
    sources.points = 'authored';
  } else if (settings.id) {
    try {
      const request = pointsOfInterestRequest(settings.id);
      const { data, source } = await fetchRequest(request, locale, { exact: true });
      points = mapPointsOfInterest(data);
      sources.points = source;
    } catch (e) {
      sources.points = 'none';
    }
  } else {
    sources.points = 'none';
  }
  const { labels, sources: labelSources } = await labelsPromise;
  sources['labels/common'] = labelSources.common;
  return {
    points, labels: pickLabels(labels, LIVE_LABEL_KEYS), sources, primary: ['points'],
  };
}

/* ------------------------------------------------------------------------------------------- */
/* Web Mercator                                                                                 */
/* ------------------------------------------------------------------------------------------- */

const worldSize = (z) => TILE * 2 ** z;

/** World pixel position of a point at a zoom level. */
export function project(lat, lng, z) {
  const sin = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
  const size = worldSize(z);
  return {
    x: ((lng + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  };
}

/**
 * The live fitBounds: the highest zoom at which every point fits into the view (within the
 * padding), and the centre of their bounds.
 * @returns {{zoom: number, center: {x: number, y: number}}} centre in world pixels at zoom
 */
export function fitBounds(points, width, height, maxZoom) {
  const room = {
    w: Math.max(width - FIT_PADDING.left - FIT_PADDING.right, 1),
    h: Math.max(height - FIT_PADDING.top - FIT_PADDING.bottom, 1),
  };
  const box = (z) => {
    const px = points.map((p) => project(p.lat, p.lng, z));
    const xs = px.map((p) => p.x);
    const ys = px.map((p) => p.y);
    return {
      minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys),
    };
  };
  let zoom = maxZoom;
  while (zoom > MIN_ZOOM) {
    const b = box(zoom);
    if (b.maxX - b.minX <= room.w && b.maxY - b.minY <= room.h) break;
    zoom -= 1;
  }
  const b = box(zoom);
  // the padding is uneven (room for the pins above): shift the centre by half the difference
  return {
    zoom,
    center: {
      x: (b.minX + b.maxX) / 2 + (FIT_PADDING.right - FIT_PADDING.left) / 2,
      y: (b.minY + b.maxY) / 2 + (FIT_PADDING.bottom - FIT_PADDING.top) / 2,
    },
  };
}

/* ------------------------------------------------------------------------------------------- */
/* Rendering                                                                                    */
/* ------------------------------------------------------------------------------------------- */

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.append(content);
  return node;
}

/** Positions an absolutely placed layer child (whole pixels: crisp tiles). */
function place(node, x, y) {
  node.setAttribute('style', `left:${Math.round(x)}px;top:${Math.round(y)}px`);
}

function srOnly(text) {
  return el('span', 'poi-map-sr-only', text);
}

/** The bubble of a point: a link when the point has one, else a tooltip. */
function buildBubble(point, labels) {
  const title = el('span', 'poi-map-title', point.title);
  if (!point.link) {
    const tip = el('div', 'poi-map-bubble');
    tip.setAttribute('role', 'tooltip');
    tip.tabIndex = -1;
    tip.append(title);
    return tip;
  }
  const a = el('a', 'poi-map-bubble');
  a.href = point.link;
  if (point.linkExternal || isForeign(point.link)) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  a.append(title, el('span', 'poi-map-link', point.linkLabel || labels['visit website label']));
  return a;
}

/**
 * Draws the map into the view: tiles, markers, zoom buttons, attribution; drag to pan.
 * @param {HTMLElement} view
 * @param {Array} points
 * @param {Object} labels
 * @param {string} tiles key of TILE_SOURCES
 */
export function drawMap(view, points, labels, tiles) {
  const source = TILE_SOURCES[tiles] || TILE_SOURCES.osm;
  const size = () => ({
    w: view.clientWidth || DEFAULT_WIDTH,
    h: view.clientHeight || DEFAULT_HEIGHT,
  });
  const first = size();
  const fitted = fitBounds(points, first.w, first.h, source.maxZoom);
  const state = { zoom: fitted.zoom, center: fitted.center };

  const tileLayer = el('div', 'poi-map-tiles');
  tileLayer.setAttribute('aria-hidden', 'true');
  const markerLayer = el('div', 'poi-map-markers');
  const tileImages = new Map();

  const markers = points.map((point) => {
    const marker = el('div', 'poi-map-marker');
    marker.tabIndex = 0;
    marker.setAttribute('role', 'group');
    if (point.title) marker.setAttribute('aria-label', point.title);
    const pin = el('span', 'poi-map-pin');
    pin.setAttribute('aria-hidden', 'true');
    marker.append(pin);
    markerLayer.append(marker);
    return { point, marker, bubble: null };
  });

  const render = () => {
    const { w, h } = size();
    const ox = state.center.x - w / 2;
    const oy = state.center.y - h / 2;
    const count = 2 ** state.zoom;
    const wanted = new Set();
    const lastRow = Math.min(count - 1, Math.floor((oy + h) / TILE));
    for (let ty = Math.max(0, Math.floor(oy / TILE)); ty <= lastRow; ty += 1) {
      for (let tx = Math.floor(ox / TILE); tx <= Math.floor((ox + w) / TILE); tx += 1) {
        const key = `${state.zoom}/${tx}/${ty}`;
        wanted.add(key);
        let img = tileImages.get(key);
        if (!img) {
          img = el('img');
          img.alt = '';
          img.draggable = false;
          img.decoding = 'async';
          img.src = source.url(state.zoom, ((tx % count) + count) % count, ty);
          tileImages.set(key, img);
          tileLayer.append(img);
        }
        place(img, tx * TILE - ox, ty * TILE - oy);
      }
    }
    [...tileImages.keys()].filter((k) => !wanted.has(k)).forEach((k) => {
      tileImages.get(k).remove();
      tileImages.delete(k);
    });
    markers.forEach(({ point, marker }) => {
      const p = project(point.lat, point.lng, state.zoom);
      place(marker, p.x - ox, p.y - oy);
    });
  };

  const panBy = (dx, dy) => {
    state.center = { x: state.center.x + dx, y: state.center.y + dy };
    render();
  };

  const zoomTo = (zoom) => {
    const next = Math.min(Math.max(zoom, MIN_ZOOM), source.maxZoom);
    if (next === state.zoom) return;
    const factor = 2 ** (next - state.zoom);
    state.center = { x: state.center.x * factor, y: state.center.y * factor };
    state.zoom = next;
    render();
  };

  /* bubbles: open on hover or focus (the live marker-active), panned into the view */
  const close = (entry) => {
    if (!entry.bubble) return;
    entry.bubble.remove();
    entry.bubble = null;
    entry.marker.classList.remove('marker-active');
    entry.marker.tabIndex = 0;
  };
  const open = (entry, focusBubble) => {
    markers.filter((m) => m !== entry).forEach(close);
    if (!entry.bubble) {
      entry.bubble = buildBubble(entry.point, labels);
      entry.marker.append(entry.bubble);
      entry.marker.classList.add('marker-active');
    }
    if (focusBubble && entry.point.link) {
      entry.marker.tabIndex = -1;
      entry.bubble.focus();
    }
    if (typeof window.requestAnimationFrame !== 'function') return;
    window.requestAnimationFrame(() => {
      if (!entry.bubble) return;
      const b = entry.bubble.getBoundingClientRect();
      const v = view.getBoundingClientRect();
      const margin = 12;
      let dx = 0;
      let dy = 0;
      if (b.left < v.left + margin) dx = b.left - v.left - margin;
      else if (b.right > v.right - margin) dx = b.right - v.right + margin;
      if (b.top < v.top + margin) dy = b.top - v.top - margin;
      if (dx || dy) panBy(dx, dy);
    });
  };
  markers.forEach((entry) => {
    const { marker } = entry;
    marker.addEventListener('mouseenter', () => open(entry, false));
    marker.addEventListener('mouseleave', () => {
      if (!marker.contains || !marker.contains(document.activeElement)) close(entry);
    });
    marker.addEventListener('focusin', (e) => {
      if (e.target === marker) open(entry, true);
    });
    marker.addEventListener('focusout', (e) => {
      if (!e.relatedTarget || !marker.contains || !marker.contains(e.relatedTarget)) close(entry);
    });
    marker.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close(entry);
        marker.focus();
      }
    });
  });

  /* zoom buttons (live .zoom-control, bottom right) */
  const zoomControl = el('div', 'poi-map-zoom');
  const zoomButton = (className, label, delta) => {
    const button = el('button', `poi-map-zoom-button ${className}`);
    button.type = 'button';
    button.append(srOnly(label));
    button.addEventListener('click', () => zoomTo(state.zoom + delta));
    return button;
  };
  zoomControl.append(
    zoomButton('poi-map-zoom-in', labels['zoom in label'], 1),
    zoomButton('poi-map-zoom-out', labels['zoom out label'], -1),
  );

  const attribution = el('div', 'poi-map-attribution');
  attribution.append('© ');
  source.attribution.forEach(([name, href], i) => {
    if (i) attribution.append(' © ');
    const a = el('a', '', name);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    attribution.append(a);
    if (i === 0) attribution.append(` ${labels['attribution label']}`);
  });

  /* drag to pan (mouse and pen; touch scrolls the page, the buttons zoom) */
  let drag = null;
  view.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0 || (e.target.closest && e.target.closest('.poi-map-zoom, .poi-map-bubble, .poi-map-attribution'))) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
    if (view.setPointerCapture) view.setPointerCapture(e.pointerId);
    view.classList.add('is-dragging');
  });
  view.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    panBy(drag.x - e.clientX, drag.y - e.clientY);
    drag.x = e.clientX;
    drag.y = e.clientY;
  });
  const endDrag = () => {
    drag = null;
    view.classList.remove('is-dragging');
  };
  view.addEventListener('pointerup', endDrag);
  view.addEventListener('pointercancel', endDrag);
  window.addEventListener('resize', render);

  view.replaceChildren(tileLayer, markerLayer, zoomControl, attribution);
  view.classList.add(`poi-map-tiles-${tiles}`);
  render();
  return { state, render, zoomTo };
}

/** Calls fn once the block is near the viewport (at once without IntersectionObserver). */
function whenNear(block, fn) {
  if (typeof window.IntersectionObserver !== 'function') {
    fn();
    return;
  }
  const observer = new window.IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      fn();
    }
  }, { rootMargin: '300px 0px' });
  observer.observe(block);
}

/**
 * Map of points of interest with pins, zoom buttons and a bubble per point.
 * @param {Element} block
 * @returns {Promise<void>} resolves when the map is drawn or the block hidden (at once in a
 *   browser with IntersectionObserver: the map waits for the visible section)
 */
export default function decorate(block) {
  instanceCount += 1;
  const locale = getLocale();
  const { config, points: authored } = readPoiMapRows(block);
  const settings = readPoiMapSettings(config);
  const view = el('div', 'poi-map-view');
  view.id = `poi-map-${instanceCount}`;
  view.setAttribute('role', 'region');
  // the live map often sits in a two-column component: text under it (Caption) and the other
  // column (Aside) come with the block, which cannot sit inside a Columns block
  const rich = (key, className) => {
    const entry = config[key];
    if (!entry || !(entry.text || entry.cell.querySelector('img, a'))) return null;
    const box = el('div', className);
    box.append(...entry.cell.childNodes);
    return box;
  };
  const caption = rich('caption', 'poi-map-caption');
  const aside = rich('aside', 'poi-map-aside');
  const main = el('div', 'poi-map-main');
  main.append(view);
  if (caption) main.append(caption);
  if (aside) {
    block.classList.add('poi-map-with-aside');
    block.replaceChildren(main, aside);
  } else {
    block.replaceChildren(main);
  }
  block.setAttribute('aria-busy', 'true');

  return new Promise((resolve) => {
    whenNear(block, async () => {
      const result = await loadPoiMap(settings, authored, locale);
      // authored row, then the live label (labels/common), then the built-in default
      const defaults = resolveLabels(DEFAULT_LABELS, {}, locale.lang);
      const labels = { ...defaults, ...result.labels };
      Object.keys(defaults).forEach((key) => {
        const authoredLabel = config[toConfigKey(key)];
        if (authoredLabel && authoredLabel.text) labels[key] = authoredLabel.text;
      });
      view.setAttribute('aria-label', labels['map label']);
      if (result.sources.points === 'authored') {
        block.dataset.lhSource = 'authored';
        block.dataset.lhSources = Object.entries(result.sources).map(([n, s]) => `${n}:${s}`).join(' ');
      } else {
        markSource(block, result.sources, result.primary);
      }
      block.removeAttribute('aria-busy');
      if (!result.points.length) {
        // like the live component without an answer: no map (here without the empty 500px box)
        // the caption speaks of the map: it goes with it; the aside stays
        if (aside) {
          main.remove();
          block.classList.remove('poi-map-with-aside');
        } else block.hidden = true;
        block.dataset.lhSource = 'none';
        resolve();
        return;
      }
      drawMap(view, result.points, labels, settings.tiles);
      resolve();
    });
    // with an IntersectionObserver the section is still hidden (aem.js shows it once its blocks
    // are decorated) and a hidden block never comes near the viewport: waiting here kept this
    // section and every later one hidden. The map loads once the section shows.
    if (typeof window.IntersectionObserver === 'function') resolve();
  });
}
