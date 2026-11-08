/* eslint-disable max-len */
/* Brief 484: campaign pages (100-years/campaigns, chronicle and the other campaign pages at 20-33 %)
   are built of www's AEM sections (.container-content > .section), each padded 2rem / 4rem above and
   below (.section-padding-y-regular) or not, each with .mb-default's 2.4rem under it or not.
   lufthansa-sections keeps an unpadded AEM section with the one before it, so on campaigns 20
   AEM sections came in as 9 of ours and an author quote between two padded column views had
   128 px above it instead of www's 152. The campaign template's own transformer
   (campaign-sections, after lufthansa-sections) makes each AEM section a section of ours, style
   campaign-section + padded + spaced / flush; styles.css gives campaign-section no section gap.
   WebImporter's createBlock and linkedom's Range are stand-ins (as importer-tab-sections).
   Run: node --max-old-space-size=256 --test test/campaign-sections-484.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { default: sectionsTransform } = await import('../tools/importer/transformers/lufthansa-sections.js');
const { default: campaignTransform } = await import('../tools/importer/transformers/campaign-sections.js');
const { default: cleanupTransform } = await import('../tools/importer/transformers/lufthansa-cleanup.js');

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
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

// www's AEM section: wrapper (mb-default or not) > section-content (padded or not) > components
const aem = (inner, { mb = true, pad = true, grey = false } = {}) => `<div class="section"><div class="${grey ? 'section-regular container-gray ' : ''}${mb ? 'mb-default' : ''}"><div class="section-content container-fluid section-regular ${pad ? 'section-padding-y-regular' : ''}">${inner}</div></div></div>`;
const CAMPAIGNS = [
  aem('<div class="inspirationteaser"><h1>Stage</h1></div>', { pad: false }),
  // www's intro text ends with an empty paragraph (its line and margin: 51px)
  aem('<div class="headline"><h2>A mirror of society</h2></div><div class="text"><div class="richtext"><p>Intro</p><p><br></p></div></div>'),
  aem('<div class="image"><img src="/big.jpg" alt=""></div>'),
  aem(['Row', 'Row 2'].map((t) => `<div class="twocolumn"><div class="column-view"><div class="row"><div class="column-view-item"><div class="image"><img src="/a.jpg" alt=""></div></div><div class="column-view-item"><div class="text"><p>${t}</p></div></div></div></div></div>`).join('')
    // an empty separator ends it (cabin-design: live keeps its 40px in the section)
    + '<div class="separator section"><div aria-hidden="true" style="margin-bottom: 40px;" class="hr hr-no-layout"><maui-divider></maui-divider></div></div>', { mb: false }),
  // as lufthansa-cleanup leaves a quote alone in its AEM section after a padded one: spacers for that padding
  aem('<p>{spacer-0}</p><p>{spacer-14 from-768}</p><blockquote class="authorquote"><p>Quote</p></blockquote>', { mb: false, pad: false }),
  aem('<div class="text"><p>After the quote</p></div>', { pad: false }),
  aem('<div class="text"><p>Note</p></div>', { grey: true }),
].join('');

const run = (transforms) => {
  const { document } = parseHTML(`<html><body><main><div class="container-content">${CAMPAIGNS}</div></main></body></html>`);
  const main = document.querySelector('main');
  document.createRange = () => rangeFor(document);
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
  // the template's sections: an unstyled one inside an AEM section (campaign's section-6)
  const template = { name: 'campaign', blocks: [], sections: [{ id: 's1', selector: '.inspirationteaser', style: null }, { id: 's6', selector: ['.section-content > .twocolumn + .twocolumn'], style: null }] };
  ['onLoad', 'beforeTransform', 'afterTransform'].forEach((hook) => transforms.forEach((t) => t(hook, main, { document, template })));
  return main.innerHTML.split('<hr>').map((html) => {
    const doc = parseHTML(`<html><body>${html}</body></html>`).document;
    const style = [...doc.querySelectorAll('table tr')].slice(1).map((tr) => tr.children[1].textContent).join('');
    doc.querySelectorAll('table').forEach((t) => t.remove());
    return { text: [...doc.querySelectorAll('h1, h2, p, .quote-text')].map((e) => e.textContent.trim()).filter(Boolean).join(' '), style: style.split(/,\s*/).filter(Boolean).sort() };
  }).filter((x, i, all) => i < all.length - 1 || x.text || x.style.length);
};

test('before: lufthansa-sections alone keeps the unpadded AEM sections with the padded one before them', () => {
  const s = run([sectionsTransform]);
  assert.ok(s.some((x) => x.text === 'Row 2 {spacer-0} {spacer-14 from-768} Quote After the quote'), JSON.stringify(s));
  assert.ok(s.some((x) => x.text === 'A mirror of society Intro'), 'the empty paragraph is no text');
  assert.ok(s.some((x) => x.text === 'Row'), 'the template splits the AEM section');
});

test('each AEM section of a campaign page is a section of ours, its padding and its gap as styles', () => {
  const s = run([sectionsTransform, campaignTransform]);
  assert.deepEqual(s.map((x) => x.text), ['Stage', 'A mirror of society Intro {spacer-50}', '', 'Row Row 2 {spacer-40}', 'Quote', 'After the quote', 'Note']);
  const by = (text) => s.find((x) => x.text === text).style;
  assert.deepEqual(by('Stage'), ['before-padded', 'stage']);
  assert.deepEqual(by('A mirror of society Intro {spacer-50}'), ['campaign-section', 'padded', 'spaced'], 'the empty paragraph a spacer');
  assert.deepEqual(s[2].style, ['campaign-section', 'padded', 'spaced'], 'the picture section');
  assert.deepEqual(by('Row Row 2 {spacer-40}'), ['campaign-section', 'flush', 'padded'], 'one AEM section, one of ours, the separator a spacer');
  assert.deepEqual(by('Quote'), ['campaign-section', 'flush'], 'no spacers: the padding above is the row section\'s own');
  assert.deepEqual(by('After the quote'), ['campaign-section', 'spaced']);
  assert.ok(!by('Note').includes('campaign-section') && by('Note').includes('grey'), 'grey keeps its own style');
});

test('the campaign template runs it after lufthansa-sections, in its import script and bundle', () => {
  const { templates } = JSON.parse(fs.readFileSync('tools/importer/page-templates.json', 'utf8'));
  assert.deepEqual(templates.find((t) => t.name === 'campaign').transformers, ['campaign-sections']);
  assert.ok(templates.filter((t) => t.name !== 'campaign').every((t) => !t.transformers), 'only campaign');
  const script = fs.readFileSync('tools/importer/import-campaign.js', 'utf8');
  assert.match(script, /const transformers = \[lufthansaCleanupTransformer, lufthansaSectionsTransformer, campaignSectionsTransformer\];/);
  assert.ok(!fs.readFileSync('tools/importer/import-info.js', 'utf8').includes('campaignSections'));
  assert.ok(fs.readFileSync('tools/importer/import-campaign.bundle.js', 'utf8').includes('campaign-section'));
});

test('styles.css: campaign-section has no section gap, spaced 2.4rem, no second top padding under a stage', () => {
  const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (sel) => {
    const at = css.indexOf(`${sel} {`);
    assert.ok(at >= 0, sel);
    return css.slice(at, css.indexOf('}', at));
  };
  assert.match(rule('body.brand-lufthansa main > .section.campaign-section'), /margin-bottom: 0;/);
  assert.match(rule('body.brand-lufthansa main > .section.campaign-section.spaced'), /margin-bottom: var\(--spacing-default\);/);
  assert.match(rule('body.brand-lufthansa main > .section.stage.before-padded + .section.campaign-section.padded'), /padding-top: 0;/);
});

test('styles.css: the campaign-section components spaced as live\'s (measured against www\'s render, 1440 and 390)', () => {
  const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (sel) => {
    const at = css.indexOf(`${sel} {`);
    assert.ok(at >= 0, sel);
    return css.slice(at, css.indexOf('}', at));
  };
  const S = 'body.brand-lufthansa main > .section.campaign-section';
  assert.match(rule(`${S}::after`), /display: table;/, 'bottom margins stay in the section');
  assert.match(rule(`${S} > .default-content-wrapper > blockquote`), /margin-inline: 15px;/);
  assert.match(rule(`${S} > .default-content-wrapper > blockquote:not(:has(> * + *))`), /padding-bottom: 10px;/);
  assert.match(rule(`${S} > .default-content-wrapper > p:has(> picture):not(:last-child)`), /margin-bottom: 40px;/);
  assert.match(rule(`${S} > .columns-media-wrapper:has(> .columns-media.sidebar) + div`), /margin-top: 0;/);
  assert.match(rule(`${S} > .columns-media-wrapper:last-child > .columns-media.padded:not(.sidebar)`), /padding-bottom: 32px;/);
  assert.match(rule(`${S} .cards-teaser .cards-teaser-body > .cards-teaser-title:last-child`), /margin-bottom: 0;/);
  assert.match(rule(`${S} > .cards-teaser-wrapper > .cards-teaser > ul`), /padding-bottom: 8px;/);
  assert.match(rule(`${S} > .cards-teaser-wrapper:last-child > .cards-teaser > ul`), /padding-bottom: 32px;/);
  assert.match(css, /@media \(width >= 1024px\) \{\s*body\.brand-lufthansa main > \.section\.campaign-section > \.default-content-wrapper > blockquote \{\s*margin-inline: 40px;/);
  assert.match(rule(`${S} > .default-content-wrapper:not(:has(> :not(p.spacer)))`), /margin-top: 24px;/);
  // live's separator is maui-divider's 1px box (shadow DOM): margins do not collapse through it, the
  // spacer keeps its N + 1 px (no campaign rule for its height)
  assert.ok(!css.includes(`${S} .default-content-wrapper > p.spacer`) && !css.includes('+ p.spacer:not(.divider'), 'no spacer height rule');
  assert.match(rule(`${S} > .default-content-wrapper:not(:has(> :not(p.spacer))) + div`), /margin-top: 0;/);
});

test('with the cleanup: the spacers keep no width marker (a full-width text\'s empty paragraph, a trailing separator)', () => {
  const sec = (inner) => aem(inner, { mb: false });
  const html = sec('<div class="headline"><h2>First</h2></div>') + sec('<div class="text"><div class="richtext"><p>Intro</p><p><br></p></div></div><div class="separator section"><div aria-hidden="true" style="margin-bottom: 40px;" class="hr hr-no-layout"><maui-divider></maui-divider></div></div>');
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content">${html}</div></main></body></html>`);
  const url = 'https://www.lufthansa.com/de/en/100-years/campaigns';
  const payload = { document, url, params: { originalURL: url }, template: { name: 'campaign', blocks: [], sections: [] } };
  ['onLoad', 'beforeTransform', 'afterTransform'].forEach((hook) => [cleanupTransform, campaignTransform].forEach((t) => t(hook, document.body, payload)));
  const texts = [...document.querySelectorAll('p')].map((x) => x.textContent.trim());
  assert.ok(texts.includes('Intro {full-width}'), JSON.stringify(texts));
  assert.ok(texts.includes('{spacer-50}'), JSON.stringify(texts));
  assert.ok(texts.includes('{spacer-40}'), JSON.stringify(texts));
});
