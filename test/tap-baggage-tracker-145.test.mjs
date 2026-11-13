/* eslint-disable max-len, import/extensions */
/* TAP row 145, www's baggage tracker (ComponentTrackBagaggeModel, the locate-baggage pages of 8 roots): a React form
   (flight date, airline code, flight number, baggage tag number; no action, TAP's own service answers it) that cannot
   work on our hosts. The importer wrote the title and a bare "See on flytap.com" paragraph; it now writes www's
   description under the title and a link box (cards one-up, one card) to the tracker on flytap.com, in the page's
   language (www's texts, the snapshots of each root). Still reported as linked out.
   Run: node --max-old-space-size=256 --test test/tap-baggage-tracker-145.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { convertPage } from '../tools/importer/tap-import.mjs';

const page = (url, title) => {
  const nd = { props: { pageProps: { page: { title, sections: [{ __typename: 'ComponentTrackBagaggeModel', title }] } } } };
  const out = convertPage(nd, { url, scope: new Set(), media: () => null });
  const { document } = parseHTML(`<html><body><main>${out.html}</main></body></html>`);
  return { out, document };
};

test('en-pt: the title, www\'s description, a link box to the tracker on flytap.com', () => {
  const { out, document } = page('https://www.flytap.com/en-pt/information/baggage/locate-baggage', 'Loaded baggage status');
  assert.equal(document.querySelector('h1').textContent, 'Loaded baggage status');
  const box = document.querySelector('.cards');
  assert.ok(box, 'the box');
  assert.equal(box.className, 'cards one-up');
  assert.equal(box.children.length, 1, 'one card');
  const links = [...box.querySelectorAll('a')].map((a) => `${a.getAttribute('href')} ${a.textContent}`);
  assert.deepEqual(links, ['https://www.flytap.com/en-pt/information/baggage/locate-baggage Search on flytap.com']);
  assert.ok(box.querySelector('strong > a'), 'a button link');
  const texts = [...document.querySelectorAll('p')].map((p) => p.textContent);
  assert.ok(texts.includes('Check if your baggage has been loaded on your flight by using the baggage tag.'), 'www\'s description');
  assert.ok(!texts.includes('See on flytap.com'), 'no bare link any more');
  assert.ok(JSON.stringify(out.report || {}).includes('TrackBagagge'), 'still reported as linked out');
});

test('each root\'s own words: pt-br\'s description, de-de\'s link', () => {
  const br = page('https://www.flytap.com/pt-br/informacoes/bagagem/localizar-bagagem', 'Estado da bagagem embarcada').document;
  assert.ok([...br.querySelectorAll('p')].some((p) => p.textContent === 'Verifique se sua bagagem foi embarcada em seu voo usando a etiqueta de bagagem.'));
  assert.equal(br.querySelector('.cards a').textContent, 'Pesquisar em flytap.com');
  const de = page('https://www.flytap.com/de-de/informationen/gepack/gepack-finden', 'Status des verladenen Gepäcks').document;
  assert.equal(de.querySelector('.cards a').textContent, 'Auf flytap.com suchen');
  assert.equal(de.querySelector('.cards a').getAttribute('href'), 'https://www.flytap.com/de-de/informationen/gepack/gepack-finden');
});
