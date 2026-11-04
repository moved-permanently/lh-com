/*
 * poi-map on brand tap (TAP Air Portugal): www.flytap.com's destinations map (/en-pt/destinations,
 * /pt-pt/destinos; there Smartvel's widget). The points come from a sheet of the root, Source
 * `/<root>/destinations/destinations-map.json` (tools/tap-data/destinations-sheet.mjs: region,
 * city, country, code, lat, lng, link, countryLink): a green dot per destination, its bubble the
 * city and country with a link to www's flights page; above the map one button per region of the
 * sheet
 * (www's list: Africa, America, Europe) and "All", showing that region's destinations only and
 * fitting the map to them. Another brand's poi-map is unchanged. The look: styles/themes/tap.css.
 */

/** Labels in TAP's languages (English for any other); {city} is the destination's name. */
export const TAP_MAP_LABELS = {
  en: {
    all: 'All', flights: 'Flights to {city}', regions: 'Destinations by region', map: 'Map of TAP destinations',
  },
  pt: {
    all: 'Todos', flights: 'Voos para {city}', regions: 'Destinos por região', map: 'Mapa dos destinos TAP',
  },
  es: {
    all: 'Todos', flights: 'Vuelos a {city}', regions: 'Destinos por región', map: 'Mapa de los destinos de TAP',
  },
  fr: {
    all: 'Tous', flights: 'Vols pour {city}', regions: 'Destinations par région', map: 'Carte des destinations TAP',
  },
  de: {
    all: 'Alle', flights: 'Flüge nach {city}', regions: 'Ziele nach Region', map: 'Karte der TAP-Ziele',
  },
  it: {
    all: 'Tutte', flights: 'Voli per {city}', regions: 'Destinazioni per regione', map: 'Mappa delle destinazioni TAP',
  },
  pl: {
    all: 'Wszystkie', flights: 'Loty do {city}', regions: 'Kierunki według regionu', map: 'Mapa kierunków TAP',
  },
};

export const labelsFor = (lang) => TAP_MAP_LABELS[lang] || TAP_MAP_LABELS.en;

/** Whether a Source value is a sheet (a .json path or URL) rather than lufthansa.com's JCR path. */
export const isSheetSource = (text) => /^(\/|https?:\/\/)\S*\.json(\?\S*)?$/i.test(String(text || '').trim());

/**
 * The map's points from the sheet's rows: those with coordinates, in the sheet's order.
 * @param {{data?: Array}} json the sheet
 * @param {string} lang
 */
export function pointsOfSheet(json, lang) {
  const labels = labelsFor(lang);
  const rows = (json && Array.isArray(json.data)) ? json.data : [];
  return rows.map((r) => ({
    city: String(r.city || '').trim(),
    country: String(r.country || '').trim(),
    group: String(r.region || '').trim(),
    lat: Number(r.lat),
    lng: Number(r.lng),
    link: /^https?:\/\//.test(String(r.link || '')) ? String(r.link) : '',
  })).filter((p) => p.city && Number.isFinite(p.lat) && Number.isFinite(p.lng)
    && Math.abs(p.lat) <= 85 && Math.abs(p.lng) <= 180 && (p.lat || p.lng))
    .map((p) => ({
      ...p,
      title: p.country ? `${p.city}, ${p.country}` : p.city,
      linkLabel: p.link ? labels.flights.replace('{city}', p.city) : '',
      linkExternal: Boolean(p.link),
    }));
}

/**
 * The sheet's points, as poi-map's loadPoiMap answers (points:sheet, or none when the sheet does
 * not load).
 * @param {string} source the Source row
 * @param {string} lang
 * @param {Function} [fetcher]
 */
export async function loadTapMap(source, lang, fetcher = (u) => fetch(u)) {
  const url = `${source.trim()}${source.includes('?') ? '&' : '?'}limit=1000`;
  try {
    const resp = await fetcher(url);
    if (!resp.ok) throw new Error(String(resp.status));
    const points = pointsOfSheet(await resp.json(), lang);
    return { points, labels: {}, sources: { points: points.length ? 'sheet' : 'none' } };
  } catch (e) {
    return { points: [], labels: {}, sources: { points: 'none' } };
  }
}

/**
 * TAP's parts on the drawn map: the class, the region buttons (with more than one region).
 * @param {Element} block
 * @param {{markers: Array, state: Object, render: Function}} drawn poi-map's drawMap answer
 * @param {Array} points
 * @param {{lang: string, fitBounds: Function, view: Element, maxZoom: number}} opts
 */
export function decorateTapMap(block, drawn, points, {
  lang, fitBounds, view, maxZoom,
}) {
  block.classList.add('poi-map-tap');
  const labels = labelsFor(lang);
  drawn.markers.forEach(({ point, marker }) => {
    if (point.group) marker.dataset.group = point.group;
  });
  const groups = [...new Set(points.map((p) => p.group).filter(Boolean))];
  if (groups.length < 2) return;

  const bar = document.createElement('div');
  bar.className = 'poi-map-regions';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', labels.regions);
  const show = (group) => {
    const shown = [];
    drawn.markers.forEach(({ point, marker }) => {
      const on = !group || point.group === group;
      marker.hidden = !on;
      if (on) shown.push(point);
    });
    [...bar.children].forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.group || '') === (group || ''))));
    const fitted = fitBounds(shown, view.clientWidth || 600, view.clientHeight || 500, maxZoom);
    drawn.state.zoom = fitted.zoom;
    drawn.state.center = fitted.center;
    drawn.render();
  };
  const button = (label, group) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'poi-map-region';
    b.textContent = label;
    if (group) b.dataset.group = group;
    b.setAttribute('aria-pressed', String(!group));
    b.addEventListener('click', () => show(group));
    return b;
  };
  bar.append(button(labels.all, ''), ...groups.map((g) => button(g, g)));
  view.before(bar);
}
