/* eslint-disable max-len, import/extensions -- dev tooling */
/* Austrian's chat button (brief 438): its page metadata row "chat-button" (the webchat's start topic) was
   written into the documents outside the importer, so a re-import dropped it (11 of the 42 documents of
   austrian-parity-002 lost it on 2026-11-06). www's page says the topic: webchat_init.js?...start=
   DYNAMIC_web-<topic> (equal to the row on all 139 documents that have both). withChatButton writes the row
   from the snapshot when the document has none; a row that is there (the contact forms' "open") stays.
   Run: node --max-old-space-size=512 --test test/austrian-chat-button.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const meta = (rows) => `<div class="metadata">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;
const snap = (topic) => `<html><head><script src="https://www.austrian.com/digitalassistant/support/webchat_init.js?language=DE&amp;start=DYNAMIC_web-${topic}"></script></head></html>`;

test('the topic of www\'s webchat as the chat-button row, after the metadata\'s other rows', async () => {
  const { withChatButton } = await import('../tools/importer/austrian-import.mjs');
  const doc = `<div><h1>Gepäckprobleme</h1>${meta([['nav', '/at/de/nav'], ['footer', '/at/de/footer']])}</div>`;
  assert.equal(withChatButton(doc, snap('baggage_problems')), `<div><h1>Gepäckprobleme</h1>${meta([['nav', '/at/de/nav'], ['footer', '/at/de/footer'], ['chat-button', 'baggage_problems']])}</div>`);
});

test('a row that is there stays; no topic, no row', async () => {
  const { withChatButton } = await import('../tools/importer/austrian-import.mjs');
  const open = `<div>${meta([['chat-button', 'open']])}</div>`;
  assert.equal(withChatButton(open, snap('x')), open);
  const none = `<div>${meta([['nav', '/at/de/nav']])}</div>`;
  assert.equal(withChatButton(none, '<html></html>'), none);
});

test('the import writes it', () => {
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /const next = withChatButton\(withOpenFirst\(withPoiPoints\(withPartnerLogoAlts\(/);
});
