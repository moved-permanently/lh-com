/**
 * node --test has no `cloudflare:workers`: this loader hook (node --import) answers the module
 * with a WorkerEntrypoint base class that keeps ctx and env, as the Workers runtime does.
 * The locale table (scripts/locale-table.js) is loaded as with tools/markets/locale-data.json
 * `liveWaves: []` (tools/reports/markets/go-live.md): every row a go-live wave made live (a market
 * root, documents: 'language', or a language version with documents of its own, xx/fr in wave 11,
 * xx/es in wave 12) is pilot here; only the four roots stay live, so the tests keep checking the
 * pilot answers whatever waves are live; test/go-live.test.mjs checks the live ones on its own
 * tables.
 */
import { register } from 'node:module';

const stub = 'export class WorkerEntrypoint { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }';
const hooks = `
export async function resolve(specifier, context, next) {
  if (specifier === 'cloudflare:workers') return { url: 'data:text/javascript,${encodeURIComponent(stub)}', shortCircuit: true };
  return next(specifier, context);
}
const FOUR = ["'de/en'", "'de/de'", "'at/de'", "'gb/en'"];
export async function load(url, context, next) {
  const result = await next(url, context);
  if (!url.endsWith('/scripts/locale-table.js') || result.source == null) return result;
  const source = String(result.source).split('\\n')
    .map((line) => (line.includes("status: 'live'") && !FOUR.some((k) => line.trimStart().startsWith(k)) ? line.replace("status: 'live'", "status: 'pilot'") : line))
    .join('\\n');
  return { ...result, source, shortCircuit: true };
}`;
register(`data:text/javascript,${encodeURIComponent(hooks)}`);
