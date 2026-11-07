/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * Austrian's import templates for its check-in and flight-status pages (austrian-import.mjs
 * templateOf): lh-com's app-entry and flight-status templates map only the few components of
 * lufthansa.com's hub pages, so an Austrian page with the check-in entry or the timetable lost the
 * rest (/at/en/online-check-in: the four-column steps, the accordion, the card row, the column
 * views). Each Austrian template is lh-com's info template (blocks and sections) with the page's own
 * block in front: app-entry's booking-lookup (austrian-checkin), flight-status's flight-status
 * (austrian-flight-status), hub's hero-banner (austrian-hero-banner). Built from the current templates, so a change to info carries over:
 * run this, then rebuild their bundles (build-bundles.mjs austrian-checkin austrian-flight-status austrian-hero-banner);
 * test/austrian-templates.test.mjs fails while page-templates.json and this disagree.
 *
 * Usage: node tools/importer/austrian-templates.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'page-templates.json');

const own = (templates, name, block) => {
  const t = templates.find((x) => x.name === name);
  return {
    block: t.blocks.find((b) => b.name === block),
    section: t.sections.find((s) => (s.blocks || []).includes(block)),
  };
};

/** The Austrian templates built from lh-com's current templates (an array). */
export function austrianTemplates(templates) {
  const info = templates.find((t) => t.name === 'info');
  return [
    ['austrian-checkin', 'Austrian: an info page with the check-in entry (app-entry\'s booking-lookup)', own(templates, 'app-entry', 'booking-lookup')],
    ['austrian-flight-status', 'Austrian: an info page with the flight status and timetable search (flight-status\'s block)', own(templates, 'flight-status', 'flight-status')],
    // www's expanding panels (.herobanner .dcep-hero-banner, /at/en/fly/on-board/culinary-services; parity row 37)
    ['austrian-hero-banner', 'Austrian: an info page with the expanding image panels (hub\'s hero-banner)', own(templates, 'hub', 'hero-banner')],
  ].map(([name, description, { block, section }]) => ({
    name,
    description,
    urls: [],
    blocks: [block, ...info.blocks],
    sections: [{ ...section, id: 'section-0' }, ...info.sections],
  }));
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const json = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const built = austrianTemplates(json.templates);
  built.forEach((t) => {
    const i = json.templates.findIndex((x) => x.name === t.name);
    if (i >= 0) json.templates[i] = t; else json.templates.push(t);
  });
  fs.writeFileSync(FILE, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`page-templates.json: ${built.map((t) => t.name).join(', ')} written`);
}
