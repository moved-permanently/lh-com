/* eslint-disable no-console */
/**
 * The workspace's parser and transformer checks (the excat plugin's PostToolUse hooks, outside
 * this repo) validate an edited importer against the first URL tools/importer/page-templates.json
 * gives them: the parser check the first template with a block of the parser's name, the
 * transformer check the first template with URLs. Those were www.lufthansa.com pages, so every
 * edit of an importer sent requests to an airline host (standing order 8 of 2026-11-12, item 1).
 * The hooks probe and load only http(s) URLs; for any other URL they skip the validation without
 * a request. This guard is a template of its own, first in the list: validationOnly (no bundle,
 * build-bundles.mjs), every parser's block, its URL the local snapshot of an info page
 * (tools/importer/bd-snapshots/www.lufthansa.com/de/en/check-in-deadlines.html, not in git), a
 * path, not http.
 *
 * Usage: node tools/importer/hook-validation-guard.mjs   (rewrites page-templates.json with the
 *        guard first; run after adding a parser, and build-page-templates.js runs it)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const GUARD_NAME = '_hook-validation';
export const GUARD_URL = 'file:tools/importer/bd-snapshots/www.lufthansa.com/de/en/check-in-deadlines.html';

/** The guard template: every parser in the directory as a block of that name. */
export function guardTemplate(parsersDir) {
  const names = fs.readdirSync(parsersDir).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)).sort();
  return {
    name: GUARD_NAME,
    description: 'Not a page template: the workspace\'s parser and transformer checks read their test URL here first, a local snapshot path (they skip it, no request to an airline host). No bundle. tools/importer/hook-validation-guard.mjs',
    validationOnly: true,
    urls: [GUARD_URL],
    blocks: names.map((name) => ({ name })),
  };
}

/** page-templates.json's content with the guard first (an old guard replaced). */
export function withGuard(json, parsersDir) {
  const rest = (json.templates || []).filter((t) => t.name !== GUARD_NAME);
  return { ...json, templates: [guardTemplate(parsersDir), ...rest] };
}

const isMain = process.argv[1]
  && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(dir, 'page-templates.json');
  const json = withGuard(JSON.parse(fs.readFileSync(file, 'utf8')), path.join(dir, 'parsers'));
  fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`page-templates.json: ${GUARD_NAME} first, ${json.templates[0].blocks.length} parsers`);
}
