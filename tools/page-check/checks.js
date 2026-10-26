/* eslint-disable max-len -- check messages and selector lists */
/**
 * Page check (AMS rest A11): the checks of the editors' page health panel, pure logic. Input:
 * the document's preview (.plain.html), its metadata (from the DA source, else the preview's
 * head), the site's page paths (query indexes), the redirects sheet, and a `head(url)` function
 * that answers {ok, size} (HEAD requests: page existence, media sizes). Output: issues
 * [{check, severity, group, message, text}] (`text`: a snippet of the place, for a link into
 * the preview) and scores. Nothing here changes the document.
 */

export const SEVERITY_POINTS = { high: 15, medium: 8, low: 3 };
export const GROUPS = ['Accessibility', 'Content quality', 'Media', 'Performance'];
export const CHECKS = [
  {
    id: 'title', title: 'Title missing', severity: 'high', group: 'Content quality',
  },
  {
    id: 'description', title: 'Description missing', severity: 'medium', group: 'Content quality',
  },
  {
    id: 'alt', title: 'Image without alternative text', severity: 'high', group: 'Accessibility',
  },
  {
    id: 'empty', title: 'Empty content', severity: 'low', group: 'Content quality',
  },
  {
    id: 'large-image', title: 'Large image', severity: 'high', group: 'Media',
  },
  {
    id: 'broken-link', title: 'Broken internal link', severity: 'high', group: 'Content quality',
  },
  {
    id: 'too-many-parts', title: 'Too many parts', severity: 'medium', group: 'Performance',
  },
  {
    id: 'heading-order', title: 'Heading order', severity: 'medium', group: 'Accessibility',
  },
  {
    id: 'short-url', title: 'Short URL notice', severity: 'low', group: 'Content quality',
  },
];
export const LARGE_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_PARTS = 40;
export const SITE_HOSTS = [/^[a-z0-9-]+--lh-com--moved-permanently\.aem\.(page|live)$/, /^lhcom\.bbird\.live$/, /^lhedge\.bbird\.live$/];

const byId = Object.fromEntries(CHECKS.map((c) => [c.id, c]));
const issue = (check, message, text = '') => ({
  check, severity: byId[check].severity, group: byId[check].group, message, text: String(text || '').replace(/\s+/g, ' ').trim().slice(0, 80),
});
const textOf = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
const MEDIA = 'img, picture, video, iframe';

/** Sections and blocks of a .plain.html document (body > div sections, their div[class] blocks). */
export function partsOf(doc) {
  const sections = [...doc.body.children].filter((el) => el.tagName === 'DIV');
  const blocks = sections.flatMap((s) => [...s.children].filter((el) => el.tagName === 'DIV' && el.className && !/^(metadata|section-metadata)$/.test(el.className.split(/\s+/)[0])));
  return { sections, blocks };
}

/** Metadata rows (key lower case -> text) of a DA source or .plain.html with a metadata block. */
export function metadataOf(doc) {
  const out = {};
  const block = doc.querySelector('div.metadata');
  if (!block) return out;
  [...block.children].forEach((row) => {
    const [k, v] = row.children;
    if (k) out[textOf(k).toLowerCase()] = v ? textOf(v) : '';
  });
  return out;
}

/** The page path a link points to on this site, or null (other sites, files, anchors). */
export function sitePathOf(href, origin) {
  const raw = String(href || '').trim();
  if (!raw || raw.startsWith('#') || /^(mailto|tel|javascript):/i.test(raw)) return null;
  let url;
  try { url = new URL(raw, origin); } catch (e) { return null; }
  if (!/^https?:$/.test(url.protocol)) return null;
  const own = url.origin === new URL(origin).origin || SITE_HOSTS.some((re) => re.test(url.hostname));
  if (!own) return null;
  const path = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  if (/\.[a-z0-9]+$/i.test(path.split('/').pop()) || /^\/(content\/dam|media_|tools|scripts|styles|blocks|icons)(\/|$)/.test(path.slice(0, 40))) return null;
  return path;
}

/**
 * The URL to measure for an image source (`base`: the page URL, for relative ./media_ files):
 * media of this site as is, www's DAM images by the
 * name of their copy on this site (damName: scripts/dam-path.js edsDamPath), others null.
 */
export function mediaUrlOf(src, base, damName) {
  let url;
  try { url = new URL(src, base); } catch (e) { return null; }
  const { origin } = new URL(base);
  if (url.origin === origin || SITE_HOSTS.some((re) => re.test(url.hostname))) return `${origin}${url.pathname}`;
  if (/(^|\.)lufthansa\.com$/.test(url.hostname) && url.pathname.startsWith('/content/dam/')) {
    const asset = decodeURIComponent(url.pathname.replace(/(\.(?:jpe?g|png|gif|webp|svg))\.transform\/.*$/i, '$1'));
    return damName ? `${origin}${damName(asset)}` : null;
  }
  return null;
}

/** Heading order issues: the first heading deeper than H2, a skipped level going down, H4+ back to H1. */
export function headingIssues(doc) {
  const out = [];
  let prev = null;
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    const level = Number(h.tagName[1]);
    if (prev === null && level > 2) out.push(issue('heading-order', `The first heading is an H${level}; start with an H1 or H2.`, textOf(h)));
    else if (prev !== null && level > prev + 1) out.push(issue('heading-order', `H${prev} is followed by H${level}: a level is skipped.`, textOf(h)));
    else if (prev !== null && prev >= 4 && level === 1) out.push(issue('heading-order', `H${prev} is followed by H1.`, textOf(h)));
    prev = level;
  });
  return out;
}

/**
 * All checks. ctx: { doc (the .plain.html), meta (metadata rows, may be {}), headTitle,
 * headDescription (the preview's head, used when meta lacks them), path, origin, sitePaths
 * (Set of known page paths), redirects (rows {Source, Destination}), head(url) -> {ok, size},
 * damName, disabled (Set of check ids) }
 */
export async function runChecks(ctx) {
  const {
    doc, meta = {}, path, origin, sitePaths = new Set(), redirects = [], head, damName, disabled = new Set(),
  } = ctx;
  const issues = [];
  const on = (id) => !disabled.has(id);
  const h1 = doc.querySelector('h1');
  const firstP = textOf([...doc.querySelectorAll('p')].find((p) => textOf(p)));

  if (on('title') && !meta.title && !(ctx.headTitle && !meta.source) && !h1) issues.push(issue('title', 'No title: the page has no Title metadata and no H1.'));
  if (on('description')) {
    const fromHead = String(ctx.headDescription || '').trim();
    const missing = meta.source ? !meta.description : (!fromHead || fromHead === firstP);
    if (missing) issues.push(issue('description', 'No Description metadata (search results and shares show the first paragraph instead).'));
  }
  if (on('alt')) {
    doc.querySelectorAll('img').forEach((img) => {
      if (!String(img.getAttribute('alt') || '').trim()) issues.push(issue('alt', `Image without alternative text: ${String(img.getAttribute('src') || '').split('?')[0].split('/').pop()}`, textOf(img.closest('div'))));
    });
  }
  if (on('empty')) {
    doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach((el) => {
      if (!textOf(el) && !el.querySelector(MEDIA)) issues.push(issue('empty', `Empty ${el.tagName === 'P' ? 'paragraph' : `heading (${el.tagName})`}.`, textOf(el.previousElementSibling)));
    });
    partsOf(doc).blocks.forEach((block) => {
      [...block.children].forEach((row) => [...row.children].forEach((cell) => {
        if (!textOf(cell) && !cell.querySelector(`${MEDIA}, a`)) issues.push(issue('empty', `Empty cell in the ${block.className.split(/\s+/)[0]} block.`, textOf(row)));
      }));
    });
  }
  if (on('too-many-parts')) {
    const { sections, blocks } = partsOf(doc);
    if (sections.length + blocks.length > MAX_PARTS) issues.push(issue('too-many-parts', `${sections.length} sections and ${blocks.length} blocks (${sections.length + blocks.length}, more than ${MAX_PARTS}).`));
  }
  if (on('heading-order')) issues.push(...headingIssues(doc));
  if (on('short-url')) {
    const sources = redirects.filter((r) => String(r.Destination || '').replace(/\.html$/, '').replace(/\/$/, '') === path).map((r) => r.Source);
    if (sources.length) issues.push(issue('short-url', `Redirected to this page: ${sources.join(', ')}.`));
  }
  if (on('broken-link') && head) {
    const links = new Map();
    doc.querySelectorAll('a[href]').forEach((a) => {
      const p = sitePathOf(a.getAttribute('href'), `${origin}${path}`);
      if (p && p !== path && !links.has(p)) links.set(p, textOf(a));
    });
    const unknown = [...links.keys()].filter((p) => !sitePaths.has(p));
    const answers = await Promise.all(unknown.map(async (p) => [p, await head(`${origin}${p}`)]));
    answers.filter(([, r]) => !r || !r.ok).forEach(([p]) => issues.push(issue('broken-link', `Link to ${p}: no previewed or published page.`, links.get(p))));
  }
  if (on('large-image') && head) {
    const media = new Map();
    doc.querySelectorAll('img[src], source[srcset]').forEach((el) => {
      const src = el.getAttribute('src') || String(el.getAttribute('srcset')).split(/[\s,]/)[0];
      const u = mediaUrlOf(src, `${origin}${path}`, damName);
      if (u && !media.has(u)) media.set(u, el.closest('picture') ? (el.closest('picture').querySelector('img') || el).getAttribute('alt') : el.getAttribute('alt'));
    });
    const answers = await Promise.all([...media.keys()].map(async (u) => [u, await head(u)]));
    answers.filter(([, r]) => r && r.ok && r.size > LARGE_IMAGE_BYTES).forEach(([u, r]) => issues.push(issue('large-image', `Image of ${(r.size / 1024 / 1024).toFixed(1)} MB (more than 2 MB): ${u.split('/').pop()}`, media.get(u))));
  }
  return issues;
}

/** The score of a set of issues: 100 minus 15 per high, 8 per medium, 3 per low, never below 0. */
export const scoreOf = (issues) => Math.max(0, 100 - issues.reduce((n, i) => n + SEVERITY_POINTS[i.severity], 0));
export const labelOf = (score) => {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Warning';
  return 'Poor';
};

/** Overall and per group: {score, label}. */
export function scores(issues) {
  const overall = scoreOf(issues);
  return {
    overall: { score: overall, label: labelOf(overall) },
    groups: Object.fromEntries(GROUPS.map((g) => {
      const s = scoreOf(issues.filter((i) => i.group === g));
      return [g, { score: s, label: labelOf(s) }];
    })),
  };
}
