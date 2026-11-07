/* eslint-disable max-len, import/extensions */
/* SWISS's current information (brief 455, item 2): on www the message center (its live notices)
   opens the sidebar's content, in the column beside the aside; ours stood with the title above the
   sidebar's section, 938 px wide where the content column is 843 px. tools/importer/swiss-sidebar.mjs:
   when www's sidebar content opens with the message center (.messagecenterwrapper), the document's
   message-center block right before the content's start belongs to the content. Others as before.
   Run: node --max-old-space-size=512 --test test/swiss-mc-sidebar-455.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { withSwissSidebar, withSwissAccordions } from '../tools/importer/swiss-sidebar.mjs';

const snap = (content, aside = '') => `<html><body><div class="contentpage"><h1>Current information</h1><div class="airem-sidebar"><div class="sidebar-content">${content}</div><div class="sidebar-aside">${aside}</div></div></div></body></html>`;
const MC = '<div class="messagecenterwrapper section"><div class="message-center-wrapper"><maui-collapsible-item class="mcm-critically-high"><div class="richtext"><p>In light of the current situation flights to Dubai are postponed.</p></div></maui-collapsible-item></div></div>';
const ACC = '<div class="accordion"><maui-collapsible><div class="accordionitem"><maui-collapsible-item headline="Important information for guests with baggage irregularities"><div class="richtext"><p>For guests with current baggage delivery irregularities, see our page on baggage problems.</p></div></maui-collapsible-item></div></maui-collapsible></div>';
const doc = (...secs) => `<body><header></header><main>${secs.map((s) => `<div>${s}</div>`).join('')}</main><footer></footer></body>`;
const sections = (d) => {
  const { document } = parseHTML(`<main>${d.match(/<main>([\s\S]*)<\/main>/)[1]}</main>`);
  return [...document.querySelector('main').children].map((s) => [...s.children].map((c) => c.className || c.tagName.toLowerCase()));
};

test('www\'s sidebar content opens with the message center: the block is the content\'s first, beside the aside', () => {
  const html = snap(MC + ACC);
  const page = doc('<h1>Current information</h1><div class="message-center"></div>', '<div class="metadata"><div><div>markets</div><div>ae/en</div></div></div>');
  const r = withSwissSidebar(withSwissAccordions(page, html).doc, html);
  assert.equal(r.made, 1, r.skipped.join());
  const s = sections(r.doc);
  assert.deepEqual(s[0], ['h1']);
  assert.deepEqual(s[1], ['message-center', 'accordion-columns']);
  assert.deepEqual(s[2], ['section-metadata']);
});

test('www\'s sidebar content without the message center: a message-center block before the start stays where it is', () => {
  const html = snap(ACC);
  const page = doc('<h1>Current information</h1><div class="message-center"></div>');
  const r = withSwissSidebar(withSwissAccordions(page, html).doc, html);
  assert.equal(r.made, 1, r.skipped.join());
  assert.deepEqual(sections(r.doc)[0], ['h1', 'message-center']);
});

test('the block\'s CSS: in a sidebar\'s content the content column\'s width (else lh-com\'s 74.2 % from 768 px)', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../blocks/message-center/message-center.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('@media (width >= 768px) { .message-center { width: 74.2%; } }'));
  assert.ok(css.includes('@media (width >= 768px) { main > .section.with-aside .message-center { width: auto; } }'));
});
