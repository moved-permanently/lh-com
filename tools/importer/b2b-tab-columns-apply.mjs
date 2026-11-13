/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Group for Business' text columns in tab panels into the documents as they are (DA's copy plus the
 * delta, not a new import: DA's copies hold the tab sets' later options and market sections). The
 * standing order of 2026-11-10 evening, decision 3: www sets a tab panel's text in a column view of
 * two or three items side by side (the Allegris start-of-booking pages: "Lufthansa Allegris from/to
 * Frankfurt (FRA)" beside "... Munich (MUC)"); the import has no rule for a column view without an
 * image in a tab panel, so DA holds the items one under the other. Per document and www view (the
 * snapshot): the view's items each start with a heading and the view ends its panel; the Tab
 * section in DA's copy holding those headings in order gets, from the first item's heading to the
 * section's end (its section metadata aside), a Columns Media block, one cell per item. A view
 * that does not fit (an item without a heading, more content after it in the panel, headings not
 * found in one section) stays as it is.
 * Usage: node tools/importer/b2b-tab-columns-apply.mjs --list paths.txt --docs <dir> --snapshots <dir> --out <dir>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
const HEADING = 'h1, h2, h3, h4, h5, h6';
const isMetaBlock = (el) => el.tagName === 'DIV' && /^(section-)?metadata$/.test(el.className.split(' ')[0]);

/** www's text-only column views that end their tab panel: [[item heading text, ...], ...]. */
export function tabViews(snapshot) {
  const { document } = parseHTML(snapshot);
  const views = [];
  document.querySelectorAll('maui-tab-control-panel-responsive').forEach((panel) => {
    [...panel.querySelectorAll('.twocolumn, .threecolumn')]
      .filter((v) => !v.querySelector('img, iframe, form, .teaser, .table, .accordion') && !v.parentElement.closest('.twocolumn, .threecolumn, .fourcolumn'))
      .forEach((v) => {
        const items = [...v.querySelectorAll('.column-view-item')].filter((it) => !v.contains(it.parentElement.closest('.column-view-item')));
        const heads = items.map((it) => text(it.querySelector(HEADING)));
        let rest = '';
        for (let n = v.nextElementSibling; n; n = n.nextElementSibling) rest += text(n);
        if (items.length >= 2 && heads.every(Boolean) && !rest) views.push(heads);
      });
  });
  return views;
}

/** Text as letters and digits only (www's and DA's whitespace, icons and punctuation differ). */
const key = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

/**
 * www's two-column views in tab panels with one text item beside empty ones (meals-on-board: the
 * text in the left half): [{ at, of, text }] (the filled item's index, the item count, its text).
 */
export function halfViews(snapshot) {
  const { document } = parseHTML(snapshot);
  // screen-reader texts (a link's new-tab and external-site notes) are not DA's text
  document.querySelectorAll('.sr-only, maui-screen-reader-label').forEach((el) => el.remove());
  const views = [];
  document.querySelectorAll('maui-tab-control-panel-responsive .twocolumn').forEach((v) => {
    if (v.querySelector('img, iframe, form, .teaser, .table, .accordion') || v.parentElement.closest('.twocolumn, .threecolumn, .fourcolumn')) return;
    const items = [...v.querySelectorAll('.column-view-item')].filter((it) => !v.contains(it.parentElement.closest('.column-view-item')));
    const filled = items.map((it, i) => [i, key(it.textContent)]).filter(([, t]) => t);
    // an empty item holds nothing: an image component whose picture loads later is not empty
    const blank = items.filter((it) => !key(it.textContent) && !it.querySelector('.image, .videoViewer, picture, video'));
    if (items.length === 2 && filled.length === 1 && blank.length === 1) views.push({ at: filled[0][0], of: 2, text: filled[0][1] });
  });
  return views;
}

/**
 * The document with each of www's tab views as a Columns Media block in its Tab section.
 * @returns {{html: string, views: string[]}}
 */
export function applyTabColumns(doc, snapshot) {
  const { document } = parseHTML(`<html><body><main>${doc}</main></body></html>`);
  const main = document.querySelector('main');
  const made = [];
  tabViews(snapshot).forEach((heads) => {
    const section = [...main.children].find((s) => {
      const hs = [...s.children].filter((el) => el.matches(HEADING)).map(text);
      let k = 0;
      hs.forEach((h) => { if (h === heads[k]) k += 1; });
      return k === heads.length;
    });
    if (!section || section.querySelector(':scope > .columns-media')) return;
    const kids = [...section.children];
    const starts = [];
    let k = 0;
    kids.forEach((el, i) => { if (k < heads.length && el.matches(HEADING) && text(el) === heads[k]) { starts.push(i); k += 1; } });
    const end = kids.findIndex((el, i) => i > starts[0] && isMetaBlock(el));
    const stop = end < 0 ? kids.length : end;
    const block = document.createElement('div');
    block.className = 'columns-media';
    const row = document.createElement('div');
    starts.forEach((s, j) => {
      const cell = document.createElement('div');
      cell.append(...kids.slice(s, j + 1 < starts.length ? starts[j + 1] : stop));
      row.append(cell);
    });
    block.append(row);
    if (stop < kids.length) kids[stop].before(block);
    else section.append(block);
    made.push(heads.join(' | '));
  });
  // a text beside an empty item: the run of a section's elements whose text is the item's
  halfViews(snapshot).forEach(({ at, of, text: want }) => {
    [...main.children].some((section) => {
      if (section.matches('.columns-media') || !section.children.length) return false;
      const kids = [...section.children];
      for (let i = 0; i < kids.length; i += 1) {
        // the run's texts in www's item, in order, from its start; www's links carry notes DA has
        // not (screen-reader labels), up to 250 letters between two of them and at its end
        let pos = 0;
        let covered = 0;
        for (let j = i; j < kids.length && !isMetaBlock(kids[j]) && kids[j].tagName !== 'DIV'; j += 1) {
          const k = key(kids[j].textContent);
          const idx = k ? want.indexOf(k, pos) : pos;
          if (idx < 0 || (j === i ? idx !== 0 : idx - pos > 250)) break;
          pos = idx + k.length;
          covered += k.length;
          const next = kids[j + 1] && key(kids[j + 1].textContent);
          const nextFits = next && want.indexOf(next, pos) >= 0 && want.indexOf(next, pos) - pos <= 250;
          if (!nextFits && want.length - pos <= 250 && covered >= want.length * 0.6) {
            const block = document.createElement('div');
            block.className = 'columns-media';
            const row = document.createElement('div');
            for (let c = 0; c < of; c += 1) row.append(document.createElement('div'));
            kids[i].before(block);
            row.children[at].append(...kids.slice(i, j + 1));
            block.append(row);
            made.push(`half: ${text(row.children[at]).slice(0, 40)}`);
            return true;
          }
        }
      }
      return false;
    });
  });
  return { html: main.innerHTML, views: made };
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const opt = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : ''; };
  fs.readFileSync(opt('list'), 'utf8').split('\n').map((x) => x.trim()).filter(Boolean)
    .forEach((p) => {
      const from = path.join(opt('docs'), `${p}.plain.html`);
      const snap = path.join(opt('snapshots'), `${p}.html`);
      if (!fs.existsSync(from) || !fs.existsSync(snap)) { console.log(`${p}\tmissing`); return; }
      const r = applyTabColumns(fs.readFileSync(from, 'utf8'), fs.readFileSync(snap, 'utf8'));
      const to = path.join(opt('out'), `${p}.plain.html`);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.writeFileSync(to, r.html);
      console.log(`${p}\t${r.views.length} blocks\t${r.views.join(' ; ')}`);
    });
}
