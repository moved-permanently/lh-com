/* eslint-disable max-len, import/no-unresolved */
/* The not-found page per brand (scripts/not-found.js): the 404 has no metadata of its own, so it
   takes the brand of its site from the site's /metadata.json (brand row), the nav, footer and
   language its pages carry (sites without roots: their language prefix; with roots: the path's
   <cc>/<ll>), the brand in its title, and only links to pages that exist on the site (no
   Lufthansa search, no www.lufthansa.com help page). lh-com (no brand row): as before.
   Run: node --max-old-space-size=512 --test test/not-found-brand.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseHTML } from 'linkedom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** A 404 page at a path (linkedom), as globals. */
function page(pathname, brand = '') {
  const { window, document } = parseHTML(`<!DOCTYPE html><html><head><title>Page not found | Lufthansa</title><meta property="og:title" content="Page not found | Lufthansa">${brand ? `<meta name="brand" content="${brand}">` : ''}</head><body><header></header><main><div><h1>Page not found</h1></div></main><footer></footer></body></html>`);
  window.location = {
    hostname: 'example.org', pathname, search: '', href: `https://example.org${pathname}`, origin: 'https://example.org',
  };
  globalThis.window = window;
  globalThis.document = document;
  return document;
}

page('/de/en/zz');
const nf = await import('../scripts/not-found.js');

test('metadataBrand: the brand row of /metadata.json that matches the path', () => {
  assert.equal(nf.metadataBrand([{ URL: '/**', robots: 'noindex, nofollow', brand: 'ita' }], '/it/en/x'), 'ita');
  assert.equal(nf.metadataBrand([{ URL: '/**', robots: 'noindex, nofollow' }], '/de/en/x'), '', 'lh-com: no brand row');
  assert.equal(nf.metadataBrand([{ URL: '/en/**', brand: 'cargo' }], '/en/x'), 'cargo');
  assert.equal(nf.metadataBrand([{ URL: '/en/**', brand: 'cargo' }], '/de/x'), '');
  assert.equal(nf.metadataBrand([{ URL: '/**', brand: 'unknown' }], '/x'), '', 'unknown brands are none');
  assert.equal(nf.metadataBrand(undefined, '/x'), '');
});

test('brandPageMeta: the rows the site\'s pages carry', () => {
  assert.deepEqual(nf.brandPageMeta('/en/no-such', 'cargo'), {
    brand: 'cargo', language: 'en', nav: '/en/nav', footer: '/en/footer',
  });
  assert.deepEqual(nf.brandPageMeta('/de/ci/x', 'cargo'), {
    brand: 'cargo', language: 'de', nav: '/de/nav', footer: '/de/footer',
  });
  assert.deepEqual(nf.brandPageMeta('/x', 'cargo'), {
    brand: 'cargo', language: 'en', nav: '/en/nav', footer: '/en/footer',
  }, 'outside the prefixes: the first language');
  assert.deepEqual(nf.brandPageMeta('/voli/x', 'airdolomiti'), {
    brand: 'airdolomiti', language: 'it', nav: '/nav', footer: '/footer',
  });
  assert.deepEqual(nf.brandPageMeta('/it/en/no-such', 'ita'), { brand: 'ita', nav: '/it/en/nav', footer: '/it/en/footer' });
  assert.deepEqual(nf.brandPageMeta('/xx/fr/a/b', 'discover'), { brand: 'discover', nav: '/xx/fr/nav', footer: '/xx/fr/footer' });
  assert.deepEqual(nf.brandPageMeta('/x', 'ita'), { brand: 'ita' });
});

test('a brand\'s 404: its name in the title, only links that exist on the site, no Lufthansa search or help', async () => {
  const doc = page('/it/en/no-such', 'ita');
  const asked = [];
  await nf.buildBrandNotFound(doc.querySelector('main'), async (href) => { asked.push(href); return href === '/it/en/homepage'; });
  const main = doc.querySelector('main');
  assert.equal(main.querySelector('h1').textContent, 'Page not found');
  assert.deepEqual([...main.querySelectorAll('a')].map((a) => a.getAttribute('href')), ['/it/en/homepage']);
  assert.ok(main.querySelector('form') === null, 'no search field (www.lufthansa.com\'s search)');
  assert.doesNotMatch(main.innerHTML, /lufthansa\.com/);
  assert.equal(doc.title, 'Page not found | ITA Airways');
  assert.equal(doc.querySelector('meta[property="og:title"]').content, 'Page not found | ITA Airways');
  assert.ok(asked.every((h) => h.startsWith('/it/en/')), 'same-origin pages of the root only');
  assert.ok(asked.length >= 2, 'every candidate is checked');

  const cargo = page('/en/no-such', 'cargo');
  Object.entries(nf.brandPageMeta('/en/no-such', 'cargo')).forEach(([k, v]) => nf.setMeta(k, v));
  await nf.buildBrandNotFound(cargo.querySelector('main'), async (href) => href === '/en/home');
  assert.deepEqual([...cargo.querySelectorAll('main a')].map((a) => a.getAttribute('href')), ['/en/home']);
  assert.equal(cargo.title, 'Page not found | Lufthansa Cargo');
  assert.equal(cargo.querySelector('meta[name="nav"]').content, '/en/nav');
});

test('lh-com\'s 404 exactly as before (the same markup as the previous not-found.js)', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nf-old-'));
  const old = execFileSync('git', ['show', 'b62c01c:scripts/not-found.js'], { cwd: root, encoding: 'utf8' })
    .replace(/from '\.\/locale\.js'/, `from '${pathToFileURL(path.join(root, 'scripts/locale.js')).href}'`);
  fs.writeFileSync(path.join(dir, 'old.mjs'), old);
  const one = async (p) => {
    const before = page(p);
    await import(`${pathToFileURL(path.join(dir, 'old.mjs')).href}?p=${encodeURIComponent(p)}`);
    const expected = [before.querySelector('main').innerHTML, before.title];
    const now = page(p);
    nf.buildNotFound(now.querySelector('main'));
    assert.deepEqual([now.querySelector('main').innerHTML, now.title], expected, p);
  };
  // one page at a time: the module and the page are globals
  await ['/de/en/no-such', '/de/de/x', '/gb/en/a/b', '/error.html'].reduce((prev, p) => prev.then(() => one(p)), Promise.resolve());
  fs.rmSync(dir, { recursive: true, force: true });
});

test('404.html: not-found.js loads scripts.js itself, after the brand is set', () => {
  const html = fs.readFileSync(path.join(root, '404.html'), 'utf8');
  assert.match(html, /<script nonce="aem" src="\/scripts\/not-found\.js" type="module"><\/script>/);
  assert.doesNotMatch(html, /src="\/scripts\/scripts\.js"/);
  const src = fs.readFileSync(path.join(root, 'scripts/not-found.js'), 'utf8');
  assert.match(src, /await import\('\.\/scripts\.js'\)/);
});
