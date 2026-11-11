/* eslint-disable max-len -- the notes */
/**
 * www's no-break spaces through the import (the brief after 527, item 1;
 * tools/reports/parity-2026-11-09/nbsp-proposal-cashub.md). The framework (the plugin's helix-importer:
 * DOMUtils.reviewParagraphs and reviewInlineElement replace &nbsp; in paragraphs and inline elements, MDUtils.cleanupMarkdown
 * every U+00A0 left in the markdown) writes them as plain spaces. guardNbsp, in every import script's onLoad (after the
 * transformers' onLoad, before the framework's steps), writes them as U+2007 (figure space: no www page has one, the framework leaves it); restoreNbsp
 * writes them back: withRestoredNbsp at every brand importer's collapse, import-batch.mjs after the bulk run, da-upload's
 * upload body. A text that is only no-break spaces (www's empty line, <p>&nbsp;</p>) is not guarded: the framework drops
 * it, as before. Attributes are left as they are. No Node API here: the import bundles take this file.
 */
export const NBSP_STAND_IN = '\u2007';
const NBSP_ALL = /\u00a0/g;
const NBSP_BLANK = /^[\s\u00a0]*$/;
const NBSP_SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);

/** The element's text nodes with a no-break space as the stand-in, in place; an element whose whole text is blank skipped. */
export function guardNbsp(root) {
  const visit = (el) => {
    if (!el || NBSP_SKIP_TAGS.has(el.tagName) || NBSP_BLANK.test(el.textContent || '')) return;
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        if (n.nodeValue.includes('\u00a0')) n.nodeValue = n.nodeValue.replace(NBSP_ALL, NBSP_STAND_IN);
      } else if (n.nodeType === 1) visit(n);
    });
  };
  visit(root);
  return root;
}

/** The stand-in (also as &#8199; &#x2007; &numsp;) back to U+00A0; idempotent. */
export const restoreNbsp = (html) => String(html).replace(/\u2007|&#8199;|&#x2007;|&numsp;/gi, '\u00a0');

/** The written documents restored in place (an unchanged file is not written); the list back, for collapseDocs. */
export function withRestoredNbsp(files, fs) {
  files.filter((f) => fs.existsSync(f)).forEach((f) => {
    const html = fs.readFileSync(f, 'utf8');
    const next = restoreNbsp(html);
    if (next !== html) fs.writeFileSync(f, next);
  });
  return files;
}

// www's empty line: a paragraph whose text is only no-break spaces (with or without <br>); in a tab or accordion
// panel it shows nothing at 1440 (the brief after 530: business, gesundes-reisen), elsewhere a line of the brand's size
const EMPTY_LINE = /<p(?:\s[^>]*)?>((?:\s|&nbsp;|&#160;|&#xa0;|\u00a0|<br\s*\/?>)*)<\/p>/gi;
const HAS_NBSP = /&nbsp;|&#160;|&#xa0;|\u00a0/i;
const IN_PANEL = '.accordion, .accordionitem, maui-collapsible-item, maui-tab-control-panel-responsive, .tabs, header, footer, nav';
const emptyLine = (p) => [...p.children].every((c) => c.tagName === 'BR') && (p.textContent || '').includes('\u00a0') && NBSP_BLANK.test(p.textContent || '');

/**
 * The snapshot with each run of n visible empty lines as one spacing marker {spacer-(n x size)} (the brief after 530,
 * item 1): the marker the collapse turns into a Spacer block, where the framework would drop the empty paragraph. String
 * based (the rest of the snapshot byte for byte); parse (linkedom's parseHTML) tells which empty lines are in a panel. A
 * snapshot whose paragraphs the parse and the string do not count alike comes back unchanged.
 */
export function emptyLineSpacers(html, { parse, size }) {
  const matches = [...html.matchAll(EMPTY_LINE)].filter((m) => HAS_NBSP.test(m[1]));
  if (!matches.length) return html;
  const { document } = parse(html);
  const lines = [...document.querySelectorAll('p')].filter(emptyLine);
  if (lines.length !== matches.length) return html;
  const visible = lines.map((p) => !p.closest(IN_PANEL));
  let out = '';
  let at = 0;
  let run = null;
  const flush = () => {
    if (!run) return;
    out += `<p>{spacer-${run.n * size}}</p>`;
    at = run.end;
    run = null;
  };
  matches.forEach((m, i) => {
    if (!visible[i]) {
      flush();
      return;
    }
    if (run && !html.slice(run.end, m.index).trim()) {
      run.n += 1;
      run.end = m.index + m[0].length;
      return;
    }
    flush();
    out += html.slice(at, m.index);
    run = { n: 1, end: m.index + m[0].length };
  });
  flush();
  return out + html.slice(at);
}

// an empty paragraph without a no-break space (<p></p>, <p><br></p>): the framework drops it too
// (spaces, tabs and line ends only: a no-break space is emptyLineSpacers' empty line)
const EMPTY_PARA = /<p(?:\s[^>]*)?>((?:[ \t\n\r\f]|<br\s*\/?>)*)<\/p>/gi;
const isEmptyPara = (p) => p.tagName === 'P' && [...p.children].every((c) => c.tagName === 'BR') && !(p.textContent || '').replace(/[ \t\n\r\f]/g, '');
// the sibling before / after, a stray <br> between blocks passed over (Brussels' rich text: </p><br><p></p>)
const neighbour = (el, dir) => { let n = el[dir]; while (n && n.tagName === 'BR') n = n[dir]; return n; };
// a text paragraph (not a marker paragraph such as an empty line's {spacer-N}) or a list
const isText = (el) => !!el && ((el.tagName === 'P' && !!(el.textContent || '').trim() && !/^\s*\{[^}]*\}\s*$/.test(el.textContent)) || /^(UL|OL)$/.test(el.tagName));

/**
 * www's empty paragraphs between two text paragraphs (standing order 5 of 2026-11-11, item 1; ema-cashub's row 2: Brussels'
 * rich text): an empty <p></p> takes one paragraph margin on www, a <p><br></p> a line and a margin; the framework drops
 * both. Each run of them whose neighbours are a text paragraph or a list (the same parent, not in a panel) as one spacing
 * marker: {spacer-(emptySize)} for a run of empty ones, {spacer-(n x brSize)} for a run with n line breaks. The collapse keeps
 * such a marker between two text elements on a theme with textSpacers (marker-collapse.mjs). A paragraph at a container's start
 * or end takes nothing on www and stays out. String based, as emptyLineSpacers; without sizes the snapshot as it is.
 */
export function emptyParagraphSpacers(html, { parse, emptySize, brSize }) {
  if (!emptySize && !brSize) return html;
  const matches = [...html.matchAll(EMPTY_PARA)];
  if (!matches.length) return html;
  const { document } = parse(html);
  const paras = [...document.querySelectorAll('p')].filter(isEmptyPara);
  if (paras.length !== matches.length) return html;
  // runs of consecutive empty paragraphs (siblings), with their text neighbours
  const take = new Map(); // index of a run's first match -> { last, px }
  for (let i = 0; i < paras.length; i += 1) {
    let j = i;
    while (j + 1 < paras.length && paras[j].nextElementSibling === paras[j + 1]) j += 1;
    const first = paras[i];
    const last = paras[j];
    const run = paras.slice(i, j + 1);
    const lines = run.filter((p) => p.querySelector('br')).length;
    const px = lines ? lines * (brSize || 0) : (emptySize || 0);
    if (px && isText(neighbour(first, 'previousElementSibling')) && isText(neighbour(last, 'nextElementSibling')) && !first.closest(IN_PANEL)) take.set(i, { last: j, px });
    i = j;
  }
  if (!take.size) return html;
  let out = '';
  let at = 0;
  take.forEach(({ last, px }, i) => {
    out += `${html.slice(at, matches[i].index)}<p>{spacer-${px}}</p>`;
    at = matches[last].index + matches[last][0].length;
  });
  return out + html.slice(at);
}
