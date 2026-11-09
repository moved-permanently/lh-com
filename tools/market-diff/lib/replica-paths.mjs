/* eslint-disable import/extensions, import/no-relative-packages, max-len -- plain Node, as tools/market-diff; the slug library is the repo's */
// Where market-diff asks for a pair's pages (the brief after 518; ema-cashub's tools/reports/slugs/write-step-517.md). A pair
// is two www paths (the root's page, the version's page) and stays so: the www side is read at its www paths. Our replica
// is asked where the write step puts a page: the site's map's write target (canonicalOf without `all`, as da-upload writes:
// the canonical path once the root's flag is on, else the www path). Every flag is off today, so every request is as before.
//
//   replicaMapOf(host, {file})  the slug map (tools/slugs/lib.mjs loadMap) of the site whose www host it is, or null (ITA,
//                               TAP, Air Dolomiti: no map); file: another copy of a map (a test copy with flags on)
//   requestsOf(pair, map)       {www: [versionPath, rootPath], replica: [rootPath, versionPath]} for {rootPath, versionPath}
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMap } from '../../slugs/lib.mjs';

const SLUGS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../slugs');

export function replicaMapOf(host, { file } = {}) {
  if (!host) return null;
  const files = file ? [path.resolve(file)] : fs.readdirSync(SLUGS).filter((f) => f.endsWith('.json')).map((f) => path.join(SLUGS, f));
  const maps = files.map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
  const map = maps.find((m) => String(m.host || '').replace(/^https?:\/\//, '').replace(/\/$/, '') === host);
  return map ? loadMap(map) : null;
}

// an AEM path's /content/<site>/markets prefix dropped: the replica's path
const short = (p) => p.replace(/^\/content\/[^/]+\/markets/, '');

export function requestsOf({ rootPath, versionPath }, map) {
  const at = (p) => (map ? map.canonicalOf(short(p)) : short(p));
  return { www: [versionPath, rootPath], replica: [at(rootPath), at(versionPath)] };
}
