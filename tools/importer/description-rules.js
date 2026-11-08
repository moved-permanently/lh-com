/* eslint-disable max-len -- the rules' examples */
/**
 * A page's description when www has none: the first real text paragraph, else the first heading
 * (briefs 490 and 494). One set of rules for description-fix.mjs (the documents in DA) and the
 * importer's cleanup (lufthansa-cleanup.js ensureDescription, in every import bundle), so a
 * re-import writes the description description-fix.mjs would. No linkedom here: the bundles take
 * this file; any DOM works (the importer's, linkedom's).
 */
import { stripStyleMarkers } from '../../scripts/style-markers.js';

export const clean = (s) => String(s || '')
  .replace(/[\u200B-\u200D\uFEFF]/g, '')
  .replace(/\u00A0/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
// a date line alone (B2B news: "(10. März 2026)", "(1 September 2026)")
const DATE_ONLY = /^\(?(?:\d{1,2}\.?\s+\p{L}+\.?|\p{L}+\.?\s+\d{1,2},?)\s+\d{4}\)?$/u;
const VIDEO_PATH = /^(?:https?:\/\/\S+|\/\S+)\.(?:mp4|webm|mov|m4v)(?:\?\S*)?$|^(?:https?:\/\/[^\s/]+)?\/content\/dam\/\S+$/i;
// weak as a description (brief 490: "* Minimum two adults need to be booked", "Niemcy", "Buchungszeitraum: 30.09.2019 -
// 04.11.2019", "19. June 2025 | 5 min read | …", "… the redemption of vouchers:", "1. Turn on your notebook …";
// brief 494: "Dear Customer,", "お客様へ", "チューリッヒ／ジュネーブ、2026年3月1日", "Lufthansa Allegris › Inside Sessions", "감사합니다!")
const HAN_KANA = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const HANGUL = /\p{Script=Hangul}/u;
const FOOTNOTE = /^(?:[*†‡¹²³⁴⁵⁶⁷⁸⁹]|\(\d{1,2}\)\s)/u;
const DATES = '\\d{1,2}\\.\\d{1,2}\\.\\d{2,4}|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\.?\\s+\\p{L}+\\.?,?\\s+\\d{4}|\\p{L}+\\.?\\s+\\d{1,2},?\\s+\\d{4}|\\d{4}\\s?年\\s?\\d{1,2}\\s?月\\s?\\d{1,2}\\s?日';
const DATE = new RegExp(DATES, 'gu');
const DATE_AT_END = new RegExp(`(?:${DATES})[)）]?$`, 'u');
const PRICE = /(?:[€$£¥₩]|\b(?:EUR|USD|CHF|GBP|CNY|HKD|KRW|MYR|THB|INR|JPY)\b)\s?\d[\d.,]*|\d[\d.,]*\s?(?:[€$£¥₩]|\b(?:EUR|USD|CHF|GBP|CNY|HKD|KRW|MYR|THB|INR|JPY)\b)/gu;
const LEAD_IN = /(?:[:：,，;；–—-]|…|\.\.\.)$/u;
const STEP = /^\d{1,2}[.)]\s*(?!\p{L}+\.?,?\s+\d{4})\p{L}/u;
const SALUTATION = /^(?:dear|sehr geehrte[rs]?|liebe[rs]?|geachte|chère?s?|cher|madame|monsieur|gentile|egregi[oa]|estimad[oa]|prezad[oa]|car[oa]|αγαπητ\p{L}*|уважаем\p{L}*|дорог\p{L}*)(?!\p{L})|^(?:お客様へ|拝啓|亲爱的|親愛的|친애하는)/iu;
const CRUMB = /\s[›»>]\s/u;
const words = (s) => s.split(' ').filter((t) => /\p{L}/u.test(t)).length;

/**
 * A footnote, a word or two, a number line (a phone, hours), a date or price line, a dateline, a
 * salutation, a breadcrumb, a lead-in, a text cut off, a numbered step.
 */
export function isWeak(text) {
  if (FOOTNOTE.test(text) || LEAD_IN.test(text) || STEP.test(text)) return true;
  const chars = text.replace(/\s/g, '');
  if ((chars.match(/\p{L}/gu) || []).length < chars.length * 0.4) return true;
  const end = text.match(DATE_AT_END);
  if (end) {
    // a place or a label and a date: "Zurich, 1 March 2026", "最終更新：2025年1月21日"
    const rest = text.slice(0, end.index).trim();
    if (!rest || /[,:，：、|–-]$/u.test(rest)) return true;
  }
  const cjk = HAN_KANA.test(text);
  if (SALUTATION.test(text) && (cjk ? [...chars].length <= 12 : words(text) <= 6)) return true;
  if (CRUMB.test(text) && words(text) <= 8) return true;
  if (cjk) return [...chars].length < 6;
  if (words(text) < (HANGUL.test(text) ? 3 : 4)) return true;
  const dated = text.replace(DATE, ' ').replace(PRICE, ' ');
  if (dated === text) return false;
  return / \| /.test(text) || words(clean(dated)) < 3;
}

/** An element's lines (split at its line breaks), style markers removed. */
const textLines = (el) => {
  const c = el.cloneNode(true);
  c.querySelectorAll('br').forEach((br) => br.replaceWith(c.ownerDocument.createTextNode('\n')));
  return c.textContent.split('\n').map((l) => clean(stripStyleMarkers(clean(l)))).filter(Boolean);
};

/** The text of a paragraph that can describe the page, or '' (link only, video path, picture, weak). */
export function paragraphText(p) {
  const lines = textLines(p);
  const text = clean(stripStyleMarkers(lines.join(' ')));
  if (!text) return '';
  if (VIDEO_PATH.test(text) || DATE_ONLY.test(text) || isWeak(text)) return '';
  // short lines one per line (conditions, phone numbers): a list, not a description
  if (lines.length > 1 && lines.every(isWeak)) return '';
  const links = [...p.querySelectorAll('a')];
  if (links.length && clean(links.map((a) => a.textContent).join(' ')) === text) return '';
  return text;
}

/**
 * The first real text paragraph under root (not inside `skip`), markers removed; every paragraph
 * weak: the first heading that is not (h1, else h2); none: ''.
 */
export function firstTextParagraph(root, skip = 'div.metadata, div.section-metadata') {
  const first = (sel) => [...root.querySelectorAll(sel)]
    .filter((x) => !x.closest(skip))
    .find((x) => paragraphText(x));
  const p = first('p') || first('h1') || first('h2');
  return p ? paragraphText(p) : '';
}
