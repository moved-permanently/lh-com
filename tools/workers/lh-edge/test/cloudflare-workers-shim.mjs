/**
 * node --test has no `cloudflare:workers`: this loader hook (node --import) answers the module
 * with a WorkerEntrypoint base class that keeps ctx and env, as the Workers runtime does.
 * The locale table (scripts/locale-table.js) is loaded as with tools/markets/locale-data.json
 * `liveWaves: []` (tools/reports/markets/go-live.md): a market root (documents: 'language') a
 * go-live wave made live is pilot here, so the tests keep checking the pilot answers whatever waves
 * are live; test/go-live.test.mjs checks the live ones on its own tables.
 */
import { register } from 'node:module';

const stub = 'export class WorkerEntrypoint { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }';
const hooks = `
export async function resolve(specifier, context, next) {
  if (specifier === 'cloudflare:workers') return { url: 'data:text/javascript,${encodeURIComponent(stub)}', shortCircuit: true };
  return next(specifier, context);
}
export async function load(url, context, next) {
  const result = await next(url, context);
  if (!url.endsWith('/scripts/locale-table.js') || result.source == null) return result;
  const source = String(result.source).split('\\n')
    .map((line) => (line.includes("documents: 'language'") ? line.replace("status: 'live'", "status: 'pilot'") : line))
    .join('\\n');
  return { ...result, source, shortCircuit: true };
}`;
register(`data:text/javascript,${encodeURIComponent(hooks)}`);
