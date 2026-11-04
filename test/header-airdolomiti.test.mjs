/* eslint-disable max-len */
/* Air Dolomiti's desktop menu (blocks/header/header-airdolomiti.js), as www.airdolomiti.it's
   (1440 px, 2026-11-04): the nav document's three top items (Esplora, Prenota e Gestisci,
   In viaggio) as buttons in the bar, each opening a panel under the bar with its columns (a grey
   title, its links; a column without a title: bold links under the column before it), the
   column with a picture as an image card (its title as a chip, its link as a button) and the
   quick actions (the column whose links carry icons) as the teal column on the right of every
   panel. One open at a time; a second click, Escape (the focus back on its button) or a click
   outside closes it. Only on the brand airdolomiti (header.js); every other brand as before.
   Run: node --max-old-space-size=512 --test test/header-airdolomiti.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
let focused = null;
window.HTMLElement.prototype.focus = function focus() { focused = this; };
const key = (target, k) => {
  const e = new window.Event('keydown', { bubbles: true });
  e.key = k;
  target.dispatchEvent(e);
};
const click = (target) => target.dispatchEvent(new window.Event('click', { bubbles: true }));

const { buildAirDolomitiMenu, readAirDolomitiMenu } = await import('../blocks/header/header-airdolomiti.js');

// the menu section of the nav document as the page has it (decorated: a section with its wrapper)
const section = () => {
  const s = document.createElement('div');
  s.className = 'section';
  s.innerHTML = `<div class="default-content-wrapper"><ul>
    <li><p>Esplora</p><ul>
      <li><p><a href="/destinazioni">Destinazioni</a></p><ul><li><a href="/destinazioni/monaco-di-baviera">Monaco di Baviera</a></li><li><a href="/destinazioni">Vedi tutte</a></li></ul></li>
      <li><p>Servizi</p><ul><li><a href="/servizi/autonoleggio">Autonoleggio</a></li></ul></li>
      <li><p></p><ul><li><a href="/flotta">Flotta</a></li><li><a href="/articoli">Blog</a></li></ul></li>
      <li><p>Azioni Rapide</p><ul><li><a href="/prenotazioni"><picture><img src="/media_1.png" alt=""></picture> Prenota un volo</a></li><li><a href="/stato-volo"><picture><img src="/media_2.png" alt=""></picture> Stato volo</a></li></ul></li>
      <li><p>Air Dolomiti Blog</p><p><picture><img src="/media_3.jpg" alt=""></picture></p><ul><li><a href="/articoli">Leggi di più</a></li></ul></li>
    </ul></li>
    <li><p>Prenota e Gestisci</p><ul>
      <li><p>Voli</p><ul><li><a href="/prenotazioni">Prenota un volo</a></li></ul></li>
      <li><p>Il nostro network</p><p><picture><img src="/media_4.png" alt=""></picture></p><ul><li><a href="/voli-europa">Scopri tutti i voli</a></li></ul></li>
    </ul></li>
    <li><p>In viaggio</p><ul>
      <li><p><a href="/bagagli">Bagagli</a></p><ul><li><a href="/bagaglio/franchigia">Franchigia</a></li></ul></li>
    </ul></li>
  </ul></div>`;
  return s;
};
const link = (href, label, className) => {
  const x = document.createElement('a');
  x.href = href;
  x.className = className;
  x.textContent = label;
  return x;
};

test('the document read as tabs of columns (a column without a title joins the one before), cards and the quick actions', () => {
  const { tabs, quick } = readAirDolomitiMenu(section());
  assert.deepEqual(tabs.map((t) => t.label), ['Esplora', 'Prenota e Gestisci', 'In viaggio']);
  const [esplora, prenota] = tabs;
  assert.deepEqual(esplora.columns.map((c) => c.map((g) => [g.label, g.href, g.bold, g.links.map((l) => l.label)])), [
    [['Destinazioni', '/destinazioni', false, ['Monaco di Baviera', 'Vedi tutte']]],
    [['Servizi', null, false, ['Autonoleggio']], ['', null, true, ['Flotta', 'Blog']]],
  ]);
  assert.equal(esplora.card.title, 'Air Dolomiti Blog');
  assert.deepEqual([esplora.card.href, esplora.card.cta], ['/articoli', 'Leggi di più']);
  assert.ok(esplora.card.picture.querySelector('img[src="/media_3.jpg"]'));
  assert.equal(prenota.card.title, 'Il nostro network');
  assert.equal(quick.label, 'Azioni Rapide');
  assert.deepEqual(quick.links.map((l) => [l.href, l.label, Boolean(l.icon)]), [['/prenotazioni', 'Prenota un volo', true], ['/stato-volo', 'Stato volo', true]]);
  assert.equal(tabs[2].card, null, 'a tab without a card');
});

test('the bar: a button per tab, each panel with its columns, its card and the quick actions', () => {
  const menu = buildAirDolomitiMenu(section(), { link });
  document.body.replaceChildren(menu.root);
  assert.equal(menu.root.className, 'nav-ad-menu');
  const buttons = [...menu.root.querySelectorAll('button.nav-ad-menu-button')];
  assert.deepEqual(buttons.map((b) => b.textContent.trim()), ['Esplora', 'Prenota e Gestisci', 'In viaggio']);
  const panel = (b) => document.getElementById(b.getAttribute('aria-controls'));
  buttons.forEach((b) => {
    assert.equal(b.getAttribute('aria-expanded'), 'false');
    assert.ok(panel(b).classList.contains('nav-ad-panel') && panel(b).hidden);
    assert.ok(panel(b).querySelector('.nav-ad-quick'), 'the quick actions in every panel');
  });
  const esplora = panel(buttons[0]);
  assert.equal(esplora.querySelectorAll('.nav-ad-column').length, 2);
  const title = esplora.querySelector('.nav-ad-group-title a');
  assert.deepEqual([title.getAttribute('href'), title.textContent], ['/destinazioni', 'Destinazioni']);
  assert.deepEqual([...esplora.querySelectorAll('.nav-ad-column:nth-child(2) a.nav-ad-link-bold')].map((a) => a.textContent), ['Flotta', 'Blog']);
  const card = esplora.querySelector('.nav-ad-card');
  assert.equal(card.querySelector('.nav-ad-card-title').textContent, 'Air Dolomiti Blog');
  assert.ok(card.querySelector('picture img'));
  assert.deepEqual([card.querySelector('a.nav-ad-card-cta').getAttribute('href'), card.querySelector('a.nav-ad-card-cta').textContent], ['/articoli', 'Leggi di più']);
  const quick = esplora.querySelector('.nav-ad-quick');
  assert.equal(quick.querySelector('.nav-ad-quick-title').textContent, 'Azioni Rapide');
  assert.deepEqual([...quick.querySelectorAll('a.nav-ad-quick-link')].map((a) => [a.getAttribute('href'), a.textContent.trim(), Boolean(a.querySelector('img'))]), [['/prenotazioni', 'Prenota un volo', true], ['/stato-volo', 'Stato volo', true]]);
  assert.equal(panel(buttons[2]).querySelector('.nav-ad-card'), null);
});

test('one panel open at a time; again, Escape or a click outside closes it', () => {
  const menu = buildAirDolomitiMenu(section(), { link });
  document.body.replaceChildren(menu.root, document.createElement('main'));
  const [esplora, prenota] = [...menu.root.querySelectorAll('button.nav-ad-menu-button')];
  const panel = (b) => document.getElementById(b.getAttribute('aria-controls'));
  click(esplora);
  assert.equal(esplora.getAttribute('aria-expanded'), 'true');
  assert.equal(panel(esplora).hidden, false);
  click(prenota);
  assert.equal(panel(esplora).hidden, true, 'the other one closes');
  assert.equal(prenota.getAttribute('aria-expanded'), 'true');
  click(prenota);
  assert.equal(panel(prenota).hidden, true, 'a second click closes it');
  click(prenota);
  key(panel(prenota).querySelector('a'), 'Escape');
  assert.equal(panel(prenota).hidden, true);
  assert.ok(focused === prenota, 'the focus back on its button');
  click(prenota);
  click(document.querySelector('main'));
  assert.equal(panel(prenota).hidden, true, 'a click outside closes');
  click(esplora);
  menu.close();
  assert.equal(esplora.getAttribute('aria-expanded'), 'false');
});

test('header.js: the Air Dolomiti menu on the brand airdolomiti only, with its search button and language list; other brands as before', () => {
  const js = fs.readFileSync('blocks/header/header.js', 'utf8');
  assert.match(js, /const airdolomiti = \/\^airdolomiti\$\/i\.test\(getMetadata\('brand'\)\) \? await import\('\.\/header-airdolomiti\.js'\) : null;/);
  assert.match(js, /\} else if \(airdolomiti\) \{\n\s+barMenu = airdolomiti\.buildAirDolomitiMenu\(menu, \{/);
  assert.match(js, /if \(quick && !tap && !airdolomiti\)/);
  assert.match(js, /airdolomiti \? 'nav-airdolomiti' : ''/);
  // the options of the other brands untouched (test/header-bar-menu.test.mjs)
  assert.match(js, /if \(headerStyle\.menu === 'bar'\)/);
  const css = fs.readFileSync('blocks/header/header-airdolomiti.css', 'utf8');
  assert.match(css, /\.header \.nav-airdolomiti \.nav-ad-menu \{/);
  assert.doesNotMatch(css, /^\.header \.nav-(bar|tools|brand)\b/m, 'every rule under .nav-airdolomiti');
});
