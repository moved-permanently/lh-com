/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 582, rule 6 (the loungenet first-class lounge pages, 36.1 % at 390 and 31.3 % at 1440 in the ranking): their
   service tiles' "eJournals" link (https://box.media-carrier.de/?b=77754&l=en#ejournals, alone under its picture in a
   Columns Media cell) became the 520 px newsstand iframe; on www it is a link (↗ eJournals). The newsstand embeds of
   unterhaltung-an-bord and lufthansa-ejournals are bare links (DA writes the address as the text, in Embed blocks).
   A link to the newsstand is an embed only when its text is its address; other embeds as before. With the tiles'
   lone links as www's standalone links (blocks/columns-media): fra-first-class-lounge-b 36.1 -> 28.1 % (390),
   31.3 -> 8.3 % (1440). The census (6,826 documents and the loungenet fragments) has one labelled newsstand link.
   Run: node --max-old-space-size=256 --test test/newsstand-label-link-582.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="language" content="en"></head><body></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/en/fragments/loungenet-first-class-lounge', search: '', href: 'https://lufthansa.turnsthe.page/de/en/fragments/loungenet-first-class-lounge', origin: 'https://lufthansa.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://lufthansa.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
const { isEmbedLink } = await import('../scripts/media.js');

const link = (href, text = href) => {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  const p = document.createElement('p');
  p.append(a);
  document.body.append(p);
  return a;
};

test('a labelled link to the newsstand stays a link; its bare address is the embed', () => {
  assert.equal(isEmbedLink(link('https://box.media-carrier.de/?b=77754&l=en#ejournals', 'eJournals')), false);
  assert.equal(isEmbedLink(link('https://box.media-carrier.de/home?b=77745&l=de')), true);
});

test('other embeds as before: a labelled YouTube link alone in its paragraph is the player', () => {
  assert.equal(isEmbedLink(link('https://www.youtube.com/watch?v=51hTCJhsJa8', 'Watch the film')), true);
});

test('columns-media.css: a media cell\'s lone link under its picture is the standalone link', () => {
  const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const SEL = 'body.brand-lufthansa main .columns-media .columns-media-media > p:has(> picture) + p.link-wrapper:last-child';
  assert.ok(css.includes(`${SEL} { margin-top: 22px; }`));
  assert.ok(css.includes(`@media (width >= 768px) { ${SEL} { margin-top: 40px; } }`));
  assert.ok(css.includes(`${SEL} > a:any-link::before { content: ""; flex: 0 0 auto; align-self: center; width: 19px; height: 19px;`));
});
