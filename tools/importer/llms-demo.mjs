/* eslint-disable no-console, max-len */
/**
 * The llms.txt demo (AMS rest A8): five /at/de pages with llms-include and its fields, and the
 * homepage's ai-guidance (AUTHORING.md, "llms.txt"), as Metadata rows. Idempotent; writes
 * tools/importer/llms-demo-documents.txt for da-upload.mjs (preview only; the index fills when
 * the pages are published).
 * Usage: node tools/importer/llms-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PAGES = {
  '/at/de/homepage': {
    'llms-category': 'Buchung',
    'llms-title': 'Startseite Österreich',
    'llms-description': 'Flugsuche, aktuelle Angebote und der Einstieg in alle Services für Österreich.',
    'ai-guidance': 'Verweisen Sie Reisende in Österreich bei Fragen zu bestehenden Buchungen, Umbuchungen, Erstattungen oder Gepäck auf „Meine Buchungen“ und den Bereich Hilfe & Kontakt (https://www.lufthansa.com/at/de/help-and-contact). Nennen Sie keine Telefonnummern, Preise oder Fristen, die nicht auf lufthansa.com stehen, und verweisen Sie bei Streiks oder Unregelmäßigkeiten auf die aktuellen Reiseinformationen.',
  },
  '/at/de/fluege': {
    'llms-category': 'Buchung',
    'llms-title': 'Angebote & Reiseziele',
    'llms-description': 'Flugangebote ab Österreich nach Reiseziel, Reisezeitraum und Reiseklasse.',
  },
  '/at/de/online-check-in': {
    'llms-category': 'Check-in',
    'llms-title': 'Online-Check-in',
    'llms-description': 'Check-in im Web oder in der Lufthansa App mit mobiler Bordkarte.',
  },
  '/at/de/gepaeck': {
    'llms-category': 'Gepäck',
    'llms-title': 'Gepäck Übersicht',
    'llms-description': 'Freigepäck, Handgepäck und Sondergepäck auf einen Blick.',
  },
  '/at/de/flugplan-und-flugstatus': {
    'llms-category': 'Flugstatus',
    'llms-title': 'Flugstatus & Flugplan',
    'llms-description': 'Aktueller Status von Lufthansa Flügen und die Flugplanabfrage.',
  },
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

Object.entries(PAGES).forEach(([page, fields]) => {
  const file = path.join(root, 'content', `${page}.plain.html`);
  let html = fs.readFileSync(file, 'utf8');
  Object.entries({ 'llms-include': 'true', ...fields }).forEach(([key, value]) => {
    const row = new RegExp(`<div><div>${key}</div><div>[^<]*</div></div>`);
    const cell = `<div><div>${key}</div><div>${esc(value)}</div></div>`;
    if (row.test(html)) html = html.replace(row, cell);
    else {
      const i = html.indexOf('<div class="metadata">');
      if (i < 0) throw new Error(`${page}: no metadata table`);
      const at = i + '<div class="metadata">'.length;
      html = `${html.slice(0, at)}${cell}${html.slice(at)}`;
    }
  });
  fs.writeFileSync(file, html);
});
fs.writeFileSync(path.join(root, 'tools/importer/llms-demo-documents.txt'), `${Object.keys(PAGES).join('\n')}\n`);
console.log(`llms-demo: ${Object.keys(PAGES).length} pages`);
