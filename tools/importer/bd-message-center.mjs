/* eslint-disable no-console */
/**
 * Captures the live Message Center components through ONE warm Bright Data browser session
 * (one page every 5-10 s): the homepage flash teaser (.dcep-flash-teaser, rendered) and the
 * message center items of the current travel information page, at 1440 and 390 px:
 * rendered HTML, computed styles of their elements (box, font, colour, spacing), the stylesheet
 * URLs of the components and screenshots of the region. Output: tools/source-export/message-center/.
 * Usage: node tools/importer/bd-message-center.mjs [--locale de/en] [--only flash-teaser]
 *   [--widths 1440,390]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const SCRAPE = path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts');
const { connectBrowser } = await import(path.join(SCRAPE, 'browser-source.js'));

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const locale = argv.includes('--locale') ? argv[argv.indexOf('--locale') + 1] : 'de/en';
const OUT = path.join(root, 'tools/source-export/message-center', locale.replace('/', '-'));
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification/i;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const pause = () => sleep(5000 + Math.random() * 5000);

const ALL_TARGETS = [
  { name: 'flash-teaser', url: `https://www.lufthansa.com/${locale}/homepage`, selector: '.dcep-flash-teaser' },
  { name: 'message-center', url: `https://www.lufthansa.com/${locale}/prepare-for-your-trip/current-travel-information`, selector: '.messagecenterwrapper' },
];
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;
const widthsArg = argv.includes('--widths') ? argv[argv.indexOf('--widths') + 1] : '1440,390';
const WIDTHS = widthsArg.split(',').map(Number);
const TARGETS = ALL_TARGETS.filter((t) => !only || t.name === only);

async function open(page, url) {
  await page.goto(url, { timeout: 90000 }).catch((e) => console.error(`  navigation: ${e.message.split('\n')[0]}`));
  const title = () => page.title().catch(() => 'just a moment');
  for (let i = 0; i < 60 && (CHALLENGE.test(await title()) || !(await title())); i += 1) await sleep(1000); // eslint-disable-line no-await-in-loop
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await sleep(2500);
  await page.evaluate(() => {
    const btn = document.querySelector('#onetrust-reject-all-handler, #onetrust-accept-btn-handler');
    if (btn) btn.click();
    document.querySelector('#onetrust-consent-sdk')?.remove();
  }).catch(() => {});
  await sleep(800);
  return title();
}

function describe(selector) {
  const root = document.querySelector(selector);
  if (!root) return null;
  const props = ['display', 'position', 'width', 'height', 'margin', 'padding', 'border', 'border-radius',
    'background-color', 'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
    'text-decoration', 'gap', 'align-items', 'justify-content', 'overflow', 'white-space', 'text-overflow',
    '-webkit-line-clamp', 'box-shadow', 'opacity', 'transform', 'transition', 'z-index'];
  const els = [root, ...root.querySelectorAll('*')].slice(0, 400);
  const walkShadow = (el) => (el.shadowRoot ? [...el.shadowRoot.querySelectorAll('*')].slice(0, 80) : []);
  const info = (el, shadowOf) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className : '',
      id: el.id || undefined,
      shadowOf,
      attrs: Object.fromEntries([...el.attributes].filter((a) => /^(role|aria-|slot|use|name|variant|tabindex|type)/.test(a.name)).map((a) => [a.name, a.value])),
      text: el.children.length ? undefined : (el.textContent || '').trim().slice(0, 120) || undefined,
      box: [Math.round(r.left), Math.round(r.top + window.scrollY), Math.round(r.width), Math.round(r.height)],
      style: Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)])),
    };
  };
  const list = [];
  els.forEach((el) => {
    list.push(info(el));
    walkShadow(el).forEach((s) => list.push(info(s, el.tagName.toLowerCase())));
  });
  const sheets = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href)
    .filter((h) => /flash|message|maui|collapsible|clientlib/i.test(h));
  const r = root.getBoundingClientRect();
  return {
    html: root.outerHTML, list, sheets, rect: [Math.round(r.left), Math.round(r.top + window.scrollY), Math.round(r.width), Math.round(r.height)],
  };
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await connectBrowser('bd');
try {
  const page = await browser.newPage();
  for (let t = 0; t < TARGETS.length; t += 1) {
    const target = TARGETS[t];
    if (t) await pause(); // eslint-disable-line no-await-in-loop
    for (const width of WIDTHS) { // eslint-disable-line no-restricted-syntax
      await page.setViewportSize({ width, height: 900 }).catch(() => {}); // eslint-disable-line no-await-in-loop
      const title = await open(page, target.url); // eslint-disable-line no-await-in-loop
      if (CHALLENGE.test(title)) {
        console.log(`BLOCKED ${target.url}`);
        process.exit(2);
      }
      // the components render after load: wait until the region has a height (at most 15 s)
      await page.waitForFunction((sel) => { const e = document.querySelector(sel); return e && e.getBoundingClientRect().height > 0; }, target.selector, { timeout: 15000 }).catch(() => {}); // eslint-disable-line no-await-in-loop
      await sleep(1500); // eslint-disable-line no-await-in-loop
      const d = await page.evaluate(describe, target.selector); // eslint-disable-line no-await-in-loop
      if (!d) {
        console.log(`${target.name}@${width}: ${target.selector} not found`);
      } else {
        fs.writeFileSync(path.join(OUT, `${target.name}-${width}.json`), `${JSON.stringify({ url: target.url, width, capturedAt: new Date().toISOString(), ...d }, null, 1)}\n`);
        const y = Math.max(0, d.rect[1] - 120);
        await page.screenshot({ path: path.join(OUT, `${target.name}-${width}.png`), clip: { x: 0, y, width, height: Math.min(1400, d.rect[3] + 520) }, fullPage: true }).catch((e) => console.log(`  shot: ${e.message.split('\n')[0]}`)); // eslint-disable-line no-await-in-loop
        console.log(`${target.name}@${width}: ${d.list.length} elements, rect ${d.rect.join(',')}`);
      }
      if (width === 1440) await pause(); // eslint-disable-line no-await-in-loop
    }
  }
} finally {
  await browser.close().catch(() => {});
}
