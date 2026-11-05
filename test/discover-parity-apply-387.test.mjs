/* eslint-disable max-len, import/extensions */
/* tools/importer/discover-parity-387.mjs (brief 387): the lh-discover documents of de/en and de/de to
   www.discover-airlines.com's capture discover-parity-001. Asserts are booleans and strings only
   (a failing assert on a linkedom node prints the whole tree).
   Run: node --max-old-space-size=256 --test test/discover-parity-apply-387.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  addHeadingMarkers, teaserGrids, tabSets, footerTop, compact, serialize,
} from '../tools/importer/discover-parity-387.mjs';

const doc = (html) => parseHTML(`<html><body><main>${html}</main></body></html>`).document;
const pic = (n) => `<picture><img src="/media_${n}.jpg" alt=""></picture>`;
const sm = (rows) => `<div class="section-metadata">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;

test('heading markers: www\'s class added where the import lost it, not where a marker is or the level\'s default; cards and accordions left alone', () => {
  const d = doc('<div><h1>Baggage</h1><h2>Additional baggage {heading-small}</h2><h3>Economy Light fare</h3><h2>Plain one</h2><div class="carousel-cards grid"><div><div>x</div><div><h4>Card title</h4></div></div></div></div>');
  const n = addHeadingMarkers(d.querySelector('main'), {
    baggage: 'heading-large', 'additional baggage': 'heading-small', 'economy light fare': 'heading-copytext-large', 'plain one': 'heading-medium', 'card title': 'heading-copytext-large',
  });
  assert.equal(n, 1);
  const hs = [...d.querySelectorAll('h1, h2, h3, h4')].map((h) => h.textContent);
  assert.equal(hs.join(' | '), 'Baggage | Additional baggage {heading-small} | Economy Light fare {heading-copytext-large} | Plain one | Card title');
});

test('teaser grids: picture link + linked heading pairs become a carousel-cards grid two-up, the column markers around them go', () => {
  const d = doc(`<div><h3>This might also be of interest to you {heading-small}</h3><p>{column-start-outer}</p><p><a href="/a">${pic(1)}</a></p><h4><a href="/a">Children</a></h4><p><a href="/b">${pic(2)}</a></p><h4><a href="/b">Sports {column-end-outer}</a></h4><p>after</p></div>`);
  assert.equal(teaserGrids(d.querySelector('main')), 1);
  const block = d.querySelector('.carousel-cards');
  assert.equal(block ? block.className : 'none', 'carousel-cards grid two-up');
  assert.equal(String(block && block.children.length), '2');
  assert.equal(block.querySelector('div > div > picture') ? 'picture in the first cell' : 'no', 'picture in the first cell');
  assert.equal(block.querySelectorAll('h4 a')[1].textContent, 'Sports');
  assert.equal(d.querySelector('main').textContent.includes('{column'), false);
  assert.equal(d.querySelector('main > div').lastElementChild.textContent, 'after');
});

test('teaser grids: a picture with text after its heading is not a teaser', () => {
  const d = doc(`<div><p>${pic(1)}</p><h2>Red Beach</h2><p>text</p><p>${pic(2)}</p><h2>White Beach</h2><p>text</p></div>`);
  assert.equal(teaserGrids(d.querySelector('main')), 0);
});

test('tab sets: the panels become Tab sections at www\'s first texts, the section\'s own metadata kept before and after, items laid out as www\'s', () => {
  const d = doc(`<div><h1>Vacation</h1><h2>Why visit {heading-small}</h2><p>${pic(1)}</p><h2>Head to the Red Beach</h2><p>The Red Beach is red.</p><p>${pic(2)}</p><h2>Visit to the Santo Winery</h2><p>Wine lovers.</p><p>{divider-25}</p><h2>Bucket list</h2><p>1. Swim</p>${sm([['Style', 'grey']])}</div>`);
  const sets = [{ panels: [['Bathing', 'Head to the Red Beach The Red Beach is red.'], ['Greek wine', 'Visit to the Santo Winery Wine lovers.']], after: 'Bucket list 1. Swim' }];
  assert.equal(tabSets(d.querySelector('main'), sets), 1);
  const secs = [...d.querySelectorAll('main > div')];
  const meta = (s) => [...s.querySelectorAll(':scope > .section-metadata > div')].map((r) => `${r.children[0].textContent}=${r.children[1].textContent}`).join(',');
  assert.equal(secs.map(meta).join(' / '), 'Style=grey / Tab=Bathing,Tabs=1 / Tab=Greek wine,Tabs=1 / Style=grey');
  assert.equal(secs[1].querySelector('.columns-media') ? 'rows' : 'none', 'rows');
  assert.equal(secs[1].querySelector('.columns-media > div > div:first-child picture') ? 'media first' : 'no', 'media first');
  // the divider before the text after the set goes with it
  assert.equal(secs[3].querySelector('p').textContent, '{divider-25}');
  assert.equal(compact(secs[3].textContent).startsWith('bucketlist'), true);
});

test('tab sets: a set\'s first text not found leaves the document unchanged', () => {
  const html = '<div><h1>X</h1><p>a</p><h2>B</h2></div>';
  const d = doc(html);
  assert.equal(tabSets(d.querySelector('main'), [{ panels: [['One', 'Nothing like it'], ['Two', 'B']], after: 'zzz' }]), 0);
  assert.equal(d.querySelector('main').innerHTML, html);
});

test('tab sets: an older copy of a panel between the title and the set goes where www shows nothing there (check-in at the airport); www\'s own text there stays', () => {
  const d = doc(`<div><h1>Check-in</h1><p>${pic(1)}</p><h2>Check-in at Frankfurt Airport</h2><p>Counters usually open.</p><p>Late-night check-in, as in the panel.</p><p>${pic(2)}</p><h2>Check-in at Frankfurt Airport</h2><p>Our counters open.</p><p>Late-night check-in, as in the panel.</p><h2>Check-in at Munich Airport</h2><p>Munich.</p><h2>Video</h2></div>`);
  const sets = [{ panels: [['Frankfurt Airport', 'Check-in at Frankfurt Airport Our counters open.'], ['Munich Airport', 'Check-in at Munich Airport Munich.']], after: 'Video' }];
  assert.equal(tabSets(d.querySelector('main'), sets, { wwwBefore: '' }), 1);
  assert.equal(d.querySelector('main').textContent.includes('usually'), false);
  assert.equal(d.querySelectorAll('img').length, 1);
  assert.equal(d.querySelector('main > div').textContent, 'Check-in');
  const kept = doc(`<div><h1>Baggage</h1><p>Intro www shows.</p><p>${pic(2)}</p><h2>One</h2><p>a</p><h2>Two</h2><p>b</p><h2>After</h2></div>`);
  tabSets(kept.querySelector('main'), [{ panels: [['1', 'One a'], ['2', 'Two b']], after: 'After' }], { wwwBefore: 'Intro www shows.' });
  assert.equal(kept.querySelector('main > div').textContent, 'BaggageIntro www shows.');
});

test('serialize: DA\'s source shape kept, an ampersand in an attribute stays &amp;amp; (linkedom writes it bare)', () => {
  const d = doc('<div><p><a href="/offers?a=1&amp;b=2&amp;c=&#x26;">x &amp; y</a></p></div>');
  assert.equal(serialize(d.querySelector('main')), '<div><p><a href="/offers?a=1&amp;b=2&amp;c=&amp;">x &amp; y</a></p></div>');
});

test('footer: the search and country row goes; Follow us is a link column (badges, in-columns)', () => {
  const d = doc(`<div><p>:search: <a href="/s">Enter search term</a></p><p>:globe: Germany | English</p></div><div><h3>About us</h3><ul><li>a</li></ul></div><div><h3>Follow us</h3><ul><li>f</li></ul>${sm([['Style', 'badges']])}</div>`);
  assert.equal(footerTop(d.querySelector('main')), true);
  assert.equal(d.querySelectorAll('main > div').length, 2);
  assert.equal(d.querySelector('.section-metadata div div:last-child').textContent, 'badges, in-columns');
});
