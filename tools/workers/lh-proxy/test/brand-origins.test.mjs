/* The brand sites' own preview and live hosts (lh-discover, lh-ita, lh-austrian, lh-brussels,
   lh-cargo, lh-airdolomiti, lh-b2b on aem.page / aem.live) ask lh-proxy for the slider's origin
   list (fareteaser/recommend) and got a CORS error (only lh-com and lh-flynet were allowed; the
   site fell back to the recorded list). b2b.turnsthe.page waits until B2B's site is set up (it is
   no brand host of scripts/demo.js yet: test/host-lists.test.mjs). Checked with the worker's
   defaults and with the values wrangler.toml deploys (both copies must agree).
   Run: npm test (every test file; test/ alone ran only index.test.mjs) */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../src/index.js';

const BASE = 'https://lh-proxy.example.com';
const toml = fs.readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
// a TOML basic string: \\ is one backslash
const tomlVar = (name) => {
  const m = toml.match(new RegExp(`^${name}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'm'));
  return m ? m[1].replace(/\\\\/g, '\\') : undefined;
};
const ENVS = {
  defaults: { UPSTREAM_ORIGIN: 'https://upstream.test' },
  'wrangler.toml': {
    UPSTREAM_ORIGIN: 'https://upstream.test',
    ALLOWED_ORIGIN_PATTERN: tomlVar('ALLOWED_ORIGIN_PATTERN'),
    EXTRA_ALLOWED_ORIGINS: tomlVar('EXTRA_ALLOWED_ORIGINS'),
  },
};
const SITES = ['lh-com', 'lh-flynet', 'lh-discover', 'lh-ita', 'lh-austrian', 'lh-brussels', 'lh-cargo', 'lh-airdolomiti', 'lh-b2b'];
const allowed = async (env, origin) => {
  const res = await worker.fetch(new Request(`${BASE}/health`, { headers: { Origin: origin } }), env);
  return res.status === 200 && res.headers.get('access-control-allow-origin') === origin;
};

Object.entries(ENVS).forEach(([name, env]) => {
  test(`${name}: every site's preview and live hosts`, async () => {
    const origins = SITES.flatMap((s) => [`https://main--${s}--moved-permanently.aem.page`, `https://feat-x--${s}--moved-permanently.aem.live`])
      .concat('https://discover.turnsthe.page', 'https://brussels.turnsthe.page', 'http://localhost:3000');
    const results = await Promise.all(origins.map((o) => allowed(env, o)));
    origins.forEach((o, i) => assert.ok(results[i], `${o} allowed`));
  });

  test(`${name}: other sites and look-alikes stay refused`, async () => {
    const origins = ['https://main--lh-discoverx--moved-permanently.aem.page', 'https://main--other--moved-permanently.aem.live',
      'https://main--lh-ita--someone-else.aem.page', 'https://b2b.turnsthe.page.evil.example', 'https://evil.example.com'];
    const results = await Promise.all(origins.map((o) => allowed(env, o)));
    origins.forEach((o, i) => assert.ok(!results[i], `${o} refused`));
  });
});

Object.entries(ENVS).forEach(([name, env]) => {
  test(`${name}: austrian-cn.turnsthe.page, the Austrian site's China alias (as lufthansa-cn), allowed`, async () => {
    assert.ok(await allowed(env, 'https://austrian-cn.turnsthe.page'));
    assert.ok(await allowed(env, 'https://lufthansa-cn.turnsthe.page'), 'lufthansa-cn as before');
    assert.ok(!(await allowed(env, 'https://austrian-cn.turnsthe.page.example.com')));
  });
});

Object.entries(ENVS).forEach(([name, env]) => {
  test(`${name}: swiss-cn.turnsthe.page, the SWISS site's China alias (as austrian-cn), allowed`, async () => {
    assert.ok(await allowed(env, 'https://swiss-cn.turnsthe.page'));
    assert.ok(await allowed(env, 'https://austrian-cn.turnsthe.page'), 'austrian-cn as before');
    assert.ok(!(await allowed(env, 'https://swiss-cn.turnsthe.page.example.com')));
  });
});
