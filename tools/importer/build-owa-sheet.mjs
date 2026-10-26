/* eslint-disable no-console, max-len, import/no-relative-packages */
/**
 * The header and footer JSON of www (package 5, lh-edge src/owa.js) from the replica's nav and
 * footer documents: this script prepares both sides once, from www's recorded answers
 * (tools/source-export/feeds/owa/<cc>-<ll>-homepage.{header,footer}.json):
 *   --nav-links  writes the links of the level-2 headings of the mega menu (www's group href,
 *                "Flights" -> /de/en/book-and-manage/overview-flights) into
 *                content/<cc>/<ll>/nav.plain.html (root-relative for migrated pages, absolute on
 *                www otherwise, as the importer writes links); idempotent
 *   --sheet      writes tools/importer/owa-tracking-sheet.json, the sheet /app/config/owa-tracking
 *                (locale, part, key, track, url, text): every tracking id of www's answers, the
 *                values the documents don't hold (field:logoUrl, field:flyoutImage ...), and url
 *                or text where www's answer differs from what lh-edge builds from the document
 * Keys: quick/<label>, menu/<top>[/<group>[/<link>]], tool/accessibility, tool/support,
 * list<n>/<text>, field:<name>.
 *
 * Usage: node tools/importer/build-owa-sheet.mjs [--nav-links] [--sheet]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHeader, buildFooter } from '../workers/lh-edge/src/owa.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const LOCALES = ['de/en', 'de/de', 'at/de', 'gb/en'];
const FIX = path.join(root, 'tools/source-export/feeds/owa');
const fixture = (locale, part) => JSON.parse(fs.readFileSync(path.join(FIX, `${locale.replace('/', '-')}-homepage.${part}.json`), 'utf8'));
const doc = (locale, name) => path.join(root, 'content', locale, `${name}.plain.html`);
const { default: SCOPE } = await import(path.join(root, 'tools/importer/transformers/scope-paths.js'));
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** The document form of a www header href (as the importer writes links). */
function docHref(href) {
  const [p, q = ''] = String(href).split('?');
  if (!p.startsWith('/')) return href;
  return SCOPE.has(p.replace(/\/$/, '')) ? href : `https://www.lufthansa.com${p}${q ? `?${q}` : ''}`;
}

if (argv.includes('--nav-links')) {
  LOCALES.forEach((locale) => {
    const file = doc(locale, 'nav');
    let html = fs.readFileSync(file, 'utf8');
    let added = 0;
    fixture(locale, 'header')['dcep-header-flyout'].menuItems.forEach((top) => top.menuItems.forEach((group) => {
      if (!group.href) return;
      const plain = `<p>${escapeHtml(group.label.trim())}</p>`;
      if (!html.includes(plain)) return;
      html = html.replace(plain, `<p><a href="${escapeHtml(docHref(group.href))}">${escapeHtml(group.label.trim())}</a></p>`);
      added += 1;
    }));
    fs.writeFileSync(file, html);
    console.log(`${locale}/nav: ${added} heading links written`);
  });
}

/** Rows for one locale and part, walking lh-edge's answer (no sheet) and www's side by side. */
function rowsFor(locale, part) {
  const rows = [];
  const row = (key, track, mine, www) => {
    const r = {
      locale, part, key, track: track ?? '', url: '', text: '',
    };
    if (mine && www) {
      if (www.url !== undefined && mine.url !== www.url) r.url = www.url;
      if (www.text !== undefined && mine.text !== www.text) r.text = www.text;
    }
    rows.push(r);
  };
  const field = (name, value) => rows.push({
    locale, part, key: `field:${name}`, track: '', url: '', text: value ?? '',
  });
  const problems = [];
  if (part === 'header') {
    const mine = buildHeader(fs.readFileSync(doc(locale, 'nav'), 'utf8'), locale, []);
    const www = fixture(locale, 'header');
    const mq = mine['dcep-header-quick-action-links'].links;
    const wq = www['dcep-header-quick-action-links'].links;
    if (mq.length !== wq.length) problems.push(`quick links ${mq.length} / ${wq.length}`);
    wq.forEach((w, i) => {
      const m = mq[i] || {};
      row(`quick/${m.label ?? w.label}`, w.dataIdentifierTrack, { url: m.url, text: m.label }, { url: w.url, text: w.label });
    });
    const mt = mine['dcep-header-flyout'].menuItems;
    const wt = www['dcep-header-flyout'].menuItems;
    if (mt.length !== wt.length) problems.push(`top items ${mt.length} / ${wt.length}`);
    wt.forEach((wTop, i) => {
      const mTop = mt[i] || { menuItems: [] };
      const topKey = `menu/${mTop.label ?? wTop.label}`;
      row(topKey, wTop.dataIdentifierTrack, { text: mTop.label }, { text: wTop.label });
      if (mTop.menuItems.length !== wTop.menuItems.length) problems.push(`${topKey}: groups ${mTop.menuItems.length} / ${wTop.menuItems.length}`);
      wTop.menuItems.forEach((wG, j) => {
        const mG = mTop.menuItems[j] || { menuItems: [] };
        const gKey = `${topKey}/${mG.label ?? wG.label}`;
        row(gKey, wG.dataIdentifierTrack, { url: mG.href, text: mG.label }, { url: wG.href, text: wG.label });
        if (mG.menuItems.length !== wG.menuItems.length) problems.push(`${gKey}: links ${mG.menuItems.length} / ${wG.menuItems.length}`);
        wG.menuItems.forEach((wL, k) => {
          const mL = mG.menuItems[k] || {};
          row(`${gKey}/${mL.label ?? wL.label}`, wL.dataIdentifierTrack, { url: mL.href, text: mL.label }, { url: wL.href, text: wL.label });
        });
      });
    });
    const mf = mine['dcep-header-flyout'];
    const wf = www['dcep-header-flyout'];
    row('tool/accessibility', wf.accessibilityDataTrackingId, { url: mf.accessibilityUrl, text: mf.accessibilityTextLabel }, { url: wf.accessibilityUrl, text: wf.accessibilityTextLabel });
    row('tool/support', wf.supportDataTrackingId, { url: mf.supportUrl, text: mf.supportTextLabel }, { url: wf.supportUrl, text: wf.supportTextLabel });
    field('flyoutImage', wf.flyoutImage);
    const wh = www['dcep-header'];
    field('logoUrl', wh.logoUrl);
    field('logoAlt', wh.logoAlt);
    field('homepageHeadline', wh.homepageHeadline);
    if (mine['dcep-header'].homeUrl !== wh.homeUrl) field('homeUrl', wh.homeUrl);
  } else {
    const mine = buildFooter(fs.readFileSync(doc(locale, 'footer'), 'utf8'), locale, []);
    const www = fixture(locale, 'footer');
    ['logoIcon', 'logoAltText', 'secondaryLogoIcon', 'secondaryLogoAltText', 'quoteText', 'copyrightText', 'linkedInIcon', 'linkedInAltText', 'linkedInLink', 'linkTarget']
      .forEach((f) => field(f, www[f]));
    for (let n = 1; n <= 7; n += 1) {
      const m = mine[`linkList${n}`] || [];
      const w = www[`linkList${n}`] || [];
      if (m.length !== w.length) problems.push(`linkList${n}: ${m.length} / ${w.length}`);
      w.forEach((wl, i) => {
        const ml = m[i] || {};
        row(`list${n}/${ml.text ?? wl.text}`, wl.eventId, { url: ml.url, text: ml.text }, { url: wl.url, text: wl.text });
      });
    }
  }
  return { rows, problems };
}

if (argv.includes('--sheet')) {
  const data = [];
  LOCALES.forEach((locale) => ['header', 'footer'].forEach((part) => {
    const { rows, problems } = rowsFor(locale, part);
    data.push(...rows);
    const overrides = rows.filter((r) => r.url || (r.text && !r.key.startsWith('field:')));
    console.log(`${locale} ${part}: ${rows.filter((r) => r.track).length} tracking ids, ${overrides.length} overrides${problems.length ? `; structure differs: ${problems.join('; ')}` : ''}`);
    overrides.forEach((r) => console.log(`   ${r.key}: ${r.url ? `url ${r.url}` : ''} ${r.text ? `text "${r.text}"` : ''}`));
  }));
  const sheet = {
    total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
  };
  fs.writeFileSync(path.join(root, 'tools/importer/owa-tracking-sheet.json'), `${JSON.stringify(sheet, null, 1)}\n`);
  console.log(`owa-tracking-sheet.json: ${data.length} rows`);
}
