/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Group for Business' loose teasers into the documents as they are (DA's copy plus the delta, not a
 * new import: DA's copies hold market sections and later fixes a re-import would undo). The
 * standing order of 2026-11-10 evening, decision 3: documents imported before the info template's
 * two-up teaser rule (65afd3a2, 2026-11-06) hold www's teaser cards as loose content, per card a
 * paragraph with a linked picture, an H3 / H4 and a paragraph, drawn full width one under the other
 * (the airlines-at-a-glance pages: 45 to 55 % at 1440 against b2b-parity-006). Per document:
 * - each run of two or more such cards becomes the Carousel Cards block today's import writes for
 *   it (the import of the document's snapshot, --imported: the block whose card headings are the
 *   run's, in order; its class taken without space-* options, e.g. "carousel-cards grid two-up");
 *   a run the import has no such block for stays as it is;
 * - the H1's section gets the section style H1 compact where today's import gives it (www's title
 *   in heading-small: THEMES.b2b headingChoices.h1.compact).
 * Everything else of the document stays as it is (its pictures, links, ids, sections, metadata).
 * Usage: node tools/importer/b2b-teaser-grids-apply.mjs --list paths.txt --docs <dir> --imported <dir> --out <dir>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
const isPicturePara = (el) => el && el.tagName === 'P' && el.children.length === 1 && el.querySelector(':scope > a > picture')
  && !text(el);
const isCardHeading = (el) => el && /^H[34]$/.test(el.tagName);
const isCardText = (el) => el && el.tagName === 'P' && !el.querySelector('picture') && !!text(el);

/** The runs of loose cards among a section's children: [[pic, heading, text], ...] of two or more. */
export function looseRuns(section) {
  const kids = [...section.children];
  const runs = [];
  let run = [];
  for (let i = 0; i < kids.length;) {
    if (isPicturePara(kids[i]) && isCardHeading(kids[i + 1]) && isCardText(kids[i + 2])) {
      run.push(kids.slice(i, i + 3));
      i += 3;
    } else {
      if (run.length >= 2) runs.push(run);
      run = [];
      i += 1;
    }
  }
  if (run.length >= 2) runs.push(run);
  return runs;
}

/** The Carousel Cards blocks of a document: [{className, headings}]. */
const gridsOf = (main) => [...main.querySelectorAll('div.carousel-cards')].map((b) => ({
  className: b.className,
  headings: [...b.querySelectorAll(':scope > div > div > :is(h3, h4)')].map(text),
}));

const h1Compact = (main) => {
  const h1 = main.querySelector(':scope > div > h1');
  const meta = h1 && h1.parentElement.querySelector(':scope > .section-metadata');
  return !!meta && [...meta.children].some((row) => /^style$/i.test(text(row.children[0])) && /\bh1-compact\b/i.test(text(row.children[1])));
};

/**
 * The document with its loose card runs as the import's blocks and its H1 section's style.
 * @returns {{html: string, grids: string[], h1: boolean}}
 */
export function applyTeaserGrids(doc, imported) {
  const { document } = parseHTML(`<html><body><main>${doc}</main></body></html>`);
  const main = document.querySelector('main');
  const ref = parseHTML(`<html><body><main>${imported}</main></body></html>`).document.querySelector('main');
  const grids = gridsOf(ref);
  const made = [];
  [...main.children].forEach((section) => looseRuns(section).forEach((run) => {
    const heads = run.map(([, h]) => text(h));
    const block = grids.find((g) => g.headings.length === heads.length && g.headings.every((h, k) => h === heads[k]));
    if (!block) return;
    const el = document.createElement('div');
    // the layout options only: a space-* option is the import's spacing marker there, which DA's
    // copy has as it is around the run
    el.className = block.className.split(/\s+/).filter((c) => !/^space-/.test(c)).join(' ');
    run.forEach(([pic, h, para]) => {
      const row = document.createElement('div');
      const media = document.createElement('div');
      media.append(pic.querySelector('picture'));
      const body = document.createElement('div');
      const p = document.createElement('p');
      p.textContent = text(para);
      body.append(h, p);
      row.append(media, body);
      el.append(row);
    });
    run[0][0].before(el);
    run.forEach(([pic, , para]) => { pic.remove(); para.remove(); });
    made.push(`${el.className}: ${heads.join(' | ')}`);
  }));
  let h1 = false;
  const title = main.querySelector(':scope > div > h1');
  if (title && h1Compact(ref) && !h1Compact(main)) {
    const section = title.parentElement;
    const meta = section.querySelector(':scope > .section-metadata');
    const style = meta && [...meta.children].find((row) => /^style$/i.test(text(row.children[0])));
    if (style) {
      style.children[1].textContent = `${text(style.children[1])}, h1-compact`;
    } else if (meta) {
      meta.insertAdjacentHTML('beforeend', '<div><div>Style</div><div>h1-compact</div></div>');
    } else {
      section.insertAdjacentHTML('beforeend', '<div class="section-metadata"><div><div>Style</div><div>h1-compact</div></div></div>');
    }
    h1 = true;
  }
  return { html: main.innerHTML, grids: made, h1 };
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const opt = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : ''; };
  const paths = fs.readFileSync(opt('list'), 'utf8').split('\n').map((x) => x.trim()).filter(Boolean);
  paths.forEach((p) => {
    const from = path.join(opt('docs'), `${p}.plain.html`);
    const ref = path.join(opt('imported'), `${p}.plain.html`);
    if (!fs.existsSync(from) || !fs.existsSync(ref)) { console.log(`${p}\tmissing`); return; }
    const r = applyTeaserGrids(fs.readFileSync(from, 'utf8'), fs.readFileSync(ref, 'utf8'));
    const to = path.join(opt('out'), `${p}.plain.html`);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, r.html);
    console.log(`${p}\t${r.grids.length} blocks${r.h1 ? ', H1 compact' : ''}\t${r.grids.join(' ; ')}`);
  });
}
