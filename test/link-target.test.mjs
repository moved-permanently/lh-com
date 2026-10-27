/* Page metadata `Links: new-tab` (scripts/link-target.js): links in main open in a new tab.
   Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import openLinksInNewTab from '../scripts/link-target.js';

const here = new URL('https://main--lh-com--moved-permanently.aem.page/migration-status/author-guide');

function main(html) {
  const { document } = parseHTML(`<html><body><main>${html}</main></body></html>`);
  return document.querySelector('main');
}

test('every link to another page or site gets target _blank and rel noopener', () => {
  const m = main('<p><a href="https://da.live/edit#/moved-permanently/lh-com/de/en/homepage">DA</a>'
    + ' <a href="/de/en/homepage">home</a> <a href="http://main--lh-com--moved-permanently.aem.live/de/en/homepage">live</a></p>'
    + '<div class="cards-steps"><a href="/migration-status#next">status</a></div>');
  openLinksInNewTab(m, here);
  m.querySelectorAll('a').forEach((a) => {
    assert.equal(a.getAttribute('target'), '_blank', a.getAttribute('href'));
    assert.equal(a.getAttribute('rel'), 'noopener', a.getAttribute('href'));
  });
});

test('links to a place on the same page stay in the tab', () => {
  const m = main('<a href="#blocks">Blocks</a><a href="/migration-status/author-guide#blocks">Blocks</a>'
    + `<a href="${here.href}#x">x</a>`);
  openLinksInNewTab(m, here);
  m.querySelectorAll('a').forEach((a) => {
    assert.equal(a.getAttribute('target'), null, a.getAttribute('href'));
    assert.equal(a.getAttribute('rel'), null, a.getAttribute('href'));
  });
});

test('mailto and tel links are left alone, existing rel values are kept', () => {
  const m = main('<a href="mailto:a@example.com">mail</a><a href="tel:+49">call</a>'
    + '<a href="https://example.com" rel="nofollow">ext</a>');
  openLinksInNewTab(m, here);
  const [mail, tel, ext] = m.querySelectorAll('a');
  assert.equal(mail.getAttribute('target'), null);
  assert.equal(tel.getAttribute('target'), null);
  assert.equal(ext.getAttribute('target'), '_blank');
  assert.equal(ext.getAttribute('rel'), 'nofollow noopener');
});
