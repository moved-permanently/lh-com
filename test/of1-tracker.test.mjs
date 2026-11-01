/* eslint-disable max-len */
/* Our own visit tracker for OF1 (scripts/of1/tracker.js, not OF1's of1-tracker.js): the visits
   in localStorage (the last 20; never /of1, /deliverables/, /galleries/), each
   {url, path, title, dwellTimeMs, maxScrollDepth, scrollDepth, clickTargets, focusAreas,
   visitedAt}; the interests (topic = page title) and the intent profile in OF1's stages; the
   answer to OF1's OF1_REQUEST_PROFILE (our window and origin only). It writes no cookie and
   reads none of Adobe's (AMCV_*, kndctr_*).
   Run: node --max-old-space-size=512 --test test/of1-tracker.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  isTrackedPath, visitOf, addVisit, recordClick, readVisits, writeVisits, clearVisits, deriveInterests,
  deriveIntentProfile, profilePayload, visitSummary, answerProfileRequests, VISITS_KEY, MAX_VISITS, STAGES,
} from '../scripts/of1/tracker.js';

const memoryStorage = () => {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k), data,
  };
};
const NOW = new Date('2026-11-02T08:00:00.000Z');
const visit = (path, title, extra = {}) => ({
  ...visitOf({ href: `https://lufthansa.turnsthe.page${path}?utm=x#top`, pathname: path }, `${title} | Lufthansa`, NOW), ...extra,
});

test('tracked paths: not /of1, /deliverables/, /galleries/', () => {
  ['/de/en/homepage', '/de/en/baggage', '/of1-guide', '/de/en/of1'].forEach((p) => assert.equal(isTrackedPath(p), true, p));
  ['/of1', '/of1/', '/of1/x', '/deliverables/', '/deliverables/index.html', '/galleries/', '/galleries/a/b'].forEach((p) => assert.equal(isTrackedPath(p), false, p));
});

test('a visit: OF1\'s fields, the URL without query or hash, the title without the site name', () => {
  const v = visit('/de/en/baggage', 'Baggage');
  assert.deepEqual(Object.keys(v), ['url', 'path', 'title', 'dwellTimeMs', 'maxScrollDepth', 'scrollDepth', 'clickTargets', 'focusAreas', 'visitedAt']);
  assert.equal(v.url, 'https://lufthansa.turnsthe.page/de/en/baggage');
  assert.equal(v.path, '/de/en/baggage');
  assert.equal(v.title, 'Baggage');
  assert.equal(v.dwellTimeMs, 0);
  assert.equal(v.maxScrollDepth, 0);
  assert.equal(v.scrollDepth, 0);
  assert.deepEqual(v.clickTargets, []);
  assert.deepEqual(v.focusAreas, []);
  assert.equal(v.visitedAt, NOW.toISOString());
});

test('clicks: one entry per target, counted; text short', () => {
  const v = visit('/de/en/baggage', 'Baggage');
  recordClick(v, { selector: 'a.button', text: '  Excess   baggage  ' });
  recordClick(v, { selector: 'a.button', text: 'Excess baggage' });
  recordClick(v, { selector: 'a', text: 'x'.repeat(200) });
  assert.deepEqual(v.clickTargets[0], { selector: 'a.button', text: 'Excess baggage', count: 2 });
  assert.equal(v.clickTargets[1].text.length, 60);
});

test('storage: the last 20 visits, read back; cleared on withdrawal', () => {
  const storage = memoryStorage();
  let visits = [];
  for (let i = 0; i < 25; i += 1) visits = addVisit(visits, visit(`/de/en/p${i}`, `Page ${i}`));
  assert.equal(MAX_VISITS, 20);
  assert.equal(visits.length, 20);
  assert.equal(visits[0].path, '/de/en/p5');
  writeVisits(storage, visits);
  assert.deepEqual(readVisits(storage), visits);
  assert.ok(storage.data.has(VISITS_KEY));
  clearVisits(storage);
  assert.equal(storage.data.has(VISITS_KEY), false);
  assert.deepEqual(readVisits(storage), []);
  storage.setItem(VISITS_KEY, 'not json');
  assert.deepEqual(readVisits(storage), []);
});

test('interests: one per page title, scored by visits, dwell and scroll, highest first', () => {
  const visits = [
    visit('/de/en/ski', 'Ski holidays', { dwellTimeMs: 90000, maxScrollDepth: 90, scrollDepth: 90 }),
    visit('/de/en/ski', 'Ski holidays', { dwellTimeMs: 30000, maxScrollDepth: 40, scrollDepth: 40 }),
    visit('/de/en/baggage', 'Baggage', { dwellTimeMs: 5000, maxScrollDepth: 10, scrollDepth: 10 }),
  ];
  const interests = deriveInterests(visits);
  assert.deepEqual(interests.map((i) => i.topic), ['Ski holidays', 'Baggage']);
  assert.equal(interests[0].score, 1);
  assert.ok(interests[1].score > 0 && interests[1].score < 1);
  assert.ok(interests.every((i) => i.source === 'browsing' && Object.keys(i).join() === 'topic,score,source'));
});

test('intent profile: OF1\'s six stages with scores, labels, descriptions and signals; the top one', () => {
  assert.deepEqual(STAGES, ['exploring', 'researching', 'comparing', 'purchase', 'deal-seeking', 'support']);
  const visits = [
    visit('/de/en/local-page/black-friday', 'Black Friday offers'),
    visit('/de/en/flights-offers', 'Flight offers'),
    visit('/de/en/baggage', 'Baggage'),
  ];
  const profile = deriveIntentProfile(visits, NOW);
  assert.deepEqual(Object.keys(profile), ['intents', 'topIntent', 'topScore', 'updatedAt']);
  assert.deepEqual(profile.intents.map((i) => i.category).sort(), [...STAGES].sort());
  profile.intents.forEach((i) => {
    assert.deepEqual(Object.keys(i), ['category', 'score', 'label', 'description', 'signals']);
    assert.ok(i.score >= 0 && i.score <= 1);
    assert.ok(i.label && i.description);
  });
  assert.equal(profile.topIntent, 'deal-seeking');
  assert.equal(profile.topScore, profile.intents[0].score);
  assert.ok(profile.intents[0].signals.some((s) => s.includes('/de/en/local-page/black-friday')));
  assert.equal(profile.updatedAt, NOW.toISOString());
  assert.equal(deriveIntentProfile([], NOW).topIntent, 'exploring', 'nothing yet: exploring');
});

test('the payload: pageVisits, interests, intentProfile and a short query', () => {
  const visits = [visit('/de/en/ski', 'Ski holidays'), visit('/de/en/ski-flights', 'Ski flights'), visit('/de/en/baggage', 'Sports baggage')];
  const payload = profilePayload(visits, NOW);
  assert.deepEqual(Object.keys(payload), ['pageVisits', 'interests', 'intentProfile', 'query']);
  assert.deepEqual(payload.pageVisits, visits);
  assert.equal(payload.query, visitSummary(visits));
  assert.ok(payload.query.length <= 120);
  assert.match(payload.query, /Ski holidays/);
});

test('OF1_REQUEST_PROFILE: answered with OF1_PERSONALIZE to our origin, only from our window and origin', () => {
  const listeners = [];
  const posted = [];
  const win = {
    location: { origin: 'https://lufthansa.turnsthe.page' },
    addEventListener: (type, fn) => listeners.push([type, fn]),
    removeEventListener: (type, fn) => { const i = listeners.findIndex((l) => l[1] === fn); if (i >= 0) listeners.splice(i, 1); },
    postMessage: (data, origin) => posted.push([data, origin]),
  };
  const payload = {
    pageVisits: [], interests: [], intentProfile: null, query: '',
  };
  const stop = answerProfileRequests(win, () => payload);
  const send = (event) => listeners.filter(([t]) => t === 'message').forEach(([, fn]) => fn(event));
  send({ source: win, origin: 'https://lufthansa.turnsthe.page', data: { type: 'OF1_REQUEST_PROFILE', domain: 'x' } });
  assert.deepEqual(posted, [[{ type: 'OF1_PERSONALIZE', payload }, 'https://lufthansa.turnsthe.page']]);
  send({ source: {}, origin: 'https://lufthansa.turnsthe.page', data: { type: 'OF1_REQUEST_PROFILE' } });
  send({ source: win, origin: 'https://evil.example', data: { type: 'OF1_REQUEST_PROFILE' } });
  send({ source: win, origin: 'https://lufthansa.turnsthe.page', data: { type: 'OTHER' } });
  send({ source: win, origin: 'https://lufthansa.turnsthe.page', data: null });
  assert.equal(posted.length, 1);
  // no payload (consent gone): no answer
  const quiet = answerProfileRequests(win, () => null);
  posted.length = 0;
  stop();
  send({ source: win, origin: 'https://lufthansa.turnsthe.page', data: { type: 'OF1_REQUEST_PROFILE' } });
  assert.equal(posted.length, 0);
  quiet();
  assert.equal(listeners.length, 0);
});

test('the tracker writes no cookie and never touches Adobe\'s cookies or an ECID', () => {
  const src = ['tracker.js', 'consent-adapter.js', 'index.js', 'homepage.js'].map((f) => fs.readFileSync(new URL(`../scripts/of1/${f}`, import.meta.url), 'utf8')).join('\n');
  assert.ok(!/AMCV_|kndctr_|ecid/i.test(src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')), 'no AMCV_, kndctr_ or ECID in the code');
  const tracker = fs.readFileSync(new URL('../scripts/of1/tracker.js', import.meta.url), 'utf8');
  assert.ok(!/document\.cookie/.test(tracker), 'the tracker sets no cookie (of1_profile is the proxy\'s)');
});
