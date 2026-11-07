/* eslint-disable max-len, import/extensions -- dev tooling */
/* Air Dolomiti's breadcrumbs (tools/importer/airdolomiti-import.mjs breadcrumbRows): www's trail
   (<nav aria-label="Breadcrumb"> in the rendered snapshot: "Home | Orario Voli", "Home | extra
   services | eSIM") as lh-com's breadcrumb rows: Parent the nearest linked crumb that is a page of
   the site (else the language's homepage), Breadcrumb Title the page's own crumb; a homepage
   "Breadcrumb Title | Home" for its children; no trail on www, no rows.
   The English and German homepages by their pages' address, /en/ and /de/ (/en answers 404 on
   aem.page).
   Run: node --max-old-space-size=512 --test test/airdolomiti-breadcrumb.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { breadcrumbRows } from '../tools/importer/airdolomiti-import.mjs';

// www labels the trail in the page's language ("Percorso di navigazione", "Breadcrumb")
const trail = (items, label = 'Percorso di navigazione') => `<header></header><nav aria-label="${label}"><ol class="Breadcrumbs_breadcrumbs__H5Q0T breadcrumbs">${items.map(([text, href]) => `<li class="Breadcrumbs_text__5FGZG">${href ? `<a href="${href}">${text}</a>` : `<span>${text}</span>`}</li>`).join('')}</ol></nav><main id="page-content"></main>`;
const exists = (p) => ['/', '/en', '/de', '/articoli', '/articoli/travellers', '/en/extra-services'].includes(p);

test('an inner page: Parent the language\'s homepage, its crumb the page\'s title', () => {
  assert.deepEqual(
    breadcrumbRows(trail([['Home', '/'], ['Orario Voli']]), 'https://www.airdolomiti.it/orario-voli', { exists }),
    [['Parent', '<a href="/">/</a>'], ['Breadcrumb Title', 'Orario Voli']],
  );
  // an unlinked middle crumb (www: "extra services") is no page: Parent the homepage, the crumb a
  // level without a link (Breadcrumb Levels, brief 448)
  assert.deepEqual(
    breadcrumbRows(trail([['Home', '/'], ['extra services'], ['eSIM']], 'Breadcrumb'), 'https://www.airdolomiti.eu/extra-services/plans-esim', { exists }),
    [['Parent', '<a href="/en/">/en/</a>'], ['Breadcrumb Levels', 'extra services'], ['Breadcrumb Title', 'eSIM']],
  );
});

test('a linked ancestor that is a page of the site is the Parent (www\'s absolute or relative link)', () => {
  assert.deepEqual(
    breadcrumbRows(trail([['Home', '/'], ['Articoli', '/articoli'], ['Travellers', 'https://www.airdolomiti.it/articoli/travellers'], ['Bambini a bordo']]), 'https://www.airdolomiti.it/articoli/travellers/bambini-a-bordo', { exists }),
    [['Parent', '<a href="/articoli/travellers">/articoli/travellers</a>'], ['Breadcrumb Title', 'Bambini a bordo']],
  );
  // an ancestor the site doesn't have: the next one up, the ancestor's crumb a level without a link
  assert.deepEqual(
    breadcrumbRows(trail([['Home', '/'], ['Hub', '/de/hub'], ['Seite']]), 'https://www.airdolomiti.de/hub/seite', { exists }),
    [['Parent', '<a href="/de/">/de/</a>'], ['Breadcrumb Levels', 'Hub'], ['Breadcrumb Title', 'Seite']],
  );
});

test('a homepage: its label for the children; no trail on www: no rows', () => {
  assert.deepEqual(breadcrumbRows('<main></main>', 'https://www.airdolomiti.it/', { exists, home: true }), [['Breadcrumb Title', 'Home']]);
  assert.deepEqual(breadcrumbRows('<main></main>', 'https://www.airdolomiti.it/orario-voli', { exists }), []);
});
