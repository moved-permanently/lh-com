// The app services an "app-service" block can show, from the site's query index of the SDUI
// service documents. Pure functions, no DOM.

export const SERVICES_INDEX = '/data/content-fragments/orchestrator-services/sdui-services/query-index.json';

const text = (v) => (v === null || v === undefined ? '' : String(v).trim());

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

const orderOf = (row) => {
  const n = Number.parseInt(text(row.order), 10);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
};

/**
 * Index JSON -> [{ id, name, description, type, detail }], sorted by `order`, then path.
 * The id is the service's path as the app knows it: `dam-path`, else the document path with
 * /data/ as /content/dam/.
 */
export function serviceList(json) {
  const rows = Array.isArray(json?.data) ? json.data : [];
  return rows
    .filter((r) => text(r.path))
    .sort((a, b) => orderOf(a) - orderOf(b) || text(a.path).localeCompare(text(b.path)))
    .map((r) => {
      const path = text(r.path);
      const type = text(r['service-type']);
      return {
        id: text(r['dam-path']) || path.replace(/^\/data\//, '/content/dam/'),
        name: path.split('/').pop(),
        description: text(r.description),
        type,
        detail: type === 'HTTP' ? hostOf(text(r.url)) : text(r.framework),
      };
    });
}

/** Services that contain every word of the query (any field, case-insensitive). */
export function filterServices(list, query) {
  const words = text(query).toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((s) => {
    const all = [s.name, s.description, s.type, s.detail, s.id].join(' ').toLowerCase();
    return words.every((w) => all.includes(w));
  });
}
