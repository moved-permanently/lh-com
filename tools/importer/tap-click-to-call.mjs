#!/usr/bin/env node
/**
 * TAP's call-back cards from the capture (tap-byside-001: click-to-call.json, www.flytap.com's
 * BySide windows per CoreMedia type and version; parity.md row 66) as
 * tools/importer/tap-click-to-call.json, the data tap-import.mjs and tap-markets.mjs write
 * ema-test's click-to-call block from (blocks/click-to-call/README.md's rows).
 *
 *   node tools/importer/tap-click-to-call.mjs <unpacked capture>/byside
 *
 * The pictures' copies: the same directory as a --media of the import (mediaIndex reads its
 * click-to-call.json's pictures).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(root, 'tools/importer/tap-click-to-call.json');

// the opening hours of BySide's schedule lists (Lisbon time; the cards' schedule line)
const HOURS = { time_ranges_pt: 'Mon-Fri 09:00-24:00' };

/**
 * The capture's cards: type -> version -> the block's fields and the pages www showed it on, or
 * {noCard: [pages]} where www served none.
 */
export function cardsOf(capture) {
  const url = new Map((capture.pictures || []).map((p) => [p.file, p.url]));
  const none = new Set((capture.noCardRechecks || []).map((r) => `${r.type} ${new URL(r.page).pathname.replace(/\/+$/, '')}`));
  const cards = {};
  (capture.entries || []).forEach((e) => {
    const without = (e.pages || []).filter((p) => none.has(`${e.type} ${p}`));
    const pages = (e.pages || []).filter((p) => !without.includes(p));
    cards[e.type] = cards[e.type] || {};
    if (!e.title) { cards[e.type][e.version] = { noCard: e.pages || [] }; return; }
    const form = e.form || {};
    const pics = e.pictures || {};
    const slots = (form.timeSlots || {}).firstLast;
    const fa = e.floatingAnchor || {};
    const card = {
      title: e.titleHtml || e.title,
      text: e.textHtml || e.text || '',
      schedule: e.scheduleHtml || e.schedule || '',
      hours: HOURS[(e.byside || {}).scheduleSetForLanguageList] || '',
      button: (e.buttonLabels || {}).inOpeningHours || '',
      buttonOutside: (e.buttonLabels || {}).outsideOpeningHours || '',
      phone: form.phonePlaceholder || '',
      days: form.dayOptions || [],
      slots: slots ? slots.join('-') : '',
      smallPrint: e.smallPrintHtml || '',
      image: url.get(pics.wide) || '',
      mobileImage: url.get(pics.mobile) || '',
      alt: ((pics.mobileNote || '').match(/alt="([^"]*)"/) || [])[1] || '',
      floating: fa.shownAtCapture ? [fa.text, fa.subText].filter(Boolean) : [],
      pages,
    };
    if (without.length) card.noCard = without;
    cards[e.type][e.version] = card;
  });
  return cards;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  if (!dir) { console.log('usage: node tools/importer/tap-click-to-call.mjs <capture>/byside'); process.exit(1); }
  const capture = JSON.parse(fs.readFileSync(path.join(dir, 'click-to-call.json'), 'utf8'));
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  const cards = cardsOf(capture);
  fs.writeFileSync(OUT, `${JSON.stringify({ _note: prev._note, captured: capture.captured, cards }, null, 1)}\n`);
  const n = Object.values(cards).flatMap((v) => Object.values(v));
  console.log(`${Object.keys(cards).length} types, ${n.filter((c) => c.title).length} cards on ${n.reduce((a, c) => a + (c.pages || []).length, 0)} pages, no card on ${n.reduce((a, c) => a + (c.noCard || []).length, 0)}`);
}
