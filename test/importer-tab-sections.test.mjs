/* eslint-disable max-len */
/* lufthansa.com's importer (tools/importer/transformers/lufthansa-sections.js): a tab control whose
   panels hold column views (www's maui-tab-control-responsive on /de/en/advance-seat-reservation:
   a panel per travel class, each a heading and picture | text rows) becomes one section per panel
   with the section metadata Tab (the panel's name), as scripts/section-tabs.js reads them (SWISS's
   and Austrian's tabs); a break after the control ends the set. Before, the panels came in flat,
   one after the other. A tab control a template block takes (profile-tabs: text-only panels) and
   one without column views stay as they are. WebImporter's createBlock is a stand-in here.
   Run: node --max-old-space-size=256 --test test/importer-tab-sections.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { default: transform } = await import('../tools/importer/transformers/lufthansa-sections.js');

globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      const table = document.createElement('table');
      const head = document.createElement('tr');
      head.innerHTML = `<th>${name}</th>`;
      table.append(head);
      Object.entries(cells).forEach(([k, v]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${k}</td><td>${v}</td>`;
        table.append(tr);
      });
      return table;
    },
  },
};

// linkedom's Range lacks what the transformer uses (setStart, a setEndBefore that works on any
// node): a stand-in by document order, cloneContents the nodes wholly between the boundaries
function rangeFor(document) {
  const pre = new Map();
  const post = new Map();
  let c = 0;
  const walk = (n) => {
    pre.set(n, c += 1);
    [...n.childNodes].forEach(walk);
    post.set(n, c += 1);
  };
  walk(document.documentElement);
  let start = 0;
  let end = Infinity;
  const inside = (n) => pre.has(n) && pre.get(n) > start && post.get(n) < end;
  return {
    setStart(node) { start = pre.get(node); },
    setStartAfter(node) { start = post.get(node); },
    setEndBefore(node) { end = pre.get(node); },
    cloneContents() {
      const frag = document.createElement('div');
      const add = (n) => {
        if (inside(n) && !inside(n.parentNode)) frag.append(n.cloneNode(true));
        else [...n.childNodes].forEach(add);
      };
      add(document.documentElement);
      return frag;
    },
  };
}

const row = (title) => `<div class="twocolumn column"><div class="column-view"><div class="row"><div class="column-view-item"><div class="image"><img src="/a.jpg"></div></div><div class="column-view-item"><h2>${title}</h2><p>Text</p></div></div></div></div>`;
const page = (tabs) => parseHTML(`<html><body><main><div class="container-content"><div class="section"><div><div class="section-content"><h1>Seat reservation</h1><p>Intro</p>${tabs}<p>After the tabs</p></div></div></div></div></main></body></html>`).document;
const run = (document, template = { name: 'info', blocks: [], sections: [] }) => {
  const main = document.querySelector('main');
  document.createRange = () => rangeFor(document);
  // linkedom's compareDocumentPosition misses a node after an ancestor's sibling: by document order
  const order = () => {
    const at = new Map();
    let c = 0;
    const walk = (n) => { at.set(n, c += 1); [...n.childNodes].forEach(walk); };
    walk(document.documentElement);
    return at;
  };
  Object.getPrototypeOf(Object.getPrototypeOf(main)).compareDocumentPosition = function position(other) {
    const at = order();
    return at.get(other) > at.get(this) ? 4 : 2;
  };
  transform('beforeTransform', main, { document, template });
  transform('afterTransform', main, { document, template });
  return main;
};
// the sections of the result: the content between breaks, each with its metadata rows
const sections = (main) => main.innerHTML.split('<hr>').map((html) => {
  const doc = parseHTML(`<html><body>${html}</body></html>`).document;
  const meta = [...doc.querySelectorAll('table tr')].slice(1).map((tr) => [...tr.children].map((c) => c.textContent).join(': '));
  return { text: doc.body.textContent.replace(/\s+/g, ' ').trim(), meta };
});

test('a tab control with column views: a section per panel with Tab, a break after it', () => {
  const document = page(`<div class="tabs panelcontainer"><maui-tab-control-responsive><maui-tab-control-panel-responsive name="Economy Class" navigation-id="eco"><h2>European flights</h2>${row('Classic Seat')}${row('Preferred Zone Seat')}</maui-tab-control-panel-responsive><maui-tab-control-panel-responsive name="Business Class" navigation-id="bus">${row('Business Seat')}</maui-tab-control-panel-responsive></maui-tab-control-responsive></div>`);
  const s = sections(run(document));
  assert.equal(s.length, 4);
  assert.match(s[0].text, /^Seat reservation\s*Intro$/);
  assert.deepEqual(s[0].meta, []);
  assert.match(s[1].text, /European flights\s*Classic Seat\s*Text\s*Preferred Zone Seat\s*Text/);
  assert.deepEqual(s[1].meta, ['Tab: Economy Class']);
  assert.match(s[2].text, /Business Seat\s*Text/);
  assert.deepEqual(s[2].meta, ['Tab: Business Class']);
  assert.match(s[3].text, /^After the tabs$/);
  assert.deepEqual(s[3].meta, []);
});

test('a tab control a template block takes, or one without column views: unchanged', () => {
  const plain = '<div class="tabs panelcontainer"><maui-tab-control-responsive><maui-tab-control-panel-responsive name="A"><p>Only text</p></maui-tab-control-panel-responsive><maui-tab-control-panel-responsive name="B"><p>More text</p></maui-tab-control-panel-responsive></maui-tab-control-responsive></div>';
  assert.equal(sections(run(page(plain))).length, 1);
  const taken = `<div class="tabs panelcontainer mapped"><maui-tab-control-responsive><maui-tab-control-panel-responsive name="A">${row('X')}</maui-tab-control-panel-responsive></maui-tab-control-responsive></div>`;
  assert.equal(sections(run(page(taken), { name: 'info', blocks: [{ name: 'profile-tabs', instances: ['.tabs.panelcontainer.mapped'] }], sections: [] })).length, 1);
});

test('info: the rows of a tab panel (picture | text) as columns-media, in the template and its import script', async () => {
  const fs = await import('node:fs');
  const SEL = 'maui-tab-control-panel-responsive :is(.twocolumn, .threecolumn):has(> .column-view > .row > .column-view-item > .image img)';
  const { templates } = JSON.parse(fs.readFileSync('tools/importer/page-templates.json', 'utf8'));
  const info = templates.find((t) => t.name === 'info').blocks.find((b) => b.name === 'columns-media');
  assert.ok(info.instances.some((s) => s.startsWith(SEL)));
  assert.ok(fs.readFileSync('tools/importer/import-info.js', 'utf8').includes(SEL));
});

// Brussels' /be/fr/extra-services/baggage/problems-with-your-baggage (tools/reports/brussels/parity.md
// P36): three tabs, accordions in each, came in one under the other (3617 px, www 2619)
test('a tab control whose panels hold accordions: a section per panel with Tab', () => {
  const acc = (q) => `<div class="accordion commonevent"><maui-collapsible class="accordion-maui"><div class="accordionitem"><maui-collapsible-item headline="${q}"><p>Answer</p></maui-collapsible-item></div></maui-collapsible></div>`;
  const document = page(`<div class="tabs panelcontainer"><maui-tab-control-responsive><maui-tab-control-panel-responsive name="Bagage retardé ou perdu">${acc('Que faire ?')}</maui-tab-control-panel-responsive><maui-tab-control-panel-responsive name="Bagage endommagé">${acc('Comment déclarer ?')}</maui-tab-control-panel-responsive><maui-tab-control-panel-responsive name="Objets disparus">${acc('Où chercher ?')}</maui-tab-control-panel-responsive></maui-tab-control-responsive></div>`);
  const s = sections(run(document));
  assert.equal(s.length, 5);
  assert.deepEqual(s.slice(1, 4).map((x) => x.meta), [['Tab: Bagage retardé ou perdu'], ['Tab: Bagage endommagé'], ['Tab: Objets disparus']]);
  assert.match(s[4].text, /^After the tabs$/);
});

// Austrian parity row 43 (brief 444): a grey band inside a tab panel opens a section of its own (style grey) and a
// break after it; those sections had no Tab, so the band (and what follows it in the panel) showed under every tab.
// A break inside a panel now carries the panel's Tab: lh-com's own panels (maui-tab-control-panel-responsive) and
// the panels SWISS's and Austrian's import mark with paragraphs (withTabMarkers: @@tab@@<set>@@<label>@@ ...
// @@tabs-end@@, split by splitTabSections after the import), there with the set as Tabs.
const band = '<div class="twocolumn column"><div class="column-view container-gray full-width-bg"><div class="row"><div class="column-view-item"><h2>In the band</h2></div></div></div></div>';
const mark = (t) => `<div class="text section"><div class="richtext"><p>${t}</p></div></div>`;

test('a grey band inside lh-com\'s own tab panel: its section and the one after it carry the panel\'s Tab', () => {
  const document = page(`<div class="tabs panelcontainer"><maui-tab-control-responsive><maui-tab-control-panel-responsive name="Economy Class">${row('Classic Seat')}${band}<p>After the band</p></maui-tab-control-panel-responsive><maui-tab-control-panel-responsive name="Business Class">${row('Business Seat')}</maui-tab-control-panel-responsive></maui-tab-control-responsive></div>`);
  const s = sections(run(document));
  const tabs = s.filter((x) => x.meta.some((m) => m.startsWith('Tab: ')));
  assert.deepEqual(tabs.map((x) => x.meta.find((m) => m.startsWith('Tab: '))), ['Tab: Economy Class', 'Tab: Economy Class', 'Tab: Economy Class', 'Tab: Business Class']);
  assert.ok(tabs[1].meta.some((m) => m.startsWith('style: ') && m.split(/[:,]\s*/).includes('grey')), 'the band keeps its style');
  assert.match(tabs[2].text, /After the band/);
  assert.match(s.at(-1).text, /^After the tabs$/);
  assert.deepEqual(s.at(-1).meta, []);
});

test('a grey band inside a marked panel (SWISS / Austrian tab markers): its sections carry the panel\'s Tab and Tabs; outside the set none', () => {
  const document = page(`${mark('@@tab@@1@@Verspätet@@')}<p>A</p>${band}<p>After the band</p>${mark('@@tab@@1@@Beschädigt@@')}<p>B</p>${mark('@@tabs-end@@')}${band}`);
  const s = sections(run(document));
  const tabRows = (x) => x.meta.filter((m) => m.startsWith('Tab: ') || m.startsWith('Tabs: '));
  const i = s.findIndex((x) => x.text.startsWith('In the band') && !x.text.includes('After the band'));
  assert.ok(i > 0, 'the band a section');
  assert.deepEqual(tabRows(s[i]), ['Tab: Verspätet', 'Tabs: 1']);
  assert.ok(s[i].meta.some((m) => m.startsWith('style: ') && m.split(/[:,]\s*/).includes('grey')));
  assert.match(s[i + 1].text, /^After the band/);
  assert.deepEqual(tabRows(s[i + 1]), ['Tab: Verspätet', 'Tabs: 1'], 'the panel after the band');
  const last = s.filter((x) => x.text.includes('In the band')).at(-1);
  assert.deepEqual(tabRows(last), [], 'a band after the set: no Tab');
  // the panel's part after the band ends at the next marker (a break before it), so its Tab rows stay with it:
  // splitTabSections gives a section's own rows to what follows the set's end marker
  const after = s[i + 1];
  assert.ok(!after.text.includes('B'), 'the next panel not in it');
  assert.ok(s.some((x) => x.text.startsWith('@@tab@@1@@Beschädigt@@')), 'the next panel opens a section at its marker');
});
