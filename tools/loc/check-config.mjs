/* eslint-disable no-console, max-len, no-restricted-syntax, import/extensions, import/no-extraneous-dependencies, import/prefer-default-export -- dev tooling */
/**
 * Checks tools/loc/translate.json against the localisation app's own code (adobe/da-nx
 * nx/blocks/loc at the pinned commit below): the app's functions are downloaded into a temp
 * folder (never into the repository) and run on the configuration and on real lh-com pages.
 * - formatConfig (views/options/utils/utils.js): source language, default conflict behaviours,
 *   service;
 * - formatLangs and finalizeOptions: actions per row, locales, the view a project goes to;
 * - convertPath (utils/utils.js) with the arguments validate, translate and rollout pass: where
 *   a translation and each rollout land;
 * - addDnt (dnt/dnt.js): which cells of lh-com's blocks reach the translation service;
 * - sourceChecks: the project's source folder from its URLs (source.language.detect, 1.29.1);
 * - globalSourceChecks: the same for the global source's rows (/gc/en, /gc/de; README "Global
 *   source (/gc)"), with the app's Sync, translate and rollout path functions.
 * The checks follow the translate.json's rows (setup-lib.mjs): today's or the gc ones.
 * Usage: node tools/loc/check-config.mjs [--config <file>|da] [--page /de/en/feedback-past-flight ...]
 * Exit 1 when a check fails. Report: tools/reports/loc-config-check.md (today's rows),
 * tools/reports/loc-config-check-gc.md (the gc rows)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { loadApp, DA_NX_COMMIT } from './da-nx.mjs';
import { locSetup, readConfig } from './setup-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const lines = [];
let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed += 1;
  lines.push(`- ${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}`);
};

/** The cells of a block that stay translatable after addDnt: [{row, col, text}]. */
function translatable(html, blockClass) {
  const { document } = parseHTML(html);
  const out = [];
  document.querySelectorAll(`.${blockClass}`).forEach((block) => {
    [...block.children].forEach((row, r) => {
      [...row.children].forEach((cell, c) => {
        const no = cell.closest('[translate="no"]');
        const text = cell.textContent.replace(/\s+/g, ' ').trim();
        if (!no && text) out.push({ row: r + 1, col: c + 1, text: text.slice(0, 50) });
      });
    });
  });
  return out;
}

/**
 * The options view of a project with these URLs, as the app builds it (options.js detectSource
 * 72-93, updateOptions): (urls) -> {sourceLang, detected, error, options, langs}.
 */
function projectView(app, config) {
  const { options: opts, config: conf } = app.options.formatConfig(config);
  const enabled = app.utils.isSourceDetectEnabled(conf['source.language.detect']);
  return (urls) => {
    const options = { ...opts };
    const defaultSourceLang = options['source.language'];
    let langs = app.options.formatLangs(structuredClone(config.languages.data), conf);
    const res = app.options.getProjectSource({
      project: { urls: urls.map((u) => ({ suppliedPath: u })) }, enabled, langs, defaultSourceLang,
    });
    if (!res.error && res.detected) {
      options['source.language'] = res.sourceLang;
      langs = app.options.filterLangsBySource({ langs, sourceLocation: res.sourceLang.location, defaultLocation: defaultSourceLang?.location });
    }
    return { ...res, options, langs };
  };
}

/**
 * A project's source folder, as the released app takes it from the project's URLs (da-nx
 * 69006f3b, release 1.29.1: views/options/options.js detectSource 72-93 with getProjectSource,
 * views/options/utils/utils.js 152-161; resolveSourceLang, utils/utils.js 362-389;
 * filterLangsBySource, views/options/utils/utils.js 167-188; the rollout's paths,
 * views/rollout/index.js formatLangUrls/formatRolloutUrls 112-145): the checks as
 * [{name, ok, detail}], the app's own functions on translate.json.
 * @param {Object} app the app's modules (loadApp)
 * @param {Object} config translate.json
 */
export function sourceChecks(app, config) {
  const out = [];
  const add = (name, ok, detail = '') => out.push({ name, ok: Boolean(ok), detail });
  const { config: conf } = app.options.formatConfig(config);
  const enabled = app.utils.isSourceDetectEnabled(conf['source.language.detect']);
  add('source.language.detect is read and on (isSourceDetectEnabled, da-nx #793 + #870, release 1.29.1)', enabled, String(conf['source.language.detect']));
  const project = projectView(app, config);
  const acts = (langs) => langs.map((l) => `${l.name}:${l.orderedActions.map((a) => a.value).join('|')}`).join(', ');

  const en = project(['/de/en/baggage', '/de/en/flight-search']);
  add('/de/en URLs: source /de/en (resolveSourceLang), English Skip|Rollout, German Skip|Translate|Rollout', en.detected && en.sourceLang?.location === '/de/en'
    && acts(en.langs) === 'English:skip|rollout, German:skip|translate|rollout', `${en.sourceLang?.location}; ${acts(en.langs)}`);
  const de = project(['/de/de/gepaeck', '/de/de/kinder-an-bord']);
  add('/de/de URLs: source /de/de (resolveSourceLang)', de.detected && de.sourceLang?.location === '/de/de', JSON.stringify(de.sourceLang));
  add('filterLangsBySource for /de/de: only German, with Skip and Rollout (Skip preselected)', acts(de.langs) === 'German:skip|rollout' && de.langs[0].activeAction.value === 'skip', acts(de.langs));
  const mixed = project(['/de/en/baggage', '/de/en/flight-search', '/de/de/gepaeck']);
  add('mixed /de/en and /de/de URLs: refused, the message names the URL to uncheck', Boolean(mixed.error) && mixed.error.includes('/de/de/gepaeck') && mixed.error.includes('more than one source root'), mixed.error);

  // the view of a /de/de project with German rollout (finalizeOptions; the source locations as
  // validate persists them, getSourceLocations)
  const pickDe = de.langs.map((l) => ({ ...l, activeAction: { value: 'rollout' } }));
  const urlsDe = [{ suppliedPath: '/de/de/kinder-an-bord' }];
  const locs = app.utils.getSourceLocations({ options: de.options, langs: pickDe });
  const fin = app.options.finalizeOptions(conf, de.options, pickDe, urlsDe, locs);
  add('/de/de project, German Rollout -> rollout view (no Sync)', fin.view === 'rollout', `${fin.view}; source locations ${locs.join(',')}`);

  // the rollout's paths (views/rollout/index.js 112-145): from the URL's own source folder 1:1
  const { convertPath, findSourceLocation } = app.utils;
  const german = de.langs[0];
  const src = convertPath({ path: '/de/de/kinder-an-bord', sourcePrefix: findSourceLocation({ path: '/de/de/kinder-an-bord', locations: locs }), destPrefix: german.location });
  const dest = convertPath({ path: src.aemBasePath, sourcePrefix: '', destPrefix: '/at/de' });
  add('German rollout of /de/de/kinder-an-bord reads /de/de/kinder-an-bord.html -> /at/de/kinder-an-bord.html (own German slugs roll out 1:1)', src.daDestPath === '/de/de/kinder-an-bord.html' && dest.daDestPath === '/at/de/kinder-an-bord.html', `${src.daDestPath} -> ${dest.daDestPath}`);
  return out;
}

/**
 * The global source's rows (tools/loc/README.md "Global source (/gc)": English /gc/en ->
 * /de/en, /gb/en; German /gc/en -> /gc/de -> /de/de, /at/de) against the released app (da-nx
 * 69006f3b), with its own functions: the options view (formatConfig, formatLangs,
 * getProjectSource, filterLangsBySource, finalizeOptions), validate's source locations
 * (getSourceLocations, getProjectBasePath), Sync (views/sync/index.js getSyncUrls 7-34), the
 * translation's destination (views/translate/index.js getSaveDestPath 107-117) and the rollout's
 * source (views/rollout/index.js formatLangUrls 112-125; its destinations as formatRolloutUrls
 * 127-147, not exported, does). [{name, ok, detail}]
 * @param {Object} app the app's modules (loadApp)
 * @param {Object} config translate.json with the gc rows
 */
function gcChecks(app, config) {
  const out = [];
  const add = (name, ok, detail = '') => out.push({ name, ok: Boolean(ok), detail });
  const { options: opts, config: conf } = app.options.formatConfig(config);
  const enabled = app.utils.isSourceDetectEnabled(conf['source.language.detect']);
  add('source.language.detect is read and on (isSourceDetectEnabled)', enabled, String(conf['source.language.detect']));
  add('source.language -> the English row at /gc/en (every project\'s default source)', JSON.stringify(opts['source.language']) === JSON.stringify({ name: 'English', code: 'en', location: '/gc/en' }), JSON.stringify(opts['source.language']));
  const all = Object.fromEntries(app.options.formatLangs(structuredClone(config.languages.data), conf).map((l) => [l.name, l]));
  const acts = (l) => l.orderedActions.map((a) => a.value).join('|');
  const locs = (l) => (l.locales || []).map((x) => `${x.code}:${x.active}`).join();
  add('English: Skip|Rollout, locales /de/en and /gb/en (both active: one rollout writes both)', all.English && acts(all.English) === 'skip|rollout' && locs(all.English) === '/de/en:true,/gb/en:true', all.English && `${acts(all.English)}; ${locs(all.English)}`);
  add('German: Skip|Translate|Rollout, locales /de/de and /at/de (both active: one rollout writes both)', all.German && acts(all.German) === 'skip|translate|rollout' && locs(all.German) === '/de/de:true,/at/de:true', all.German && `${acts(all.German)}; ${locs(all.German)}`);

  const project = projectView(app, config);
  const langActs = (langs) => langs.map((l) => `${l.name}:${acts(l)}`).join(', ');
  // validate's source locations (getUpdates: the detected source, else the default; plus the rows' sources)
  const sourceLocations = (p) => app.utils.getSourceLocations({ options: { 'source.language': { location: p.detected ? p.sourceLang.location : opts['source.language'].location } }, langs: config.languages.data });
  const en = project(['/gc/en/baggage', '/gc/en/flights']);
  add('/gc/en URLs: source /gc/en (resolveSourceLang), English Skip|Rollout, German Skip|Translate|Rollout', en.detected && en.sourceLang?.location === '/gc/en' && langActs(en.langs) === 'English:skip|rollout, German:skip|translate|rollout', `${en.sourceLang?.location}; ${langActs(en.langs)}`);
  const de = project(['/gc/de/gepaeck', '/gc/de/fluege']);
  add('/gc/de URLs: source /gc/de (resolveSourceLang); filterLangsBySource leaves only German, with Skip and Rollout', de.detected && de.sourceLang?.location === '/gc/de' && langActs(de.langs) === 'German:skip|rollout', `${de.sourceLang?.location}; ${langActs(de.langs)}`);
  const mixed = project(['/gc/en/baggage', '/gc/en/flights', '/gc/de/gepaeck']);
  add('mixed /gc/en and /gc/de URLs: refused, the message names the URL to uncheck', Boolean(mixed.error) && mixed.error.includes('/gc/de/gepaeck'), mixed.error);

  // the hazard: market URLs match no source root, the project goes to Sync, which copies them
  // under the default source with their full path (getSyncUrls: convertPath without a source prefix)
  const marketUrls = ['/de/en/baggage', '/de/de/gepaeck', '/at/de/gepaeck', '/gb/en/baggage'];
  const market = project(marketUrls);
  const mLocs = sourceLocations(market);
  const pick = (langs, value) => langs.map((l) => ({ ...l, activeAction: { value } }));
  const marketView = app.options.finalizeOptions(conf, market.options, pick(market.langs.filter((l) => l.name === 'English'), 'rollout'), marketUrls.map((u) => ({ suppliedPath: u })), mLocs).view;
  const synced = app.sync.getSyncUrls('moved-permanently', 'lh-com', market.options['source.language'].location, marketUrls.map((u) => ({ suppliedPath: u })), undefined, mLocs);
  const dests = synced.map((u) => u.destination.replace('/moved-permanently/lh-com', '')).join(', ');
  add('/de/en URLs match no source: Sync copies them into /gc/en/de/en/… (also /de/de, /at/de, /gb/en URLs): never put market URLs in a project', !market.detected && !market.error && marketView === 'sync'
    && dests === '/gc/en/de/en/baggage.html, /gc/en/de/de/gepaeck.html, /gc/en/at/de/gepaeck.html, /gc/en/gb/en/baggage.html', `detected ${market.detected}; view ${marketView}; ${dests}`);

  // the translation from a /gc/en project
  const enLocs = sourceLocations(en);
  const germanOfEn = en.langs.find((l) => l.name === 'German');
  const basePath = app.utils.getProjectBasePath({ path: '/gc/en/flights', defaultLocation: '/gc/en', sourceLocations: enLocs });
  const tdest = app.translate.getSaveDestPath({ url: { suppliedPath: '/gc/en/flights', basePath }, lang: germanOfEn, sourceLocations: enLocs });
  add('translate /gc/en/flights -> /gc/de/flights.html (getSaveDestPath; the slug step moves it to /gc/de/fluege)', tdest === '/gc/de/flights.html', tdest);

  // the rollouts: the source as formatLangUrls reads it, each active locale as formatRolloutUrls writes it
  const rolloutOf = (p, lang, locations) => {
    const [u] = app.rollout.formatLangUrls('o', 's', locations, lang, [{ suppliedPath: p }]);
    const to = (lang.locales || []).filter((l) => l.active).map((l) => app.utils.convertPath({
      path: u.aemBasePath, sourcePrefix: '', destPrefix: l.code, snapshotPrefix: '',
    }).daDestPath);
    return `${u.source.replace('/o/s', '')} -> ${to.join(' and ')}`;
  };
  const deLocs = sourceLocations(de);
  const g = rolloutOf('/gc/de/fluege', de.langs[0], deLocs);
  add('one German rollout of /gc/de/fluege reads /gc/de/fluege.html and writes /de/de/fluege.html and /at/de/fluege.html (own German slugs roll out 1:1)', g === '/gc/de/fluege.html -> /de/de/fluege.html and /at/de/fluege.html', g);
  const e = rolloutOf('/gc/en/baggage', en.langs.find((l) => l.name === 'English'), enLocs);
  add('one English rollout of /gc/en/baggage reads /gc/en/baggage.html and writes /de/en/baggage.html and /gb/en/baggage.html', e === '/gc/en/baggage.html -> /de/en/baggage.html and /gb/en/baggage.html', e);
  const gInEn = rolloutOf('/gc/en/flights', germanOfEn, enLocs);
  add('German Rollout in a /gc/en project reads /gc/de/<English path> (/gc/de/flights.html, not /gc/de/fluege) and writes /de/de and /at/de: click both German locales off there, roll out German from a /gc/de project', gInEn === '/gc/de/flights.html -> /de/de/flights.html and /at/de/flights.html', gInEn);

  const fin = app.options.finalizeOptions(conf, de.options, pick(de.langs, 'rollout'), [{ suppliedPath: '/gc/de/fluege' }], deLocs);
  add('/gc/de project, German Rollout -> rollout view (no Sync)', fin.view === 'rollout', `${fin.view}; source locations ${deLocs.join(',')}`);
  return out;
}

export function globalSourceChecks(app, config) {
  try {
    return gcChecks(app, config);
  } catch (e) {
    // other rows (today's) leave the gc model without its rows: a failed check, not a crash
    return [{ name: 'the gc rows as the app reads them', ok: false, detail: e.message }];
  }
}

/** Today's rows (/de/en source): source language, actions, locales, views and paths. */
function todayChecks(app, config, options, conf) {
  check('source.language -> the English row', JSON.stringify(options['source.language']) === JSON.stringify({ name: 'English', code: 'en', location: '/de/en' }), JSON.stringify(options['source.language']));
  // the project's source folder from its URLs (released in 1.29.1)
  sourceChecks(app, config).forEach((c) => check(c.name, c.ok, c.ok ? '' : c.detail));

  // formatLangs: actions, locales
  const langs = app.options.formatLangs(structuredClone(config.languages.data), conf);
  const by = Object.fromEntries(langs.map((l) => [l.name, l]));
  // the first action is the one a new project preselects: Skip, so an author picks each action
  check('English: Skip first (preselected), then Rollout; locale /gb/en', by.English.orderedActions.map((a) => a.value).join(',') === 'skip,rollout' && by.English.locales.map((l) => `${l.code}:${l.active}`).join() === '/gb/en:true');
  check('German: Skip first (preselected), then Translate, Rollout; locale /at/de', by.German.orderedActions.map((a) => a.value).join(',') === 'skip,translate,rollout' && by.German.locales.map((l) => `${l.code}:${l.active}`).join() === '/at/de:true');
  check('no waiting languages (no "source language" column)', langs.every((l) => !l.waitingFor));
  check('unique codes (options.js, rollout.js match languages by code)', new Set(langs.map((l) => l.code)).size === langs.length);

  // finalizeOptions: the view a project goes to
  const pick = (en, de) => langs.map((l) => ({ ...l, activeAction: { value: l.name === 'English' ? en : de } }));
  const view = (en, de, urls) => app.options.finalizeOptions(conf, options, pick(en, de), urls.map((u) => ({ suppliedPath: u }))).view;
  check('/de/en URLs, English rollout + German translate -> translate view first', view('rollout', 'translate', ['/de/en/baggage']) === 'translate');
  check('/de/en URLs, German rollout only -> rollout view', view('skip', 'rollout', ['/de/en/baggage']) === 'rollout');

  // paths: validate (basePath), translate (saveLang), rollout (formatLangUrls, formatRolloutUrls)
  const { convertPath } = app.utils;
  const basePath = (p) => convertPath({ path: p, sourcePrefix: '/de/en' }).aemBasePath;
  const translateDest = (p) => convertPath({ path: basePath(p), sourcePrefix: '/', destPrefix: '/de/de' }).daDestPath;
  const rollout = (p, lang, locale) => {
    const { daDestPath: source, aemBasePath } = convertPath({ path: p, sourcePrefix: '/de/en', destPrefix: lang.location });
    const { daDestPath: dest } = convertPath({ path: aemBasePath, sourcePrefix: '', destPrefix: locale });
    return [source, dest];
  };
  check('translate /de/en/baggage -> /de/de/baggage.html', translateDest('/de/en/baggage') === '/de/de/baggage.html');
  check('translate /de/en/flight-search -> /de/de/flight-search.html (the slug step moves it to /de/de/flugsuche)', translateDest('/de/en/flight-search') === '/de/de/flight-search.html');
  check('English rollout /de/en/baggage -> /gb/en/baggage.html', JSON.stringify(rollout('/de/en/baggage', by.English, '/gb/en')) === JSON.stringify(['/de/en/baggage.html', '/gb/en/baggage.html']));
  check('German rollout of /de/en/baggage reads /de/de/baggage.html -> /at/de/baggage.html', JSON.stringify(rollout('/de/en/baggage', by.German, '/at/de')) === JSON.stringify(['/de/de/baggage.html', '/at/de/baggage.html']));
  check('German rollout in a /de/en project reads /de/de/<English path> (/de/de/flight-search.html, not /de/de/flugsuche): click /at/de off there, roll out German from a /de/de project', rollout('/de/en/flight-search', by.German, '/at/de')[0] === '/de/de/flight-search.html');
}

const dntRows = [];

/** DNT: the rules on small tables, and what reaches the translation service on lh-com pages. */
async function dntChecks(app, config, pages) {
  // DNT rules on small tables (decorateTable, dnt/decorateTable.js): every rule shape the config uses
  const synthetic = [
    ['poi-map', [['Casa Bacardi', '39.93, 116.45', '<a href="x">More Information</a>'], ['Caption', 'A caption, with a comma'], ['Source', 'abc=='], ['Zoom in label', 'Zoom in']],
      ['tr/no/tr', 'no/tr', 'ROW', 'no/tr']],
    ['hero-banner', [['<picture><img src="a.jpg" alt="x"></picture>', '<h2>Tab</h2>'], ['Overlay', 'dark']], ['tr/tr', 'ROW']],
    ['carousel-lightbox', [['<picture><img src="a.jpg" alt="x"></picture>', 'Caption text'], ['Close label', 'Close']], ['tr/tr', 'no/tr']],
    ['price-bar', [['Destination', 'BER'], ['Price label', 'Round trip from']], ['ROW', 'no/tr']],
    ['blog-overview', [['Tag', 'articles:food'], ['Page size', '12']], ['BLOCK', 'BLOCK']],
  ];
  for (const [block, rows, expected] of synthetic) {
    const html = `<html><body><main><div><div class="${block}">${rows.map((r) => `<div>${r.map((x) => `<div>${x}</div>`).join('')}</div>`).join('')}</div></div></main></body></html>`;
    // eslint-disable-next-line no-await-in-loop
    const { document } = parseHTML(await app.dnt.addDnt(html, config));
    const t = document.querySelector(`.${block}`);
    const got = [...t.children].map((r) => {
      if (t.getAttribute('translate') === 'no') return 'BLOCK';
      if (r.getAttribute('translate') === 'no') return 'ROW';
      return [...r.children].map((cell) => (cell.getAttribute('translate') === 'no' ? 'no' : 'tr')).join('/');
    });
    check(`rules on a ${block} table`, JSON.stringify(got) === JSON.stringify(expected), `${got.join(' | ')} (expected ${expected.join(' | ')})`);
  }

  // DNT on real pages: what reaches the translation service
  const samples = pages.length ? pages : ['/de/en/feedback-past-flight', '/de/en/timetable-and-flight-status', '/de/en/homepage', '/de/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day', '/de/en/320', '/de/en/flights', '/de/en/online-check-in', '/de/en/food-and-beverages', '/de/en/32n', '/de/en/articles/explore-the-world'];
  for (const p of samples) {
    const file = path.join(root, 'content', `${p}.plain.html`);
    if (!fs.existsSync(file)) { check(`DNT sample ${p}`, false, 'no local copy'); continue; } // eslint-disable-line no-continue
    const html = `<html><body><header></header><main>${fs.readFileSync(file, 'utf8')}</main><footer></footer></body></html>`;
    // eslint-disable-next-line no-await-in-loop
    const out = await app.dnt.addDnt(html, config);
    const { document } = parseHTML(out);
    const blocks = [...new Set([...document.querySelectorAll('main div[class]')].map((d) => d.className.split(' ')[0]))].filter((b) => !['columns-media', 'carousel-cards', 'cards-teaser', 'accordion-columns'].includes(b) || b === 'metadata');
    blocks.forEach((b) => {
      const kept = translatable(out, b);
      dntRows.push(`| ${p} | ${b} | ${kept.length ? kept.slice(0, 6).map((k) => `${k.row}/${k.col} "${k.text}"`).join('; ') + (kept.length > 6 ? ` (+${kept.length - 6})` : '') : 'nothing'} |`);
    });
    const meta = translatable(out, 'metadata').map((k) => k.text);
    const keys = [...document.querySelectorAll('.metadata > div')].filter((row) => !row.children[1]?.closest('[translate="no"]')).map((row) => row.children[0].textContent.trim());
    check(`metadata of ${p}: only display texts translated`, keys.every((k) => ['title', 'description', 'og:title', 'og:description', 'keywords', 'breadcrumb title', 'parent title', 'card-image-alt', 'author-description', 'reading-time', 'tags'].includes(k.toLowerCase())) && meta.length > 0, keys.join(', '));
    if (p.includes('feedback-past-flight')) {
      const form = [...document.querySelectorAll('.form > div')];
      const cellNo = (row, c) => Boolean(row.children[c - 1]?.closest('[translate="no"]'));
      check('form: header row, Type, Name, Required, Rules and config rows not translated; Label and texts translated', form.length > 3 && form[0].closest('[translate="no"]') !== null
        && form.slice(1).every((row) => [2, 3, 4, 10].every((c) => !row.children[c - 1] || cellNo(row, c)))
        && form.filter((row) => row.children[1]?.textContent.trim() === 'config').every((row) => [1, 2, 3, 5].every((c) => cellNo(row, c)))
        && form.slice(1).some((row) => row.children[1]?.textContent.trim() !== 'config' && !cellNo(row, 1) && row.children[0].textContent.trim()));
    }
  }
}

/** The report of the run (today's rows or the gc ones): {failed, lines}. */
function report(which, global) {
  const out = [`# translate.json against the localisation app (adobe/da-nx ${DA_NX_COMMIT.slice(0, 8)})`, '', new Date().toISOString(), '',
    `translate.json: ${which === 'repo' ? 'tools/loc/translate.json' : which} (${global ? 'the global source\'s rows: /gc/en, /gc/de' : 'today\'s rows: /de/en, /de/de'}).`, '',
    `${failed ? `${failed} checks failed` : 'All checks pass'}.`, '', ...lines, '',
    '## What reaches the translation service (addDnt on lh-com pages)', '', 'row/col and text of the cells that stay translatable, per block (other blocks: everything but the block name is translated)', '',
    '| page | block | translatable cells |', '|---|---|---|', ...dntRows, ''];
  fs.mkdirSync(path.join(root, 'tools/reports'), { recursive: true });
  fs.writeFileSync(path.join(root, `tools/reports/loc-config-check${global ? '-gc' : ''}.md`), out.join('\n'));
  return { failed, lines };
}

export async function run({ pages = [], which = 'repo' } = {}) {
  const app = await loadApp();
  const config = await readConfig(which);
  const { global } = locSetup(config);

  // the sheet: every :names entry exists, totals match
  config[':names'].forEach((n) => check(`sheet ${n}`, Array.isArray(config[n]?.data) && config[n].total === config[n].data.length, `${config[n]?.data?.length} rows, total ${config[n]?.total}`));

  // formatConfig (views/options/utils/utils.js formatConfig)
  const { options, config: conf } = app.options.formatConfig(config);
  ['translate', 'rollout', 'copy', 'sync'].forEach((k) => check(`${k}.conflict.behavior default`, options[`${k}.conflict.behavior`] === 'merge', options[`${k}.conflict.behavior`]));
  check('service', conf.service.name === 'Google' && options['translation.service.all.env'] === 'prod' && conf.service.envs.prod.origin === 'https://translate.da.live/google', JSON.stringify(conf.service));
  // the global source: its own checks of the rows (sources, rollouts, the Sync hazard)
  if (global) globalSourceChecks(app, config).forEach((c) => check(c.name, c.ok, c.ok ? '' : c.detail));
  else todayChecks(app, config, options, conf);
  await dntChecks(app, config, pages);
  return report(which, global);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const pages = argv.flatMap((a, i) => (a === '--page' ? [argv[i + 1]] : []));
  const which = argv.includes('--config') ? argv[argv.indexOf('--config') + 1] : 'repo';
  const { failed: n } = await run({ pages, which });
  console.log(lines.join('\n'));
  process.exitCode = n ? 1 : 0;
}
