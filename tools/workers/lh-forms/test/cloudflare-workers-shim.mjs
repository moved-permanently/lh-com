/**
 * node --test has no `cloudflare:workers`: this loader hook (node --import) answers the module
 * with a WorkerEntrypoint base class that keeps ctx and env, as the Workers runtime does.
 */
import { register } from 'node:module';

const stub = 'export class WorkerEntrypoint { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }';
const hooks = `
export async function resolve(specifier, context, next) {
  if (specifier === 'cloudflare:workers') return { url: 'data:text/javascript,${encodeURIComponent(stub)}', shortCircuit: true };
  return next(specifier, context);
}`;
register(`data:text/javascript,${encodeURIComponent(hooks)}`);
