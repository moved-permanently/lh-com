/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Brief 387: the lh-discover documents of de/en and de/de to www.discover-airlines.com as the user's
 * capture discover-parity-001 shows it (not a new import: the documents carry DA's image copies and
 * later fixes a re-import would undo). Each step changes only what it names:
 *  - addHeadingMarkers: a heading the import wrote without www's class gets its marker
 *    ({heading-copytext-large} etc.: www's h3.headline.heading-copytext-large in column views),
 *    from www's own markup of the same page; the level's default (h1 heading-large, h2
 *    heading-medium) and headings in cards, accordions and metadata stay as they are.
 *  - teaserGrids: www's teaser cards (a.teaser.card, .col-md-6) the import wrote as loose pairs of a
 *    linked picture and a linked heading become a carousel-cards grid two-up; the column-view markers
 *    around them go.
 *  - tabSets: www's maui-tab-control-responsive: the panels (found by the first text of each www
 *    panel; a picture just before it opens the panel) become Tab sections (scripts/section-tabs.js:
 *    section metadata Tab = the label, Tabs = 1), up to the text that follows the set on www; the
 *    section's own metadata stays with what comes before and after. In a panel, www's column views:
 *    picture + heading items (h2) as columns-media image | text rows, a run of picture + h3 items as
 *    one columns-media row of cells (an image opening a text cell). wwwBefore: between the title
 *    and the set only what www shows there stays (an older copy of the first panel goes).
 *  - footerTop: the search and country row goes (www's footer has neither); Follow us is a link
 *    column (badges, in-columns), as www's.
 * Usage: node tools/importer/discover-parity-387.mjs --capture <dir> [--docs <dir>] [--dry-run]
 *   (--capture: the unpacked discover-parity-001; --docs: default content-sites/lh-discover/content)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const PAGES = ['homepage', 'book/flights/flight-search', 'my-bookings/check-in/check-in-at-the-airport',
  'book/special-requests/families', 'my-bookings/check-in', 'my-bookings/services/additional-services',
  'discover/travel-classes/business-class', 'discover/services-on-board/entertainment', 'book/flights/offers',
  'travel-inspiration/inspiration/destinations/santorini', 'travel-inspiration/inspiration/destinations/punta-cana',
  'my-bookings/manage/customer-service', 'book/baggage'];
// the pages whose tab set follows an older copy of its first panel (www shows nothing between its title and the set)
const STALE_BEFORE = new Set(['my-bookings/check-in/check-in-at-the-airport']);
const MARKER = /\s*\{[a-z0-9 -]+\}\s*$/;
const ADDED = new Set(['heading-large', 'heading-medium', 'heading-small', 'heading-copytext-large', 'heading-copytext-medium']);
const DEFAULT = { H1: 'heading-large', H2: 'heading-medium' };

/** Text for matching: letters and digits only, lower case (soft hyphens, tokens and spacing aside). */
export const compact = (t) => String(t || '')
  .replace(/\{[^}]*\}/g, '')
  .replace(/[\u00ad\u200b]/g, '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, '');
/** Text as www's headline: spacing folded, lower case. */
export const norm = (t) => String(t || '')
  .replace(/[\u00ad\u200b]/g, '')
  .replace(/\u00a0/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
const isPicPara = (el) => el.tagName === 'P' && !!el.querySelector('picture') && !el.textContent.trim();
const isMarkerPara = (el, re = /^\{[a-z0-9 -]+\}$/) => el.tagName === 'P' && re.test(el.textContent.trim()) && !el.querySelector('picture');
const isMeta = (el) => el.tagName === 'DIV' && /\b(section-metadata|metadata)\b/.test(el.className);
const lastText = (el) => {
  const walker = el.ownerDocument.createTreeWalker(el, 4);
  let last = null;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.textContent.trim()) last = n;
  return last;
};

/** www's heading classes into the headings that lost them; returns how many got one. */
export function addHeadingMarkers(main, classesByText) {
  let n = 0;
  main.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    if (h.closest('.carousel-cards, .accordion-columns, .metadata, .section-metadata, .cards-icon')) return;
    if (MARKER.test(h.textContent)) return;
    const cls = classesByText[norm(h.textContent)];
    if (!cls || !ADDED.has(cls) || DEFAULT[h.tagName] === cls) return;
    const t = lastText(h);
    if (!t) return;
    t.textContent = `${t.textContent.replace(/\s+$/, '')} {${cls}}`;
    n += 1;
  });
  return n;
}

const stripColumnTokens = (el) => {
  const t = lastText(el);
  if (!t) return;
  t.textContent = t.textContent.replace(/\s*\{([a-z0-9 -]+)\}\s*$/, (m, tokens) => {
    const keep = tokens.split(' ').filter((x) => !x.startsWith('column-'));
    return keep.length ? ` {${keep.join(' ')}}` : '';
  });
};

/** Loose teaser pairs (linked picture, linked heading) into carousel-cards grid two-up blocks. */
export function teaserGrids(main) {
  let blocks = 0;
  [...main.children].forEach((section) => {
    const kids = [...section.children];
    const isPair = (k) => k + 1 < kids.length && isPicPara(kids[k]) && kids[k].querySelector('a[href]') && isHeading(kids[k + 1]) && kids[k + 1].querySelector('a[href]');
    const isColumnMark = (el) => el && isMarkerPara(el, /^\{column-[a-z -]+\}$/);
    for (let i = 0; i < kids.length; i += 1) {
      let j = i;
      const pairs = [];
      const marks = [];
      // a run of pairs; www's rows of a column view are separated by column markers only
      for (;;) {
        let k = j;
        const skipped = [];
        while (pairs.length && isColumnMark(kids[k])) { skipped.push(kids[k]); k += 1; }
        if (!isPair(k)) break;
        marks.push(...skipped);
        pairs.push([kids[k], kids[k + 1]]);
        j = k + 2;
      }
      if (pairs.length >= 2) {
        const doc = section.ownerDocument;
        const block = doc.createElement('div');
        block.className = 'carousel-cards grid two-up';
        section.insertBefore(block, pairs[0][0]);
        pairs.forEach(([p, h]) => {
          const row = doc.createElement('div');
          const media = doc.createElement('div');
          media.append(p.querySelector('picture'));
          const body = doc.createElement('div');
          stripColumnTokens(h);
          body.append(h);
          row.append(media, body);
          block.append(row);
          p.remove();
        });
        marks.forEach((m) => m.remove());
        if (isColumnMark(kids[i - 1]) && /start/.test(kids[i - 1].textContent)) kids[i - 1].remove();
        if (isColumnMark(kids[j]) && /end/.test(kids[j].textContent)) kids[j].remove();
        blocks += 1;
        i = j - 1;
      }
    }
  });
  return blocks;
}

const metaBlock = (doc, rows) => {
  const m = doc.createElement('div');
  m.className = 'section-metadata';
  rows.forEach(([k, v]) => {
    const r = doc.createElement('div');
    const a = doc.createElement('div');
    const b = doc.createElement('div');
    a.textContent = k;
    b.textContent = v;
    r.append(a, b);
    m.append(r);
  });
  return m;
};

/** In a panel: picture + h2 items as image | text rows, a run of picture + h3 items as one row of cells. */
function panelColumns(section) {
  const doc = section.ownerDocument;
  const kids = [...section.children].filter((el) => !isMeta(el));
  const items = [];
  for (let i = 0; i < kids.length; i += 1) {
    if (isPicPara(kids[i]) && kids[i + 1] && isHeading(kids[i + 1])) {
      const level = kids[i + 1].tagName;
      let j = i + 2;
      while (j < kids.length && !isPicPara(kids[j]) && !(level === 'H2' && kids[j].tagName === 'H3') && !(isHeading(kids[j]) && kids[j].tagName <= level && !/heading-copytext/.test(kids[j].textContent)) && kids[j].tagName !== 'DIV') j += 1;
      items.push({ start: i, end: j, level });
      i = j - 1;
    }
  }
  // consecutive items of one kind make one block
  const groups = [];
  items.forEach((it) => {
    const g = groups[groups.length - 1];
    if (g && g.level === it.level && g.end === it.start) { g.items.push(it); g.end = it.end; } else groups.push({ level: it.level, items: [it], end: it.end });
  });
  groups.forEach((g) => {
    if (g.level === 'H3' && g.items.length < 2) return;
    const block = doc.createElement('div');
    block.className = 'columns-media';
    const anchor = kids[g.items[0].start];
    section.insertBefore(block, anchor);
    if (g.level === 'H3') {
      const row = doc.createElement('div');
      g.items.forEach((it) => {
        const cell = doc.createElement('div');
        kids.slice(it.start, it.end).forEach((el) => cell.append(el));
        row.append(cell);
      });
      block.append(row);
    } else {
      g.items.forEach((it) => {
        const row = doc.createElement('div');
        const media = doc.createElement('div');
        const text = doc.createElement('div');
        media.append(kids[it.start]);
        kids.slice(it.start + 1, it.end).forEach((el) => text.append(el));
        row.append(media, text);
        block.append(row);
      });
    }
  });
}

/**
 * www's tab sets into Tab sections. sets: [{ panels: [[label, firstText], ...], after }];
 * opts.wwwBefore: www's text between the page's title and the set; only that stays there.
 * Returns how many sets were made; a set whose texts are not all found changes nothing.
 */
export function tabSets(main, sets, opts = {}) {
  let made = 0;
  sets.forEach((set) => {
    const sections = [...main.children];
    let done = false;
    sections.forEach((section) => {
      if (done) return;
      const kids = [...section.children];
      const text = (k) => compact(kids.slice(k, k + 4).map((el) => el.textContent).join(' '));
      const starts = [];
      let from = 0;
      set.panels.forEach(([, first]) => {
        const want = compact(first).slice(0, 40);
        const k = kids.findIndex((el, idx) => idx >= from && !isMeta(el) && text(idx).startsWith(want));
        starts.push(k);
        from = k + 1;
      });
      if (starts.some((k) => k < 0)) return;
      const afterWant = compact(set.after).slice(0, 24);
      let end = kids.findIndex((el, idx) => idx > starts[starts.length - 1] && !isMeta(el) && text(idx).startsWith(afterWant));
      if (end < 0) end = kids.findIndex((el) => isMeta(el));
      if (end < 0) end = kids.length;
      while (end > 0 && isMarkerPara(kids[end - 1], /^\{(divider|spacer)-\d+( from-768)?\}$/)) end -= 1;
      const open = starts.map((k) => (k > 0 && isPicPara(kids[k - 1]) ? k - 1 : k));
      const doc = section.ownerDocument;
      const ownMeta = kids.find((el) => el.tagName === 'DIV' && el.className === 'section-metadata');
      let beforeEls = kids.slice(0, open[0]).filter((el) => el !== ownMeta);
      if (typeof opts.wwwBefore === 'string') {
        // between the title and the set: what www shows there stays, the rest (an older copy of
        // the first panel, its picture) goes
        const h1 = beforeEls.findIndex((el) => el.tagName === 'H1');
        const shown = compact(opts.wwwBefore);
        const stale = beforeEls.slice(h1 + 1).filter((el) => !isMeta(el) && !(compact(el.textContent) && shown.includes(compact(el.textContent))));
        stale.forEach((el) => el.remove());
        beforeEls = beforeEls.filter((el) => !stale.includes(el));
      }
      const panels = open.map((k, n) => kids.slice(k, n + 1 < open.length ? open[n + 1] : end));
      const afterEls = kids.slice(end).filter((el) => el !== ownMeta);
      const newSections = [];
      if (beforeEls.length) {
        const s = doc.createElement('div');
        beforeEls.forEach((el) => s.append(el));
        if (ownMeta) s.append(ownMeta.cloneNode(true));
        newSections.push(s);
      }
      panels.forEach((els, n) => {
        const s = doc.createElement('div');
        els.forEach((el) => s.append(el));
        panelColumns(s);
        s.append(metaBlock(doc, [['Tab', set.panels[n][0]], ['Tabs', '1']]));
        newSections.push(s);
      });
      if (afterEls.length) {
        const s = doc.createElement('div');
        afterEls.forEach((el) => s.append(el));
        if (ownMeta) s.append(ownMeta.cloneNode(true));
        newSections.push(s);
      }
      newSections.forEach((s) => main.insertBefore(s, section));
      section.remove();
      made += 1;
      done = true;
    });
  });
  return made;
}

/** The footer's search and country row goes; Follow us becomes a link column. */
export function footerTop(main) {
  const top = [...main.children].find((s) => /:search:/.test(s.textContent) && !s.querySelector('ul, h2, h3'));
  if (!top) return false;
  top.remove();
  main.querySelectorAll('.section-metadata > div').forEach((row) => {
    const [k, v] = row.children;
    if (k && v && /^style$/i.test(k.textContent.trim()) && v.textContent.trim() === 'badges') v.textContent = 'badges, in-columns';
  });
  return true;
}

/* ------------------------------------------------------------------ capture --------- */

const unescape = (t) => t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&#x27;/g, '’')
  .replace(/&[a-z]+;/g, ' ');
const textOf = (fragment) => unescape(fragment
  .replace(/<(script|style|template)\b[\s\S]*?<\/\1>/g, ' ')
  .replace(/<[^>]+>/g, ' '))
  .replace(/\s+/g, ' ')
  .trim();

/** www's heading classes of a captured page: { norm(text): 'heading-…' }. */
export function wwwHeadingClasses(html) {
  const out = {};
  [...html.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/g)].forEach((m) => {
    const cls = (m[2].match(/class="([^"]*)"/) || [])[1] || '';
    const c = cls.split(/\s+/).find((x) => x.startsWith('heading-'));
    const t = norm(textOf(m[3]));
    if (c && t && !(t in out)) out[t] = c;
  });
  return out;
}

/** www's top-level tab sets: [{ panels: [[label, firstText]], after }]. */
export function wwwTabSets(html) {
  const re = /<(\/?)(maui-tab-control-responsive|maui-tab-control-panel-responsive)\b([^>]*)>/g;
  const stack = [];
  const sets = [];
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const [, close, tag, attrs] = m;
    if (!close) {
      const node = { tag, start: re.lastIndex, panels: [] };
      if (tag.endsWith('panel-responsive')) {
        node.name = unescape((attrs.match(/\bname="([^"]*)"/) || [])[1] || '');
        if (stack.length) stack[stack.length - 1].panels.push(node);
      } else node.top = !stack.some((x) => x.tag === 'maui-tab-control-responsive');
      stack.push(node);
    } else {
      const node = stack.pop();
      if (tag.endsWith('panel-responsive')) node.first = textOf(html.slice(node.start, m.index)).slice(0, 120);
      else if (node.top) sets.push({ panels: node.panels.map((p) => [p.name, p.first]), after: textOf(html.slice(re.lastIndex, re.lastIndex + 8000)).slice(0, 120) });
    }
  }
  return sets;
}

/* ------------------------------------------------------------------ cli ------------- */

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
  const capture = opt('--capture');
  const docs = opt('--docs') || path.join(root, 'content-sites/lh-discover/content');
  const dry = argv.includes('--dry-run');
  if (!capture) {
    console.error('usage: --capture <discover-parity-001 dir> [--docs <dir>] [--dry-run]');
    process.exit(2);
  }
  ['en', 'de'].forEach((lang) => {
    [...PAGES, 'footer'].forEach((p) => {
      const file = path.join(docs, `de/${lang}/${p}.plain.html`);
      if (!fs.existsSync(file)) { console.log(`de/${lang}/${p}: no document`); return; }
      const before = fs.readFileSync(file, 'utf8');
      const { document } = parseHTML(`<html><body><main>${before}</main></body></html>`);
      const main = document.querySelector('main');
      const done = [];
      if (p === 'footer') {
        if (footerTop(main)) done.push('footer top row');
      } else {
        const www = fs.readFileSync(path.join(capture, `de-${lang}-${p.replace(/\//g, '-')}-1440.html`), 'utf8');
        const sets = wwwTabSets(www);
        if (sets.length) {
          const between = www.slice(www.indexOf('</h1>') + 5, www.indexOf('<maui-tab-control-responsive'));
          const n = tabSets(main, sets, STALE_BEFORE.has(p) ? { wwwBefore: textOf(between) } : {});
          done.push(`${n}/${sets.length} tab sets`);
        }
        const g = teaserGrids(main);
        if (g) done.push(`${g} teaser grids`);
        const h = addHeadingMarkers(main, wwwHeadingClasses(www));
        if (h) done.push(`${h} heading markers`);
      }
      const after = main.innerHTML;
      console.log(`de/${lang}/${p}: ${done.join(', ') || 'unchanged'}`);
      if (!dry && after !== before) fs.writeFileSync(file, after);
    });
  });
}
