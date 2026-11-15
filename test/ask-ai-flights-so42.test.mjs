/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 42: www.austrian.com's AI flight-finder entry under the flight search, as the block ask-ai-flights,
   behind the site flag ask-ai-flights (scripts/flags.js). Flag on: the band with the document's line and its link as
   the outlined button. No row, "off", a 404 or no link: the block takes itself out with its wrapper (the page as it
   was). And the rows (delta-so42-austrian-ask-ai-flights): one insert per homepage right after the flight-search
   block, www's line, a link to the market's www homepage.
   Run: node --max-old-space-size=256 --test test/ask-ai-flights-so42.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><main></main></body></html>');
globalThis.window = window;
globalThis.document = document;

let flagRows;
let flagStatus;
beforeEach(async () => {
  flagRows = null;
  flagStatus = 200;
  globalThis.fetch = async (url) => {
    if (String(url) === '/config/flags.json' && flagRows && flagStatus === 200) {
      return new Response(JSON.stringify({ data: flagRows }), { headers: { 'content-type': 'application/json' } });
    }
    return new Response('', { status: 404 });
  };
  (await import('../scripts/flags.js')).resetFlags();
  document.querySelector('main').innerHTML = '';
});

const { default: decorate, ASK_AI_FLAG, readAskAi } = await import('../blocks/ask-ai-flights/ask-ai-flights.js');
const LINE = 'Flexible dates? Chat with our AI to find your perfect flight options';

/** A section as the page has it: the flight search's wrapper, then the block's (decorateButtons ran before). */
const section = (cell = `<p><strong>${LINE}</strong></p><p class="button-container"><em><a class="button secondary" href="https://www.austrian.com/gb/en/homepage">Ask AI for flights</a></em></p>`) => {
  const s = document.createElement('div');
  s.className = 'section';
  s.innerHTML = `<div class="flight-search-wrapper"><div class="flight-search"></div></div><div class="ask-ai-flights-wrapper"><div class="ask-ai-flights"><div><div>${cell}</div></div></div></div>`;
  document.querySelector('main').append(s);
  return s;
};

test('the flag\'s name', () => {
  assert.equal(ASK_AI_FLAG, 'ask-ai-flights');
});

test('flag on: the band, www\'s line and the link as the outlined button', async () => {
  flagRows = [{ flag: 'ask-ai-flights', value: 'on' }];
  const s = section();
  const block = s.querySelector('.ask-ai-flights');
  await decorate(block);
  assert.ok(block.classList.contains('ask-ai-flights-on'));
  assert.equal(block.children.length, 2);
  assert.equal(block.querySelector('p.ask-ai-flights-text').textContent, LINE);
  const a = block.querySelector('a.ask-ai-flights-button');
  assert.equal(a.getAttribute('href'), 'https://www.austrian.com/gb/en/homepage');
  assert.equal(a.className, 'button secondary ask-ai-flights-button');
  assert.equal(a.textContent, 'Ask AI for flights');
  assert.equal(s.querySelectorAll(':scope > div').length, 2);
});

[
  ['no flags sheet', null, 404],
  ['no row', [{ flag: 'live-chat', value: 'on' }], 200],
  ['"off"', [{ flag: 'ask-ai-flights', value: 'off' }], 200],
  ['any other value', [{ flag: 'ask-ai-flights', value: 'yes' }], 200],
].forEach(([name, rows, status]) => {
  test(`${name}: the block and its wrapper out, the section as it was`, async () => {
    flagRows = rows;
    flagStatus = status;
    const s = section();
    await decorate(s.querySelector('.ask-ai-flights'));
    assert.equal(s.querySelectorAll('.ask-ai-flights, .ask-ai-flights-wrapper').length, 0);
    assert.equal(s.innerHTML, '<div class="flight-search-wrapper"><div class="flight-search"></div></div>');
  });
});

test('flag on but no link: out as well', async () => {
  flagRows = [{ flag: 'ask-ai-flights', value: 'on' }];
  const s = section(`<p>${LINE}</p>`);
  await decorate(s.querySelector('.ask-ai-flights'));
  assert.equal(s.querySelectorAll('.ask-ai-flights-wrapper').length, 0);
});

test('two cells, the link first: the line is the other cell\'s text', () => {
  const b = document.createElement('div');
  b.innerHTML = `<div><div><a href="/x">Ask</a></div><div>  ${LINE}\n</div></div>`;
  const { text, link } = readAskAi(b);
  assert.equal(text, LINE);
  assert.equal(link.getAttribute('href'), '/x');
});

test('the CSS: hidden until on, www\'s band (84 / 158 px with 40 / 52 px above it)', () => {
  const css = fs.readFileSync(new URL('../blocks/ask-ai-flights/ask-ai-flights.css', import.meta.url), 'utf8');
  assert.match(css, /\.ask-ai-flights-wrapper:not\(:has\(> \.ask-ai-flights-on\)\) \{\s*display: none;/);
  assert.match(css, /background-color: #e5e5e5;/);
  assert.match(css, /div\.ask-ai-flights-wrapper \{\s*margin-top: 52px;/);
  assert.match(css, /@media \(width >= 1025px\) \{\s*main > \.section > div\.ask-ai-flights-wrapper \{\s*margin-top: 40px;/);
});

test('the rows: 15 English homepages, one insert after the flight search, www\'s line and the market\'s www homepage', () => {
  const rows = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so42-austrian-ask-ai-flights.json', import.meta.url), 'utf8'));
  assert.deepEqual(rows.map((r) => r.path.split('/')[1]).sort(), 'by ca fr gb it md me pl pt ro rs ru tr ua xk'.split(' '));
  rows.forEach(({ path, inserts }) => {
    assert.equal(inserts.length, 1, path);
    assert.match(path, /^\/[a-z]{2}\/en\/homepage$/);
    const [{ after, text }] = inserts;
    assert.ok(after.endsWith('</div>'), path);
    const mk = path.split('/')[1];
    assert.equal(text, `<div class="ask-ai-flights"><div><div><p><strong>${LINE}</strong></p><p><em><a href="https://www.austrian.com/${mk}/en/homepage">Ask AI for flights</a></em></p></div></div></div>`);
  });
  const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so42-austrian-ask-ai-flights.txt', import.meta.url), 'utf8');
  assert.ok(!list.split('\n').some((l) => /^READY\t\/de\/en\/overview-manage/.test(l)));
});
