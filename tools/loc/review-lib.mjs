/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom: dev dependency */
/**
 * The pure parts of clear-review.mjs and block-check.mjs (tests: test/loc-review.test.mjs).
 *
 * Why: before da-nx 1.29.1 a rejected incoming block with the same hash as one of the page's own
 * blocks (a heading, only the id differs) made the next merge drop the page's own block without a
 * mark; #930 fixed it (adobe/da-nx 69006f3b nx/blocks/loc/regional-diff/regional-diff.js 434-443).
 * Checking every target after every app step still catches what a step loses; the linked-image
 * marks no editor action resolves go before a rollout (removeLinkedImageMarks).
 */
import { parseHTML } from 'linkedom';

const doc = (html) => parseHTML(/^\s*<html/i.test(html) ? html : `<html><head></head>${/<body/i.test(html) ? html : `<body>${html}</body>`}</html>`).document;
const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();

/** The rows of a da-metadata block as {key: text}. */
export function daMetadataRows(el) {
  return Object.fromEntries([...(el?.children || [])]
    .filter((row) => row.children.length >= 2)
    .map((row) => [clean(row.children[0].textContent).toLowerCase(), clean(row.children[1].textContent)]));
}

/**
 * The document without its da-metadata block(s): {html, removed: [rows], changed}. The rest of
 * the document is kept byte for byte (the block is cut out of the source string).
 */
export function removeDaMetadata(html) {
  const d = doc(html);
  const blocks = [...d.querySelectorAll('.da-metadata')];
  if (!blocks.length) return { html, removed: [], changed: false };
  let out = html;
  blocks.forEach((b) => {
    const at = out.indexOf(b.outerHTML);
    if (at >= 0) out = out.slice(0, at) + out.slice(at + b.outerHTML.length);
    else b.remove();
  });
  if (out === html) out = d.querySelector('body').outerHTML;
  return { html: out, removed: blocks.map(daMetadataRows), changed: true };
}

/** Where an element sits: an incoming merge block (da-diff-deleted), else the page. */
const incoming = (el) => Boolean(el.closest('da-diff-deleted, da-loc-deleted'));

/**
 * The items a step must not lose: headings, paragraphs, images and blocks, without what the DA
 * editor re-serialises (heading ids, <p> wrappers in metadata cells, <source> in pictures) and
 * without the da-metadata block. Each: {kind, text, incoming}.
 * - heading: "h2 Text"; paragraph: its text (paragraphs inside metadata cells are the cell);
 * - metadata: "key: value" per row of the metadata block;
 * - image: the image's path (query and host dropped);
 * - block: the block's classes ("columns-media sidebar").
 */
export function blockItems(html) {
  const d = doc(html);
  d.querySelectorAll('.da-metadata').forEach((e) => e.remove());
  const main = d.querySelector('main') || d.querySelector('body');
  const items = [];
  const add = (kind, text, el) => { if (clean(text)) items.push({ kind, text: clean(text), incoming: incoming(el) }); };
  main.querySelectorAll('div.metadata').forEach((block) => {
    [...block.children].forEach((row) => {
      if (row.children.length >= 2) add('metadata', `${clean(row.children[0].textContent)}: ${clean(row.children[1].textContent)}`, row);
    });
  });
  main.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => add('heading', `${h.tagName.toLowerCase()} ${h.textContent}`, h));
  main.querySelectorAll('p').forEach((p) => {
    if (p.closest('div.metadata')) return;
    add('paragraph', p.textContent, p);
  });
  main.querySelectorAll('img').forEach((img) => {
    const src = String(img.getAttribute('src') || '').replace(/^https?:\/\/[^/]+/, '').replace(/[?#].*$/, '');
    add('image', src, img);
  });
  main.querySelectorAll('div[class]').forEach((b) => {
    if (b.classList.contains('metadata') || b.classList.contains('da-metadata')) return;
    // a block: a div with a class directly in a section (main > div > div[class]), merge marks
    // (<da-diff-deleted>, <da-loc-*>) around it not counted
    let p = b.parentElement;
    while (p && /^DA-/.test(p.tagName)) p = p.parentElement;
    if (!p || p.parentElement !== main) return;
    add('block', b.className, b);
  });
  return items;
}

/**
 * The items of `before` that `after` lacks (as a multiset: a heading twice before needs two
 * after). An item found after only inside an incoming merge block counts as missing (it goes
 * when that block is rejected) and says so. Returns [{kind, text, note}].
 */
export function missingItems(beforeHtml, afterHtml) {
  const key = (i) => `${i.kind}\u0000${i.text}`;
  const pool = new Map();
  const pending = new Map();
  blockItems(afterHtml).forEach((i) => {
    const m = i.incoming ? pending : pool;
    m.set(key(i), (m.get(key(i)) || 0) + 1);
  });
  const missing = [];
  blockItems(beforeHtml).filter((i) => !i.incoming).forEach((i) => {
    const k = key(i);
    if (pool.get(k)) {
      pool.set(k, pool.get(k) - 1);
      return;
    }
    const note = pending.get(k) ? 'only in an incoming merge block (gone if that block is rejected)' : 'not in the page after the step';
    if (pending.get(k)) pending.set(k, pending.get(k) - 1);
    missing.push({ kind: i.kind, text: i.text, note });
  });
  return missing;
}

/**
 * A link around a picture (`<a …><picture>…</picture></a>` in a section) gets `da-diff-added=""`
 * on the `<a>` after a merge (da-nx 1.29.1, 69006f3b; checked on a test site 2026-11-01). No
 * editor action (a block's Local/Upstream, Keep All Local/Upstream) resolves it, and the rollout
 * then refuses the page as having unmerged changes. The document without that mark on those
 * links only: {html, removed: [{href, image}], changed}. Every other mark stays (marked
 * paragraphs, marked text links, merge blocks, the da-metadata block); the attribute is cut out of
 * the link's opening tag, the rest of the document is kept byte for byte.
 */
export function removeLinkedImageMarks(html) {
  const removed = [];
  // an <a> whose whole content is one picture (whitespace around it allowed)
  const re = /<a\b([^>]*)>(\s*<picture\b(?:(?!<\/picture>)[\s\S])*<\/picture>\s*)<\/a>/g;
  const out = html.replace(re, (whole, attrs, inner) => {
    if (!/\sda-diff-added(?:="[^"]*")?(?=[\s>]|$)/.test(attrs)) return whole;
    const kept = attrs.replace(/\s+da-diff-added(?:="[^"]*")?(?=[\s>]|$)/, '');
    const href = (kept.match(/\shref="([^"]*)"/) || [])[1] || '';
    const image = (inner.match(/<img\b[^>]*\ssrc="([^"]*)"/) || [])[1] || '';
    removed.push({ href, image });
    return `<a${kept}>${inner}</a>`;
  });
  return { html: out, removed, changed: removed.length > 0 };
}
