/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, max-len, import/extensions -- tooling */
/**
 * Lufthansa Group for Business' hotline finder (the contact pages' PartnerPlusBenefit box): www's
 * box (.dcep-ppb-hotlinebox, its app in /etc/designs/b2b-neo/clientlib-all) lists the countries of
 * GET /service/api/catalogs/contact/countries and, for the picked one,
 * GET /service/api/catalogs/contact/reservation?country=<CC>&withLocalContact=false (public JSON:
 * reservationOffices[].phone1, phone2, email, link, openingComments, comments, serviceHours
 * [{weekdayId, from, to}]); its texts come from /service/api/labels/{b2bHotlineNumberDisplay,
 * hotlineNumberDisplay}/b2bneo/<ll>.
 *
 *   --record  ONE warm Bright Data session (the de/en contact page, cookies rejected), no request of
 *             its own (a fetch of its own answered 403): the page's own answers (the countries and
 *             labels in English, DE's contact), the box's look with a contact (1440 and 390), each
 *             other country picked in www's select (its app asks; one every 6-9 s, resumable), then
 *             the de/de contact page for the German names and labels; stops at the first 403, 429
 *             or challenge (exit 2).
 *             -> content-sites/lh-b2b/runs/hotlines-record.json
 *   --sheet   the DA sheet from the record: one row per country with a contact (country, name-en,
 *             name-de, phone, phone2, email, link, hours, note-en, note-de)
 *             -> content-sites/lh-b2b/content/data/hotlines.json
 *   --upload  that sheet to lh-b2b's DA (/data/hotlines.json) and its preview (never live), and the
 *             box's image (kept from the page's own answer) under its Edge Delivery name
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { edsDamPath } from '../../scripts/dam-path.js';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const W = path.join(root, 'content-sites/lh-b2b');
const RECORD = path.join(W, 'runs/hotlines-record.json');
const SHEET = path.join(W, 'content/data/hotlines.json');
const HOST = 'https://business.lufthansagroup.com';
const ORG = 'moved-permanently';
const SITE = 'lh-b2b';
const SHEET_PATH = '/data/hotlines.json';
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human/i;
const DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);

/** The box's look on www (computed styles of its parts), for blocks/hotline-finder/hotline-finder.css. */
const LOOK = () => {
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + window.scrollY), Math.round(r.width), Math.round(r.height)]; };
  const keys = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginBottom', 'borderTop', 'borderBottom', 'borderRadius', 'textDecorationLine', 'display', 'gap'];
  const css = (el) => { if (!el) return null; const c = getComputedStyle(el); return Object.fromEntries(keys.map((k) => [k, c[k]])); };
  const b = document.querySelector('.dcep-ppb-hotlinebox');
  const part = (sel) => {
    const el = b && b.querySelector(sel); return el ? {
      sel, rect: box(el), css: css(el), text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 80),
    } : { sel, missing: true };
  };
  const select = b && b.querySelector('maui-select');
  const inner = select && select.shadowRoot && select.shadowRoot.querySelector('select, button, [role="combobox"], .select, input');
  return {
    vw: window.innerWidth,
    parts: ['.ppb-container-hotline', 'maui-headline', 'form', 'maui-select', '.support-contact', '.phone-number', 'a[href^="mailto:"]', 'table.service-hours', 'table.service-hours th', 'table.service-hours td', 'img'].map(part),
    selectInner: inner ? { rect: box(inner), css: css(inner) } : null,
    html: b ? b.innerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').replace(/<maui-option[^>]*>[^<]*<\/maui-option>/g, '').slice(0, 6000) : '',
  };
};

async function record() {
  const rec = readJson(RECORD, { contacts: {} });
  const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
  const { connectBrowser } = await import(path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts/browser-source.js'));
  const save = () => { fs.mkdirSync(path.dirname(RECORD), { recursive: true }); fs.writeFileSync(RECORD, `${JSON.stringify(rec, null, 1)}\n`); };
  const browser = await connectBrowser('bd');
  let code = 0;
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 }).catch(() => {});
    const pause = () => page.waitForTimeout(6000 + Math.floor(Math.random() * 3000));
    // the page's own answers: www's app asks the catalog and the labels itself (its headers)
    const answers = new Map();
    let blocked = '';
    page.on('response', async (resp) => {
      const u = new URL(resp.url());
      // the box's teaser image as the page loads it (no request of its own)
      if (u.hostname === 'business.lufthansagroup.com' && /CustomerServiceKAM\.png/i.test(u.pathname) && resp.status() === 200 && !rec.image) {
        try {
          const bytes = await resp.body();
          const file = path.join(W, 'runs', `hotline-image${path.extname(u.pathname.replace(/\/img\.\w+$/, '')) || '.png'}`);
          fs.writeFileSync(file, bytes);
          rec.image = {
            url: u.pathname, file: path.relative(W, file), bytes: bytes.length, type: resp.headers()['content-type'] || '',
          };
        } catch (e) { /* not kept */ }
        return;
      }
      if (u.hostname !== 'business.lufthansagroup.com' || !/^\/service\/api\/(catalogs\/contact|labels\/(b2b)?[hH]otlineNumberDisplay)/.test(u.pathname)) return;
      if ([403, 429].includes(resp.status())) {
        let text = '';
        try { text = (await resp.text()).replace(/\s+/g, ' ').slice(0, 300); } catch (e) { /* none */ }
        blocked = `${resp.status()} at ${u.pathname}${u.search}: ${text}`;
        return;
      }
      try { answers.set(`${u.pathname}${u.search}`, { status: resp.status(), json: await resp.json() }); } catch (e) { answers.set(`${u.pathname}${u.search}`, { status: resp.status() }); }
    });
    const wait = async (key, ms = 15000) => {
      for (let t = 0; t < ms && !answers.has(key) && !blocked; t += 250) await page.waitForTimeout(250);
      if (blocked) throw new Error(`blocked ${blocked}`);
      return answers.get(key);
    };
    const open = async (p) => {
      const resp = await page.goto(`${HOST}${p}`, { timeout: 90000, waitUntil: 'load' });
      if (!resp || [403, 429].includes(resp.status()) || CHALLENGE.test(await page.title())) throw new Error(`blocked ${resp && resp.status()} at ${p}`);
      await page.waitForTimeout(3000);
      await page.evaluate(() => document.querySelector('#onetrust-reject-all-handler')?.click());
      await page.waitForTimeout(4000);
    };
    // the box's select (www's maui-select): the country picked as a visitor's pick reaches the app
    const pick = (cc) => page.evaluate((v) => {
      const sel = document.querySelector('.dcep-ppb-hotlinebox maui-select');
      if (!sel) return false;
      sel.value = v;
      sel.setAttribute('value', v);
      ['change', 'input', 'maui-change', 'valueChange'].forEach((t) => sel.dispatchEvent(new CustomEvent(t, { bubbles: true, composed: true, detail: { value: v } })));
      return true;
    }, cc);
    const reservation = (cc) => `/service/api/catalogs/contact/reservation?country=${encodeURIComponent(cc)}&withLocalContact=false`;
    const take = (lang) => {
      const keyOf = (re) => [...answers.keys()].find((k) => re.test(k));
      [['countries', /\/catalogs\/contact\/countries$/], ['labels', new RegExp(`/labels/hotlineNumberDisplay/b2bneo/${lang}$`)], ['ppb-labels', new RegExp(`/labels/b2bHotlineNumberDisplay/b2bneo/${lang}$`)]]
        .forEach(([name, re]) => { const k = keyOf(re); if (k && answers.get(k).json && !rec[`${name}-${lang}`]) rec[`${name}-${lang}`] = answers.get(k).json; });
      save();
    };
    await open('/de/en/about-us/contact');
    await wait('/service/api/catalogs/contact/countries');
    take('en');
    // the box with a contact shown (DE, the page's default): its look at 1440 and 390
    const de = await wait(reservation('DE'));
    if (de && de.json && !rec.contacts.DE) rec.contacts.DE = { ...de.json, at: new Date().toISOString() };
    await page.waitForTimeout(2000);
    if (!rec.lookContact) {
      rec.lookContact = { 1440: await page.evaluate(LOOK) };
      await page.setViewportSize({ width: 390, height: 844 }).catch(() => {});
      await page.waitForTimeout(1500);
      rec.lookContact[390] = await page.evaluate(LOOK);
      await page.setViewportSize({ width: 1440, height: 900 }).catch(() => {});
    }
    save();
    const countries = (rec['countries-en'] && rec['countries-en'].countries) || [];
    console.log(`b2b-hotlines: ${countries.length} countries; ${Object.keys(rec.contacts).length} contacts recorded`);
    // --skip <CC>: a country www refused (403 to the page's own request, 2026-11-02 08:45: IR):
    // recorded as refused, not asked again
    argv.flatMap((a, i) => (a === '--skip' ? [argv[i + 1]] : [])).forEach((cc) => {
      if (!rec.contacts[cc]) rec.contacts[cc] = { status: 403, note: 'www refused the page\'s own request', at: new Date().toISOString() };
    });
    save();
    for (const c of countries) {
      if (rec.contacts[c.code]) continue;
      await pause();
      if (!(await pick(c.code))) throw new Error('no select');
      const got = await wait(reservation(c.code));
      rec.contacts[c.code] = got && got.json ? { ...got.json, at: new Date().toISOString() } : { status: got ? got.status : 'no answer', at: new Date().toISOString() };
      save();
      console.log(`${got ? got.status : '-'} ${c.code} ${((got && got.json && got.json.reservationOffices) || []).map((o) => o.phone1 || o.email).join(' / ')}`);
    }
    // the German names and labels: the de/de contact page's own requests
    if (!rec['countries-de']) {
      await pause();
      answers.clear();
      await open('/de/de/about-us/contact');
      await wait('/service/api/catalogs/contact/countries');
      await page.waitForTimeout(2000);
      take('de');
    }
    // a contact with a note (opening or other comments): its German text, picked on the de/de page
    for (const [cc, c] of Object.entries(rec.contacts)) {
      const noted = (c.reservationOffices || []).some((o) => o.openingComments || o.comments);
      if (!noted || rec.contacts[cc].de) continue;
      await pause();
      answers.delete(reservation(cc));
      if (!(await pick(cc))) throw new Error('no select');
      const got = await wait(reservation(cc));
      rec.contacts[cc].de = got && got.json ? got.json : { status: got ? got.status : 'no answer' };
      save();
    }
  } catch (e) {
    console.error(`b2b-hotlines: ${e.message}; stopping`);
    code = /blocked/.test(e.message) ? 2 : 1;
  } finally {
    await browser.close().catch(() => {});
    save();
  }
  return code;
}

/**
 * The block's texts in a language from the record (www's label services): the select's label, the
 * contact's and the opening hours' headings, the day names Monday first; {} without labels.
 */
export function labelsOf(rec, ll) {
  const box = rec[`labels-${ll}`] || {};
  const ppb = rec[`ppb-labels-${ll}`] || {};
  const label = (k) => box[`hotlineNumberDisplay.fullApp.${k}`] || '';
  const out = {};
  const select = ppb['b2bHotlineNumberDisplay.fullApp.default.selectCountryLabel'] || label('default.selectCountryLabel');
  if (select) out.select = select;
  if (label('default.phoneNumberLabel')) out.contact = label('default.phoneNumberLabel');
  if (label('default.serviceHours')) out.hours = label('default.serviceHours');
  const days = DAYS.map((d) => label(`days.${d}`));
  if (days.every(Boolean)) out.days = days;
  return out;
}

/** The box's image as the documents link it: its copy in lh-b2b's DA (uploaded), else ''. */
export const imageOf = (rec) => (rec.image && rec.image.uploaded ? `https://content.da.live/${ORG}/${SITE}${edsDamPath(rec.image.asset)}` : '');

const hoursOf = (o) => (o.serviceHours || [])
  .slice().sort((a, b) => DAYS.indexOf(a.weekdayId) - DAYS.indexOf(b.weekdayId))
  .map((h) => `${h.weekdayId} ${h.from}-${h.to}`).join('; ');

/** The sheet's rows: one per country with a contact (its first reservation office), www's order. */
export function sheetRows(rec) {
  const de = new Map(((rec['countries-de'] || {}).countries || []).map((c) => [c.code, c.name]));
  return ((rec['countries-en'] || {}).countries || []).flatMap((c) => {
    const o = (rec.contacts[c.code]?.reservationOffices || [])[0];
    if (!o || !(o.phone1 || o.phone2 || o.email)) return [];
    const oDe = (rec.contacts[c.code]?.de?.reservationOffices || [])[0] || o;
    const note = (x) => [x.openingComments, x.comments].filter(Boolean).join(' ');
    return [{
      country: c.code,
      'name-en': c.name,
      'name-de': de.get(c.code) || c.name,
      phone: o.phone1 || '',
      phone2: o.phone2 || '',
      email: o.email || '',
      link: o.link || '',
      hours: hoursOf(o),
      'note-en': note(o),
      'note-de': note(oDe),
    }];
  });
}

function sheet() {
  const rec = readJson(RECORD, null);
  if (!rec) throw new Error('no record (--record first)');
  const data = sheetRows(rec);
  const out = {
    total: data.length, limit: data.length, offset: 0, data, ':sheetname': 'data', ':type': 'sheet',
  };
  fs.mkdirSync(path.dirname(SHEET), { recursive: true });
  fs.writeFileSync(SHEET, `${JSON.stringify(out, null, 2)}\n`);
  const all = ((rec['countries-en'] || {}).countries || []).length;
  console.log(`b2b-hotlines sheet: ${data.length} countries with a contact of ${all} listed -> ${path.relative(root, SHEET)}`);
}

async function curl(args) {
  try {
    const { stdout } = await run('curl', ['-s', '-w', '\n%{http_code}', ...args], { maxBuffer: 8 * 1024 * 1024 });
    const i = stdout.lastIndexOf('\n');
    return { body: stdout.slice(0, i), status: Number(stdout.slice(i + 1)) };
  } catch (e) {
    return { body: String(e.message), status: 0 };
  }
}

async function upload() {
  // the box's image (kept from the page's own answer): its copy in DA under its Edge Delivery name
  const rec = readJson(RECORD, {});
  if (rec.image && !rec.image.uploaded) {
    rec.image.asset = '/content/dam/b2bneo/images/CustomerServiceKAM.png';
    const img = await curl(['-X', 'POST', '-F', `data=@"${path.join(W, rec.image.file)}";type=image/png`, `https://admin.da.live/source/${ORG}/${SITE}${edsDamPath(rec.image.asset)}`]);
    console.log(`image DA ${img.status}`);
    if (img.status >= 200 && img.status < 300) {
      const pv = await curl(['-X', 'POST', `https://admin.hlx.page/preview/${ORG}/${SITE}/main${edsDamPath(rec.image.asset)}`]);
      console.log(`image preview ${pv.status}`);
      rec.image.uploaded = new Date().toISOString();
      fs.writeFileSync(RECORD, `${JSON.stringify(rec, null, 1)}\n`);
    }
  }
  const up = await curl(['-X', 'POST', '-F', `data=@"${SHEET}";type=application/json`, `https://admin.da.live/source/${ORG}/${SITE}${SHEET_PATH}`]);
  console.log(`DA ${up.status}`);
  if (up.status < 200 || up.status >= 300) return 1;
  const pr = await curl(['-X', 'POST', `https://admin.hlx.page/preview/${ORG}/${SITE}/main${SHEET_PATH}`]);
  console.log(`preview ${pr.status}`);
  return pr.status === 200 ? 0 : 1;
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  let code = 0;
  if (has('record')) code = await record();
  if (!code && has('sheet')) sheet();
  if (!code && has('upload')) code = await upload();
  process.exit(code);
}
