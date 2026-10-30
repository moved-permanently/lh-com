/* eslint-disable no-console, max-len -- dev tooling */
/**
 * AMS rest A7 spot check: the replica's four locale sitemaps on an lh-edge host (plain and
 * .gz) against www's recorded de/en sitemap (tools/source-export/feeds/ams-rest/sitemap/
 * sitemap_lh_de_en.xml.gz). Per locale: URL count, alternates to the three other locales, and
 * for up to 10 URLs that www's file knows (as a location or an alternate) the alternates of the
 * replica's four hreflangs (en-DE, de-DE, de-AT, en-GB) compared with www's.
 * Usage: node tools/workers/lh-edge/compare-sitemap.mjs [--host https://lufthansa-edge.turnsthe.page]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const HOST = (argv.includes('--host') ? argv[argv.indexOf('--host') + 1] : 'https://lufthansa-edge.turnsthe.page').replace(/\/$/, '');
const LANGS = ['en-DE', 'de-DE', 'de-AT', 'en-GB'];
const LOCALES = {
  'de/en': 'en-DE', 'de/de': 'de-DE', 'at/de': 'de-AT', 'gb/en': 'en-GB',
};

/** URL entries of a sitemap: [{loc, alternates: {hreflang: href}}]. */
function entries(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, u]) => ({
    loc: (u.match(/<loc>([^<]+)<\/loc>/) || [])[1],
    alternates: Object.fromEntries([...u.matchAll(/<xhtml:link\s([^>]+)\/?>/g)].map(([, a]) => [(a.match(/hreflang="([^"]+)"/) || [])[1], (a.match(/href="([^"]+)"/) || [])[1]])),
  }));
}
const pick = (alts) => Object.fromEntries(LANGS.filter((l) => alts[l]).map((l) => [l, alts[l]]));

const www = entries(zlib.gunzipSync(fs.readFileSync(path.join(root, 'tools/source-export/feeds/ams-rest/sitemap/sitemap_lh_de_en.xml.gz'))).toString());
// www's page groups, keyed by every URL of the group (location or alternate)
const wwwGroup = new Map();
www.forEach((e) => {
  const group = pick({ 'en-DE': e.loc, ...e.alternates });
  Object.values(group).forEach((u) => wwwGroup.set(u, group));
});

const lines = [];
await Object.entries(LOCALES).reduce(async (prev, [loc, lang]) => {
  await prev;
  const name = `sitemap_lh_${loc.replace('/', '_')}.xml`;
  const plain = await fetch(`${HOST}/sitemap/${name}`);
  const gz = await fetch(`${HOST}/sitemap/${name}.gz`);
  const xml = plain.ok ? await plain.text() : '';
  const gzOk = gz.ok && zlib.gunzipSync(Buffer.from(await gz.arrayBuffer())).toString() === xml;
  const ours = entries(xml);
  const withAll = ours.filter((e) => LANGS.filter((l) => l !== lang).every((l) => e.alternates[l])).length;
  const known = ours.filter((e) => wwwGroup.has(e.loc)).slice(0, 10);
  const checked = known.map((e) => {
    const mine = pick({ ...e.alternates, [lang]: e.loc });
    const theirs = wwwGroup.get(e.loc);
    const same = JSON.stringify(Object.entries(mine).sort()) === JSON.stringify(Object.entries(theirs).sort());
    return {
      loc: e.loc, same, mine, theirs,
    };
  });
  lines.push(`## ${loc} (${lang}): ${plain.status}, .gz ${gz.status}${gzOk ? ' (= plain)' : ' (differs)'}; ${ours.length} URLs, ${withAll} with alternates to all three other locales; spot check ${checked.filter((c) => c.same).length}/${checked.length} equal to www`);
  checked.forEach((c) => lines.push(`- ${c.same ? 'OK  ' : 'DIFF'} ${c.loc}${c.same ? '' : `\n  ours ${JSON.stringify(c.mine)}\n  www  ${JSON.stringify(c.theirs)}`}`));
}, Promise.resolve());
console.log(lines.join('\n'));
fs.writeFileSync(path.join(root, 'tools/reports/lh-edge/compare-sitemap.md'), `# Sitemaps on ${HOST} vs www's de/en sitemap\n\n${new Date().toISOString()}\n\n${lines.join('\n')}\n`);
