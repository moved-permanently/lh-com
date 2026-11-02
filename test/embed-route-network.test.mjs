/* eslint-disable max-len */
/* Lufthansa Group for Business' route network map (decision 6 of the B2B groundwork):
   business.lufthansagroup.com/<root>/travel-management/route-network embeds https://lhg-network.com/
   (.iframe > .iframe-wrapper [max-width 1440px, height 800px] > iframe title "Lufthansa Network
   Table"). The embed block plays it as a lazy iframe of www's size; the importer writes it
   (parsers/media-nodes.js embedUrl, the info template's .iframe selector); the other embed hosts as
   before, and nothing else on lhg-network.com's name.
   Run: node --max-old-space-size=512 --test test/embed-route-network.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="b2b"><meta name="language" content="en"></head><body></body></html>');
window.location = {
  hostname: 'main--lh-b2b--moved-permanently.aem.page', pathname: '/de/en/travel-management/route-network', search: '', href: 'https://main--lh-b2b--moved-permanently.aem.page/de/en/travel-management/route-network', origin: 'https://main--lh-b2b--moved-permanently.aem.page',
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-b2b--moved-permanently.aem.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
const { embedFor, buildEmbed } = await import('../scripts/media.js');

const link = (href, text = href) => {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  const p = document.createElement('p');
  p.append(a);
  document.body.append(p);
  return a;
};

test('lhg-network.com: a lazy iframe of www\'s map, titled by the link text', () => {
  assert.deepEqual(embedFor('https://lhg-network.com/'), { type: 'route-network', src: 'https://lhg-network.com/' });
  const el = buildEmbed(link('https://lhg-network.com/', 'Lufthansa Network Table'));
  assert.equal(el.className, 'media-embed media-embed-route-network');
  const iframe = el.querySelector('iframe');
  assert.equal(iframe.getAttribute('src'), 'https://lhg-network.com/');
  assert.equal(iframe.getAttribute('loading'), 'lazy');
  assert.equal(iframe.getAttribute('title'), 'Lufthansa Network Table');
  assert.equal(buildEmbed(link('https://lhg-network.com/')).querySelector('iframe').getAttribute('title'), 'Route network', 'the URL as text: the label');
});

test('only https://lhg-network.com/ (no other scheme, host or path); the other hosts as before', () => {
  ['http://lhg-network.com/', 'https://lhg-network.com.example.org/', 'https://evil-lhg-network.com/', 'https://lhg-network.com/admin', 'https://www.lhg-network.com/x/y']
    .forEach((h) => assert.equal(embedFor(h), null, h));
  assert.equal(embedFor('https://www.youtube.com/watch?v=abc123').type, 'youtube');
  assert.equal(embedFor('https://box.media-carrier.de/home?b=1').type, 'newsstand');
  assert.equal(embedFor('https://www.lufthansa-inflightentertainment.com/widgets').type, 'inflight-entertainment');
  assert.equal(embedFor('https://www.google.com/maps?q=FRA'), null);
});

test('www\'s frame size: max 1440px wide, 800px high', () => {
  const css = fs.readFileSync('styles/media.css', 'utf8');
  assert.match(css, /\.media-embed-route-network \{[^}]*max-width: 1440px;[^}]*height: 800px;/);
});

test('the importer: the route network iframe is an embed (media-nodes, the info template\'s selector)', async () => {
  const { embedUrl } = await import('../tools/importer/parsers/media-nodes.js');
  const comp = document.createElement('div');
  comp.className = 'iframe';
  comp.innerHTML = '<div class="iframe-wrapper text-left" data-identifier="iframe" style="max-width: 1440px; height: 800px;"><iframe src="https://lhg-network.com/" title="Lufthansa Network Table"><p>Your browser does not support iframes.</p></iframe></div>';
  assert.equal(embedUrl(comp), 'https://lhg-network.com/');
  const { templates } = JSON.parse(fs.readFileSync('tools/importer/page-templates.json', 'utf8'));
  const info = templates.find((t) => t.name === 'info').blocks.find((b) => b.name === 'embed');
  assert.ok(info.instances.includes('.iframe:has(> .iframe-wrapper iframe[src*="lhg-network.com"])'));
  // the cleanup keeps the iframe (its embed hosts) for the parser
  assert.match(fs.readFileSync('tools/importer/transformers/lufthansa-cleanup.js', 'utf8'), /const EMBED_URL = \/[^\n]*lhg-network\\\.com/);
});
