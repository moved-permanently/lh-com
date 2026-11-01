/* eslint-disable max-len, no-restricted-syntax -- sequential cases */
/* OF1 on the de/en homepage (scripts/of1/homepage.js): the button to /of1?personalize=1 (our own
   markup, built from text), and the in-place rewrite: POST /api/personalize with the headline,
   subhead and call-to-action texts (T0 to T5), only the `mutation` lines of ids we sent applied,
   text only (a link's first text node), never prices, links or form fields; inject_cta, debug and
   done ignored; any error, timeout or empty answer: the published text stays.
   Run: node --max-old-space-size=512 --test test/of1-homepage.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
const {
  pickElements, personalizeBody, mutationsFrom, applyMutations, personalizeInPlace, buildButton, MAX_ELEMENTS, BUDGET_MS,
} = await import('../scripts/of1/homepage.js');

const HOME = `<main>
  <div class="section flight-search-container"><div class="flight-search block" data-block-name="flight-search"><form><h2>Book a flight</h2><label>From <input name="origin" value="Frankfurt"></label><button>Find flights</button></form></div></div>
  <div class="section hero-card-overlay-container"><div class="hero-card-overlay block" data-block-name="hero-card-overlay"><div><p class="hero-card-overlay-eyebrow">Tropical metropolis. Yes.</p><h2 id="kl">Discover Kuala Lumpur and other destinations</h2><p class="link-wrapper"><a href="/de/en/kuala-lumpur" class="button">Find out more</a></p></div></div></div>
  <div class="section fare-teaser-container"><div class="default-content-wrapper"><h3>Winter deals</h3></div><div class="fare-teaser block" data-block-name="fare-teaser"><a class="fare-teaser-route" href="/x">Frankfurt Chicago</a><p class="fare-teaser-offer">Round trip from</p><p class="fare-teaser-price">EUR 499</p></div></div>
  <div class="section carousel-cards-container"><div class="default-content-wrapper"><h2>Current topics and news</h2></div></div>
  <div class="section"><div class="default-content-wrapper"><h2>Flights from 199 €</h2><h2>Looking for more than just a flight?</h2><h2>Extra one</h2><h2>Extra two</h2></div></div>
</main>`;
const mainOf = () => {
  document.body.innerHTML = HOME;
  return document.querySelector('main');
};
const PAYLOAD = {
  pageVisits: [],
  interests: [{ topic: 'Ski holidays', score: 1, source: 'browsing' }, { topic: 'Sports baggage', score: 0.4, source: 'browsing' }],
  intentProfile: {
    intents: [{ category: 'researching', score: 0.6 }, { category: 'exploring', score: 0.3 }, { category: 'purchase', score: 0.1 }, { category: 'support', score: 0 }], topIntent: 'researching', topScore: 0.6, updatedAt: '2026-11-02T08:00:00.000Z',
  },
  query: 'Pages I looked at: Ski holidays, Sports baggage',
};

test('the elements: the hero\'s headline, subhead and call to action, then section headings; never forms, prices or price blocks; at most six', () => {
  const elements = pickElements(mainOf());
  assert.equal(MAX_ELEMENTS, 6);
  assert.deepEqual(elements.map((e) => [e.id, e.tag, e.text]), [
    ['T0', 'h2', 'Discover Kuala Lumpur and other destinations'],
    ['T1', 'p', 'Tropical metropolis. Yes.'],
    ['T2', 'a', 'Find out more'],
    ['T3', 'h3', 'Winter deals'],
    ['T4', 'h2', 'Current topics and news'],
    ['T5', 'h2', 'Looking for more than just a flight?'],
  ]);
});

test('the request: OF1\'s body with the elements and the behaviour profile (top stage, three intent scores)', () => {
  const elements = pickElements(mainOf());
  const body = personalizeBody(elements, PAYLOAD);
  assert.deepEqual(Object.keys(body), ['id', 'index', 'elements', 'behaviorProfile']);
  assert.equal(body.id, 'moved-permanently/lh-com');
  assert.equal(body.index, 'publish');
  assert.deepEqual(body.elements.T0, { tag: 'h2', text: 'Discover Kuala Lumpur and other destinations' });
  assert.deepEqual(Object.keys(body.elements), ['T0', 'T1', 'T2', 'T3', 'T4', 'T5']);
  assert.deepEqual(body.behaviorProfile, {
    interests: [{ topic: 'Ski holidays', score: 1 }, { topic: 'Sports baggage', score: 0.4 }],
    intent: 'researching',
    intentScores: [{ category: 'researching', score: 0.6 }, { category: 'exploring', score: 0.3 }, { category: 'purchase', score: 0.1 }],
  });
});

test('the mutation filter: only mutation lines of ids we sent, with a plain text, no prices', () => {
  const lines = [
    {
      type: 'mutation', id: 'T0', new: 'Your ski winter starts here', reason: 'ski',
    },
    { type: 'mutation', id: 'T9', new: 'not ours' },
    { type: 'mutation', id: 'T1', new: '' },
    { type: 'mutation', id: 'T2', new: 42 },
    { type: 'mutation', id: 'T3', new: 'Ski deals from 99 €' },
    { type: 'mutation', id: 'T4', new: 'x'.repeat(400) },
    { type: 'inject_cta', html: '<a href="https://evil.example">Click</a>' },
    { type: 'debug', debug: {} },
    { type: 'done', stats: { mutationCount: 1, hasCta: true } },
    { type: 'mutation', id: 'T5', new: '  Plan your  ski trip  ' },
  ];
  assert.deepEqual(mutationsFrom(lines, ['T0', 'T1', 'T2', 'T3', 'T4', 'T5']), [
    { id: 'T0', text: 'Your ski winter starts here' },
    { id: 'T5', text: 'Plan your ski trip' },
  ]);
});

test('applying: text only, a link keeps its href and its other nodes, never another element', () => {
  const main = mainOf();
  const link = main.querySelector('.hero-card-overlay a');
  link.innerHTML = 'Find out more<span class="icon"></span>';
  const elements = pickElements(main);
  applyMutations(elements, [{ id: 'T0', text: 'Your ski winter <b>starts</b>' }, { id: 'T2', text: 'See ski destinations' }]);
  assert.equal(main.querySelector('#kl').textContent, 'Your ski winter <b>starts</b>');
  assert.equal(main.querySelector('#kl').children.length, 0, 'text, not HTML');
  assert.equal(link.getAttribute('href'), '/de/en/kuala-lumpur');
  assert.equal(link.firstChild.textContent, 'See ski destinations');
  assert.ok(link.querySelector('span.icon'), 'the link\'s other nodes stay');
  assert.equal(main.querySelector('input').value, 'Frankfurt');
  assert.equal(main.querySelector('.fare-teaser-price').textContent, 'EUR 499');
});

const streamOf = (chunks, { delays = [], fail = false } = {}) => new ReadableStream({
  async start(controller) {
    for (let i = 0; i < chunks.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      if (delays[i]) await new Promise((r) => { setTimeout(r, delays[i]); });
      controller.enqueue(new TextEncoder().encode(chunks[i]));
    }
    if (fail) controller.error(new Error('broken'));
    else controller.close();
  },
});
const ndjson = (objs) => objs.map((o) => `${JSON.stringify(o)}\n`).join('');

test('in place: applied once the stream is done; the request is same-origin POST /api/personalize', async () => {
  const main = mainOf();
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push([url, init.method, init.headers['content-type'], JSON.parse(init.body)]);
    const text = ndjson([{ type: 'mutation', id: 'T0', new: 'Your ski winter starts here' }, { type: 'inject_cta', html: '<b>x</b>' }]);
    return new Response(streamOf([text.slice(0, 20), text.slice(20), ndjson([{ type: 'mutation', id: 'T1', new: 'Snow. Yes.' }, { type: 'done', stats: {} }])]), { headers: { 'content-type': 'application/x-ndjson' } });
  };
  const result = await personalizeInPlace({ main, payload: PAYLOAD, fetchImpl });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], '/api/personalize');
  assert.equal(calls[0][1], 'POST');
  assert.equal(calls[0][2], 'application/json');
  assert.equal(result.applied, 2);
  assert.equal(main.querySelector('#kl').textContent, 'Your ski winter starts here');
  assert.equal(main.querySelector('.hero-card-overlay-eyebrow').textContent, 'Snow. Yes.');
  assert.equal(main.querySelectorAll('b').length, 0, 'inject_cta never inserted');
  // a withdrawal: the published texts back
  result.undo();
  assert.equal(main.querySelector('#kl').textContent, 'Discover Kuala Lumpur and other destinations');
  assert.equal(main.querySelector('.hero-card-overlay-eyebrow').textContent, 'Tropical metropolis. Yes.');
});

test('the published text stays: timeout, error status, broken stream, empty answer, no elements', async () => {
  assert.ok(BUDGET_MS >= 2000 && BUDGET_MS <= 3000);
  const original = 'Discover Kuala Lumpur and other destinations';
  const cases = {
    timeout: async () => new Response(streamOf([ndjson([{ type: 'mutation', id: 'T0', new: 'late' }]), ndjson([{ type: 'done' }])], { delays: [0, 400] })),
    status: async () => new Response('{"error":"rate limited"}', { status: 429 }),
    broken: async () => new Response(streamOf([ndjson([{ type: 'mutation', id: 'T0', new: 'half' }])], { fail: true })),
    empty: async () => new Response(''),
    network: async () => { throw new Error('offline'); },
  };
  for (const [name, fetchImpl] of Object.entries(cases)) {
    const main = mainOf();
    // eslint-disable-next-line no-await-in-loop
    const result = await personalizeInPlace({
      main, payload: PAYLOAD, fetchImpl, budgetMs: name === 'timeout' ? 150 : BUDGET_MS,
    });
    assert.equal(result.applied, 0, name);
    assert.equal(main.querySelector('#kl').textContent, original, name);
  }
  document.body.innerHTML = '<main><div class="section"><p>Nothing to rewrite</p></div></main>';
  let called = false;
  const none = await personalizeInPlace({ main: document.querySelector('main'), payload: PAYLOAD, fetchImpl: async () => { called = true; return new Response(''); } });
  assert.equal(none.applied, 0);
  assert.equal(called, false, 'no elements: no call');
});

test('the button: our markup from text, linking to /of1?personalize=1 with a short summary', () => {
  const section = buildButton({ ...PAYLOAD, query: 'Pages I looked at: <b>Ski</b> & more' });
  assert.ok(section.classList.contains('section'));
  assert.ok(section.classList.contains('of1-notice-container'));
  const link = section.querySelector('a.button');
  const url = new URL(link.getAttribute('href'), 'https://lufthansa.turnsthe.page');
  assert.equal(url.pathname, '/of1');
  assert.equal(url.searchParams.get('personalize'), '1');
  assert.equal(url.searchParams.get('q'), 'Pages I looked at: <b>Ski</b> & more');
  assert.equal(section.querySelectorAll('b').length, 0, 'text, not HTML');
  assert.ok(section.querySelector('h2').textContent);
  const plain = buildButton({ ...PAYLOAD, query: '' });
  assert.equal(new URL(plain.querySelector('a.button').getAttribute('href'), 'https://x.example').search, '?personalize=1');
});
