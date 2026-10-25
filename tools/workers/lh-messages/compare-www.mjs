/* eslint-disable no-console, no-underscore-dangle */
/**
 * Compares the worker's answers with www's recorded answers (the fixture) field by field: the JSON shape of every route, and for the messages both
 * have (same message id and language) every field.
 * Usage: node tools/workers/lh-messages/compare-www.mjs [--worker https://lh-messages.aem-poc-lab.workers.dev]
 *   [--fixture tools/workers/lh-messages/test/fixtures/www-message-center-2026-10-25.json]
 */
import fs from 'node:fs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const WORKER = opt('worker', 'https://lh-messages.aem-poc-lab.workers.dev');
const FIXTURE = opt('fixture', new URL('./test/fixtures/www-message-center-2026-10-25.json', import.meta.url));
const www = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));

/** Paths of the leaves with their JSON type (first array element only). */
function shape(o, p = '', out = {}) {
  if (Array.isArray(o)) {
    if (o.length) shape(o[0], `${p}[]`, out);
    else out[`${p}[]`] = 'empty';
  } else if (o && typeof o === 'object') {
    Object.entries(o).forEach(([k, v]) => shape(v, `${p}.${k}`, out));
  } else {
    out[p] = o === null ? 'null' : typeof o;
  }
  return out;
}

const idOf = (item) => `${(item._path || '').split('/').pop()}:${item.language}`;

const queries = Object.keys(www.queries);
for (let q = 0; q < queries.length; q += 1) {
  const name = queries[q];
  const ref = www.queries[name];
  // eslint-disable-next-line no-await-in-loop
  const resp = await fetch(`${WORKER}/graphql/execute.json/Message-Center/${name}`);
  // eslint-disable-next-line no-await-in-loop
  const ours = await resp.json();
  const a = shape(ref.body);
  const b = shape(ours);
  const onlyWww = Object.keys(a).filter((k) => !(k in b) && a[k] !== 'empty');
  const onlyOurs = Object.keys(b).filter((k) => !(k in a) && !(`${k.split('[]')[0]}[]` in a && a[`${k.split('[]')[0]}[]`] === 'empty'));
  const types = Object.keys(a).filter((k) => k in b && a[k] !== b[k] && a[k] !== 'null' && b[k] !== 'null');
  console.log(`== ${name}: ${resp.status}, cache-control ${resp.headers.get('cache-control')} (www ${ref.headers['cache-control']})`);
  console.log(`  shape: ${onlyWww.length || onlyOurs.length || types.length ? '' : 'same'}${onlyWww.length ? ` only www ${onlyWww.join(', ')}` : ''}${onlyOurs.length ? ` only ours ${onlyOurs.join(', ')}` : ''}${types.length ? ` types ${types.join(', ')}` : ''}`);
  const list = (o) => (o.data.lhgMessageList || {}).items || [];
  if (ref.body.data.lhgMessageList) {
    const theirs = new Map(list(ref.body).map((i) => [idOf(i), i]));
    const mine = list(ours);
    const both = mine.filter((i) => theirs.has(idOf(i)));
    console.log(`  items: www ${theirs.size}, ours ${mine.length}, same message and language ${both.length}`);
    both.forEach((i) => {
      const t = theirs.get(idOf(i));
      const diffs = Object.keys(t).filter((k) => JSON.stringify(k === '_tags' ? [...t[k]].sort() : t[k]) !== JSON.stringify(k === '_tags' ? [...i[k]].sort() : i[k]));
      console.log(`    ${idOf(i)}: ${diffs.length ? `differs in ${diffs.join(', ')}` : 'identical'}`);
    });
  }
}
