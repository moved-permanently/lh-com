/* eslint-disable no-console, no-underscore-dangle, max-len -- one-off import of recorded JSON */
/**
 * Imports the Lufthansa app's server-driven screens once, from www's recorded answers
 * (tools/source-export/feeds/sdui/<lang>/<path>.v2.sdui.json and .sdui.json), into one DA
 * document per screen at the same path: content/content/mobile/lh/<lang>/<path>.plain.html
 * (the hub `articles`, 7 category lists, 24 articles per language, and `homepage`).
 *
 * Document model (see blocks/app-*.md in tools/workers/lh-edge/SDUI.md):
 * - sections = the v2 columns; section metadata Spacing (medium | large, default large); a
 *   section that holds only one image or the service block sits directly in the screen body;
 * - default content: h1 (screen headline), h2 (section headline), h3 (small headline), p (text;
 *   "{small}" at the end for the small size), ul (a list), an image linked to its DAM URL
 *   (the link is the image URL lh-edge sends; the image is for the author), "{spacer: medium}"
 *   paragraphs (sizes x-small, medium, m-large, large; ", v2" for a spacer only the v2 screen
 *   has);
 * - blocks: app-links (in-app and web links), app-offer (offer box), app-article-list (the
 *   articles of a category, from the query index), app-service (the home screen's service
 *   slot, v2), app-teaser-slider (the home screen's teaser slider, v1);
 * - metadata: Title (screen title), Robots, and for articles Description, Teaser image,
 *   Category, Date, Order (the article lists).
 * Usage: node tools/importer/sdui-import.mjs [--lang en] [--only <path>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FEED = path.join(root, 'tools/source-export/feeds/sdui');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);

const index = JSON.parse(fs.readFileSync(path.join(FEED, 'index.json'), 'utf8')).urls;
const screens = Object.keys(index).filter((u) => u.endsWith('.v2.sdui')).map((u) => u.replace(/\.v2\.sdui$/, ''))
  .filter((p) => (!opt('lang') || p.startsWith(`/content/mobile/lh/${opt('lang')}/`)) && (!opt('only') || p.includes(opt('only'))));
const load = (p, v2) => JSON.parse(fs.readFileSync(path.join(FEED, index[`${p}${v2 ? '.v2.sdui' : '.sdui'}`].file.replace(/^sdui\//, '')), 'utf8'));

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
/** HTML of an SDUI text (b, ul/li, br, entities) as document HTML: b -> strong. */
const richHtml = (t) => String(t).replace(/<b(\s[^>]*)?>/g, '<strong>').replace(/<\/b>/g, '</strong>');
const screenPath = (url) => {
  const m = String(url || '').match(/\/content\/mobile\/lh\/.*?(?=\.v2\.sdui$|\.sdui$)/);
  return m ? m[0] : null;
};
const titles = Object.fromEntries(screens.map((p) => [p, load(p, true).metadata.title]));

/* ------------------------------------------------------------------------------- v1 / v2 */

/** Flat signatures (to find the spacers only the v2 screen has). */
const flat1 = (items, out = []) => {
  items.forEach((it) => {
    if (['paddedColumn', 'cardItem_v2', 'teaserSlider'].includes(it.type)) return;
    if (it.type === 'spacer') out.push(`sp:${it.size}`);
    else out.push('x');
  });
  return out;
};
const flat2 = (items, out = []) => {
  items.forEach((it) => {
    if (it.type === 'column') flat2(it.items, out);
    else if (it.type === 'sduiServiceIntegration') out.push('svc');
    else if (it.type === 'spacer') out.push(`sp:${it.size}`);
    else out.push('x');
  });
  return out;
};

/** Indexes (in flat2 order) of the v2 spacers v1 has not (LCS alignment). */
function v2OnlySpacers(a, b) {
  const n = a.length; const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const only = new Set();
  let i = 0; let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { i += 1; j += 1; } else if (dp[i + 1][j] >= dp[i][j + 1]) i += 1; else { if (b[j].startsWith('sp:')) only.add(j); j += 1; }
  }
  for (; j < m; j += 1) if (b[j].startsWith('sp:')) only.add(j);
  return only;
}

/* ------------------------------------------------------------------------------- writing */

const SPACER = {
  X_SMALL: 'x-small', SMALL: 'small', MEDIUM: 'medium', M_LARGE: 'm-large', LARGE: 'large',
};
const cell = (html) => `<div>${html}</div>`;
const row = (...cells) => `<div>${cells.map(cell).join('')}</div>`;
const block = (name, rows) => `<div class="${name}">${rows.join('')}</div>`;
const imageLink = (url, alt) => `<a href="${esc(url)}"><picture><img src="${esc(url)}" alt="${esc(alt || '')}"></picture></a>`;
const link = (url, text) => `<a href="${esc(url)}">${esc(text)}</a>`;
const actionUrl = (a) => (a.request ? a.request.url : a.url);
/** A screen link as the document has it: the path without suffix; web links as they are. */
const docHref = (a) => screenPath(actionUrl(a)) || actionUrl(a);

function linkRows(links, langTitles) {
  return links.map((l) => {
    const a = l.action;
    const target = screenPath(actionUrl(a));
    const cells = [link(docHref(a), l.text), esc(a.tracking?.label || '')];
    // the title of the target screen is the default "initial title"; authored where it differs
    if (a.type === 'getAndShowViewDefinition' && (!target || langTitles[target] !== a.initialTitle)) cells.push(esc(a.initialTitle));
    return row(...cells);
  });
}

function offerRows(o) {
  const a = o.action;
  const rows = [
    row('Title', esc(o.title)),
    row('Description', esc(o.description)),
    row('Link text', esc(o.textLink)),
    row('Image', link(o.imageURL, o.imageURL)),
    row('Link', link(docHref(a), docHref(a))),
    row('Tracking', esc(a.tracking?.label || '')),
  ];
  if (a.type === 'getAndShowViewDefinition' && titles[screenPath(actionUrl(a))] !== a.initialTitle) rows.push(row('Initial title', esc(a.initialTitle)));
  return rows;
}

function convertItems(items, ctx) {
  const out = [];
  let links = [];
  let list = [];
  const flush = () => {
    if (links.length) out.push(block('app-links', linkRows(links, titles)));
    links = [];
    if (list.length) {
      out.push(block('app-article-list', [
        row('Category', link(ctx.path, ctx.path)),
        row('Link text', esc(list[0].textLink)),
        row('Tracking', esc(list[0].action.tracking?.label || '')),
      ]));
      list.forEach((o) => ctx.listed.push({ article: screenPath(actionUrl(o.action)), offer: o, category: ctx.path }));
    }
    list = [];
  };
  items.forEach((it) => {
    const { pos } = ctx;
    ctx.pos += it.type === 'column' ? 0 : 1;
    if (it.type !== 'navigationLink' && links.length) flush();
    const isListEntry = it.type === 'offerBox' && it.action?.tracking?.category === 'blog overview';
    if (!isListEntry && list.length) flush();
    switch (it.type) {
      case 'mainHeadline': {
        const level = { HEADING_XL: 'h1', HEADING_XXL: 'h1', HEADING_L: 'h2' }[it.variant] || 'h2';
        out.push(`<${level}>${richHtml(it.text)}</${level}>`);
        break;
      }
      case 'copyText':
        if (it.variant === 'HEADLINE') out.push(`<h3>${richHtml(it.text)}</h3>`);
        else if (/^<ul>[\s\S]*<\/ul>$/.test(it.text)) out.push(richHtml(it.text));
        else out.push(`<p>${richHtml(it.text)}${it.size === 'SMALL' ? ' {small}' : ''}</p>`);
        break;
      case 'image':
        out.push(`<p>${imageLink(it.url, it.contentDescription)}</p>`);
        break;
      case 'spacer':
        out.push(`<p>{spacer: ${SPACER[it.size] || it.size.toLowerCase()}${ctx.v2Only.has(pos) ? ', v2' : ''}}</p>`);
        break;
      case 'navigationLink':
        links.push(it);
        break;
      case 'offerBox':
        if (isListEntry) list.push(it);
        else out.push(block('app-offer', offerRows(it)));
        break;
      case 'sduiServiceIntegration':
        out.push(block('app-service', [
          row('Service', esc(it.serviceId)),
          row('Auxiliary data', esc(it.auxiliaryData)),
          row('Tenant', esc(it.tenant)),
          row('Market', esc(it.market)),
          row('Language', esc(it.language)),
        ]));
        break;
      default:
        throw new Error(`${ctx.path}: unknown v2 item ${it.type}`);
    }
  });
  flush();
  return out;
}

function teaserSliderBlock(slider) {
  const rows = [row('Title', esc(slider.title))];
  slider.items.forEach((card) => {
    const col = card.items.find((i) => i.type === 'paddedColumn');
    const texts = col.items.filter((i) => i.type === 'copyText');
    const img = card.items.find((i) => i.type === 'image');
    const a = card.action_v2;
    rows.push(row(
      `<h3>${esc(texts[0]?.text.trim())}</h3><p>${esc(texts[1]?.text.trim())}</p>`,
      imageLink(img.url, img.contentDescription),
      link(docHref(a), a.initialTitle),
      esc(a.tracking?.label || ''),
    ));
  });
  return block('app-teaser-slider', rows);
}

const MONTHS = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  januar: 1,
  februar: 2,
  märz: 3,
  mai: 5,
  juni: 6,
  juli: 7,
  oktober: 10,
  dezember: 12,
};
function isoDate(text) {
  const m = String(text || '').replace(/<[^>]+>/g, '').match(/(\d{1,2})\.\s*([A-Za-zäöüÄÖÜ]+)\s+(\d{4})/);
  if (!m || !MONTHS[m[2].toLowerCase()]) return '';
  return `${m[3]}-${String(MONTHS[m[2].toLowerCase()]).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

const listed = [];
const docs = {};
screens.forEach((p) => {
  const v2 = load(p, true);
  const v1 = load(p, false);
  const container = v1.type === 'CONTAINER';
  const v2Only = v2OnlySpacers(
    (() => { const a = flat1(v1.items); return container ? a : a.slice(1, -1); })().filter((x, i, arr) => !(container && (i === 0 || i === arr.length - 1))),
    flat2(v2.body.items),
  );
  const ctx = {
    path: p, pos: 0, v2Only, listed,
  };
  const sections = [];
  v2.body.items.forEach((it) => {
    if (it.type === 'column') {
      const meta = [];
      if (it.spacing && it.spacing !== 'LARGE') meta.push(row('Spacing', it.spacing.toLowerCase()));
      const body = convertItems(it.items, ctx);
      if (meta.length) body.push(block('section-metadata', meta));
      sections.push(body.join(''));
    } else {
      sections.push(convertItems([it], ctx).join(''));
    }
  });
  if (container) {
    const slider = v1.items.find((i) => i.type === 'teaserSlider');
    if (slider) sections[sections.length - 1] += teaserSliderBlock(slider);
  }
  docs[p] = {
    sections, title: v2.metadata.title, container, v1, v2,
  };
});

// article metadata from the category lists: description, teaser image, category, date, order
const articleMeta = {};
listed.forEach(({ article, offer, category }, i, all) => {
  const order = all.filter((x) => x.category === category).findIndex((x) => x.article === article) + 1;
  articleMeta[article] = {
    Description: offer.description, 'Teaser image': offer.imageURL, Category: category, Order: String(order),
  };
});

let written = 0;
Object.entries(docs).forEach(([p, d]) => {
  const meta = [['Title', esc(d.title)], ['Robots', 'noindex, nofollow']];
  if (d.container) meta.push(['SDUI type', 'container']);
  const am = articleMeta[p];
  if (am) {
    const dateLine = d.v1.items.find((i) => i.type === 'copyText' && i.size === 'SMALL');
    meta.push(
      ['Description', esc(am.Description)],
      ['Teaser image', link(am['Teaser image'], am['Teaser image'])],
      ['Category', link(am.Category, am.Category)],
      ['Date', isoDate(dateLine && dateLine.text)],
      ['Order', am.Order],
    );
  }
  const html = `${d.sections.map((s) => `<div>${s}</div>`).join('\n')}\n<div>${block('metadata', meta.map(([k, v]) => row(k, v)))}</div>\n`;
  const file = path.join(root, 'content', `${p}.plain.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written += 1;
});
console.log(`sdui-import: ${written} documents (${listed.length} list entries)`);
