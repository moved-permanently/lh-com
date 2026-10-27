/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/extensions -- linkedom is a dev tool dependency */
/**
 * Builds lh-com's DA block library from the content: one document per block at
 * content/library/blocks/<block>.html (DA /library/blocks/<block>), one block table per
 * variant (option combination) that occurs on lh-com pages: a copy of a real page's block with
 * the structure the most of the variant's blocks resolve against (structure.mjs chooseModels:
 * the fields all of them share; a sample with more is cut to them), then, under a heading, one
 * per other structure the pages use (at least 4 blocks or a tenth of the variant; the Block
 * Inspector edits every block of a variant with its first table, these are for inserting),
 * each followed by a library-metadata table (description,
 * fields: the labels the Block Inspector of adobe-rnd/ew-extensions shows, mirroring the
 * table's rows and cells; see tools/library/structure.mjs). Writes the index sheet
 * content/library/blocks.json (sheets blocks, editor, options) and
 * tools/library/library-variants.json (variant -> sample page, pages), which
 * tools/library/check-fields.mjs reads.
 *
 * Left out: header and footer (loaded by the page), channels-demo, and the blocks of the
 * structured documents under /data/** (DA form documents from the GraphQL import, edited
 * with DA's form editor; their class names are generated ids).
 *
 * Usage: node tools/library/build-library.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parse, describeBlockDiv, rowShape, normalizeCell, contentFields, fieldType, rowCovers, blockCovers,
  chooseModels, rowFits, rowIsModel, describeModel,
} from './structure.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTENT = path.join(root, 'content');
const OUT = path.join(CONTENT, 'library/blocks');
const ORG_SITE = 'moved-permanently/lh-com';
const SKIP_DIRS = /^(drafts|lhg|library|media-da|data|demo)(\/|$)/;
const SKIP_BLOCKS = new Set(['header', 'footer', 'channels-demo', 'section-metadata', 'metadata', 'library-metadata']);
const LOCALE_ORDER = ['/de/en/', '/de/de/', '/gb/en/', '/at/de/', '/us/en/'];
const MAX_ITEMS = 4;

/**
 * Per block: multi (every row is an item authors add, delete and reorder), description, and
 * labels: per row index (or 'item' for multi blocks) an array per cell of field labels, used
 * in order; fields beyond them get generic labels. `imageLabel` names images.
 */
const SPEC = {
  'accordion-columns': {
    multi: true, description: 'Expandable items, such as FAQs: each row is an item whose title opens its content, optionally split into columns of links', item: [['Title'], []], columnHeadings: true,
  },
  'app-article-list': { description: 'App screen: the article list of a category, with its link text and tracking id' },
  'app-links': { multi: true, description: 'App screen: a list of links, one per row, each with its tracking id', item: [['Link'], ['Tracking ID']] },
  'app-offer': { description: 'App screen: an offer teaser with title, description, image and link' },
  'app-service': { description: 'App screen: an SDUI service the app calls, with its auxiliary data, tenant, market and language' },
  'app-teaser-slider': { description: 'App screen: a teaser slider with a title and teaser cards (text, image, link, tracking id)', rows: { 1: [['Title', 'Text'], ['Image'], ['Link'], ['Tracking ID']] } },
  'article-header': { description: 'Article page header: feature image (optionally a header video), title and intro; tags, date, reading time and author come from the page metadata', rows: { 0: [['Image', 'Header video']], 1: [['Title', 'Intro']] } },
  'blog-overview': { description: 'Article list with search, category filter and pagination, filled from the locale\'s article index' },
  'booking-lookup': { description: 'Form to find a booking by booking reference or ticket number and name, which hands off to the booking pages' },
  'car-rental': { description: 'Rental car search of a Lufthansa partner (Meili widget), with a fallback form' },
  cards: { multi: true, description: 'Cards with image and text, one card per row (boilerplate block, used on the starter page)', item: [['Image'], ['Title', 'Text']] },
  'cards-icon': {
    multi: true, description: 'Icon tiles, one per row: an icon and a linked label', item: [['Icon'], ['Link']], imageLabel: 'Icon',
  },
  'cards-icon-text': {
    multi: true, description: 'Cards with an icon, title, description and link, one card per row', item: [['Icon'], []], imageLabel: 'Icon',
  },
  'cards-steps': { multi: true, description: 'Numbered steps, one per row: step number, title, description and an optional link', item: [['Step number', 'Title', 'Text', 'Link']] },
  'cards-teaser': { multi: true, description: 'Teaser cards with image, title, text and an arrow link, one card per row' },
  'carousel-cards': { multi: true, description: 'Carousel of cards with image, eyebrow, title, text and link, one slide per row' },
  'carousel-images': { multi: true, description: 'Image carousel, one slide per row: the image and an optional caption', item: [['Image'], ['Caption']] },
  'carousel-lightbox': { description: 'Image preview that opens a gallery lightbox: intro, slides (image and caption) and optional label rows' },
  columns: { description: 'Columns of text and images (boilerplate block, used on the starter page)' },
  'columns-logos': { description: 'Columns, each with a heading and linked logos or icons (payment options, social links)', rows: { 0: [['Title', 'Logos'], ['Title', 'Logos']] } },
  'columns-media': { description: 'Text next to media (image, several images, linked image or video), one row per text/media pair' },
  'destination-finder': { description: 'Flight offers from an origin: destination slider with live prices, trip types and a finder card' },
  'destination-offer': { description: 'Destination page: flight offers, price calendar and route facts for the route in the URL' },
  ejournals: { description: 'E-journals download: a booking lookup that leads to the free e-journals' },
  embed: { description: 'A YouTube video or in-flight entertainment widget, from its link', rows: { 0: [['Video link']] } },
  'fare-teaser': { description: 'Fare teaser: routes from an origin with the lowest live price per destination' },
  feedback: { description: 'Feedback question with its answer choices', rows: { 0: [['Question']], 1: [['Answers']] } },
  'flash-teaser': { description: 'Current messages of the Message Center (disruptions, outages, promotions) at the top of the homepage' },
  'flight-search': {
    multi: true, description: 'Flight search form (origin, destination, dates, travellers) that hands off to the booking; each row is one setting (key and value), optional ones can be added or removed', item: [['Setting'], ['Value']],
  },
  'flight-status': { description: 'Flight status search by flight number, route or airport' },
  form: { multi: true, description: 'Form built from a field table: a header row naming the columns, then one row per field, heading or text', headerLabels: true },
  fragment: { description: 'Includes the content of another document (fragment), from its link', rows: { 0: [['Fragment link']] } },
  'hero-banner': { description: 'Stage with panes that open by their tab label: image, tab label, headline, text and button per pane', allRows: [['Image'], ['Tab label', 'Headline']] },
  'hero-campaign': { description: 'Campaign stage: background image (optionally a background video) with title, subtitle, text and buttons', rows: { 0: [['Background image', 'Background video']] } },
  'hero-card-overlay': { description: 'Promotion stage: background image with a card holding eyebrow, title, text, buttons and optional conditions', rows: { 0: [['Background image']] } },
  'jump-links': { multi: true, description: 'Links to sections of the page (anchors), one per row', item: [['Link']] },
  'lounge-finder': { description: 'Lounge search by city and status or travel class (labels and options in optional rows)' },
  'message-center': { description: 'Current messages of the Message Center above the travel information' },
  'micro-frontend': { description: 'One of www\'s micro-frontend apps (today trip-management), loaded from www with its design system; the page\'s data comes from the system that opens it', rows: { 0: [['App']] } },
  'poi-map': { multi: true, description: 'Map with points of interest: one row per point (title, coordinates, link), plus source, caption and aside rows', item: [['Title'], ['Coordinates'], ['Link']] },
  'price-bar': { description: 'Sticky price bar at the bottom of the window: destination, price label and link' },
  'profile-nav': { description: 'Tabs of the profile pages, as a list of links', rows: { 0: [['Tabs']] } },
  'profile-tabs': { multi: true, description: 'Tabs, one per row: tab label, panel content and an optional deep link id', item: [['Tab label'], ['Panel'], ['Tab id']] },
  'related-articles': { description: 'Three related articles, picked from the article index by tags and category; rows add fixed picks' },
  'search-results': { description: 'Site search results from the locale\'s search index', rows: { 0: [['Search index']] } },
  'stage-promotions': { description: 'Homepage stage: shows the active promotion of the locale\'s promotions document', rows: { 0: [['Promotions document']] } },
  'subpage-nav': { description: 'Navigation to the pages of a topic, at the end of the page', rows: { 0: [['Eyebrow', 'Topic', 'Pages']] } },
  'table-striped': { multi: true, description: 'Table with striped rows, one block row per table row (option header: the first row is the header)', columnLabels: true },
};

const OPTION_NOTES = {
  faq: 'FAQ style',
  spaced: 'spaced items',
  'limited-width': 'limited width',
  column: 'content in columns',
  usp: 'USP tiles',
  'four-up': 'four per row',
  'three-up': 'three per row',
  'two-up': 'two per row',
  partner: 'partner cards',
  overlay: 'text over the image',
  grid: 'grid instead of a carousel',
  article: 'article cards',
  authors: 'authors from the index',
  half: 'half width',
  stacked: 'images stacked',
  padded: 'padded',
  sidebar: 'sidebar layout',
  'before-padded': 'padding before',
  'nested-2': 'two nested columns',
  'nested-4': 'four nested columns',
  'cell-slider': 'cells as a slider below 1025px',
  slider: 'images as a slider below 1025px',
  'my-bookings': 'my bookings tabs',
  standalone: 'standalone form',
  core: 'AEM core form layout',
  narrow: '350px stage',
  right: 'text on the right',
  card: 'text in a white card',
  regular: '640px stage',
  light: 'light card',
  'no-mobile-image': 'no image on small screens',
  columns: 'in columns',
  header: 'first row is the header',
  content: 'content tabs',
};

const walk = (d, rel = '') => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const r = rel ? `${rel}/${e.name}` : e.name;
  if (e.isDirectory()) return SKIP_DIRS.test(r) ? [] : walk(path.join(d, e.name), r);
  return e.name.endsWith('.plain.html') ? [r] : [];
});
const localeRank = (p) => {
  const i = LOCALE_ORDER.findIndex((l) => p.startsWith(l));
  return i < 0 ? LOCALE_ORDER.length : i;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const title = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// --- the variants of the content
const variants = new Map();
walk(CONTENT).forEach((file) => {
  const page = `/${file.replace(/\.plain\.html$/, '')}`;
  const doc = parse(`<main>${fs.readFileSync(path.join(CONTENT, file), 'utf8')}</main>`);
  const seen = new Set();
  doc.querySelectorAll('main > div > div[class]').forEach((block) => {
    const classes = block.className.trim().split(/\s+/);
    const [name, ...opts] = classes;
    if (SKIP_BLOCKS.has(name)) return;
    const key = opts.length ? `${name} (${opts.join(', ')})` : name;
    if (!variants.has(key)) {
      variants.set(key, {
        key, name, opts, uses: [],
      });
    }
    const firstOnPage = !seen.has(key);
    seen.add(key);
    variants.get(key).uses.push({
      page, block, firstOnPage, d: describeBlockDiv(block),
    });
  });
});

const fieldTotal = (rows) => rows.reduce((a, r) => a + r.cells.reduce((b, c) => b + c.fields.length, 0), 0);

/**
 * The sample: the structure the most real blocks resolve against (rowCovers / blockCovers, as
 * the extension matches page blocks to the library table; ties: the one with more fields, then
 * the more common one), copied from a de/en page where there is one. Multi blocks: the first
 * row (the item schema) that the most rows of the same kind resolve against.
 */
function pickSample(v, spec) {
  const { uses } = v;
  const byPage = (a, b) => (localeRank(a.page) - localeRank(b.page)) || a.page.localeCompare(b.page);
  if (spec.multi) {
    const firsts = uses.filter((u) => u.d.rows.length);
    if (!firsts.length) return [...uses].sort(byPage)[0];
    const rows = uses.flatMap((u) => u.d.rows);
    const shapes = new Map(firsts.map((u) => [rowShape(u.d.rows[0]), u.d.rows[0]]));
    const score = (t) => rows.filter((r) => rowCovers(t, r)).length;
    const [best] = [...shapes.entries()].map(([s, t]) => ({
      s, n: score(t), f: fieldTotal([t]), c: rows.filter((r) => rowShape(r) === s).length,
    }))
      .sort((a, b) => (b.n - a.n) || (b.f - a.f) || (b.c - a.c));
    const pool = firsts.filter((u) => rowShape(u.d.rows[0]) === best.s);
    const uniform = (u) => u.d.rows.filter((r) => rowShape(r) === best.s).length / u.d.rows.length;
    return pool.sort((a, b) => (uniform(b) - uniform(a)) || byPage(a, b) || (Math.abs(a.d.rows.length - 3) - Math.abs(b.d.rows.length - 3)))[0];
  }
  const shapes = new Map();
  uses.forEach((u) => { const s = u.d.rows.map(rowShape).join(' / '); if (!shapes.has(s)) shapes.set(s, []); shapes.get(s).push(u); });
  const [best] = [...shapes.values()].map((group) => ({ group, n: uses.filter((u) => blockCovers(group[0].d, u.d)).length, f: fieldTotal(group[0].d.rows) }))
    .sort((a, b) => (b.n - a.n) || (b.f - a.f) || (b.group.length - a.group.length));
  return [...best.group].sort(byPage)[0];
}

/** Removes the fields of a cell beyond the first n (image-only cells keep their spacer paragraphs). */
function trimCell(cell, n) {
  normalizeCell(cell);
  const els = contentFields(cell);
  const content = els.filter((el) => fieldType(el) !== 'text' || el.textContent.trim());
  if (els.length <= n || (content.length === n && content.every((el) => fieldType(el) === 'image'))) return;
  els.slice(n).forEach((el) => el.remove());
}

/**
 * The library sample of a model: a real block that resolves against it, preferably one whose
 * structure is the model exactly (multi: its first item; else every row), then the one with the
 * most items of the model, from a de/en page where there is one. A sample with more fields than
 * the model is cut to the model (the fields table describes the sample). Multi: the rows before
 * its first item are left out (the first row is the item schema).
 */
function sampleFor(entry, uses, multi, preferred) {
  const byPage = (a, b) => (localeRank(a.page) - localeRank(b.page)) || a.page.localeCompare(b.page);
  // multi: the first item row (the sample starts with it); a fixed block starts with row 1
  const first = (u) => (multi ? u.d.rows.findIndex((r) => rowFits(entry.model, r)) : 0);
  const exact = (u) => (multi ? rowIsModel(entry.model, u.d.rows[first(u)]) : u.d.rows.every((r, i) => rowIsModel(entry.model[i], r)));
  const items = (u) => (multi ? u.d.rows.slice(first(u), first(u) + MAX_ITEMS).filter((r) => rowFits(entry.model, r)).length : 0);
  // the earlier sample (pickSample) stays when it is the model exactly: no change for authors
  if (preferred && entry.fit.includes(preferred.d) && first(preferred) === 0 && exact(preferred)) return preferred;
  const [u] = uses.filter((x) => entry.fit.includes(x.d))
    .sort((a, b) => (exact(b) - exact(a)) || (first(a) - first(b)) || (items(b) - items(a)) || byPage(a, b));
  if (first(u) === 0 && exact(u)) return u;
  const block = u.block.cloneNode(true);
  if (multi) [...block.children].slice(0, first(u)).forEach((r) => r.remove());
  const rows = [...block.children];
  (multi ? [entry.model] : entry.model).forEach((modelRow, ri) => {
    [...rows[ri].children].forEach((cell, ci) => trimCell(cell, modelRow[ci].length));
  });
  return { page: u.page, block, trimmed: !exact(u) };
}

/** Generic label of one field element. */
function genericLabel(el, state, spec) {
  if (el.tagName === 'IMG' || el.querySelector('img')) return spec.imageLabel || 'Image';
  if (el.tagName === 'UL' || el.tagName === 'OL') return [...el.children].every((li) => li.querySelector('a')) ? 'Links' : 'List';
  if (/^H[1-6]$/.test(el.tagName)) { state.headings += 1; return state.headings === 1 ? 'Title' : 'Subtitle'; }
  const text = el.textContent.trim();
  if (/^\{[^}]*\}$/.test(text)) return 'Settings';
  const links = [...el.querySelectorAll('a')];
  let link = links.length === 1 ? links[0] : null;
  if (el.tagName === 'A') link = el;
  if (link && link.textContent.trim() === text) {
    const href = link.getAttribute('href') || '';
    if (/\.mp4(\?|#|$)/i.test(href)) return 'Video';
    if (/\.vtt(\?|#|$)/i.test(href)) return /audio|deskription/i.test(text) ? 'Audio description' : 'Subtitles';
    if (el.querySelector('strong a, em a, a strong, a em') || /^(STRONG|EM)$/.test(link.parentElement?.tagName)) return 'Button';
    return 'Link';
  }
  if (!state.headings && state.index === 0 && state.total > 1 && text.length < 60 && state.nextIsHeading) return 'Eyebrow';
  return 'Text';
}

/** Labels of one cell: spec labels first, then generic ones, numbered when repeated. */
function cellLabels(cell, preset, spec, keyText, columnHeadings) {
  const c = normalizeCell(cell.cloneNode(true));
  const fields = contentFields(c);
  const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
  if (columnHeadings && fields.some(isHeading)) {
    // accordion-columns panel: each heading starts a column, followed by its list of links
    let n = 0;
    const seen = {};
    return fields.map((el) => {
      let label;
      if (isHeading(el)) {
        n += 1;
        label = `Column ${n} title`;
      } else if (n && (el.tagName === 'UL' || el.tagName === 'OL')) label = `Column ${n} links`;
      else label = n ? `Column ${n} text` : 'Text';
      seen[label] = (seen[label] || 0) + 1;
      return seen[label] > 1 ? `${label} ${seen[label]}` : label;
    });
  }
  const state = { headings: 0, index: 0, total: fields.length };
  const used = {};
  return fields.map((el, i) => {
    state.index = i;
    state.nextIsHeading = /^H[1-6]$/.test(fields[i + 1]?.tagName || '');
    let label = preset?.[i] || (keyText && i === 0 ? keyText : null) || genericLabel(el, state, spec);
    if (!preset?.[i] && /^H[1-6]$/.test(el.tagName) === false && state.headings === 0 && label === 'Title') state.headings = 1;
    used[label] = (used[label] || 0) + 1;
    if (used[label] > 1) label = `${label} ${used[label]}`;
    return label;
  });
}

/** Fields table rows for a sample block. */
function fieldRows(sample, spec) {
  const rows = [...sample.children];
  const maxCols = Math.max(1, ...rows.map((r) => r.children.length));
  const pick = spec.multi ? rows.slice(0, 1) : rows;
  return {
    maxCols,
    rows: pick.map((row, ri) => {
      const cells = [...row.children];
      const presetRow = spec.multi ? spec.item : spec.rows?.[ri];
      const isKv = !spec.multi && cells.length === 2 && !presetRow
      && cells[0].textContent.trim().length > 0 && cells[0].textContent.trim().length <= 40
      && !cells[0].querySelector('img, a, ul, ol, h1, h2, h3, h4, h5, h6');
      return cells.map((cell, ci) => {
        const span = cells.length < maxCols && ci === cells.length - 1 ? maxCols - ci : 1;
        let labels;
        const key = title(cells[0].textContent.trim());
        if (isKv && ci === 0) labels = cellLabels(cell, ['IGNORE'], spec);
        else if (isKv) labels = cellLabels(cell, null, spec, key).map((l, i) => (i ? `${key} ${l.toLowerCase()}` : l));
        else if (spec.columnLabels) labels = cellLabels(cell, [`Column ${ci + 1}`], spec);
        else if (spec.headerLabels) labels = cellLabels(cell, [title(cell.textContent.trim()) || `Column ${ci + 1}`], spec);
        else labels = cellLabels(cell, presetRow?.[ci] || spec.allRows?.[ci], spec, null, spec.columnHeadings && ci === 1);
        return { span, labels };
      });
    }),
  };
}

/** A copy of the sample block for the library (multi blocks: the first MAX_ITEMS rows). */
function sampleHtml(block, spec) {
  const copy = block.cloneNode(true);
  if (spec.multi) [...copy.children].slice(MAX_ITEMS).forEach((r) => r.remove());
  return copy.outerHTML.replace(/(["(])\/media-da\//g, `$1https://content.da.live/${ORG_SITE}/media-da/`);
}

function metadataHtml(description, fields) {
  const head = `<tr><td colspan="${fields.maxCols}"><p>Fields</p></td></tr>`;
  const body = fields.rows.map((cells) => `<tr>${cells.map((c) => `<td${c.span > 1 ? ` colspan="${c.span}"` : ''}>${(c.labels.length ? c.labels : ['IGNORE']).map((l) => `<p>${esc(l)}</p>`).join('')}</td>`).join('')}</tr>`).join('');
  return `<div class="library-metadata"><div><div><p>description</p></div><div><p>${esc(description)}</p></div></div>`
    + `<div><div><p>fields</p></div><div><table><tbody>${head}${body}</tbody></table></div></div></div>`;
}

// --- documents
fs.mkdirSync(OUT, { recursive: true });
const byBlock = new Map();
[...variants.values()].forEach((v) => { if (!byBlock.has(v.name)) byBlock.set(v.name, []); byBlock.get(v.name).push(v); });
const index = [];
const manifest = {};
const missingSpec = [];
[...byBlock.keys()].sort().forEach((name) => {
  const spec = SPEC[name] || {};
  if (!SPEC[name]) missingSpec.push(name);
  const list = byBlock.get(name).sort((a, b) => (a.opts.length - b.opts.length) || b.uses.length - a.uses.length || a.key.localeCompare(b.key));
  const sections = [];
  const addVariant = (v, sample, heading, extra = {}) => {
    const opts = v.opts.map((o) => OPTION_NOTES[o] || o);
    const description = `${spec.description || title(name.replace(/-/g, ' '))}${opts.length ? ` (${opts.join(', ')})` : ''}.${extra.note ? ` ${extra.note}` : ''}`;
    const fields = fieldRows(sample.block, spec);
    const empty = spec.multi && !sample.block.children.length;
    // a multi block needs a first item for its fields; an empty sample gets the description only
    const meta = empty ? `<div class="library-metadata"><div><div><p>description</p></div><div><p>${esc(description)}</p></div></div></div>` : metadataHtml(description, fields);
    sections.push(`<div>${heading ? `<h2>${esc(heading)}</h2>` : ''}${sampleHtml(sample.block, spec)}${meta}</div>`);
    const pages = [...new Set(v.uses.map((u) => u.page))];
    manifest[`${v.key}${heading ? ` [${heading}]` : ''}`] = {
      block: name, variant: v.opts.join(', '), heading: heading || '', multi: !!spec.multi, sample: sample.page, pages, fieldsOmitted: empty, ...(extra.entry ? { entry: extra.entry } : {}), ...(sample.trimmed ? { trimmed: true } : {}),
    };
  };
  list.forEach((v) => {
    if (name === 'article-header') {
      // content variants: without and with the header video (row 1: image, then the .mp4 link)
      const plain = v.uses.filter((u) => u.firstOnPage && rowShape(u.d.rows[0]) === 'i');
      const video = v.uses.filter((u) => u.firstOnPage && rowShape(u.d.rows[0]) === 'it');
      const best = (us) => [...us].sort((a, b) => localeRank(a.page) - localeRank(b.page) || a.page.localeCompare(b.page))[0];
      addVariant({ ...v, uses: plain }, best(plain));
      if (video.length) addVariant({ ...v, uses: video }, best(video.filter((u) => / \{mobile\}/.test(u.block.innerHTML))) || best(video), 'Article header with video');
      return;
    }
    // one entry per structure the pages use (the first: the one the most blocks resolve against;
    // the Block Inspector edits every block of the variant with it), samples cut to the model
    const multi = !!spec.multi;
    const entries = chooseModels(v.uses.map((u) => u.d), multi);
    if (!entries.length) {
      addVariant(v, pickSample(v, spec));
      return;
    }
    const label = `${title(name.replace(/-/g, ' '))}${v.opts.length ? ` (${v.opts.join(', ')})` : ''}`;
    entries.forEach((entry, i) => {
      const sample = sampleFor(entry, v.uses, multi, i ? null : pickSample(v, spec));
      if (!i) {
        addVariant(v, sample);
        return;
      }
      addVariant({ ...v, uses: v.uses.filter((u) => entry.fit.includes(u.d)) }, sample, `${label}: ${describeModel(entry.model, multi)}`, {
        entry: i + 1,
        note: `Another structure of this variant (${entry.fit.length} blocks), for inserting it: the Block Inspector edits every block of the variant with the first table of the variant.`,
      });
    });
  });
  fs.writeFileSync(path.join(OUT, `${name}.html`), `<body><header></header><main>${sections.join('')}</main><footer></footer></body>\n`);
  index.push({ name: title(name.replace(/-/g, ' ')), path: `https://content.da.live/${ORG_SITE}/library/blocks/${name}` });
});

const editor = Object.entries(SPEC).filter(([n, s]) => s.multi && byBlock.has(n)).map(([block]) => ({ block, property: 'multi' })).sort((a, b) => a.block.localeCompare(b.block));
const options = [
  { blocks: 'fare-teaser, flight-search, price-bar', key: 'Cabin', values: 'Economy=E|Premium Economy=P|Business=B|First=F' },
  { blocks: 'blog-overview', key: 'Category', values: 'Explore the world=explore-the-world|Explore flying=explore-flying|Highlights=highlights' },
  { blocks: 'blog-overview', key: 'Hide filter', values: 'Yes=true|No=false' },
  { blocks: 'car-rental', key: 'Partner ID', values: 'SIXT=105.14|Hertz=105.13|Europcar=105.12|Rental car offers=105.11' },
  { blocks: 'destination-offer', key: 'Content languages', values: 'English=en|German=de' },
];
const sheet = (data) => ({
  total: data.length, limit: data.length, offset: 0, data, ':colWidths': [],
});
const json = {
  blocks: sheet(index), editor: sheet(editor), options: sheet(options), ':names': ['blocks', 'editor', 'options'], ':version': 3, ':type': 'multi-sheet',
};
fs.writeFileSync(path.join(CONTENT, 'library/blocks.json'), `${JSON.stringify(json, null, 2)}\n`);
fs.writeFileSync(path.join(root, 'tools/library/library-variants.json'), `${JSON.stringify(manifest, null, 1)}\n`);
console.log(`build-library: ${byBlock.size} block documents, ${Object.keys(manifest).length} variants (incl. content variants), editor ${editor.length}, options ${options.length}${missingSpec.length ? `; no spec: ${missingSpec.join(', ')}` : ''}`);
