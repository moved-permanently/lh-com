/* eslint-disable no-console, max-len, no-underscore-dangle, prefer-destructuring, import/extensions */
/**
 * One-time import of www's GraphQL feeds (tools/source-export/feeds/graphql/, recorded
 * 2026-10-25) into DA structured content: one document per item under content/data/...
 * (.plain.html, the form editor's own format via the vendored @adobe/da-sc-sdk), companion
 * documents with the rich texts under content/data/details/..., the DA schemas
 * (content/.da/forms/schemas/<name>.plain.html, from tools/feeds/schemas.mjs) and the Trip
 * Management strings as a sheet (tools/importer/tmc-translations-sheet.json, for upload by Ben).
 *
 * What www's answers hold is merged per item: the What's new fields of the full list
 * (whatsnewList) and, where an item appears in a pop-up or early-access answer, its activation
 * date and per-airline images. Data errors of www are not copied: qa-www.lufthansa.com links
 * become www.lufthansa.com, doubled image URLs (".../https://www.lufthansa.com/content/dam/...")
 * their inner URL. Report: tools/reports/feeds/graphql-import.json.
 *
 * Usage: node tools/importer/graphql-import.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertJsonToHtml } from './vendor/da-sc-sdk.min.js';
import { SCHEMAS } from '../feeds/schemas.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FEED = path.join(root, 'tools/source-export/feeds/graphql');
const CONTENT = path.join(root, 'content');
const index = JSON.parse(fs.readFileSync(path.join(FEED, 'index.json'), 'utf8')).urls;
const answer = (url) => {
  const e = index[url];
  if (!e) throw new Error(`not recorded: ${url}`);
  return JSON.parse(fs.readFileSync(path.join(root, 'tools/source-export/feeds', e.file), 'utf8'));
};
const Q = (q) => `/graphql/execute.json/${q}`;

/** EDS document name: lower case, no accents, [a-z0-9-] only. */
function edsName(name) {
  return String(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
const docPathOf = (damPath, prefix = '/data') => `${prefix}${damPath.replace(/^\/content\/dam/, '').split('/').map(edsName).join('/')}`;

const written = [];
const report = {
  documents: 0, details: 0, fixes: [], placeholders: [], inferred: [],
};

function writeDoc(docPath, schemaName, data) {
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)));
  const { html, error } = convertJsonToHtml({ json: { metadata: { title: docPath.split('/').pop(), schemaName }, data: clean } });
  if (error) throw new Error(`${docPath}: ${error}`);
  const main = html.replace(/^[\s\S]*<main>/, '').replace(/<\/main>[\s\S]*$/, '');
  const file = path.join(CONTENT, `${docPath}.plain.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, main);
  written.push(docPath);
  report.documents += 1;
}

/** A companion document: the rich text as default content (one section). */
function writeDetails(docPath, html) {
  if (html === null || html === undefined) return '';
  const file = path.join(CONTENT, `${docPath}.plain.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body = String(html).trim() || '<p></p>';
  fs.writeFileSync(file, `<div>${body}</div>`);
  written.push(docPath);
  report.details += 1;
  return docPath;
}

const fixUrl = (v, where) => {
  if (typeof v !== 'string') return v;
  let out = v;
  const doubled = out.match(/^https?:\/\/[^/]+\/.+?\/(https:\/\/www\.lufthansa\.com\/content\/dam\/.+)$/);
  if (doubled) out = doubled[1];
  out = out.replace(/(^|\/\/)qa-www\.lufthansa\.com/g, '$1www.lufthansa.com');
  if (out !== v) report.fixes.push({ where, from: v, to: out });
  return out;
};

/* ------------------------------------------------------------------- What's new */
{
  const full = answer(Q('mobileapp/whatsnewList')).data.whatsnewList.items;
  const extra = new Map();
  Object.keys(index).filter((u) => /mobileapp\/(getStartPopup|whatsNewList)/.test(u)).forEach((u) => {
    const d = answer(u);
    ((d.data && d.data.whatsnewList && d.data.whatsnewList.items) || []).forEach((it) => {
      extra.set(it._path, { ...(extra.get(it._path) || {}), ...it });
    });
  });
  const seen = new Set();
  full.forEach((it, i) => {
    const x = extra.get(it._path) || {};
    let docPath = docPathOf(it._path);
    while (seen.has(docPath)) docPath += '-1';
    seen.add(docPath);
    const tags = it._tags.map((t) => t.replace(/^mobile-app:/, ''));
    const longText = writeDetails(docPathOf(it._path, '/data/details'), it.longText && it.longText.html);
    writeDoc(docPath, 'lh-whatsnew', {
      'dam-path': it._path,
      'release-version': it.releaseVersion,
      date: it.date,
      'activation-date': x.activationDate,
      headline: it.headline,
      'short-text': it.shortText && it.shortText.plaintext,
      'long-text': longText,
      tenants: tags.filter((t) => ['lh', 'lx', 'os', 'sn', 'ita', 'lhg'].includes(t)),
      platforms: tags.filter((t) => ['android', 'ios'].includes(t)),
      'early-access': tags.includes('early-access'),
      'start-popup': tags.includes('start-popup'),
      'feature-flag': it.featureFlagName,
      image: it.image && it.image._path,
      'image-lh': x.ImageLH && x.ImageLH._path,
      'image-lx': x.imageLX && x.imageLX._path,
      'image-sn': x.imageSN && x.imageSN._path,
      'image-os': x.imageOS && x.imageOS._path,
      'image-az': x.imageAZ && x.imageAZ._path,
      order: i,
    });
    const unknown = tags.filter((t) => !['lh', 'lx', 'os', 'sn', 'ita', 'lhg', 'android', 'ios', 'early-access', 'start-popup'].includes(t));
    if (unknown.length) throw new Error(`${it._path}: unknown tags ${unknown}`);
  });
}

/* ------------------------------------------------------------------- Benefit items */
['de', 'en'].forEach((lang) => {
  const items = answer(Q(`BenefitCard/BenefitItemsList;langPath=/content/dam/lufthansa-group/ancillary/upgrade/benefitcard/benefititems/${lang}`)).data.benefititemList.items;
  const seen = new Set();
  items.forEach((it, i) => {
    let name = edsName(`${it.id}-${it.airline}-${it.flightType}`);
    while (seen.has(name)) name += '-1';
    seen.add(name);
    writeDoc(`/data/lufthansa-group/ancillary/upgrade/benefitcard/benefititems/${lang}/${name}`, 'lh-benefit-item', {
      id: it.id, icon: it.icon, airline: it.airline, 'flight-type': it.flightType, label: it.label, 'upgrade-class': it.upgradeClass, order: i,
    });
  });
});

/* ------------------------------------------------------------------- Allegris aircraft */
['LH', 'LX', 'OS'].forEach((airline) => {
  answer(Q(`AllegrisUpgrade/AllegrisAircraftsList;airline=${airline}`)).data.allegrisaircraftList.items.forEach((it, i) => {
    writeDoc(`/data/lufthansa-group/ancillary/allegris-upgrade/aircraft/${edsName(`${it.airline}-${it.acv}`)}`, 'lh-allegris-aircraft', {
      airline: it.airline, acv: it.acv, 'display-badge': it.displaybadge, order: i,
    });
  });
});

/* ------------------------------------------------------------------- Travel regulations */
{
  const meta = (it, name) => ((it._metadata && it._metadata.calendarMetadata) || []).find((m) => m.name === name)?.value;
  const writeRegulation = (cc, it, i) => {
    const v = it._variation;
    const dir = `/data/details/content-fragments/travelready-infohub/${cc}/${edsName(v)}`;
    writeDoc(`/data/content-fragments/travelready-infohub/${cc}/${edsName(v)}`, 'lh-travel-regulation', {
      country: cc,
      variation: v,
      destination: writeDetails(`${dir}/destination`, it.destination && it.destination.html),
      transit: writeDetails(`${dir}/transit`, it.transit && it.transit.html),
      created: meta(it, 'jcr:created'),
      modified: meta(it, 'cq:lastModified'),
      order: i,
    });
  };
  const byHtml = new Map();
  Object.keys(index).filter((u) => u.includes('TravelRegulationsByPath;path=')).forEach((u) => {
    const cc = u.match(/infohub\/([a-z]{2})/)[1];
    answer(u).data.travelRegulationsList.items.forEach((it, i) => {
      writeRegulation(cc, it, i);
      if (it._variation === 'master') byHtml.set(it.destination && it.destination.html, cc);
    });
  });
  // the full list (masters only, no country): the countries not asked by path. Their country is
  // read from the text where it names one (the list is ordered by path, which confirms it),
  // else a placeholder that keeps the order
  const INFERRED = {
    'including Austria': 'at', 'including Belgium': 'be', 'including Switzerland': 'ch', 'including Germany': 'de', 'eticket.migracion.gob.do': 'do', 'written in Georgian': 'ge', 'arriving in Italy': 'it', 'Traveling to the United Kingdom': 'uk',
  };
  const list = answer(Q('Travel-Regulations/TravelRegulationsByPath')).data.travelRegulationsList.items;
  let prev = '';
  list.forEach((it, i) => {
    const html = it.destination && it.destination.html;
    if (byHtml.has(html)) {
      prev = byHtml.get(html);
      return;
    }
    const text = String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const key = Object.keys(INFERRED).find((k) => text.includes(k));
    let cc = key && INFERRED[key];
    if (cc) report.inferred.push({ position: i, country: cc, from: key });
    else {
      // a name that sorts between its neighbours in www's list
      cc = `${prev ? `${prev.slice(0, 1)}z` : 'aa'}-placeholder-${i}`;
      report.placeholders.push({ position: i, country: cc, text: text.trim().slice(0, 80) });
    }
    prev = cc.slice(0, 2);
    writeRegulation(cc, it, 0);
  });
  // the variation answer must be one of the imported ones
  const one = answer(Q('Travel-Regulations/TravelRegulationByPathAndVariation;path=/content/dam/content-fragments/travelready-infohub/za;variation=de')).data.travelRegulationsByPath.item;
  if (!one || one._variation !== 'de') throw new Error('TravelRegulationByPathAndVariation: unexpected answer');
}

/* ------------------------------------------------------------------- Ancillary catalog */
{
  const items = answer(Q('Ancillary-on-TMC/get-ancillaries-catalogs')).data.ancillaryCatalogList.items;
  const services = new Map();
  items.forEach((it) => {
    if (!services.has(it.name)) services.set(it.name, []);
    services.get(it.name).push(it);
  });
  [...services.entries()].forEach(([name, variations], i) => {
    writeDoc(`/data/lufthansa-group/ancillary/tmc/catalog/${edsName(name)}`, 'lh-ancillary', {
      name,
      order: i,
      variations: variations.map((v) => Object.fromEntries(Object.entries({
        variation: v._variation,
        enabled: v.enabled,
        'redirect-base-url': fixUrl(v.redirectBaseUrl, `${name}/${v._variation} redirectBaseUrl`),
        'image-url': fixUrl(v.imageUrl, `${name}/${v._variation} imageUrl`),
        localization: (v.localization || []).map((l) => ({
          locale: l.locale, title: l.title, description: l.description, 'text-link': l.textLink,
        })),
        properties: (v.properties || []).map((p) => ({ name: p.name, type: p.type, value: fixUrl(p.value, `${name}/${v._variation} ${p.name}`) })),
      }).filter(([, val]) => val !== null && val !== undefined && !(Array.isArray(val) && !val.length)))),
    });
  });
}

/* ------------------------------------------------------------------- SDUI services */
answer(Q('Orchestrator-Services/SDUI-Service-List')).data.sduiServiceList.items.forEach((it, i) => {
  writeDoc(docPathOf(it._path), 'lh-sdui-service', {
    'dam-path': it._path,
    description: it.description && it.description.plaintext,
    'service-type': it.serviceType,
    framework: it.framework,
    url: it.url,
    'provider-class-name': it.providerClassName,
    'service-is-cacheable': it.serviceIsCacheable,
    'caching-time': it.cachingTime,
    order: i,
  });
});

/* ------------------------------------------------------------------- B2B Neo feature flags */
answer(Q('B2BNeo/getFeatureFlag')).data.featureFlagList.items.forEach((it, i) => {
  writeDoc(docPathOf(it._path), 'lh-b2b-flag', {
    'dam-path': it._path,
    'flag-key': it.flagKey,
    enabled: it.enabled,
    name: it.name,
    description: it.description && it.description.plaintext,
    scope: it.scope,
    markets: (it.markets || []).filter(Boolean),
    'user-segments': (it.userSegments || []).filter(Boolean),
    'start-date': it.startDate,
    'end-date': it.endDate,
    order: i,
  });
});

/* ------------------------------------------------------------------- Trip Management strings */
{
  const item = answer(Q('Ancillary-on-TMC/tmc-translations;path=/content/dam/lufthansa-group/ancillary/tmc/tmc-web-translations/tmc-translations;variation=master')).data.tmcTranslationsByPath.item;
  const locales = Object.keys(item.translations);
  const keys = [];
  locales.forEach((l) => Object.keys(item.translations[l]).forEach((k) => { if (!keys.includes(k)) keys.push(k); }));
  const data = keys.map((key) => ({ key, ...Object.fromEntries(locales.map((l) => [l, item.translations[l][key] ?? ''])) }));
  fs.writeFileSync(path.join(root, 'tools/importer/tmc-translations-sheet.json'), `${JSON.stringify({
    total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
  }, null, 1)}\n`);
  report.tmc = { keys: keys.length, locales: locales.length };
}

/* ------------------------------------------------------------------- Schemas */
Object.entries(SCHEMAS).forEach(([name, schema]) => {
  const file = path.join(CONTENT, '.da/forms/schemas', `${name}.plain.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const json = JSON.stringify(schema, null, 2).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  fs.writeFileSync(file, `<div><pre><code>${json}</code></pre></div>`);
});

fs.mkdirSync(path.join(root, 'tools/reports/feeds'), { recursive: true });
fs.writeFileSync(path.join(root, 'tools/importer/graphql-documents.txt'), `${written.join('\n')}\n`);
fs.writeFileSync(path.join(root, 'tools/reports/feeds/graphql-import.json'), `${JSON.stringify(report, null, 1)}\n`);
console.log(`graphql-import: ${report.documents} documents, ${report.details} companion documents, ${report.fixes.length} www data errors fixed, ${report.inferred.length} countries inferred, ${report.placeholders.length} placeholders; TMC ${report.tmc.keys} keys x ${report.tmc.locales} locales`);
