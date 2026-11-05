/* eslint-disable max-len, import/extensions */
/* info-alert (brief 368, tools/reports/tap/parity.md row 63): TAP's info alert as www.flytap.com's
   (check-in information, insurance, time to think … 152 pages): a light info-blue box with a 4 px
   info-blue edge at the left, Material's info icon, the title (H4) and the text beside it, a close
   button at the top right. The close hides the alert for this page view only: www stores nothing
   (no cookie, local or session storage) and shows it again on the next load; so does the block.
   Run: node --max-old-space-size=512 --test test/tap-info-alert.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="pt"><head></head><body><main><div class="section"><div class="info-alert"><div><div><h4 id="x">Informação importante</h4><ul><li><strong>Controlo:</strong> texto.</li></ul></div></div></div></div></main></body></html>');
globalThis.window = window;
globalThis.document = document;
const { default: decorate, INFO_ALERT_CLOSE } = await import('../blocks/info-alert/info-alert.js');

test('the alert as www\'s: the icon, the title and its text beside it, a close button named in the page\'s language', async () => {
  const block = document.querySelector('.info-alert');
  await decorate(block);
  const close = block.querySelector(':scope > button.info-alert-close');
  assert.equal(Boolean(close), true);
  assert.equal(close.getAttribute('type'), 'button');
  assert.equal(close.getAttribute('aria-label'), INFO_ALERT_CLOSE.pt);
  const body = block.querySelector(':scope > .info-alert-body');
  assert.equal(body.firstElementChild.classList.contains('info-alert-icon'), true);
  assert.equal(body.firstElementChild.getAttribute('aria-hidden'), 'true');
  const text = body.querySelector('.info-alert-text');
  assert.equal(text.querySelector('h4').textContent, 'Informação importante');
  assert.equal(text.querySelector('li strong').textContent, 'Controlo:');
  close.dispatchEvent(new window.Event('click'));
  assert.equal(block.hidden, true, 'closed for this view');
  assert.equal(window.localStorage === undefined || Object.keys(window.localStorage || {}).length === 0, true, 'nothing stored');
});

test('the look: www\'s blue box (#ebf2ff, a 4 px #99c0ff edge, 4 px corners, 16 px inside), the title GT Flexa 18 / 500, the text 14 / 21', () => {
  const css = fs.readFileSync(new URL('../blocks/info-alert/info-alert.css', import.meta.url), 'utf8');
  assert.match(css, /\.info-alert \{[^}]*padding: 16px;[^}]*border-left: 4px solid #99c0ff;[^}]*border-radius: 4px;[^}]*background-color: #ebf2ff;/);
  assert.match(css, /\.info-alert \.info-alert-text :is\(h1, h2, h3, h4, h5, h6\) \{[^}]*font-family: var\(--heading-font-family\);[^}]*font-size: 18px;[^}]*font-weight: 500;/);
  assert.match(css, /\.info-alert \.info-alert-text :is\(p, li\) \{[^}]*font-size: 14px;[^}]*line-height: 21px;/);
  css.replace(/\/\*[\s\S]*?\*\//g, '').split('}').map((r) => r.split('{')[0].trim()).filter((sel) => sel && !sel.startsWith('@'))
    .forEach((sel) => sel.split(/,(?![^(]*\))/).forEach((one) => assert.equal(one.trim().startsWith('.info-alert'), true, one)));
});
