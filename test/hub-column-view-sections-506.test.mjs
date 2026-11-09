/* eslint-disable max-len, import/extensions -- marker-collapse.mjs is an ES module of its own */
/* global globalThis */
/* Brief 506 item 1, the column view carrier: after the marker collapse nothing marked a hub page's column views, so
   their H2 looked like any H2 (miles-and-more 7.2 -> 25.4 %, meetings-and-events 10.2 -> 25.2 % at 1440, collapsed
   drafts with the flow-spacing rule). The carrier is a section style: hub-column-views (afterTransform, after the
   cleanup wrote the marks and lufthansa-sections / campaign-sections the sections) makes each column view a section
   of its own:
   - a view in an AEM section ("{column-start}" ... "{column-end}"): its section's styles plus "column-view"
     (Section Metadata Style "Column view"; styles.css: 32 px above and below, 64 between two views, its headings
     two thirds wide);
   - a view directly in the page's container ("{column-start-outer}" ... "{column-end-outer}"): column-view and padded
     (www's outer view: 20 / 40 px; written here: a separator that opens the view keeps the collapse from padding it).
   The marks stay: they work until the collapse has run (a marker on an element wins), the collapse then removes
   them. Nested views stay inside their outer view's section; a view across a section break is left alone.
   Run: node --max-old-space-size=256 --test test/hub-column-view-sections-506.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

// helix-importer's createBlock: a table, its name in the first row, then key / value rows
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      const table = document.createElement('table');
      const head = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = name;
      head.append(th);
      table.append(head);
      Object.entries(cells).forEach(([k, v]) => {
        const tr = document.createElement('tr');
        [k, v].forEach((t) => { const td = document.createElement('td'); td.textContent = t; tr.append(td); });
        table.append(tr);
      });
      return table;
    },
  },
};
const { default: hubColumnViews } = await import('../tools/importer/transformers/hub-column-views.js');

const meta = (style) => `<table><tr><th>Section Metadata</th></tr><tr><td>style</td><td>${style}</td></tr></table>`;
const HUB = { name: 'hub', blocks: [] };

// the page after the other transformers' afterTransform: www's wrappers still around, the marks written
const MILES = `<html><body><div class="container-content"><div class="section"><div class="section-content">
<div class="headline"><h1>Miles &amp; More</h1></div><div class="text"><p>Intro</p></div>
<div class="onecolumn column"><div class="column-view"><div class="column-view-item"><div class="headline"><h2>Broaden {limited-width column-start}</h2></div><div class="text"><p>Text one {column-end}</p></div></div></div></div>
<div class="onecolumn column"><div class="column-view"><div class="column-view-item"><div class="headline"><h2>Earn miles {limited-width column-start}</h2></div><div class="text"><p>Text two</p><p>More two {column-end}</p></div></div></div></div>
<div class="onecolumn column"><div class="column-view"><div class="column-view-item"><div class="headline"><h2>Discover {limited-width column-start}</h2></div><div class="text"><p>Text three {column-end}</p></div></div></div></div>
<div class="link"><p><a href="/register">Register now</a></p></div>
${meta('flush, campaign-section')}</div></div>
<hr><div class="section"><div class="section-content"><h3>This might also interest you</h3><table><tr><th>Carousel Cards (grid)</th></tr><tr><td>Card</td></tr></table>
${meta('flush, campaign-section, padded')}</div></div></div></body></html>`;

// a line per element of the document's linear content: headings, paragraphs, breaks, blocks (Section Metadata with its style)
const outline = (document) => [...document.body.querySelectorAll('h1, h2, h3, p, hr, table')]
  .filter((el) => !el.parentElement.closest('table'))
  .map((el) => {
    if (el.tagName === 'HR') return '---';
    if (el.tagName === 'TABLE') {
      const name = el.querySelector('tr').textContent.trim();
      const style = [...el.querySelectorAll('tr')].slice(1).find((tr) => tr.firstElementChild.textContent.trim().toLowerCase() === 'style');
      return style ? `[${name}: ${style.lastElementChild.textContent}]` : `[${name}]`;
    }
    return `${el.tagName.toLowerCase()} ${el.textContent.trim()}`;
  });

const run = (html, template = HUB) => {
  const { document } = parseHTML(html);
  hubColumnViews('afterTransform', document.body, { document, template });
  return document;
};

test('miles-and-more: each column view in its AEM section a section of its own, style column-view; the rest keeps the section\'s styles', () => {
  assert.deepEqual(outline(run(MILES)), [
    'h1 Miles & More', 'p Intro', '[Section Metadata: flush, campaign-section]', '---',
    'h2 Broaden {limited-width column-start}', 'p Text one {column-end}', '[Section Metadata: flush, campaign-section, column-view]', '---',
    'h2 Earn miles {limited-width column-start}', 'p Text two', 'p More two {column-end}', '[Section Metadata: flush, campaign-section, column-view]', '---',
    'h2 Discover {limited-width column-start}', 'p Text three {column-end}', '[Section Metadata: flush, campaign-section, column-view]', '---',
    'p Register now', '[Section Metadata: flush, campaign-section]', '---',
    'h3 This might also interest you', '[Carousel Cards (grid)]', '[Section Metadata: flush, campaign-section, padded]',
  ]);
});

test('www\'s column wrapper is the view: a link after the last marked text but in the view stays in the view\'s section', () => {
  const VIEW = '<div class="onecolumn column"><div class="column-view"><div class="column-view-item"><div class="headline"><h2>Discover {limited-width column-start}</h2></div><div class="text"><p>Text three {column-end}</p></div><div class="link"><a href="/register">Register now</a></div></div></div></div>';
  const html = `<html><body><div class="section-content"><p>Intro</p>${VIEW}<div class="text"><p>Outro</p></div>${meta('flush, campaign-section')}</div></body></html>`;
  const { document } = parseHTML(html);
  hubColumnViews('afterTransform', document.body, { document, template: HUB });
  const view = document.querySelector('.onecolumn');
  // the breaks right before and after the wrapper; the view's metadata the wrapper's last child
  assert.equal(view.previousElementSibling.tagName, 'HR');
  assert.equal(view.nextElementSibling.tagName, 'HR');
  assert.ok(view.lastElementChild.tagName === 'TABLE' && view.lastElementChild.textContent.includes('column-view'));
  assert.ok(view.contains(document.querySelector('a[href="/register"]')));
  assert.deepEqual(outline(document), ['p Intro', '[Section Metadata: flush, campaign-section]', '---', 'h2 Discover {limited-width column-start}', 'p Text three {column-end}', '[Section Metadata: flush, campaign-section, column-view]', '---', 'p Outro', '[Section Metadata: flush, campaign-section]']);
});

test('a view that ends its section takes the section\'s own metadata; one that starts it needs no break before it', () => {
  const html = `<html><body><h2>Only view {column-start}</h2><p>Its text {column-end}</p>${meta('spaced')}<hr><p>Next</p></body></html>`;
  assert.deepEqual(outline(run(html)), ['h2 Only view {column-start}', 'p Its text {column-end}', '[Section Metadata: spaced, column-view]', '---', 'p Next']);
  const bare = '<html><body><p>Intro</p><p>{column-start}</p><h2>View</h2><p>Text {column-end}</p></body></html>';
  assert.deepEqual(outline(run(bare)), ['p Intro', '---', 'p {column-start}', 'h2 View', 'p Text {column-end}', '[Section Metadata: column-view]']);
});

test('outer views (directly in the container): a section of their own, column-view and padded (www\'s outer view; a separator in it would keep the collapse from padding it)', () => {
  const html = `<html><body><h1>Meetings</h1><p>Intro</p><h2>Benefits {column-start-outer}</h2><p>Text {column-end-outer}</p><h2>Requirements {column-start-outer}</h2><p>More {column-end-outer}</p>${meta('flush, campaign-section')}</body></html>`;
  assert.deepEqual(outline(run(html)), [
    'h1 Meetings', 'p Intro', '[Section Metadata: flush, campaign-section]', '---',
    'h2 Benefits {column-start-outer}', 'p Text {column-end-outer}', '[Section Metadata: flush, campaign-section, column-view, padded]', '---',
    'h2 Requirements {column-start-outer}', 'p More {column-end-outer}', '[Section Metadata: flush, campaign-section, column-view, padded]',
  ]);
});

test('a view that is not its AEM section\'s last piece is flush (no gap to the next piece); the last one keeps the section\'s own edge', () => {
  const html = `<html><body><p>Intro</p><h2>One {column-start-outer}</h2><p>Text {column-end-outer}</p><p>Between</p><h2>Two {column-start}</h2><p>Text {column-end}</p>${meta('spaced')}<hr><p>Next</p></body></html>`;
  assert.deepEqual(outline(run(html)), [
    'p Intro', '[Section Metadata: spaced]', '---',
    'h2 One {column-start-outer}', 'p Text {column-end-outer}', '[Section Metadata: flush, column-view, padded]', '---',
    'p Between', '[Section Metadata: spaced]', '---',
    'h2 Two {column-start}', 'p Text {column-end}', '[Section Metadata: spaced, column-view]', '---', 'p Next',
  ]);
});

test('separators between two views open the next view\'s section (no section of separators only; the collapse makes them its edge style)', () => {
  const html = '<html><body><h2>One {column-start-outer}</h2><p>Text {column-end-outer}</p><p>{divider-25}</p><h2>Two {column-start-outer}</h2><p>More {column-end-outer}</p></body></html>';
  assert.deepEqual(outline(run(html)), [
    'h2 One {column-start-outer}', 'p Text {column-end-outer}', '[Section Metadata: flush, column-view, padded]', '---',
    'p {divider-25}', 'h2 Two {column-start-outer}', 'p More {column-end-outer}', '[Section Metadata: column-view, padded]',
  ]);
  const after = '<html><body><p>Intro</p><table><tr><th>Jump Links</th></tr></table><div><p>{spacer-40}</p></div><div class="onecolumn column"><h2>One {column-start-outer}</h2><p>Text {column-end-outer}</p></div></body></html>';
  assert.deepEqual(outline(run(after)), ['p Intro', '[Jump Links]', '---', 'p {spacer-40}', 'h2 One {column-start-outer}', 'p Text {column-end-outer}', '[Section Metadata: column-view, padded]']);
});

test('a nested view stays in its outer view\'s section; a view across a section break, marks in a block and other templates are left alone', () => {
  const nested = '<html><body><p>Intro</p><h2>Outer {column-start-outer}</h2><p>{column-start}</p><p>Inner {column-end}</p><p>Last {column-end-outer}</p></body></html>';
  assert.deepEqual(outline(run(nested)), ['p Intro', '---', 'h2 Outer {column-start-outer}', 'p {column-start}', 'p Inner {column-end}', 'p Last {column-end-outer}', '[Section Metadata: column-view, padded]']);
  const across = '<html><body><p>Intro</p><h2>View {column-start}</h2><hr><p>Text {column-end}</p></body></html>';
  assert.deepEqual(outline(run(across)), ['p Intro', 'h2 View {column-start}', '---', 'p Text {column-end}']);
  const inBlock = '<html><body><p>Intro</p><table><tr><th>Columns Media</th></tr><tr><td><p>Cell {column-start}</p><p>End {column-end}</p></td></tr></table></body></html>';
  assert.deepEqual(outline(run(inBlock)), ['p Intro', '[Columns Media]']);
  assert.deepEqual(outline(run(MILES, { name: 'info', blocks: [] })), outline(parseHTML(MILES).document));
});

test('the collapse keeps the column-view sections and removes the marks', async () => {
  const { collapseHtml } = await import('../tools/importer/marker-collapse.mjs');
  const document = run(MILES);
  const r = collapseHtml(document.body.innerHTML, {
    path: '/de/en/miles-and-more', brand: 'lufthansa', force: true, parse: (h) => parseHTML(h),
  });
  // the section styles (www's wrappers have class="column-view" too)
  assert.equal((r.html.match(/campaign-section, column-view</g) || []).length, 3, r.html.slice(0, 3000));
  assert.ok(!/\{[a-z -]*column-/.test(r.html), 'no column mark left');
  const outer = run('<html><body><p>Intro</p><h2>Benefits {column-start-outer}</h2><p>Text {column-end-outer}</p><p>Outro</p></body></html>');
  const o = collapseHtml(outer.body.innerHTML, {
    path: '/de/en/meetings-and-events', brand: 'lufthansa', force: true, parse: (h) => parseHTML(h),
  });
  assert.equal((o.html.match(/padded/g) || []).length, 1, o.html);
});
