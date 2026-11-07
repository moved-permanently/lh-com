/* eslint-disable max-len */
/* The destination finder's trip type announcement, every brand (brief 447, item 3; Brussels' fr/fr
   homepage in brussels-parity-003 at 1440: www's fare teaser has, after its trip type chips, a
   polite live region, sr-only, "Les offres pour Aller-retour sont affichées", its text
   fareteaserdynamicevo.fullApp.offers.selectionAnnouncementTripType with the chosen chip's label;
   English "{TRIPTYPE} offers are displayed"). The block renders it after its chips with the
   current trip type and updates it once the list for a newly chosen trip type is shown. www's
   wording for English, French, German, Spanish, Italian and Dutch (brief 448: Brussels' captures);
   pt, el, ja, ru, zh, pl and ko ours until a capture has www's; a block row "Selection
   announcement" wins.
   Run: node --max-old-space-size=256 --test test/destination-finder-announcement-447.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-brussels--moved-permanently.aem.page', pathname: '/fr/fr', search: '', replace: () => {}, href: 'https://main--lh-brussels--moved-permanently.aem.page/fr/fr', origin: 'https://main--lh-brussels--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { SELECTION_ANNOUNCEMENTS, selectionAnnouncement } = await import('../blocks/destination-finder/destination-finder.js');
const js = fs.readFileSync(new URL('../blocks/destination-finder/destination-finder.js', import.meta.url), 'utf8');

test('www\'s texts in English and French, one for every language the finder has labels for', () => {
  assert.equal(SELECTION_ANNOUNCEMENTS.fr, 'Les offres pour {TRIPTYPE} sont affichées');
  assert.equal(SELECTION_ANNOUNCEMENTS.en, '{TRIPTYPE} offers are displayed');
  // brief 448: www's wording from Brussels' Studio captures (tools/importer/bd-snapshots: de/de, es/es,
  // it/it and nl/nl homepages' label bundles)
  assert.equal(SELECTION_ANNOUNCEMENTS.de, '{TRIPTYPE} Angebote angezeigt');
  assert.equal(SELECTION_ANNOUNCEMENTS.es, 'Se muestran {TRIPTYPE} ofertas');
  assert.equal(SELECTION_ANNOUNCEMENTS.it, 'Sono visualizzate le offerte per {TRIPTYPE}');
  assert.equal(SELECTION_ANNOUNCEMENTS.nl, 'Er worden {TRIPTYPE} aanbiedingen weergegeven');
  assert.deepEqual(Object.keys(SELECTION_ANNOUNCEMENTS).sort(), ['de', 'el', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru', 'zh']);
  Object.values(SELECTION_ANNOUNCEMENTS).forEach((t) => assert.ok(t.includes('{TRIPTYPE}'), t));
});

test('the chosen chip\'s label in the text', () => {
  assert.equal(selectionAnnouncement(SELECTION_ANNOUNCEMENTS.fr, 'Aller-retour'), 'Les offres pour Aller-retour sont affichées');
  assert.equal(selectionAnnouncement(SELECTION_ANNOUNCEMENTS.en, 'One way'), 'One way offers are displayed');
  assert.equal(selectionAnnouncement('', 'One way'), '', 'no text, no announcement');
});

test('the block: a polite live region after the chips, its text the current trip type\'s, updated once the new list shows', () => {
  assert.match(js, /status\.setAttribute\('aria-live', 'polite'\);\s*status\.setAttribute\('aria-atomic', 'true'\);/);
  assert.match(js, /status = el\('div', 'destination-finder-sr-only destination-finder-status'\);/);
  assert.match(js, /header\.append\(chips\);\s*if \(status\) header\.append\(status\);/);
  assert.match(js, /load\(\)\.then\(\(\) => announce\(\)\);/, 'after the list for the new trip type');
  assert.match(js, /'selection announcement': SELECTION_ANNOUNCEMENTS\[lang\]/, 'a block row wins over the default');
});
