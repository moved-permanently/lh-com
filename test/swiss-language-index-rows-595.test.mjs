/* eslint-disable max-len */
/* SWISS's ch/el and ch/ru language indexes miss their longest pages (standing order 11 of 2026-11-13, item 3): our host's
   /ch/el/sitemap-index.json lists /ch/el/terms-conditions/privacy-statement and /conditions-of-carriage, its
   /ch/el/language-index.json (the same include and exclude in helix-query.yaml) does not; ch/ru misses
   conditions-of-carriage the same way; the eight other ch/<ll> indexes hold every page of their sitemap index. The
   language index row carries the page's running text (content), and Greek and Cyrillic take two bytes a character: the
   missing rows would be 99 to 135 KB, the largest row that is there 89,838 bytes (ch/ru's privacy statement), so the
   index leaves the page out. For ch/el and ch/ru the content column keeps the page's first 5,500 words (words() around
   textContent in `values` joins the list into one value), about 75 KB of Greek or Cyrillic; the other languages as
   before (their longest rows 72 KB, nothing missing).
   Run: node --test test/swiss-language-index-rows-595.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const yaml = fs.readFileSync(new URL('../helix-query.yaml', import.meta.url), 'utf8');
const index = (name) => {
  const i = yaml.indexOf(`\n  ${name}:\n`);
  assert.ok(i >= 0, name);
  const next = yaml.slice(i + 1).search(/\n {2}[a-z0-9-]+:\n/);
  return yaml.slice(i, next < 0 ? undefined : i + 1 + next);
};
const content = (block) => {
  const m = block.match(/\n {6}content:\n {8}select: ([^\n]+)\n {8}values?: ([^\n]+)/);
  assert.ok(m, 'a content property');
  return { select: m[1].trim(), value: m[2].trim() };
};

test('ch/el and ch/ru: the content column the first 5,500 words of the running text', () => {
  ['el', 'ru'].forEach((ll) => {
    const c = content(index(`language-ch-${ll}`));
    assert.equal(c.select, 'main p, main li, main div > a', ll);
    assert.equal(c.value, 'words(textContent(el), 0, 5500)', ll);
  });
});

test('the other SWISS languages as before: the whole running text as a list', () => {
  ['en', 'de', 'fr', 'it', 'es', 'zh', 'pt', 'ja'].forEach((ll) => {
    const c = content(index(`language-ch-${ll}`));
    assert.equal(c.value, 'textContent(el)', ll);
  });
});
