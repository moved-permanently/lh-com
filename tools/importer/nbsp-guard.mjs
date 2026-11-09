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
