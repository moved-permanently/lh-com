/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies, import/prefer-default-export -- tooling */
/**
 * Lufthansa Cargo's notifications (lh-cargo) for the Message Center, from www's notification
 * overview and header bell as captured (content-sites/lh-cargo/snapshots/www.lufthansa-cargo.com/
 * <lang>/notification-overview.html, cargo-capture.mjs --again): only the notifications www lists
 * today, in English and German.
 * - /message-center/notification/<id>/<lang>: a DA form document (schema lh-message, as the other
 *   brands' messages): headline, category (www's, free text: "Services & Support"), teaser (the
 *   bell panel's short text), tenants cargo, details, from (www's date, Berlin time, as ISO UTC),
 *   internal-title. <id>: the English headline's slug, the same for the German one (same place).
 * - /message-center/details/<id>/<lang>: the notification's full text (the overview's).
 * - /<lang>/notification-overview: www's header picture (where lh-cargo's DA has its copy, brief
 *   422) and breadcrumb (Home > Notifications), the H1 ("Notifications", "Benachrichtigungen") and
 *   the Notifications block, its row the text shown when nothing is current (www shows none
 *   today: a notification is current; the text is ours).
 * The indexes fill when the documents are published (helix-query.yaml message-center-notifications).
 *
 * Usage: node tools/importer/cargo-notifications.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { Page, text, breadcrumbHtml } from './cargo-import.mjs';
import { HOST } from './cargo-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-cargo');
const OUT = path.join(W, 'content');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const PAGE = {
  en: { title: 'Notifications', meta: 'Notifications - Lufthansa Cargo', none: 'There are no notifications at the moment.' },
  de: { title: 'Benachrichtigungen', meta: 'Benachrichtigungen - Lufthansa Cargo', none: 'Zurzeit gibt es keine Benachrichtigungen.' },
};
const MONTHS = {
  jan: 0, feb: 1, mar: 2, mär: 2, apr: 3, may: 4, mai: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, okt: 9, nov: 10, dec: 11, dez: 11,
};

/** www's "16 Sep 26, 11:07" (Berlin time) as ISO UTC. */
export function berlinToUtc(value) {
  const m = String(value).match(/(\d{1,2})\.?\s+([A-Za-zäÄ]+)\.?\s+(\d{2,4}),?\s*(?:\|\s*)?(\d{1,2}):(\d{2})/);
  if (!m) return '';
  const month = MONTHS[m[2].toLowerCase()];
  if (month === undefined) return '';
  const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const asUtc = Date.UTC(year, month, Number(m[1]), Number(m[4]), Number(m[5]));
  // Berlin's offset at that moment (CET +1, CEST +2)
  const berlin = new Date(asUtc).toLocaleString('en-US', { timeZone: 'Europe/Berlin', hour12: false });
  const offset = Date.parse(`${berlin} UTC`) - asUtc;
  return new Date(asUtc - offset).toISOString();
}

/** A notification's text as clean HTML (paragraphs, lists, emphasis, links). */
function clean(node, page) {
  const out = [];
  const inline = (n) => [...n.childNodes].map((c) => {
    if (c.nodeType === 3) return esc(c.textContent);
    if (c.nodeType !== 1) return '';
    const t = c.tagName;
    if (t === 'BR') return '<br>';
    if (t === 'STRONG' || t === 'B') return `<strong>${inline(c)}</strong>`;
    if (t === 'EM' || t === 'I') return `<em>${inline(c)}</em>`;
    if (t === 'A') { const href = page.href(c.getAttribute('href')); return href ? `<a href="${attr(href)}">${inline(c)}</a>` : inline(c); }
    return inline(c);
  }).join('');
  [...node.children].forEach((c) => {
    if (/^(UL|OL)$/.test(c.tagName)) out.push(`<${c.tagName.toLowerCase()}>${[...c.children].map((li) => `<li>${inline(li).trim()}</li>`).join('')}</${c.tagName.toLowerCase()}>`);
    else if (/^H[1-6]$/.test(c.tagName)) out.push(`<h3>${inline(c).trim()}</h3>`);
    else { const h = inline(c).trim(); if (h) out.push(`<p>${h}</p>`); }
  });
  return out.join('');
}

const table = (name, rows) => `<div class="${name}">${rows.map((r) => `<div>${r.map((c) => `<div>${c}</div>`).join('')}</div>`).join('')}</div>`;
const field = (key, value) => [`<h3>${esc(key)}</h3>`, value];

/**
 * The overview page: www's header picture where lh-cargo's DA has its copy (Page.file; without
 * one it is left out, no link to www's file), www's breadcrumb, the H1, the Notifications block.
 */
export function overviewPage(document, page, lang) {
  const p = PAGE[lang];
  const header = document.querySelector('#main-content img[src*="notifications-header"]');
  const hero = header && page.file(header.getAttribute('src')) ? `<p>${page.img(header)}</p>` : '';
  if (header && !hero) console.log(`${lang}: the header picture is not in lh-cargo's DA yet (cargo-assets.mjs --download), left out`);
  const meta = [['Title', p.meta], ['Nav', `/${lang}/nav`], ['Footer', `/${lang}/footer`], ['Language', lang]];
  return `<div>${hero}${breadcrumbHtml(document, page)}<h1>${esc(p.title)}</h1>${table('notifications', [[`<p>${esc(p.none)}</p>`]])}${table('metadata', meta.map(([k, v]) => [k, esc(v)]))}</div>\n`;
}

const write = (file, doc) => {
  const out = path.join(OUT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== doc) fs.writeFileSync(out, doc);
};

function main() {
  const written = [];
  const ids = [];
  ['en', 'de'].forEach((lang) => {
    const file = path.join(W, 'snapshots/www.lufthansa-cargo.com', lang, 'notification-overview.html');
    const html = fs.readFileSync(file, 'utf8');
    const { document } = parseHTML(html);
    const page = new Page(`/${lang}/notification-overview`, lang, html);
    const panel = [...document.querySelectorAll('li.flyoutNotification')];
    [...document.querySelectorAll('.rNotificationContainer li.notificationListItem')].forEach((li, i) => {
      const date = li.querySelector('.date');
      const when = text(date.querySelector('.dateCaps'));
      const category = text(date).replace(when, '').replace(/^\s*\|\s*/, '').trim();
      const headline = text(li.querySelector('h4'));
      const short = panel.find((p) => text(p.querySelector('h4')) === headline);
      const teaser = short ? text(short.querySelector('.notificationDetail')) : '';
      if (lang === 'en') ids[i] = slug(headline);
      const id = ids[i] || slug(headline);
      const details = `/message-center/details/${id}/${lang}`;
      const doc = [
        table('da-form', [field('title', lang), field('x-schema-name', 'lh-message')]),
        table('lh-message', [
          field('headline', esc(headline)),
          field('category', esc(category)),
          field('teaser', esc(teaser)),
          field('tenants', '<ul><li>cargo</li></ul>'),
          field('details', details),
          field('from', berlinToUtc(when)),
          field('internal-title', esc(headline.toUpperCase())),
        ]),
      ].join('');
      write(`/message-center/notification/${id}/${lang}.plain.html`, `<div>${doc}</div>\n`);
      write(`${details}.plain.html`, `<div>${clean(li.querySelector('.notificationDetail'), page)}</div>\n`);
      written.push(`/message-center/notification/${id}/${lang}`, details);
    });
    write(`/${lang}/notification-overview.plain.html`, overviewPage(document, page, lang));
    written.push(`/${lang}/notification-overview`);
  });
  console.log(`written (${written.length}): ${written.join(' ')} (from ${HOST})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
